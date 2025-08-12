<template>
  <q-page-container class="q-pt-md" style="paddingTop:auto;">
    <q-btn class="q-ml-md" round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.go(-1)" />
    <q-page class="q-py-md">
      <div v-if="!videoFile">
        <exercise-instructions class="q-mb-md"/>
        <q-separator />
        <q-card flat class="q-ma-md">
          <q-card-section v-show="!uploadedFile" class="column items-center q-pa-sm">
            <div class="text-body2 text-center q-my-md">Record new exercise for POE assessment</div>
            <q-btn v-if="hasVideoDevice" class="q-mb-md q-pa-sm full-width" label="Open camera" color="secondary" icon-right="camera" @click="openRecordingModal" />
            <div v-else class="flex column items-center full-width">
              <q-badge class="col q-mb-md" outline color="negative" label="Device has no video inputs" />
              <q-btn class="col q-mb-md q-py-sm full-width" label="Reconnect video" color="secondary" icon="refresh" @click="checkForVideoSupport" no-caps />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="column items-center q-pa-sm">
            <div v-show="!uploadedFile" class="text-body2 text-center q-my-md">Upload video that you have already recorded</div>
            <q-file class="q-mb-sm full-width" filled ref="uploader" type="file" name="uploaded_file" accept="video/*" capture="environment" color="secondary" label="Upload exercise video" 
              v-model="uploadedFile" @change.capture="uploadedRecordedVideo" @rejected="rejectedUpload"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-if="uploadedFile" v-slot:append>
                <q-icon name="cancel" @click.stop.prevent="uploadedFile = null" class="cursor-pointer" />
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
            <q-btn v-show="uploadedFile" class="q-my-md full-width" label="Begin exercise assessment" color="secondary" no-caps icon-right="cloud_upload" @click="saveVideo" />
          </q-card-section>
        </q-card>
        <q-dialog id="recordModal" ref="qRecordDialog" v-model="openRecordModal">
          <q-card class="full-width" style="maxHeight:100%">
            <q-card-section  class="q-pb-none flex justify-between">
              <div class="text-body1">Record exercise video</div>
              <q-btn class="q-pa-none q-pb-sm" flat label="Close" v-close-popup />
            </q-card-section>
            <q-checkbox class="q-mx-md q-mb-md text-weight-light" dense v-model="saveVideoToDevice" label="(Optional) Save video to device" />
            <q-separator />
            <q-card-section class="flex flex-center column">
              <div class="video-container col text-center">
                <video ref="videoOutput" id="videoPreview" autoplay playsinline webkit-playsinline controls>
                  <source src="" type="video/mp4">
                    Your browser does not support HTML5 video.
                </video>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="col q-mb-md flex flex-center">
                <q-btn v-show="!isRecording" padding="md" round color="white" size="xl" push @click="startRecording">
                  <q-icon size="xl" name="photo_camera" color="negative"/>
                </q-btn>
                <q-btn v-show="isRecording" round push @click="stopVideoCapture">
                  <q-icon size="84px" name="stop" color="negative"/>
                </q-btn>
              </div>
              <div class="text-subtitle2 text-center q-mt-md">{{!isRecording ? 'Start recording': 'Stop recording'}}</div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
      <div v-else>
        <q-card v-if="!poe" flat class="q-pa-lg flex flex-center">
          <q-card-section>
            <div class="text-h6 flex flex-center">Processing video</div>
            <div class="text-subtitle2 q-mb-md">Retrieving results from analysed video</div>
            <q-separator />
            <div class="q-mt-md flex flex-center">
              <q-spinner-dots color="primary" size="3em" />
            </div>
          </q-card-section>
        </q-card>
        <transition v-else appear enter-active-class="animated fadeIn">
          <q-card flat class="q-ma-lg evaluation-card">
            <q-card-section>
              <div class="text-h6">Video Evaluation</div>
              <div class="text-body1">Results from recorded exercise video</div>
            </q-card-section>
            <q-separator />
            <poe-view-modal 
              :assessmentResults="poe" 
              class="q-mt-sm"
            />
          </q-card>
        </transition>
        <div class="q-pa-lg video-container">
          <div v-if="uploadedFile == 'missing'" class="q-ma-md flex flex-center">
            <q-chip size="md" color="warning" icon="warning" text-color="black">Exercise video was not found</q-chip>
          </div>
          <video v-else ref="videoPreview" id="videoPreview" autoplay playsinline webkit-playsinline controls>
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
import PoeViewModal from './PoeViewModal.vue'

