<template>
  <q-dialog>
    <q-card class="q-pl-mx" style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Add exercise</div>
      </q-card-section>
      <q-form class="q-px-sm">
        <q-input
          class="q-my-md"            
          filled
          v-model="this.exercise.startTimestamp"
          label="Start date"
          type="date"
          hint="When to start exercise"
        />
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
            v-close-popup class="q-ml-sm" 
            @click="formSubmit"
          />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import exerciseEnums from '../utils/exerciseDataTypes.js'

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
        exerciseTypes: exerciseEnums.types
      }
   },
   mounted () {
    this.resetForm()
   },
   methods: {
    formSubmit () {
      let submittedExercise  = {
        type: exerciseEnums.typeToAsc(this.exercise.type),
        notes: this.exercise.notes,
        startTimestamp: this.exercise.startTimestamp,
        endTimestamp: this.exercise.endTimestamp,
        videoFile: this.exercise.videoFile
      }
      this.$emit('newExercise', submittedExercise)
      this.resetForm()
    },
    resetForm () {
      this.exercise = {}
    }
   }
}
</script>

<style scoped>

</style>