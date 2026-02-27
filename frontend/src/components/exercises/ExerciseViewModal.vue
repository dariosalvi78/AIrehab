<template>
  <q-page-container style="padding-top:16px;">
    <q-page class="q-pb-md q-pt-none">
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
            <q-file class="full-width" filled ref="uploader" type="file" name="uploaded_file" accept="video/*" color="secondary" :label="$t('exercises.record.upload')" 
              v-model="uploadedFile" @change.capture="(e) => setVideoOutput(e.target.files[0])" @rejected="rejectedUpload" :readonly="!!uploadedFile"
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
            <q-list bordered separator class="text-body2 full-width row justify-evenly" v-if="uploadedFile">
              <q-item>
                <q-item-section>
                  <q-item-label overline>{{ $t('exercises.record.recorded') }}</q-item-label>
                  <q-item-label> {{ formatModifiedDate }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>{{ $t('exercises.record.size') }}</q-item-label>
                  <q-item-label>{{getUploadedFileSize}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="video-container col q-py-lg" v-show="uploadedFile">
              <video ref="uploadedVideoPreview" controls autoplay playsinline webkit-playsinline controlsList="nodownload">
                <source src="" type="video/mp4">
                Your browser does not support HTML5 video.
              </video>
            </div>
            <q-btn v-show="uploadedFile" class="q-mt-sm q-mb-lg q-pa-md full-width" push :label="$t('exercises.record.begin')" color="secondary" no-caps icon-right="cloud_upload" @click="saveVideo" />
          </q-card-section>
        </q-card>
        <recording-modal
          :exerciseID="exerciseID"
          :toggle="toggleRecordDialog"
          @set:uploaded-file="(file) => setVideoOutput(file)"
        >
        </recording-modal>
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
              <div class="text-h4 text-weight-light">{{ $t('exercises.results.title') }}</div>
              <div class="text-subtitle1 q-mt-sm">{{ $t('exercises.results.description') }}</div>
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
import RecordingModal from './RecordingModal.vue'

export default {
  components: { ExerciseInstructions, PoeViewModal, RecordingModal },
  name: 'ExerciseViewModal',
  i18n: await mergeLocaleMessages(['exercises']),
  props: {
    sessionID: String,
    exerciseID: String
  },
  data () {
    return {
      hasVideoDevice: false,
      uploadedFile: undefined,
      videoFile: undefined,
      poeResultsToFormat: undefined,
      isGettingPOEStatus: true,
      showPreview: false,
      toggleRecordDialog: false,
      openExerciseVideo: false
    }
  },
  async beforeMount () {
    this.$route.meta = '/home/sessions/' + this.sessionID
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
    async setVideoOutput (file) {
      this.showPreview = true
      this.uploadedFile = file
      await nicers.delay(100)
      const output = this.$refs.uploadedVideoPreview
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
            let formattedType = this.$t(`exercises.form.types.${results.type}`), exerciseDate = nicers.formattedDayOfMonth(results.date)
            const meta_info = { typeAsc: formattedType, date: exerciseDate }
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
          this.$router.push(`/home/sessions/${this.sessionID}`)
        }
        return this.$q.notify({
          type: 'negative',
          position: 'top',
          message: this.$t('common.notification.error_generic', { error: this.$t('exercises.notification.exercise_not_found', { error: errMsg }) }),
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
      this.showPreview = false
      this.toggleRecordDialog = !this.toggleRecordDialog
    },
    async openExerciseVideoDialog () {
      this.uploadedFile = true
      this.openExerciseVideo = !this.openExerciseVideo
      await this.getVideoPathForExercise()
    },
    clearUpload () {
      this.uploadedFile = null
      this.showPreview = !this.showPreview
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

<style>
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
  border-radius: 8px;
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
@media only screen and (max-width: 550px) {
  .video-container {
    width: 100%;
    max-width: 100%;
  }
}
</style>