export default {
  components: { ExerciseInstructions, PoeViewModal },
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
      uploadedFile: undefined,
      videoFile: undefined,
      poe: undefined,
      isGettingPOEStatus: true,
      showPreview: false,
      openRecordModal: false,
      saveVideoToDevice: false
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
      try {
        if (!navigator.mediaDevices?.enumerateDevices) console.error("Not possible to list input devices")
        let devices = await navigator.mediaDevices.enumerateDevices()
        for (const input in devices) {
          if (devices[input].kind.includes('videoinput')) {
            console.debug("device supports video recording.")
            this.hasVideoDevice = true
          }
        }
        return this.hasVideoDevice
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Video not available: '+ err.message,
          icon: 'report_problem'
        })
      }

    },
    async videoCapture () {
      this.showPreview = false
      this.videoChunks = []
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then((stream) => {
          this.$refs.videoOutput.srcObject = stream
          this.mediaRecorder = new MediaRecorder(stream)
        })
        .catch((err) => {
          this.isRecording = false
          console.error(err)
          return this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Rear-facing camera not available',
            icon: 'report_problem'
          })
        })
    },
    async stopVideoCapture () {
      this.$q.loading.show()
      await nicers.delay(200)
      this.isRecording = false
      this.showPreview = true
      this.mediaRecorder.stop()

      const filename = 'exercise_' + this.exerciseID + '.webm'
      let blob = new Blob(this.videoChunks, { type: "video/webm" });
      let mediaBlobUrl = URL.createObjectURL(blob);
      let file = new File([blob], filename, { type: 'video/webm' })
      const output = this.$refs.uploadedVideoPreview

      this.uploadedFile = file
      output.style.display = 'block'
      output.src = URL.createObjectURL(file)

      // saves video directly on device
      if (this.saveVideoToDevice) {
        let a = document.createElement('a')
        a.style = 'display: none'
        a.href = mediaBlobUrl
        a.download = filename
        a.click()
      }
      URL.revokeObjectURL(file)
      this.$refs.qRecordDialog.hide()
      this.$q.loading.hide()
    },
    async startRecording () {
      this.isRecording = true
      this.$refs.videoOutput.classList.toggle('recording')
      this.mediaRecorder.start(1000)
      this.mediaRecorder.ondataavailable = (e) => this.videoChunks.push(e.data)
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
          loading.hide()
          let errMsg = err
          if (err.response.status == 400 || err.response.status == 404 || err.response.status === 413 || err.response.status === 500) errMsg = err.response.data
          this.$q.notify({
            type: 'negative',
            position: 'top',
            message: 'Video cannot be saved: ' + errMsg,
            icon: 'warning'
          })
          this.uploadedFile = undefined
          this.videoFile = undefined
        }
        loading.hide()
        return
      }
    },
    async getVideoExercise() {
      try {
        let resp = await API.getExercise(this.exerciseID)
        if (resp) this.videoFile = resp.videoFile
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
                let confidences = []
                poe["posturalOrientation"] = nicers.formattedPosturalOrientation(poe.posturalOrientation)
                poe["scoreToText"] = nicers.formattedScoreToText(poe.score)
                poe["repetition"] = poe["repetition"] === 0 ? 'Summative evaluation' : poe["repetition"]

                for (let i = 0; i < 3; i++) {
                  confidences.push({score: poe['scoreConfidence_'+ i] = parseFloat((poe['scoreConfidence_'+ i]*100)).toFixed(0), text: nicers.formattedScoreToText(i)})
                  poe['confidences'] = confidences
                  delete poe['scoreConfidence_'+ i]
                }
                poe["highestPredictedConfidence"] = poe['confidences'][poe.score].score
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
      try {
        let blob = await API.getUploadFile(this.exerciseID)
        let videoURL = URL.createObjectURL(blob)
        this.$refs.videoPreview.src = videoURL        
      } catch (err) {
        this.uploadedFile = 'missing'
      }
    },
    rejectedUpload (file) {
      this.$q.notify({
        color: 'negative',
        position: 'top',
        message: 'Uploaded file is not a video: ' + file[0].file.name,
        icon: 'report_problem'
      })
      this.$refs.uploader.removeFile(this.uploadedFile)
    },
    async openRecordingModal () {
      this.openRecordModal = !this.openRecordModal
      await nicers.delay(500)
      if (this.$refs.videoOutput) await this.videoCapture()
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
.videoPlaceholder {
  margin: 0 auto;
  height: 400px;
  width: 300px;
  max-width: 100%;
}
#recordModal .video-container {
  display: flex;
  min-height: 400px;
  max-width: 100%;
}
.recording {
  outline: 2px solid var(--q-negative);
}

@media only screen and (max-width: 550px) {
  .video-container {
    max-width: 100%;
  }
}
</style>
