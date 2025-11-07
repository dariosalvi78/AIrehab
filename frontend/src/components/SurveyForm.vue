<template>
  <q-page-container>
    <div class="text-h5 q-mb-md">{{ $t('survey.title', { surveyName: this.incomingSurvey.currentSurveyID }) }}</div>
    <div class="text-body2">{{ $t('survey.description', { numOfQuestions: questions.length }) }}</div>
    <q-list class="q-py-sm">
      <q-expansion-item expand-separator :label="$t('survey.additional_info.title')" icon="info_outline" header-style="padding:0;">
        <span class="text-italic" v-html="$t('survey.additional_info.content')" />
      </q-expansion-item>
    </q-list>
    <q-separator class="q-my-sm" />
    <q-form class="survey-questions" @submit="submitForm">
      <div v-for="(question, qIndex) in questions" :key="question" :id="`question-${qIndex}`">
        <div class="q-py-md text-body2"><b>{{ `${qIndex + 1}.` }}</b> {{ question }}</div>
        <div class="q-gutter-sm column" v-for="(c, y) in choices" :key="y">
          <q-radio 
            class="col" :name="c" 
            v-model="surveyFormData[`q_${qIndex+1}`]" 
            :val="y + 1" :label="c"
            :rules="[ val => val && !val || 'Please type something']"
          />
        </div>
      </div>
      <q-separator class="q-my-sm" />
      <div class="text-body2">{{ $t('survey.complete_form_description') }} </div>
      <q-btn class="q-my-md full-width" icon="check" type="submit"
        padding="sm" color="secondary" no-caps 
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
      choices: undefined
    }
  },
  created () {
    this.questions = this.$tm(`survey.test_leader.t${this.incomingSurvey.currentSurveyID}`)
    this.choices = this.$tm('survey.choices')
  },
  methods: {
    async submitForm () {
      if (Object.keys(this.surveyFormData).length < this.questions.length) {
        return this.$q.notify({
          color: 'negative',
          message: this.$t('survey.notifications.form_error'),
          icon: 'report_problem'
        })
      }
      try {
        const formData = {
          surveyName: `t${this.incomingSurvey.currentSurveyID}`,
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
    }
  }
}
</script>

<style scoped>
</style>