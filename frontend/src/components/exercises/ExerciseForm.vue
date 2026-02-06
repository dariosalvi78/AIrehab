<template>
  <q-dialog ref="qDialog">
    <q-card class="q-pl-mx" style="min-width: 350px">
      <q-card-section>
        <div class="text-h6"> {{this.formMode == 'new' ? $t('exercises.form.title_add') : $t('exercises.form.title_edit')}}</div>
      </q-card-section>
      <q-form class="q-px-sm">
        <q-select
          ref="qInputExerciseType"
          class="q-my-md"
          filled
          clearable
          behavior="menu"
          emit-value
          map-options
          v-model="this.exercise.type"
          :options="this.exerciseTypes"
          :label="$t('exercises.form.type')"
          :hint="$t('exercises.form.type_hint')"
          :rules="[type => !!type  || $t('exercises.form.type_error')]"
        />
        <q-input
          ref="qInputNotes"
          class="q-my-md"
          filled
          v-model="this.exercise.notes"
          :label="$t('exercises.form.notes')"
          type="textarea"
          :hint="$t('exercises.form.notes_hint')"
          :rules="[notes => !notes ? true : notes.length <= 150 || $t('exercises.form.notes_error')]"
        />
        <q-input
          class="q-my-md"
          filled
          v-if="this.formMode == 'edit' && this.selectedExercise.videoFile"
          v-model="this.selectedExercise.videoFile"
          :label="$t('exercises.form.uploaded')"
          readonly
        />
    </q-form>
      <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$t('common.cancel')" v-close-popup @click="resetForm"/>
          <q-btn 
            :label="$t('common.confirm')"
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
import exerciseEnums from '../../utils/types/exerciseTypesEnum.js'
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
      this.exerciseTypes[i] = { value: type, label: this.$i18n.t(`exercises.form.types.${type}`) }
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
          message: this.$t('common.notification.error'),
          icon: 'report_problem'
        })
      }
      let submittedExercise  = {
        type: this.exercise.type ? this.exercise.type : '',
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