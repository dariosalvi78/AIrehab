<template>
  <q-page-container class="q-pa-lg">
    <q-page>
      <q-btn round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.go(-1)" />
      <q-card v-if="!hasVideoDevice" flat class="q-pa-lg">
        <q-card-section class="flex column items-center">
          <div class="text-h6 col">Device has no video inputs</div>
          <div class="col">
            <q-btn label="Reconnect" color="secondary" size="md" @click="checkForVideoSupport" />
          </div>
        </q-card-section>
      </q-card>
      <q-card v-else class="q-pa-lg q-ma-md">
        <q-card-section class="flex flex-center">
          <q-btn label="Open camera" color="positive" size="md" icon-right="camera" @click="videoCapture" />
          <q-btn label="Stop recording" color="secondary" size="md" icon-right="camera" @click="stopVideoCapture" />
        </q-card-section>
        <q-card-section class="column items-center">
          <q-file type="file" name="uploaded_file" accept="video/*" capture="environment" color="secondary" v-model="uploadedFile" label="Upload video" @change.capture="uploadedRecordedVideo">
            <template v-slot:prepend>
              <q-icon name="camera" />
            </template>
          </q-file>
          <form ref="form" action="" method="POST" enctype="multipart/form-data" @submit.prevent="saveVideo">
          </form>
            <div class="col">
            <video v-if="isRecording" ref="videoOutput" id="videoPreview" autoplay playsinline webkit-playsinline controls>
                <source src="" type="video/mp4">
                  Your browser does not support HTML5 video.
                <p id="timer"></p>
            </video>
          </div>
          <div class="col" v-show="uploadedFile">
            <video ref="uploadedVideoPreview" controls autoplay playsinline webkit-playsinline />
          </div>
          <div class="q-mt-md text-body1" v-if="uploadedFile">Recorded: {{formatModifiedDate}}</div>
          <q-btn class="q-mt-md" label="Save video" color="secondary" size="md" icon-right="camera" @click="saveVideo" />
        </q-card-section>
      </q-card>
    </q-page>
  </q-page-container>
</template>

<script>
import API from '../../API'
import nicers from '../../utils/nicers'
export default {
  name: 'ExerciseViewModal',
  props: {
    sessionID: String,
    exerciseID: String
  },
  data () {
    return {
      mediaRecorder: undefined,
      videoChunks: [],
      hasVideoDevice: false,
      isRecording: false,
      isLoadingExercise: true,
      hasPermissions: false,
      uploadedFile: undefined
    }
  },
  async mounted () {
    await this.checkForVideoSupport()
  },
  methods: {
    async checkForVideoSupport () {
      console.log(navigator)
      if (navigator.mediaDevices) {
        let devices = await navigator.mediaDevices.enumerateDevices()
        for (const input in devices) {
          if (devices[input].kind.includes('videoinput')) {
            console.debug("device supports video recording.")
            this.hasVideoDevice = true
          }
        }
        return this.hasVideoDevice
      }
    },
    async videoCapture () {
      console.log('start')
      this.isRecording = true
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          this.hasPermissions = true
          console.log(stream)
          this.$refs.videoOutput.srcObject = stream

          this.mediaRecorder = new MediaRecorder(stream)

          this.mediaRecorder.start(1000)

          this.mediaRecorder.ondataavailable = (e) => this.videoChunks.push(e.data)
          console.log(this.videoChunks)
        })
        .catch((err) => {
          this.hasPermissions = false
          return this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Camera not available: ' + err,
            icon: 'report_problem'
          })
        })
    },
    async stopVideoCapture () {
      this.isRecording = false
      console.log(this.mediaRecorder)
      this.mediaRecorder.stop()
      console.log('stopped recording: ', this.mediaRecorder)

      let blob = new Blob(this.videoChunks, { type: "video/webm" });
      let mediaBlobUrl = URL.createObjectURL(blob);
      this.$refs.videoOutput.src = mediaBlobUrl

      // saves video directly on phone,
      let a = document.createElement('a')
      a.style = 'display: none'
      a.href = mediaBlobUrl
      a.download = 'test.webm'
      a.click()
      URL.revokeObjectURL(mediaBlobUrl)
    },
    uploadedRecordedVideo(e) {
      const output = this.$refs.uploadedVideoPreview
      const file = e.target.files[0]
      this.uploadedFile = file
      output.style.display = 'block'
      output.src = URL.createObjectURL(file)
    },
    async saveVideo () {
      if (this.uploadedFile && this.exerciseID) {
        const form = new FormData()
        form.append('uploaded_file', this.uploadedFile)
        let results = await API.sendPOE(form, this.exerciseID)
        if (results) {
          return this.$q.notify({
            type: 'positive',
            position: 'top',
            message: 'Video has been saved for exercise',
          })
        }
      }
    }
  },
  computed: {
    formatModifiedDate () {
      return nicers.formattedDayOfMonth(this.uploadedFile.lastModified)
    }
  }
}
</script>

<style scoped>
.exercise-card {
  max-width: 350px;
}
video {
  max-width: 300px;
  height: 400px;
  object-fit: cover;
}
</style>