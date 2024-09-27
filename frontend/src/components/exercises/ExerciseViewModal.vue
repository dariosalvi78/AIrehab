<template>
  <q-page-container class="q-pa-lg">
    <q-page>
      <q-btn round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.go(-1)" />
      <div v-if="!exercise.videoFile">
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
              </video>
            </div>
            <div class="col" v-show="uploadedFile">
              <video ref="uploadedVideoPreview" controls autoplay playsinline webkit-playsinline />
            </div>
            <div class="q-mt-md text-body1" v-if="uploadedFile">Recorded: {{formatModifiedDate}}</div>
            <q-btn class="q-mt-md" label="Save video" color="secondary" size="md" icon-right="camera" @click="saveVideo" />
          </q-card-section>
        </q-card>
      </div>
      <div v-else>
        <q-card v-if="!poe" flat class="q-pa-lg flex flex-center">
          <q-card-section>
            <div class="text-h6 q-mb-md">Video is processing, please wait</div>
            <q-separator inset />
            <div class="q-mt-md flex flex-center">
              <q-spinner-dots
                color="primary"
                size="3em"
              />
            </div>
          </q-card-section>
        </q-card>
        <q-card v-else flat class="q-px-md patient-view-card">
          <q-card-section>
            <div class="text-h6">Video Evaluation</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle1">Score</div>
            <div class="text-body2">
              Score: {{ poe.score }}
            </div>
            <div class="text-body2">
              Confidence: {{ poe.scoreConfidence_0 }}
            </div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle1">Postural orientation</div>
            <div class="text-body2">{{ poe.posturalOrientation }}</div>
          </q-card-section>                
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle1">Repetition</div>
            <div class="text-body2">{{ poe.repetition }}</div>
          </q-card-section>
        </q-card>
      </div>
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
      uploadedFile: undefined,
      exercise: {},
      poe: undefined
    }
  },
  async beforeMount () {
    await this.checkForVideoSupport()
    await this.getExercise()
    await this.getPOE()
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
        try {
          this.$q.loading.show()
          await nicers.delay(300)
          const form = new FormData()
          form.append('uploaded_file', this.uploadedFile)

          let results = await API.sendPOE(form, this.exerciseID, this.sessionID)
          if (results) {
            this.$q.notify({
              type: 'positive',
              position: 'top',
              message: 'Video has been saved for exercise',
            })
            this.$router.go(-1)
          }
        } catch (err) {
          let errMsg = err
          if (err.response.status == 400 || err.response.status == 404) errMsg = err.response.data
          this.$q.notify({
            type: 'negative',
            position: 'top',
            message: 'Video cannot be saved: ' + errMsg,
            icon: 'warning'
          })
        }
        this.$q.loading.hide()
        return
      }
    },
    async getExercise() {
      try {
        let resp = await API.getExercise(this.sessionID, this.exerciseID)
        console.log(resp)
        if (resp) {
          this.exercise = resp
        }    
      } catch (err) {
        return this.$q.notify({
          type: 'negative',
          position: 'top',
          message: 'Cannot get exercise: ' + err,
          icon: 'warning'
        })
      }
    },
     async getPOE() {
      try {
        let resp = await API.getPOE(this.exerciseID, this.sessionID)
        console.log(resp)
        if (resp) {
          this.poe = resp
        }    
      } catch (err) {
        return this.$q.notify({
          type: 'negative',
          position: 'top',
          message: 'Cannot get video evaluation: ' + err,
          icon: 'warning'
        })
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
.evaluation-card {
  margin: 0 auto;
  max-width: 400px;
  width: 100%;
}
</style>