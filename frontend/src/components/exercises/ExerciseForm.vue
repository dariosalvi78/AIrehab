<template>
  <q-dialog ref="qDialog">
    <q-card class="q-pl-mx" style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Add exercise</div>
      </q-card-section>
      <q-form class="q-px-sm">
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
      let submittedExercise  = {
        type: this.exercise.type ? exerciseEnums.typeToAsc(this.exercise.type) : '',
        notes: this.exercise.notes ? this.exercise.notes : '',
        endTimestamp: null,
        videoFile: null
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