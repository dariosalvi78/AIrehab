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
            <!-- TODO: update end date button, disabled for now -->
            <q-btn
              class="q-mr-md"
              v-if="!session.endTimestamp"
              label="Set end date"
              size="sm"
              dense
              color="secondary"
              :disabled="true" 
            >
              <q-popup-proxy>
                <q-date
                  ref="datePicker"
                  v-model="endDate"
                  minimal
                  :options="date => formatDate(date) >= session.startTimestamp"
                  mask="YYYY-MM-DD"
                  today-btn
                >
                  <template v-slot>
                    <div class="row items-center justify-end q-gutter-sm">
                      <div class="text-weight-bold">{{endDate}}</div>
                      <q-btn label="Cancel" color="primary" size="sm" v-close-popup />
                      <q-btn label="Confirm" color="primary" size="sm" @click="submitNewEndDate" />
                    </div>
                  </template>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn dense class="q-mr-md" label="Close session" color="negative" size="sm" icon="close" @click="closeSession"/>
            <q-btn dense class="q-my-md" color="secondary" size="sm" label="Start new exercise" icon-right="chevron_right" @click="newExercisePrompt = !newExercisePrompt" />
          </div>
        </q-card-section>
        <q-separator inset />
      </q-card>
      <exercise-form 
        v-model="newExercisePrompt"
        @newExercise="addNewExercise"
      />
      <div v-if="exercises.length >= 1">
        <div 
          v-for="exercise in exercises" 
          :key="exercise.id"
        >
        <q-card class="q-ma-lg exercise-card">
          <q-card-section>
              <div class="text-h6">{{ exercise.type }}</div>
              <div class="text-body2">Start: {{ formatDate(exercise.startTimestamp) }}</div>
          </q-card-section>
         <q-card-section>
              <div class="text-body2">{{ exercise.notes }}</div>
          </q-card-section>
        </q-card>
        </div>
      </div>
      <div v-else class="flex flex-center column">
        <div class="text-h6 q-pa-md">No exercises in session</div>
      </div>
    </q-page>
    <div v-else class="q-pa-lg flex flex-center column">
      <div class="q-py-md text-h6">No session found</div>
      <q-btn color="secondary" size="md" label="Go back" icon="chevron_left" @click="this.$router.go(-1)" />
    </div>
  </q-page-container>
</template>

<script>
import { ref } from 'vue'
import ExerciseForm from '../ExerciseForm.vue'
import exerciseDataTypes from '../../utils/exerciseDataTypes'
import API from '../../API'
import nicers from '../../utils/nicers'

export default {
  name: 'ExerciseViewModal',
  components: { ExerciseForm },
  props: { sessionID: String },
  data () {
    return {
      session: undefined,
      endDate: undefined,
      newExercisePrompt: undefined,
      exercises: []
    }
  },
  async created () {
    this.resetForm()
    await this.getSessionData()
    await this.getExercisesData()
  },
  methods: {
    async getSessionData () {
      try {
        let resp = await API.getSession(this.sessionID)
        this.session = resp
        this.endDate = this.formatDate(resp.endTimestamp)
      } catch (err) {
        this.session = undefined  
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: err.response.status == 404 ? 'Found no session with the given ID' : 'Cannot fetch current session: ' + err,
          icon: 'warning'
        })
      }
    },
      async getExercisesData () {
      try {
        if (this.session) {
          let resp = await API.getExercises(this.sessionID)
          resp.map((exercise) => {
            exercise.type = exerciseDataTypes.typeToAsc(exercise.type)
          })
          this.exercises = resp
        }
      } catch (err) {
        this.session = undefined  
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Cannot fetch current exercises: ' + err,
          icon: 'warning'
        })
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
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Something went wrong when closing session: ' + err,
          icon: 'warning'
        })
      }
      this.$q.loading.hide()
      return
    },
    async addNewExercise (newExercise) {
      try {
        let exercise = newExercise
        const { startTimestamp, type, notes } = exercise
        await API.addExercise(this.sessionID, startTimestamp, type, notes)
      } catch (err) {
        let errMsg = err
        if (err.response.status == 400) errMsg = err.response.data
         this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Creating new exercise failed: ' + errMsg,
          icon: 'report_problem'
        })
      }
    },
    selectDate (date) {
      return this.formatDate(date) >= this.date.from
    },
    formatDate (date) {
      return nicers.formattedDate(date)
    },
    resetForm () {
      this.exercises = []
      this.session = undefined
      this.newExercisePrompt = undefined
    }
  }
}
</script>

<style scoped>
</style>