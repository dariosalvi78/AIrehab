<template>
  <q-dialog id="recordModal" ref="qRecordDialog" maximized class="q-pa-none">
    <q-card class="full-width q-my-none q-py-none">
      <q-card-section class="q-pb-none flex justify-between">
        <q-btn class="q-pa-none q-pb-sm" icon="close" :label="$t('common.close')" 
          flat no-caps v-close-popup @click="stopRecording"
        />
        <div class="text-body1">{{ $t('exercises.record.dialog.title') }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="flex flex-center column q-pa-sm">
        <div class="video-container col text-center flex flex-center">
          <video ref="videoOutput" id="videoPreview" autoplay playsinline webkit-playsinline :controls="false"
            disable-picture-in-picture controlsList="nodownload">
            <source src="" type="video/mp4">
            Your browser does not support HTML5 video.
          </video>
          <div v-show="!mediaRecorder?.error" class="recording-actions flex flex">
            <div v-show="isRecording" class="text-subtitle2 text-center text-white">{{ displayTimer }}</div>
            <div class="col flex flex-center">
              <q-btn padding="md" round color="white" size="xl" class="shadow-8" push
                @click="!isRecording ? startRecording() : stopRecording()">
                <q-icon size="xl" :name="!isRecording ? 'photo_camera' : 'stop'" color="negative" />
              </q-btn>
            </div>
            <div class="text-subtitle2 text-center text-white">{{ !isRecording ? $t('exercises.record.dialog.start') :
              $t('exercises.record.dialog.stop') }}</div>
          </div>
          <div v-if="mediaRecorder?.loading" class="q-mt-md flex flex-center">
            <q-spinner-dots color="primary" size="3em" />
          </div>
          <div v-show="mediaRecorder.error" class="text-subtitle2" v-html="mediaRecorder.error"></div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import nicers from '../../utils/nicers'

export default {
  name: 'RecordingModal',
  props: {
    exerciseID: String,
    toggle: Boolean
  },
  emits: ['set:uploadedFile'],
  data() {
    return {
      mediaRecorder: undefined,
      videoChunks: [],
      isRecording: false,
      videoFile: undefined,
      saveVideoToDevice: false,
      openExerciseVideo: false,
      timer: { elapsed: 0, interval: null },
      /** @type {MediaStreamConstraints} */
      constraints: {
        video: {
          facingMode: 'environment',
          aspectRatio: 16 / 9,
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
  watch: {
    async toggle() {
      this.$refs.qRecordDialog.show()
      this.mediaRecorder = { loading: true }
      await nicers.delay(500)
      if (this.$refs.videoOutput) {
        await this.videoCapture()
        this.mediaRecorder.loading = false
        document.querySelector('.recording-actions').classList.add('visible')
      }
    }
  },
  methods: {
    async videoCapture() {
      const MEDIA_CONSTRAINTS = this.constraints
      let supported_codec = undefined
      this.videoChunks = []

      navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
        .then((stream) => {
          for (const codec of this.constraints.codecs) if (MediaRecorder.isTypeSupported(codec)) { supported_codec = codec; break }
          if (!supported_codec) throw new Error(this.$t('exercises.notification.web_recording_not_supported'))
          this.$refs.videoOutput.srcObject = stream
          const mediaRecorder = new MediaRecorder(stream, { mimeType: supported_codec, videoBitsPerSecond: this.constraints.bits })
          this.mediaRecorder = mediaRecorder

          this.mediaRecorder.ondataavailable = (e) => {
            this.videoChunks.push(e.data)
          }
          this.mediaRecorder.onerror = (err) => {
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
          this.mediaRecorder = { ...this.mediaRecorder, error: `${err}<br><br>${this.$q.platform.userAgent}` }
          return this.$q.notify({
            color: 'negative',
            position: 'bottom',
            message: this.$t('exercises.notification.camera_not_available', { error: err }),
            icon: 'report_problem'
          })
        })
    },
    async stopVideoCapture() {
      this.$q.loading.show()
      await nicers.delay(200)

      const filename = 'exercise_' + this.exerciseID + '.mp4'
      let blob = new Blob(this.videoChunks, { type: this.mediaRecorder.mimeType })
      let mediaBlobUrl = URL.createObjectURL(blob)

      let file = new File([blob], filename, { type: this.mediaRecorder.mimeType })
      this.$emit('set:uploadedFile', file)

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
    async stopRecording() {
      this.isRecording = false
      if (this.mediaRecorder?.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
        this.mediaRecorder.stop()
      }
      if (this.timer?.interval) clearInterval(this.timer.interval)
      this.timer.elapsed = 0
    },
    async startRecording() {
      this.isRecording = true
      this.$refs.videoOutput.classList.toggle('recording')
      this.mediaRecorder.start(1000)
      this.timer.interval = setInterval(() => {
        this.timer.elapsed++
      }, 1000)
    },
  },
  computed: {
    displayTimer() { if (this.timer?.interval) return nicers.formattedTimer(this.timer.elapsed) }
  }
}
</script>

<style scoped>
#recordModal .video-container>#videoPreview {
  max-height: 100%;
  height: 100%;
  margin: 0 auto;
  transition: 0.5s ease-in-out;
}
.recording {
  outline: 2px solid var(--q-negative);
  box-shadow: 0px 0px 5px 1px var(--q-negative)
}
.recording-actions {
  position: absolute;
  flex-direction: column;
  bottom: 8vh;
  gap: 8px;
  opacity: 0;
  transition: 0.5s ease-in-out;
}
.visible {
  opacity: 1;
}
</style>
