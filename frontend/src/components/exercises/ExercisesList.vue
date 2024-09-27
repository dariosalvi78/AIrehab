<template>
  <div>
    <div class="text-h5 q-ml-md">Exercises {{getCountExercises}}</div>
      <div v-if="exercises.length >= 1">
        <div 
          v-for="exercise in exercises" 
          :key="exercise.id"
        >
          <transition appear enter-active-class="animated fadeIn delay-1s">
            <q-card class="q-ma-lg exercise-card">
              <q-card-section class="row">
                <div class="col-11">
                  <q-btn label="Go to exercise" dense color="secondary" size="sm" icon-right="open_in_new" @click="navigateToExercise(exercise.id)"/>
                  <div class="text-h6">{{ exercise.type ? exercise.type : 'Exercise' }}
                    <q-icon v-if="exercise.videoFile" size="sm" name="video_file" />
                  </div>
                  <div style="margin-left:2px;" class="text-capitalize">
                    <q-icon style="bottom:2px;" size="sm" name="schedule" />
                    {{ exercise.startTimestamp }}
                    - {{ exercise.endTimestamp ? '' + exercise.endTimestamp : 'Ongoing exercise' }}
                  </div>
                </div>
                <div class="col">
                  <q-btn dense color="negative" size="sm" icon="close" @click="closeExercise(exercise.id)"/>
                </div>
              </q-card-section>
              <q-card-section>
                <div class="text-body2 notes">{{ exercise.notes }}</div>
              </q-card-section>
            </q-card>
          </transition>
        </div>
      </div>
      <div v-else-if="isLoadingExercises" class="q-ma-md flex flex-center">
        <q-spinner-dots
          color="primary"
          size="3em"
        />
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
      exercises: [],
      isLoadingExercises: true
    }
  },
  async mounted () {
    this.isLoadingExercises = true
    await this.getExercises()
  },
  watch: {
    async newExerciseData () {
      await this.addNewExercise()
    }
  },
  computed: {
    getCountExercises () {
      return this.exercises.length >= 1 ? `(${this.exercises.length})` : ''
    }
  },
  methods: {
    async getExercises () {
      try {
        if (this.sessionID) {
          let resp = await API.getExercises(this.sessionID)
          resp.map((exercise) => {
            exercise.type = exerciseEnum.typeToAsc(exercise.type)
            exercise.startTimestamp = nicers.formattedDayOfMonth(exercise.startTimestamp)
            exercise.endTimestamp = nicers.formattedDayOfMonth(exercise.endTimestamp)
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
      this.isLoadingExercises = false
    },
    async addNewExercise () {
      try {
        if (this.newExerciseData && this.sessionID) {
          this.$q.loading.show()
          await nicers.delay(500)
          let exercise = this.newExerciseData
          const { startTimestamp, endTimestamp, type, notes, videoFile } = exercise
          let resp = await API.addExercise(this.sessionID, startTimestamp, endTimestamp, type, notes, videoFile)
          if (resp.data.exercise) {
            this.$q.notify({
              type: 'positive',
              position: 'top',
              message: 'Created new exercise for current session',
            })
            await this.getExercises()
            this.navigateToExercise(resp.data.exercise.id)
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
      this.$q.loading.hide()
      return
    },
    async closeExercise (exerciseID) {
      try {
        await API.deleteExercise(exerciseID, this.sessionID)
        this.$q.notify({
            color: 'info',
            position: 'top',
            message: 'Deleted exercise',
            icon: 'info'
          })
        return this.getExercises()
      } catch (err) {
         this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Cannot delete selected exercise from session: ' + err,
          icon: 'warning'
        })
        return
      }
    },
    navigateToExercise (exerciseID) {
      return this.$router.push(this.sessionID + '/exercise/' + exerciseID)
    },
  }
}
</script>

<style scoped>
.notes {
  white-space: break-spaces;
}
</style>