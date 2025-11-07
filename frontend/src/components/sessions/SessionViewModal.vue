<template>
  <q-page-container class="q-py-md" style="paddingTop:auto;">
    <q-page v-if="session">
      <q-btn round dense class="q-ml-md" color="primary" size="lg" icon="chevron_left" @click="this.$router.push('/home')" />        
       <q-card flat class="q-pb-lg q-mt-sm">
        <q-card-section>
          <div class="text-h6">
            {{ $t('exercises.sessions.title', { name: session.patientName }) }}
          </div>
          <div class="text-body2 q-mt-sm" style="marginLeft: -3px;">
            <q-icon style="bottom: 2px" size="sm" name="calendar_month"/>
            {{ formatDate(session.startTimestamp) }} - {{ session.endTimestamp ? formatDate(session.endTimestamp) : $t('exercises.sessions.no_end_date') }}
          </div>
          <div>
            <q-btn dense class="q-mr-md" :label="$t('common.delete_session')" color="negative" size="sm" icon="close" @click="closeSession"/>
            <q-btn dense class="q-my-md" color="secondary" size="sm" :label="$t('common.start_exercise')" icon-right="chevron_right" @click="openExerciseModal('new')" />
          </div>
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
      <q-spinner-dots
          color="primary"
          size="3em"
        />
    </div>
    <div v-else class="q-pa-lg flex flex-center column">
      <div class="q-py-md text-h6">No session found</div>
      <q-btn color="secondary" size="md" label="Go back" icon="chevron_left" @click="this.$router.go(-1)" />
    </div>
  </q-page-container>
</template>

<script>
import { ref } from 'vue'
import ExerciseForm from '../exercises/ExerciseForm.vue'
import ExercisesList from '../exercises/ExercisesList.vue'
import API from '../../API'
import nicers from '../../utils/nicers'

export default {
  name: 'SessionViewModal',
  components: { ExerciseForm, ExercisesList },
  props: { sessionID: String },
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
    this.resetForm()
    await this.getSessionData()
  },
  methods: {
    async getSessionData () {
      try {
        let resp = await API.getSession(this.sessionID)
        this.session = resp
        this.endDate = this.formatDate(resp.endTimestamp)
      } catch (err) {
        this.session = undefined  
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: err.response.status == 404 ? 'Found no session with the given ID' : 'Cannot fetch current session: ' + err,
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
          message: 'Something went wrong when updating session: ' + err,
          icon: 'warning'
        })
      }
    },
    async closeSession () {
      try {
        this.$q.loading.show()
        await API.deleteSession(this.sessionID)
        await nicers.delay(500)
        this.$q.notify({
          color: 'info',
          position: 'top',
          message: 'Session has been deleted',
          icon: 'info'
        })
        this.$router.go(-1)
      } catch (err) {
        let errMsg = err
        if (err.response && err.response.status == 409) errMsg = err.response.data
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Cannot delete session: ' + errMsg,
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
          message: 'Patient has not consented to be part of exercise',
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