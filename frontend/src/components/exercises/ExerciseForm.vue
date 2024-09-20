<template>
  <q-dialog ref="qDialog">
    <q-card class="q-pl-mx" style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Add exercise</div>
      </q-card-section>
      <q-form class="q-px-sm">
        <q-input
          ref="qDate"
          class="q-my-md"            
          filled
          v-model="exercise.startTimestamp"
          label="Start date"
          mask="####-##-##"
          :rules="[(date) => dateRestrictions(date) || 'Please enter valid date']"
          hint="When to start exercise"
        >
          <template v-slot:append>
            <q-icon name="event" style="cursor:pointer;">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date 
                  mask="YYYY-MM-DD"
                  v-model="exercise.startTimestamp" 
                  @update:model="() => qDateProxy.hide()" 
                  today-btn
                  :options="dateRestrictions"
                >
                <template v-slot>
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Confirm" color="primary" size="sm" v-close-popup />
                  </div>
                </template>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-select
          class="q-my-md"
          filled
          clearable
          behavior="menu"
          v-model="this.exercise.type"
          :options="this.exerciseTypes"
          label="Type of exercise"
          hint="Optional. Type of exercise"
        />
        <q-input
          class="q-my-md"
          filled
          v-model="this.exercise.notes"
          label="Notes"
          type="textarea"
          hint="Optional. Notes for exercise"
        />
    </q-form>
      <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup @click="resetForm"/>
          <q-btn 
            label="Confirm" 
            type="submit" 
            color="primary" 
            class="q-ml-sm" 
            @click="formSubmit"
          />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import exerciseEnums from '../../utils/exerciseTypesEnum.js'
import nicers from '../../utils/nicers.js'
import { ref } from 'vue'

export default {
    name: 'ExerciseForm',
    emits: ['newExercise'],
    data () {
      return {
        exercise: {
          type: undefined,
          notes: undefined,
          startTimestamp: undefined,
          endTimestamp: null,
          videoFile: null
        },
        exerciseTypes: [],
        qDate: ref()
      }
   },
   mounted () {
    this.resetForm()

    exerciseEnums.types.map((type, i) => {
      this.exerciseTypes[i] = exerciseEnums.typeToAsc(type)
    })
   },
   methods: {
    formSubmit () {
     if (this.$refs.qDate.hasError) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Please review fields and try again',
          icon: 'report_problem'
        })
      }
      let submittedExercise  = {
        type: exerciseEnums.typeToAsc(this.exercise.type),
        notes: this.exercise.notes,
        startTimestamp: this.exercise.startTimestamp,
        endTimestamp: this.exercise.endTimestamp,
        videoFile: this.exercise.videoFile
      }
      this.$emit('newExercise', submittedExercise)
      this.$refs.qDialog.hide()
      this.resetForm()
    },
    resetForm () {
      this.exercise = {}
    },
    formatDate (date) {
      return nicers.formattedDate(date)
    },
    dateRestrictions (qDate) {
      return nicers.formDatetimeValidation(qDate, 'exercise')
    }
   }
}
</script>

<style scoped>

</style>