<template>
  <q-dialog ref="qDialog">
    <q-card class="q-pl-mx" style="min-width: 350px">
      <q-card-section>
        <div class="text-h6"> {{this.formMode == 'new' ? 'Add exercise' : 'Edit exercise'}}</div>
      </q-card-section>
      <q-form class="q-px-sm">
        <q-select
          ref="qInputExerciseType"
          class="q-my-md"
          filled
          clearable
          behavior="menu"
          v-model="this.exercise.type"
          :options="this.exerciseTypes"
          label="Type of exercise"
          hint="Exercise that will be used for evaluation"
          :rules="[type => !!type  || 'Please enter the type of exercise']"
        />
        <q-input
          ref="qInputNotes"
          class="q-my-md"
          filled
          v-model="this.exercise.notes"
          label="Notes"
          type="textarea"
          hint="Optional. Notes for exercise"
          :rules="[notes => !notes ? true : notes.length <= 150 || 'Limit reached']"
        />
        <q-input
          class="q-my-md"
          filled
          v-if="this.formMode == 'edit' && this.selectedExercise.videoFile"
          v-model="this.selectedExercise.videoFile"
          label="Uploaded video"
          readonly
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
    props: { formMode: String, selectedExercise: Object },
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
   async updated () {
    this.resetForm()
    if (this.formMode == 'edit' ) await this.populateEdit()

    exerciseEnums.types.exercise.map((type, i) => {
      this.exerciseTypes[i] = exerciseEnums.typeToAsc(type)
    })
   },
   watch: {
    async selectedExercise () {
        await this.populateEdit()
      }
   },
   methods: {
    formSubmit () {
      this.$refs.qInputNotes.validate()
      this.$refs.qInputExerciseType.validate()
      if (this.$refs.qInputNotes.hasError || this.$refs.qInputExerciseType.hasError) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Please review fields and try again',
          icon: 'report_problem'
        })
      }
      let submittedExercise  = {
        type: this.exercise.type ? exerciseEnums.typeToDesc(this.exercise.type) : '',
        notes: this.exercise.notes ? this.exercise.notes.trim() : '',
        // startTimestamp: this.exercise.startTimestamp ? this.exercise.startTimestamp : null,
      }
      if (this.formMode == 'edit') submittedExercise["exerciseID"] = this.selectedExercise.id
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
    },
    populateEdit () {
      if (this.selectedExercise) {
        this.exercise.type = this.selectedExercise.type
        this.exercise.notes = this.selectedExercise.notes
      }
    }
   }
}
</script>

<style scoped>

</style>