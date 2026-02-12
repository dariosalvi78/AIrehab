<template>
  <div>
    <div v-if="numOfExercises > 0" ref="exercises" class="text-h5 q-ml-md">{{ $t('common.exercise', 2) }} {{getCountExercises}}</div>
      <div v-if="exercises.length >= 1 && pagination.maxPageNo >= 1">
        <div 
          v-for="exercise in exercises" 
          :key="exercise.id"
        >
          <transition appear enter-active-class="animated fadeIn delay-1s">
            <q-card flat bordered square class="q-my-lg q-mx-sm">
              <q-card-section class="row">
                <div class="col">
                  <q-btn class="q-mb-sm" :label="$t('exercises.edit_exercise')" dense color="primary" size="sm" icon-right="edit" no-caps @click="$emit('openExerciseModal', exercise)"/>
                  <div class="text-h6 q-mb-sm">{{ exercise.type ? $t(`exercises.form.types.${exercise.type}`) : $t('common.exercise', 1) }}
                    <q-icon v-if="exercise.videoFile" size="sm" name="video_file" />
                  </div>
                  <div style="margin-left:-2px;">
                    <q-icon style="bottom:2px;" size="sm" name="schedule" />
                    {{ exercise.startTimestamp }}
                    - {{ exercise.endTimestamp ? '' + exercise.endTimestamp : $t('exercises.ongoing') }}
                  </div>
                </div>
                <q-btn style="height:fit-content;" dense color="negative" size="sm" icon="close" @click="closeExercise(exercise)"/>
              </q-card-section>
              <div class="exercise-action">
                <q-btn push class="q-mx-md full-width" :label="!exercise.videoFile ? $t('exercises.go_exercise') : $t('exercises.go_evaluation')" color="secondary" size="md" no-caps icon-right="chevron_right" @click="navigateToExercise(exercise.id)"/>
              </div>
              <q-separator class="q-mt-md" />
              <q-card-section class="q-pa-none">
                <div v-if="exercise.notes.length" class="q-pa-sm text-body2 notes">
                  <q-scroll-area :visible="true" style="height: 130px;">
                    {{ exercise.notes }}
                  </q-scroll-area>
                </div>
              </q-card-section>
            </q-card>
          </transition>
        </div>
        <q-pagination
          v-if="pagination.maxPageNo >= 1"
          v-model="pagination.pageNo"
          :max="pagination.maxPageNo"
          :min="1"
          flat
          @update:model-value="(e) => handlePageExercise(e)"
          direction-links
          color="grey"
          active-color="primary"
          class="q-mb-md flex flex-center"
          active-design="push"
          size="md"
          gutter="sm"
        />
      </div>
      <div v-else-if="isLoadingExercises" class="q-ma-md flex flex-center">
        <q-spinner-dots
          color="primary"
          size="3em"
        />
      </div>
      <div v-else-if="pagination.maxPageNo <= 0" class="flex flex-center column">
        <div class="text-h6 q-pa-md text-weight-light">{{ $t('exercises.sessions.no_exercises_in_session') }}</div>
      </div>
  </div>
</template>

<script>
import API from '../../API'
import nicers from '../../utils/nicers'

export default {
  name: 'ExercisesList',
  props: { sessionID: String, newExerciseData: Object, formMode: String },
  data () {
    return {
      exercises: [],
      isLoadingExercises: true,
      pagination: {
        limit: 3,
        pageNo: 1,
        sortOrder: 'DESC',
        maxPageNo: 1
      },
      numOfExercises: undefined
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
      return this.numOfExercises >= 1 ? `· ${this.numOfExercises}` : ''
    }
  },
  methods: {
    async getExercises () {
      try {
        if (this.sessionID) {
          let resp = await API.getExercises(this.sessionID, this.pagination)
          resp.exercises.map((exercise) => {
            exercise.startTimestamp = nicers.formattedDayOfMonth(exercise.startTimestamp)
            exercise.endTimestamp = nicers.formattedDayOfMonth(exercise.endTimestamp)
          })
          this.exercises = resp.exercises
          this.pagination.maxPageNo = resp.maxPageNo
          this.numOfExercises = resp.numOfExercises
        }
      } catch (err) {
        this.session = undefined  
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('exercises.notification.get_exercises_error', { error: err }),
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
              message: this.$t('exercises.notification.add_exercise'),
            })
            await this.getExercises()
            this.navigateToExercise(resp.data.exercise.id)
          }
        }
      } catch (err) {
        let errMsg = err
        err.response?.status == 400 ? errMsg = this.$t('common.notification.error') :
          !err.response.data?.activated ? errMsg = this.$t('exercises.notification.user_consent_missing') : ''
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message:  this.$t('exercises.notification.add_exercise_error', { error: errMsg }),
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
          type: 'positive',
          position: 'top',
          message: this.$t('exercises.notification.delete_exercise')
        })
        this.$emit('deletedExercise')
        return this.getExercises()
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('exercises.notification.delete_exercise_error', { error: errMsg }),
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
            type: 'info',
            position: 'top',
            message: this.$t('exercises.notification.update_exercise'),
          })
          await this.getExercises()
        }
      } catch (err) {
        let errMsg = err
        if (err.response?.status == 400) errMsg = this.$t('common.notification.error')
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('exercises.notification.update_exercise_error', { error: errMsg }),
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
    async handlePageExercise (no) {
      this.pagination.pageNo = no
      await this.getExercises()  
      window.scrollTo(0, this.$refs.exercises.offsetTop)
    },
  }
}
</script>

<style scoped>
.exercise-action {
  display: flex;
  align-content: center;
  width: 90%;
  margin: 0 auto;
}
.notes {
  white-space: break-spaces;
  background-color: #0000000a;
}
</style>