<template>
  <div>
    <div class="text-h5 q-ml-md">Exercises {{getCountExercises}}</div>
      <div v-if="exercises.length >= 1">
        <div 
          v-for="exercise in exercises" 
          :key="exercise.id"
        >
          <transition appear enter-active-class="animated fadeIn delay-1s">
            <q-card class="q-ma-md exercise-card">
              <q-card-section class="row">
                <div class="col-11">
                  <q-btn class="q-mr-sm" :label="!exercise.videoFile ? 'Go to exercise' : 'Go to Evaluation'" dense color="secondary" size="sm" icon-right="open_in_new" @click="navigateToExercise(exercise.id)"/>
                  <q-btn class="q-my-sm" label="Edit exercise" dense color="primary" size="sm" icon-right="edit" @click="$emit('openExerciseModal', exercise)"/>
                  <div class="text-h6">{{ exercise.type ? exercise.type : 'Exercise' }}
                    <q-icon v-if="exercise.videoFile" size="sm" name="video_file" />
                  </div>
                  <div style="margin-left:-2px;" class="text-capitalize">
                    <q-icon style="bottom:2px;" size="sm" name="schedule" />
                    {{ exercise.startTimestamp }}
                    - {{ exercise.endTimestamp ? '' + exercise.endTimestamp : 'Ongoing exercise' }}
                  </div>
                </div>
                <div class="col">
                  <q-btn dense color="negative" size="sm" icon="close" @click="closeExercise(exercise)"/>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div v-if="exercise.notes.length" class="q-pa-sm text-body2 notes">
                  <q-scroll-area :visible="true" style="height: 130px;">
                    {{ exercise.notes }}
                  </q-scroll-area>
                </div>
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
  props: { sessionID: String, newExerciseData: Object, formMode: String },
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
    async newExerciseData (newData, data) {
      if (this.formMode == 'new') await this.addNewExercise(newData)
      else if (this.formMode == 'edit') await this.editExercise(newData)
      return
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
    async addNewExercise (newExercise) {
      try {
        if (newExercise && this.sessionID) {
          this.$q.loading.show()
          await nicers.delay(500)
          let exercise = newExercise
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
    async closeExercise (exercise) {
      try {
        await API.deleteExercise(exercise.id, this.sessionID, exercise.videoFile)
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
    async editExercise (editData) {
      try {
        if (editData && this.sessionID) {
          let exercise = editData
          const { type, notes, videoFile } = exercise
          await API.editExercise(exercise.exerciseID, type, notes, videoFile)
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: 'Updated exercise for current session',
          })
          await this.getExercises()
        }
      } catch (err) {
        let errMsg = err
        if (err.response && err.response.status == 400) errMsg = err.response.data
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Updating exercise failed: ' + errMsg,
          icon: 'report_problem'
        })
      }
      this.$q.loading.hide()
      delete editData.exerciseID
      return
    },
    navigateToExercise (exerciseID) {
      return this.$router.push(this.sessionID + '/exercise/' + exerciseID)
    },
  }
}
</script>

<style scoped>
.exercise-card {
  max-height: 300px;
}
.notes {
  white-space: break-spaces;
}
</style>