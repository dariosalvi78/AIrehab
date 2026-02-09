<template>
  <q-page-container style="padding-top:16px;">
    <q-btn class="q-ml-md" round dense color="primary" size="lg" icon="chevron_left" @click="goToSession" />
    <q-page class="q-py-md">
      <div v-if="!videoFile">
        <exercise-instructions class="q-mb-md"/>
        <q-separator />
        <q-card flat class="q-mx-md">
          <q-card-section v-show="!uploadedFile" class="column items-center q-pa-sm">
            <div class="text-body2 text-center q-my-md">{{ $t('exercises.record.title') }}</div>
            <q-btn v-if="hasVideoDevice" class="q-mb-md q-pa-md full-width" push no-caps :label="$t('exercises.record.open_camera')" color="secondary" icon-right="camera" @click="openRecordingModal" />
            <div v-else class="flex column items-center full-width">
              <q-badge class="col q-mb-md" outline color="negative" :label="$t('exercises.record.no_device')" />
              <q-btn class="col q-mb-md q-pa-md q-py-sm full-width" push :label="$t('exercises.record.reconnect')" color="secondary" icon="refresh" @click="checkForVideoSupport" no-caps />
            </div>
          </q-card-section>
          <q-card-section v-if="showUploadPrompt" class="column items-center q-pa-sm">
            <div v-show="!uploadedFile" class="text-body2 text-center q-my-md">{{ $t('exercises.record.upload_desc') }}</div>
            <q-file class="q-mb-sm full-width" filled ref="uploader" type="file" name="uploaded_file" accept="video/*" color="secondary" :label="$t('exercises.record.upload')" 
              v-model="uploadedFile" @change.capture="uploadedRecordedVideo" @rejected="rejectedUpload"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-if="uploadedFile" v-slot:append>
                <q-icon name="cancel" @click.stop.prevent="clearUpload" class="cursor-pointer" />
              </template>
            </q-file>
            <form ref="form" action="" method="POST" enctype="multipart/form-data" @submit.prevent="saveVideo">
            </form>
            <div class="video-container col" v-show="uploadedFile">
              <video ref="uploadedVideoPreview" controls autoplay playsinline webkit-playsinline controlsList="nodownload">
                <source src="" type="video/mp4">
                Your browser does not support HTML5 video.
              </video>
            </div>
            <div class="q-mt-md text-body2" v-if="uploadedFile">
              {{ $t('exercises.record.recorded') }}: {{formatModifiedDate}}<br/>
              {{ $t('exercises.record.size') }}: {{getUploadedFileSize}}
            </div>
            <q-btn v-show="uploadedFile" class="q-my-md q-pa-md full-width" push :label="$t('exercises.record.begin')" color="secondary" no-caps icon-right="cloud_upload" @click="saveVideo" />
          </q-card-section>
        </q-card>
        <q-dialog id="recordModal" ref="qRecordDialog" v-model="openRecordModal" maximized class="q-pa-none">
          <q-card class="full-width q-my-none q-py-none">
            <q-card-section class="q-pb-none flex justify-between">
              <div class="text-body1">{{ $t('exercises.record.dialog.title') }}</div>
              <q-btn class="q-pa-none q-pb-sm" flat :label="$t('common.close')" v-close-popup  @click="stopRecording" />
            </q-card-section>
            <q-separator />
            <q-card-section class="flex flex-center column q-pa-sm">
              <div class="video-container col text-center flex flex-center">
                <video ref="videoOutput" id="videoPreview" autoplay playsinline webkit-playsinline controls controlsList="nodownload">
                  <source src="" type="video/mp4">
                    Your browser does not support HTML5 video.
                </video>
                <div class="action-btn flex flex-center">
                  <div class="col flex flex-center">
                    <q-btn v-show="!isRecording" padding="md" round color="white" size="xl" push @click="startRecording">
                      <q-icon size="xl" name="photo_camera" color="negative"/>
                    </q-btn>
                    <q-btn v-show="isRecording" padding="md" round color="white" size="xl" push @click="stopRecording">
                      <q-icon size="xl" name="stop" color="negative"/>
                    </q-btn>
                  </div>
                  <div class="text-subtitle2 text-center text-white">{{!isRecording ? $t('exercises.record.dialog.start'): $t('exercises.record.dialog.stop')}}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
      <div v-else>
        <q-card v-if="!poeResultsToFormat" flat class="q-pa-lg flex flex-center column">
          <q-card-section class="flex flex-center q-gutter-sm evaluation-card">
            <q-icon name="info_outline" size="md" class="q-ml-xs" />
            <div class="text-body2 text-center" v-html="$t('exercises.results.processing_info')"></div>
          </q-card-section>
          <q-card-section>
            <div class="text-h6 flex flex-center">{{ $t('exercises.results.processing') }}</div>
            <div class="text-subtitle2 q-mb-md">{{ $t('exercises.results.retrieving') }}</div>
            <q-btn :label="$t('exercises.results.preview_video')" @click="openExerciseVideoDialog" icon-right="open_in_new" no-caps :ripple="false" flat class="q-pl-none q-mt-sm"/>
            <q-separator />
            <div class="q-mt-md flex flex-center">
              <q-spinner-dots color="primary" size="3em" />
            </div>
          </q-card-section>
        </q-card>
        <transition v-else appear enter-active-class="animated fadeIn">
          <q-card flat class="q-ma-lg evaluation-card">
            <q-card-section>
              <div class="text-h6">{{ $t('exercises.results.title') }}</div>
              <div class="text-body1">{{ $t('exercises.results.description') }}</div>
              <q-btn :label="$t('exercises.results.review_video')" @click="openExerciseVideoDialog" icon-right="open_in_new" no-caps :ripple="false" flat class="q-pl-none q-mt-sm"/>
            </q-card-section>
            <q-separator />
            <poe-view-modal
              :assessmentResults="poeResultsToFormat"
              class="q-mb-sm"
            />
          </q-card>
        </transition>
        <q-dialog class="q-pa-lg video-container" v-model="openExerciseVideo">
          <q-card class="full-width q-pa-md">
            <div v-if="uploadedFile == 'missing'" class="q-ma-md flex flex-center">
              <q-chip size="md" color="warning" icon="warning" text-color="black">{{ $t('exercises.results.recording_not_found') }}</q-chip>
            </div>
            <video v-else ref="videoPreview" id="videoPreview" autoplay playsinline webkit-playsinline controls controlsList="nodownload">
              Your browser does not support HTML5 video.
            </video>
          </q-card>
        </q-dialog>
      </div>
    </q-page>
  </q-page-container>
