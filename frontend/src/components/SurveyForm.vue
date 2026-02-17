<template>
  <q-page class="bg-white" style="padding-bottom: 32px;">
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
      <div v-for="(question, _) in questions" :key="question" :id="`question-${question.i}`">
        <section v-if="getRadioQuestions(question)" :ref="`${question.i}_${question.code}`">
          <div class="q-py-md text-body1"><b>{{ `${question.i}.` }}</b> {{ question.q }}</div>
          <div id="answers" class="q-gutter-sm">
            <div :id="`a-${y + 1}`" v-for="(c, y) in choices.scales" :key="y">
              <q-radio 
                class="col text-body2" :name="c"
                v-model="surveyFormData[`${question.i}_${question.code}`]"
                :val="y + 1" :label="c"
              />
            </div>
          </div>
        </section>
        <section v-else-if="getTextareaQuestions(question)">
          <div class="q-py-md text-body1"><b>{{ `${question.i}.` }}</b> {{ question.q }}</div>
          <q-input
            :ref="`qTextarea_${question.code}`"
            class="q-my-sm text-body2"
            v-model="surveyFormData[`${question.i}_${question.code}`]"
            :label="choices.text.label"
            type="textarea"
            :hint="choices.text.hint"
            :rules="patterns.textarea"
          />
        </section>
        <q-checkbox v-else-if="question.code == 'interview'" class="q-my-lg text-body1" :false-value="''" 
          :label="question.q" v-model="surveyFormData[`${question.i}_${question.code}`]"
        />
      </div>
      <q-separator class="q-my-lg" />
      <div class="text-body2 q-mb-md">{{ $t('survey.complete_form_description') }} </div>
      <q-btn class="q-mb-lg full-width" icon="send" type="submit"
        padding="md" size="16px" color="secondary" no-caps @click="submitForm"
        :label="$t('survey.send_survey')" 
      />
    </q-form>
  </q-page>
</template>

<script>
import { mergeLocaleMessages } from 'src/boot/i18n';
import API from '../API'

export default {
  name: 'SurveyForm',
  i18n: await mergeLocaleMessages(['survey']),
  props: { incomingSurvey: Object },
  emits: ['panelFormGoBack'], 
  data () {
    return {
      surveyFormData: {},
      questions: undefined,
      choices: undefined,
      patterns: {
        textarea: [val => !val ? true : val.length <= 300 || this.$t('exercises.form.notes_error')]
      }
    }
  },
  created () {
    let questions = [], currentQuestions = this.$tm(`survey.${this.incomingSurvey.userType}.${this.incomingSurvey.currentSurveyID}`)
    for (const q in currentQuestions) questions.push({ ...currentQuestions[q], i: +q + 1 })
    this.questions = questions
    this.choices = this.$tm('survey.choices')
    for (let i = 0; i < this.questions.length; i++) this.surveyFormData[`${this.questions[i].i}_${this.questions[i].code}`] = ''
  },
  methods: {
    async submitForm () {
      let refs = Object.keys(this.$refs), formError = false, surveyForm = Object.keys(this.surveyFormData)
      for (const r in refs) {
        let refInput = this.$refs[refs[r]][0]
        if (refInput.hasError) {
          refInput.validate()
          formError = true
        }
        if (refs[r] !== surveyForm[r]) continue
        if (!this.surveyFormData[surveyForm[r]]) formError = true
      }

      if (formError) {
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
    getRadioQuestions (q) { return q.code !== 'UB1' && q.code !== 'UB2' && q.code !== 'interview' },
    getTextareaQuestions (q) { return q.code == 'UB1' || q.code == 'UB2' }
  }
}
</script>

<style scoped>
  .survey-questions {
    max-width: 600px;
    margin: 0 auto;
  }
</style>