<template>
  <q-page-container class="q-pa-lg">
    <q-page v-if="session">
      <q-btn round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.go(-1)" />        
       <q-card flat class="q-py-lg">
        <q-card-section>
          <div class="text-h6">
            Session for {{session.patientName}}
          </div>
          <div class="text-subtitle-1">
            <q-icon style="bottom: 2px" size="sm" name="calendar_month"/>
            {{ formatDate(session.startTimestamp) }}
          </div>
          <div class="text-body2">
            {{ session.endTimestamp ? formatDate(session.endTimestamp) : 'No end date' }}
          </div>
          <div>
            <q-btn dense class="q-mr-md" label="Close session" color="negative" size="sm" icon="close" @click="closeSession"/>
            <q-btn dense class="q-my-md" color="secondary" size="sm" label="Start new exercise" icon-right="chevron_right" @click="newExercisePrompt = !newExercisePrompt" />
          </div>
        </q-card-section>
        <q-separator inset />
      </q-card>
      <exercise-form 
        v-model="newExercisePrompt"
        @newExercise="(data) => (newExercise = data)"
      />
      <exercises-list :sessionID="sessionID" :newExerciseData="newExercise"/>
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
      newExercisePrompt: undefined,
      isloadingSession: true,
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
          message: 'Something went wrong when closing session: ' + errMsg,
          icon: 'warning'
        })
      }
      this.$q.loading.hide()
      return
    },
    selectDate (date) {
      return this.formatDate(date) >= this.date.from
    },
    formatDate (date) {
      return nicers.formattedDate(date)
    },
    resetForm () {
      this.session = undefined
      this.newExercisePrompt = undefined
      this.newExercise = {}
    }
  }
}
</script>

<style scoped>
</style>