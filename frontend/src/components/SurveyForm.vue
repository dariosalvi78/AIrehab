<template>
  <q-page-container class="bg-white">
    <q-btn v-if="incomingSurvey.userType == 'patient'" class="q-mb-md" round dense color="primary" size="lg" icon="chevron_left" @click="this.$emit('panelFormGoBack')" />
    <div class="text-h5 q-mb-md">{{ $t('survey.title', { surveyName: this.incomingSurvey.currentSurveyID }) }}</div>
    <div class="text-body2">{{ $t('survey.description', { numOfQuestions: questions.length }) }}</div>
    <q-list class="q-py-sm">
      <q-expansion-item expand-separator :label="$t('survey.additional_info.title')" icon="info_outline" header-style="padding:0;">
        <span class="text-italic" v-html="$t('survey.additional_info.content')" />
      </q-expansion-item>
    </q-list>
    <q-separator class="q-my-sm" />
    <q-form class="survey-questions" @submit.prevent="">
      <div v-for="(question, qIndex) in questions" :key="question" :id="`question-${qIndex}`">
        <div class="q-py-md text-body2"><b>{{ `${qIndex + 1}.` }}</b> {{ question.q }}</div>
        <section v-if="handleQuestionsInput(question)">
          <div class="q-gutter-sm column" v-for="(c, y) in choices.scales" :key="y">
            <q-radio 
              class="col" :name="c" 
              v-model="surveyFormData[`q_${qIndex+1}`]" 
              :val="y + 1" :label="c"
            />
          </div>
        </section>
        <section v-else>
          <q-input
            :ref="`qTextarea_${question.code}`"
            class="q-my-sm"
            v-model="surveyFormData[`q_${qIndex+1}`]"
            :label="choices.text.label"
            type="textarea"
            :hint="choices.text.hint"
            :rules="patterns.textarea"
          />
        </section>
      </div>
      <q-separator class="q-my-sm" />
      <div class="text-body2">{{ $t('survey.complete_form_description') }} </div>
      <q-btn class="q-my-md full-width" icon="check" type="submit"
        padding="sm" color="secondary" no-caps @click="submitForm"
        :label="$t('common.send')" 
      />
    </q-form>
  </q-page-container>
</template>

<script>
import API from '../API'

export default {
  name: 'SurveyForm',
  props: { incomingSurvey: Object },
  emits: ['panelFormGoBack'], 
  data () {
    return {
      surveyFormData: {},
      questions: undefined,
      choices: undefined,
      patterns: {
        textarea: [val => !val ? true : val.length <= 10 || this.$t('exercises.form.notes_error')]
      }
    }
  },
  created () {
    this.questions = this.$tm(`survey.${this.incomingSurvey.userType}.${this.incomingSurvey.currentSurveyID}`)
    this.choices = this.$tm('survey.choices')
  },
  methods: {
    async submitForm () {
      let refs = Object.keys(this.$refs), formError = false
      for (const r of refs) {
        this.$refs[r][0].validate()
        if (this.$refs[r][0].hasError) formError = true
      }
      if (formError || (Object.keys(this.surveyFormData).length < this.questions.length)) {
        return this.$q.notify({
          color: 'negative',
          message: this.$t('survey.notifications.form_error'),
          icon: 'report_problem'
        })
      }
      try {
        const formData = {
          surveyName: this.incomingSurvey.currentSurveyID,
          results: JSON.stringify(this.surveyFormData)
        }
        let response = await API.addSurvey(formData)
        if (response) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: this.$t('survey.notifications.upload_completed'),
          })
          return this.$emit('panelFormGoBack')
        }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          message: 'Error: ' + err,
          icon: 'report_problem'
        })
      }
    },
    handleQuestionsInput (q) {
      return q.code !== 'UB1' && q.code !== 'UB2'
    }
  }
}
</script>

<style scoped>
</style>