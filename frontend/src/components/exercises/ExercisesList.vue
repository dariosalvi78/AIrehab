<template>
  <div>
    <div class="text-h5 q-ml-md">Exercises</div>
      <div v-if="exercises.length >= 1">
        <div 
          v-for="exercise in exercises" 
          :key="exercise.id"
        >
        <q-card class="q-ma-lg exercise-card">
          <q-card-section>
              <div class="text-h6">{{ exercise.type }}</div>
              <div class="text-body2">Start: {{ exercise.startTimestamp }}</div>
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
  </div>
</template>

<script>
import API from '../../API'
import exerciseEnum from '../../utils/exerciseTypesEnum.js'
import nicers from '../../utils/nicers'

export default {
  name: 'ExercisesList',
  props: { sessionID: String, newExerciseData: Object },
  data () {
    return {
      exercises: []
    }
  },
  async mounted () {
    await this.getExercises()
  },
  watch: {
    async newExerciseData () {
      await this.addNewExercise()
    }
  },
  methods: {
    async getExercises () {
      try {
        if (this.sessionID) {
          let resp = await API.getExercises(this.sessionID)
          resp.map((exercise) => {
            exercise.type = exerciseEnum.typeToAsc(exercise.type)
            exercise.startTimestamp = nicers.formattedDate(exercise.startTimestamp)
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
    async addNewExercise () {
      try {
        if (this.newExerciseData && this.sessionID) {
          let exercise = this.newExerciseData
          const { startTimestamp, type, notes } = exercise
          let resp = await API.addExercise(this.sessionID, startTimestamp, type, notes)
          if (resp) {
            this.$q.notify({
              type: 'positive',
              position: 'top',
              message: 'Created new exercise for current session',
            })
            await this.getExercises()
            return
          }
        }
      } catch (err) {
        let errMsg = err
        if (err.response && err.response.status == 400) errMsg = err.response.data
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Creating new exercise failed: ' + errMsg,
          icon: 'report_problem'
        })
      }
    },
  }
}
</script>

<style scoped>

</style>