</template>

<script>
import { mergeLocaleMessages } from 'src/boot/i18n'
import API from '../../API'
import nicers from '../../utils/nicers'
import exerciseTypes from '../../utils/types/exerciseTypesEnum'
import ExerciseInstructions from './ExerciseInstructions.vue'
import PoeViewModal from './PoeViewModal.vue'

export default {
  components: { ExerciseInstructions, PoeViewModal },
  name: 'ExerciseViewModal',
  i18n: await mergeLocaleMessages(['exercises']),
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
      poeResultsToFormat: undefined,
      isGettingPOEStatus: true,
      showPreview: false,
      openRecordModal: false,
      saveVideoToDevice: false,
      openExerciseVideo: false,
      /** @type {MediaStreamConstraints} */
      constraints: {
        video: {
          facingMode: 'environment',
          aspectRatio: 16/9,
          width: { min: 1024, ideal: 1280, max: 1920 },
          height: { min: 400, ideal: 720, max: 1080 },
          frameRate: { min: 25, ideal: 30, max: 60 },
          bits: 2500000
        },
        audio: false,
        codecs: ['video/mp4; codecs="vp9"', 'video/mp4;']
      },
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
          message: this.$t('exercises.notification.video_not_available', { error: err.message }),
          icon: 'report_problem'
        })
      }

    },
    async videoCapture () {
      const MEDIA_CONSTRAINTS = this.constraints
      let supported_codec = undefined
      this.showPreview = false
      this.videoChunks = []

      navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
        .then((stream) => {
          for (const codec of this.constraints.codecs) if (MediaRecorder.isTypeSupported(codec)) { supported_codec = codec; break }
          if (!supported_codec) throw new Error(this.$t('exercises.notification.web_recording_not_supported'))
          this.$refs.videoOutput.srcObject = stream
          const mediaRecorder = new MediaRecorder(stream, { mimeType: supported_codec, videoBitsPerSecond: this.constraints.bits  })
          this.mediaRecorder = mediaRecorder

          this.mediaRecorder.ondataavailable = (e) => {
            this.videoChunks.push(e.data)
          }
          this.mediaRecorder.onerror = (err) => {
            console.error(err)
            this.$q.notify({
              color: 'negative',
              position: 'bottom',
              message: this.$t('exercises.notification.recording_error', { error: err }),
              icon: 'report_problem'
            })
          }
          this.mediaRecorder.onstop = (e) => this.stopVideoCapture()
        })
        .catch((err) => {
          this.isRecording = false
          console.error(err)
          return this.$q.notify({
            color: 'negative',
            position: 'bottom',
            message: this.$t('exercises.notification.camera_not_available', { error: err }),
            icon: 'report_problem'
          })
        })
    },
    async stopVideoCapture () {
      this.$q.loading.show()
      await nicers.delay(200)

      const filename = 'exercise_' + this.exerciseID + '.mp4'
      let blob = new Blob(this.videoChunks, { type: this.mediaRecorder.mimeType })
      let mediaBlobUrl = URL.createObjectURL(blob)

      let file = new File([blob], filename, { type: this.mediaRecorder.mimeType })
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
    async stopRecording () {
      this.isRecording = false
      this.showPreview = true
      if (this.mediaRecorder) {
        this.mediaRecorder.stream.getTracks().forEach( track => track.stop() )
        this.mediaRecorder.stop()
      }
    },
    async startRecording () {
      this.isRecording = true
      this.$refs.videoOutput.classList.toggle('recording')
      this.mediaRecorder.start(1000)
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
            message: this.$t('exercises.notification.uploading_video')
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
              message: this.$t('exercises.notification.video_upload_success'),
              html: true
            })
            let formattedType = exerciseTypes.typeToAsc(results.type), exerciseDate = nicers.formattedDayOfMonth(results.date)
            const meta_info = { typeAsc: formattedType, date: exerciseDate }
            console.log(meta_info)
            let poe_evaluation = await API.sendPOE(meta_info, this.exerciseID)
            if (poe_evaluation) {
              loading.hide()
              this.$q.notify({
                type: 'info',
                position: 'top',
                message: this.$t('exercises.notification.processing_started'),
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
            message: this.$t('exercises.notification.uploading_video_error', { error: errMsg }),
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
          message: this.$t('exercises.notification.get_video_exercise', { error: errMsg }),
          icon: 'warning'
        })
      }
    },
    async getPOE() {
        while (this.isGettingPOEStatus) {
          try {
            let resp = await API.getPOE(this.exerciseID)
            if (resp && resp._results) {
              this.poeResultsToFormat = resp._results
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
        message: this.$t('exercises.notification.upload_rejected', { file: file[0].file.name }),
        icon: 'report_problem'
      })
      this.$refs.uploader.removeFile(this.uploadedFile)
    },
    async openRecordingModal () {
      this.openRecordModal = !this.openRecordModal
      await nicers.delay(500)
      if (this.$refs.videoOutput) await this.videoCapture()
    },
    async openExerciseVideoDialog () {
      this.uploadedFile = true
      this.openExerciseVideo = !this.openExerciseVideo
      await this.getVideoPathForExercise()
    },
    clearUpload () {
      this.uploadedFile = null
      this.showPreview = !this.showPreview
    },
    goToSession () {
      return this.$router.push('/home/sessions/' + this.sessionID)
    }
  },
  computed: {
    formatModifiedDate () {
      let lastModified = new Date(this.uploadedFile.lastModified).toLocaleString()
      return nicers.formattedDayOfMonth(lastModified)
    },
    getUploadedFileSize () {
      let formatFileSize = this.uploadedFile.size
      return (formatFileSize / Math.pow(1024, 2)).toFixed(1) + ' MB'
    },
    showUploadPrompt () { return process.env.DEV || (this.showPreview) }
  },
  unmounted () {
    this.isGettingPOEStatus = false
    this.openExerciseVideo = false
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

#recordModal .video-container > #videoPreview {
  max-height: 100%;
  height: 100%;
  margin: 0 auto;
  border-radius: 1em;
}

.recording {
  outline: 2px solid var(--q-negative);
  box-shadow: 0px 0px 5px 1px var(--q-negative)
}

.action-btn {
  position: absolute;
  flex-direction: column;
  bottom: 10vh;
}

@media only screen and (max-width: 550px) {
  .video-container {
    width: 100%;
    max-width: 100%;
  }
}
</style>
