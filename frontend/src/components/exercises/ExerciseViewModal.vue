<template>
  <q-page-container>
    <q-btn class="q-ml-md" round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.go(-1)" />
    <q-page class="q-py-md">
      <div v-if="!videoFile">
        <exercise-instructions class="q-mb-md"/>
        <q-tabs v-model="deviceTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
          <q-tab name="phone" label="Upload" />
          <q-tab name="app" label="Record" />
        </q-tabs>
        <q-separator />
        <q-tab-panels keep-alive v-model="deviceTab" animated>
          <q-tab-panel class="device-panel" name="phone">
            <q-card flat class="q-ma-md">
              <q-card-section class="column items-center q-pa-sm">
                <q-file class="q-mb-sm" ref="uploader" type="file" name="uploaded_file" accept="video/*" capture="environment" color="secondary" label="Open camera" 
                  v-model="uploadedFile" @change.capture="uploadedRecordedVideo" @rejected="rejectedUpload"
                >
                  <template v-slot:prepend>
                    <q-icon name="camera" />
                  </template>
                </q-file>
                <form ref="form" action="" method="POST" enctype="multipart/form-data" @submit.prevent="saveVideo">
                </form>
                <div class="video-container col" v-show="uploadedFile">
                  <video ref="uploadedVideoPreview" controls autoplay playsinline webkit-playsinline />
                </div>
                <div class="q-mt-md text-body2" v-if="uploadedFile">
                  Recorded: {{formatModifiedDate}}<br/>
                  Size: {{getUploadedFileSize}}
                </div>
                <q-btn :disabled="!uploadedFile" class="q-my-md" label="Save video" color="secondary" size="md" icon-right="camera" @click="saveVideo" />
              </q-card-section>
            </q-card>
          </q-tab-panel>
          <q-tab-panel class="device-panel" name="app">
            <q-card flat class="q-pa-lg">
              <q-card-section v-if="!hasVideoDevice" class="flex column items-center">
                <div class="text-h6 col">Device has no video inputs</div>
                <div class="col">
                  <q-btn label="Reconnect" color="secondary" size="md" @click="checkForVideoSupport" />
                </div>
              </q-card-section>
              <q-card-section v-else class="flex flex-center q-gutter-md">
                <q-btn :disabled="isRecording" label="Start recording" color="positive" size="md" icon-right="camera" @click="videoCapture" />
                <q-btn :disabled="!isRecording" label="Stop recording" color="secondary" size="md" icon-right="camera" @click="stopVideoCapture" />
              </q-card-section>
              <div class="video-container col">
                <video v-if="isRecording" ref="videoOutput" id="videoPreview" autoplay playsinline webkit-playsinline controls>
                  <source src="" type="video/mp4">
                    Your browser does not support HTML5 video.
                </video>
              </div>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <div v-else>
        <q-card v-if="!poe" flat class="q-pa-lg flex flex-center">
          <q-card-section>
            <div class="text-h6 flex flex-center">Processing video</div>
            <div class="text-subtitle2 q-mb-md">Retrieving results from analysed video</div>
            <q-separator />
            <div class="q-mt-md flex flex-center">
              <q-spinner-dots
                color="primary"
                size="3em"
              />
            </div>
          </q-card-section>
        </q-card>
        <transition v-else appear enter-active-class="animated fadeIn">
          <q-card flat class="q-ma-lg evaluation-card">
            <q-card-section>
              <div class="text-h6">Video Evaluation</div>
              <div class="text-subtitle2">Results from recorded exercise video</div>
            </q-card-section>
            <q-separator />
            <q-list bordered class="rounded-borders" :key="res.posturalOrientation" v-for="res in poe">
              <q-expansion-item
                class="q-py-sm"
                expand-separator
              >
                <template v-slot:header>
                <q-item-section class="text-subtitle2">
                  {{ res.posturalOrientation }}
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    outline
                    :clickable="false" 
                    :ripple="false" 
                    :text-color="`${ 
                      res.score === 0 ? 'positive' 
                      : res.score === 1 ? 'warning' 
                      : 'negative'
                    }`" 
                  >
                    {{ res.scoreToText }}
                  </q-chip>
                </q-item-section>
                </template>
                <q-card>
                 <q-card-section>
                    <div class="text-body2">
                      Score: {{ res.scoreToText }}
                    </div>
                    <div class="text-body2">
                      Predicted confidence for score: <b>{{ res.highestPredictedConfidence }} %</b>
                    </div>
                  </q-card-section>
                  <q-separator inset />
                  <q-card-section>
                    <div class="text-subtitle1">Postural orientation</div>
                    <div class="text-body2">{{ res.posturalOrientation }}</div>
                  </q-card-section>
                  <q-separator inset />
                  <q-card-section>
                    <div class="text-subtitle1">Repetition</div>
                    <div class="text-body2">{{ res.repetition }}</div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card>
        </transition>
        <div class="q-pa-lg video-container">
          <video ref="videoPreview" id="videoPreview" autoplay playsinline webkit-playsinline controls>
            Your browser does not support HTML5 video.
          </video>
        </div>
      </div>
    </q-page>
  </q-page-container>
</template>

<script>
import API from '../../API'
import nicers from '../../utils/nicers'
import ExerciseInstructions from './ExerciseInstructions.vue'

export default {
  components: { ExerciseInstructions },
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
      videoFile: undefined,
      poe: undefined,
      isGettingPOEStatus: true,
      deviceTab: 'phone'
    }
  },
  async beforeMount () {
    await this.checkForVideoSupport()
    await this.getVideoExercise()
    if (this.videoFile) {
      await this.getVideoPathForExercise()
      await this.getPOE()
    }
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
      a.download = 'exercise_' + this.exerciseID + '.webm'
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
        let loading = this.$q.loading
        try {
          loading.show({
            message: 'Uploading video to server, please wait...'
          })
          await nicers.delay(300)
          const form = new FormData()
          form.append('uploaded_file', this.uploadedFile)
          let results = await API.uploadFile(form, this.exerciseID)
          if (results) {
            try {
              this.videoFile = results.videoFile
            } catch (err) {
              // do not trigger the general catch below, because we want the sendPOE to be called in any case
              console.error(err)
            }
            loading.show({
              message: '<b>Video uploaded</b><br>Processing will start in a moment<br>Please wait...',
              html: true
            })
            let poe_evaluation = await API.sendPOE(results.videoFile, this.exerciseID)
            if (poe_evaluation) {
              loading.hide()
              this.$q.notify({
                type: 'info',
                position: 'top',
                message: 'Video has been sent for processing',
                icon: 'info'
              })
              await this.getVideoPathForExercise()
              await this.getPOE()
            }
          }
        } catch (err) {
          let errMsg = err
          if (err.response.status == 400 || err.response.status == 404 || err.response.status === 413) errMsg = err.response.data
          this.$q.notify({
            type: 'negative',
            position: 'top',
            message: 'Video cannot be saved: ' + errMsg,
            icon: 'warning'
          })
          this.$refs.uploader.removeFile(this.uploadedFile)
          this.$refs.uploader.nativeEl.value = ''
          this.uploadedFile = undefined
        }
        loading.hide()
        return
      }
    },
    async getVideoExercise() {
      try {
        let resp = await API.getExercise(this.exerciseID)
        console.log(resp)
        if (resp) {
          this.videoFile = resp.videoFile
        }
      } catch (err) {
        let errMsg = err
        if (err.response.status == 404) {
          errMsg = err.response.data
          this.$router.push('/home')
        }
        return this.$q.notify({
          type: 'negative',
          position: 'top',
          message: 'Cannot get exercise: ' + errMsg,
          icon: 'warning'
        })
      }
    },
    async getPOE() {
        while (this.isGettingPOEStatus) {
          try {
            let resp = await API.getPOE(this.exerciseID)
            if (resp && resp._results) {
              let poe_results = resp._results
              poe_results.map((poe, i) => {
                poe["posturalOrientation"] = nicers.formattedPosturalOrientation(poe.posturalOrientation)
                poe["scoreToText"] = nicers.formattedScoreToText(poe.score)
                poe["highestPredictedConfidence"] = parseFloat((poe['scoreConfidence_'+ poe.score]*100)).toFixed(0)
                poe["repetition"] = poe["repetition"] === 0 ? 'Summative evaluation' : poe["repetition"]
              })
              this.poe = poe_results
              return
            } else if (resp && !resp._results) {
              await nicers.delay(10000)
              return await this.getPOE()
            }
          } catch (err) {
            // ongoing status not available yet, video in queue = 500 response
            // keep checking until we can fetch ongoing status
            await nicers.delay(10000)
          }
      }
    },
    async getVideoPathForExercise () {
      let blob = await API.getUploadFile(this.exerciseID)
      let videoURL = URL.createObjectURL(blob)
      this.$refs.videoPreview.src = videoURL
    },
    rejectedUpload (file) {
      this.$q.notify({
        color: 'negative',
        position: 'top',
        message: 'Uploaded file is not a video: ' + file[0].file.name,
        icon: 'report_problem'
      })
      this.$refs.uploader.removeFile(this.uploadedFile)
    }
  },
  computed: {
    formatModifiedDate () {
      return nicers.formattedDayOfMonth(this.uploadedFile.lastModified)
    },
    getUploadedFileSize () {
      let formatFileSize = this.uploadedFile.size
      return (formatFileSize / Math.pow(1024, 2)).toFixed(1) + ' MB'
    }
  },
  unmounted () {
    this.isGettingPOEStatus = false
  }
}
</script>

<style scoped>
.exercise-card {
  max-width: 350px;
}
.video-container {
  max-width: 60%;
  margin: 0 auto;
}
.video-container video {
  width: 100%;
  height: auto;
}
.evaluation-card {
  margin: 0 auto;
  max-width: 400px;
  width: 100%;
}
.device-panel {
  min-height: 300px;
}

@media only screen and (max-width: 550px) {
  .video-container {
    max-width: 100%;
  }
}
</style>
