<template>
  <q-page-container class="q-pb-md" style="padding-top: 0px;">
    <q-page v-if="session">
      <q-card flat class="q-pb-lg q-mt-sm">
        <q-card-section>
          <div class="text-h6 text-weight-regular">
            {{ $t('exercises.sessions.title', { name: session.patientName }) }}
          </div>
          <div class="text-body2 q-mt-sm" style="margin-left: -3px;">
            <q-icon style="bottom: 2px" size="sm" name="calendar_month"/>
            {{ formatDate(session.startTimestamp) }} - {{ session.endTimestamp ? formatDate(session.endTimestamp) : $t('exercises.sessions.no_end_date') }}
          </div>
          <q-btn-group push spread class="q-mt-md">
            <q-btn :label="$t('common.delete_session')" color="negative" size="12px" icon="close" no-caps @click="closeSession"/>
            <q-btn color="secondary" size="12px" :label="$t('common.start_exercise')" icon-right="add" no-caps @click="openExerciseModal('new')" />
          </q-btn-group>
        </q-card-section>
        <q-separator />
      </q-card>
      <exercise-form
        :formMode="this.exerciseForm"
        :selectedExercise="this.selectedExercise"
        v-model="exerciseModalPrompt"
        @newExercise="(data) => (newExercise = data)"
      />
      <exercises-list
        :formMode="this.exerciseForm"
        :sessionID="sessionID"
        :newExerciseData="newExercise"
        @openExerciseModal="e => openExerciseModal('edit', e)"
        @deletedExercise="getSessionData"
      />
    </q-page>
    <div v-else-if="isloadingSession" class="q-ma-md flex flex-center">
      <q-spinner-dots color="primary" size="3em" />
    </div>
    <div v-else class="q-pa-lg flex flex-center column">
      <div class="q-py-md text-h6 text-weight-light text-center">{{ $t('exercises.sessions.does_not_exist') }}</div>
      <q-btn class="full-width" color="secondary" size="md" no-caps :label="$t('common.go_back')" icon="chevron_left" @click="this.$router.go(-1)" />
    </div>
  </q-page-container>
</template>

<script>
import ExerciseForm from '../exercises/ExerciseForm.vue'
import ExercisesList from '../exercises/ExercisesList.vue'
import API from '../../API'
import nicers from '../../utils/nicers'
import { mergeLocaleMessages } from 'src/boot/i18n';

export default {
  name: 'SessionViewModal',
  components: { ExerciseForm, ExercisesList },
  props: { sessionID: String },
  i18n: await mergeLocaleMessages(['exercises']),
  data () {
    return {
      session: undefined,
      endDate: undefined,
      exerciseModalPrompt: undefined,
      isloadingSession: true,
      exerciseForm: 'new',
      selectedExercise: undefined,
      newExercise: {}
    }
  },
  async created () {
    this.$route.meta = '/home?view=sessions'
    this.resetForm()
    await this.getSessionData()
  },
  methods: {
    async getSessionData () {
      try {
        const response = await API.getSession(this.sessionID)
        if (response?.isTestPatient) return this.$router.push('/home')
        this.session = response
        this.endDate = this.formatDate(response.endTimestamp)
      } catch (err) {
        this.session = undefined  
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: err.response.status == 404 
            ? this.$t('exercises.notification.session_not_found')
            : this.$t('exercises.notification.get_session_error', { error: err }),
          icon: 'warning'
        })
        this.isloadingSession = false
        return
      }
    },
    async submitNewEndDate () {
      try {
        if (this.endDate && this.sessionID) {
          let resp = await API.editSession(this.sessionID, { editEndTimestamp: this.endDate })
          console.log('edit. ',  resp)
        }  
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('exercises.notification.update_session_error', { error: err }),
          icon: 'warning'
        })
      }
    },
    async closeSession () {
      try {
        this.$q.loading.show()
        await API.deleteSession(this.sessionID)
        this.session = undefined
        await nicers.delay(500)
        this.$q.notify({
          color: 'info',
          position: 'top',
          message: this.$t('exercises.notification.session_deleted'),
          icon: 'info'
        })
        this.$router.push('/home?view=sessions')
      } catch (err) {
        let errMsg = err.response?.status == 409 ? this.$t('exercises.notification.session_ongoing') : err
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('exercises.notification.session_deleted_error', { error: errMsg }),
          icon: 'warning'
        })
      }
      this.$q.loading.hide()
      return
    },
    openExerciseModal (formMode, editData) {
      if (!this.session.activated) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('exercises.notification.patient_consent_missing'),
          icon: 'warning'
        })
      }
      if (formMode == 'edit') this.selectedExercise = editData
      this.exerciseModalPrompt = !this.exerciseModalPrompt
      this.exerciseForm = formMode
    },
    selectDate (date) {
      return this.formatDate(date) >= this.date.from
    },
    formatDate (date) {
      return nicers.formattedDayOfMonth(date)
    },
    resetForm () {
      this.session = undefined
      this.exerciseModalPrompt = undefined
      this.newExercise = {}
    }
  }
}
</script>

<style scoped>
</style>