<template>
  <q-layout v-if="patient" view="lHh Lpr lFf" class="m-width">
    <q-header elevated class="header m-width shadow-2 layout-theme">
      <q-toolbar>
        <q-avatar>
          <img src="/icons/favicon-maskable.ico">
        </q-avatar>
        <q-toolbar-title>{{ $t('patient.participant') }}</q-toolbar-title>
        <q-chip v-show="authenticated" outline square size="md" class="q-mx-md">
          {{patient.names}}
        </q-chip>
      </q-toolbar>
      <q-separator />
      <q-toolbar v-show="panel == 'survey'" class="justify-between">
        <back-button @back:action="openPatientHome" />
        <q-chip dense size="18px" class="layout-theme text-weight-light q-mx-none q-px-none">
          {{ $route.name }}
        </q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-tab-panels v-model="panel" ref="panelForm" vertical>
        <q-tab-panel name="main" class="q-px-none q-px-md">
          <q-btn v-if="installPrompt" color="secondary" class="q-mx-md full-width" icon="add_to_home_screen" :label="$t('common.add_to_homescreen')"  no-caps @click="showInstallPrompt"/>
          <q-card flat bordered class="q-my-lg">
            <q-card-section>
              <div class="text-h6">{{ $t('common.consent.header') }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="text-body2" v-html="$t('common.consent.description')"></div>
              <div class="q-mt-lg text-center" @click="openConsentModal = !openConsentModal">
                  <div class="text-body2 text-bold cursor-pointer">
                    {{ $t('common.consent.read_information') }}
                    <q-icon name="open_in_new" size="sm" />
                  </div>
              </div>
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-pb-sm">
              <div class="text-body2">{{ $t('common.consent.confirm_description') }}</div>
            </q-card-section>
            <q-card-actions vertical align="left" class="q-mx-none q-pa-none q-pb-sm">
              <q-checkbox
                right-label
                size="lg"
                v-model="participationStatus"
                :label="$t('common.consent.confirm_checkbox')"
                checked-icon="task_alt"
                unchecked-icon="highlight_off"
                :disable="!this.authenticated"
                @click=" 
                  !this.patient.email && !this.patient.activated  
                    ? this.sendPatientActivationLink()
                    : this.showWithdrawConsentDialog()
                "
              />
            </q-card-actions>
          </q-card>
          <q-card flat bordered class="q-my-lg">
            <q-card-section>
              <div class="text-h6">{{ $t('exercises.name') }} {{ getNumOfExercises }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="text-body2">{{ $t('patient.home.exercise_description') }}</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-none">
              <div v-if="!results" class="q-my-sm flex flex-center"><q-spinner-dots color="primary" size="3em" /></div>
              <q-list v-else-if="results && results.length" v-for="exercise in results" :key="exercise.id">
                <q-expansion-item
                  icon="accessibility"
                  :label="exercise.type"
                  :caption="exercise.startTimestamp"
                  class="q-py-sm text-body1"
                >
                  <template v-slot:header>
                    <q-item-section v-if="exercise.bracket" avatar style="width: 100px;">
                      <q-chip
                        :clickable="false" :ripple="false" size="md"
                        class="q-py-sm full-width glossy"
                        :color="exercise.bracket.theme" text-color="white"
                      >
                        <span style="width: 100%; text-align: center;" class="text-subtitle2">{{ $t(`poe.scores.${exercise.bracket.text}`) }}</span>
                      </q-chip>
                    </q-item-section>
                    <q-item-section>
                      <span>{{ exercise.type }}</span>
                      <span class="q-item__label--caption text-caption">
                        {{ exercise.startTimestamp }}
                      </span>
                    </q-item-section>
                  </template>
                  <div class="col q-ma-md text-body2">
                    <div style="margin-left:-2px;" class="text-capitalize">
                      <q-icon style="bottom:2px;" size="sm" name="schedule" />
                      {{ exercise.startTimestamp }}
                      - {{ exercise.endTimestamp ? '' + exercise.endTimestamp : $t('exercises.ongoing') }}
                    </div>
                  </div>
                  <poe-view-modal 
                    v-if="exercise.poe.length" 
                    :assessmentResults="exercise.poe" 
                    @getPOEBracket="(bracket) => exercise.bracket = bracket"
                  />
                  <div v-else class="q-ma-md text-body2 text-italic">{{ $t('poe.no_results') }}</div>
                </q-expansion-item>
              </q-list>
              <div v-else class="text-body2 text-center q-pa-md">{{ $t('patient.home.exercise_no_results') }}</div>
              <q-pagination
                v-if="pagination.maxPageNo > 1"
                v-model="pagination.pageNo"
                :max="pagination.maxPageNo"
                :min="1" flat
                @update:model-value="(e) => handlePageExercise(e)"
                direction-links
                color="grey" active-color="primary"
                class="q-my-md flex flex-center"
                active-design="push"
                size="md" gutter="sm"
              />
            </q-card-section>
          </q-card>
          <q-card flat bordered class="q-my-lg">
            <q-card-section>
              <div class="text-h6">{{ $t('patient.home.survey.title') }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none flex flex-center column">
              <div class="text-body2" v-html="$t('patient.home.survey.description')"></div>
              <q-spinner-dots v-if="!incomingSurvey" color="primary" size="3em" />
              <q-btn 
                v-else-if="incomingSurvey && incomingSurvey.currentSurveyID" icon-right="open_in_new"
                class="q-mt-lg q-pa-md full-width" outline no-caps @click="goToSurvey"
                :label="$t('patient.home.survey.available', { surveyName: incomingSurvey.currentSurveyID })"
              />
              <div v-else class="q-mt-md text-subtitle2" v-html="$t('patient.home.survey.no_results')"></div>
            </q-card-section>
          </q-card>
        </q-tab-panel>
        <q-tab-panel name="survey" class="q-mx-none q-py-none">
          <survey-form
            :incomingSurvey="this.incomingSurvey"
            @panelFormGoBack="openPatientHome"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-page-container>
    <terms-modal v-model="openConsentModal" :isPatient="true"></terms-modal>
    <q-dialog ref="qDialogAuth" position="top">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('patient.authentication.success.title') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <span v-html="$refs.qDialogAuth.data" />
        </q-card-section>
        <q-expansion-item
          icon="bookmark"
          label="Bookmark instructions"
        >
          <q-card-section>
            <div class="text-subtitle2">Chrome</div>
            Tap More <q-icon class="q-ml-sm" name="more_verts"/><q-icon name="chevron_right"/> and then "Add to Bookmarks" <q-icon name="star_outline"/>
            <div class="text-subtitle2 q-mt-sm">Safari</div>
            Tap the bookmark icon <q-icon name="import_contacts" /> to add bookmark
          </q-card-section>
        </q-expansion-item>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
  <div v-else class="q-ma-md flex flex-center">
    <q-spinner-dots
      color="primary"
      size="3em"
    />
  </div>
</template>

<script>
import API from '../../API'
import nicers from '../../utils/nicers'
import TermsModal from '../UserTermsModal.vue'
import PoeViewModal from '../exercises/PoeViewModal.vue'
import SurveyForm from '../SurveyForm.vue'
import { mergeLocaleMessages } from 'src/boot/i18n'
import BackButton from '../reusables/BackButton.vue'

export default {
  name: 'PatientHome',
  i18n: await mergeLocaleMessages(['patient', 'exercises']),
  props: { patientID: String },
  components: { TermsModal, PoeViewModal, SurveyForm, BackButton },
  data () {
    return {
      patient: {},
      participationStatus: false,
      openConsentModal: false,
      authenticated: undefined,
      secret: undefined,
      panel: undefined,
      incomingSurvey: undefined,
      results: undefined,
      pagination: {
        limit: 3,
        pageNo: 1,
        sortOrder: 'DESC',
        maxPageNo: 1
      },
      installPrompt: null
    }
  },
  async mounted () {
    this.$refs.panelForm.goTo('main')
    this.openConsentModal = false
    this.authenticated = false
    this.secret = this.$route.query.access || null

    if (this.patientID && this.secret) await this.setPatientActivation()
    this.participationStatus = await this.getPatientInfo()
    if (this.authenticated) {
      await this.getPatientExercises()
      await this.setManifestFile()
    }
  },
  methods: {
    async getPatientInfo() {
      try {
        let response = await API.getPatientInfo(this.patientID, this.secret)
        if (response) {
          this.authenticated = true
          if (response.token) return await this.getPatientInfo()
          this.patient = response.patient
          this.incomingSurvey = response.newSurveyAvailable || []
          if (this.incomingSurvey) this.$route.name = this.$t('common.header.patient_survey')
          return response.patient.activated
        }
      } catch (err) {
        this.authenticated = false
        if (err.response.status == 403) {
          this.$q.dialog({
            title: this.$t('patient.authentication.error.title'),
            message: this.$t('patient.authentication.error.description', { supportEmail: err.response.data.support }),
            ok: false, cancel: false, position: 'top', html: true, persistent: true
          })
        } else {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: this.$t('patient.notification.get_patient_error', { error: err }),
            icon: 'report_problem'
          })
        }
        return this.participationStatus
      }
    },
    async getPatientExercises () {
      try {
        let exercise_results = await API.getExercises(this.patient.sessionID, this.pagination)
        if (exercise_results) {
          this.numOfExercises = exercise_results.numOfExercises
          this.results = exercise_results ? this.formatExerciseData(exercise_results.exercises) : []
          this.pagination.maxPageNo = exercise_results.maxPageNo
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('exercises.notification.get_exercises_error', { error: err }),
          icon: 'report_problem'
        })
      }
    },  
    async sendPatientActivationLink () {
      const emailPattern = (await import('quasar')).patterns.testPattern.email
      try {
        if (!this.authenticated) return
        this.$q.dialog({
          color: 'primary',
          title: this.$t('patient.home.consent.confirm.email_required'),
          message: this.$t('patient.home.consent.confirm.description'),
          prompt: {
            model: '',
            isValid: val => emailPattern(val), 
            type: 'text'
          },
          ok: { color: 'primary', label: this.$t('common.confirm'), noCaps: true },
          persistent: true,
          cancel: { class: 'q-btn--flat text-black', color: 'white', label: this.$t('common.cancel'), noCaps: true },
          html: true
        }).onOk(async (email) => {
          this.$q.loading.show()
          await nicers.delay(200)
          const patientID = this.patientID, secret = this.secret
          let response = undefined
          try {
            response = await API.sendPatientConsentEmail(email.toLowerCase(), patientID, secret)            
          } catch (err) {
            if (err.response.status == 409) {
              this.$q.notify({
                color: 'negative',
                position: 'bottom',
                message: this.$t('patient.notification.email_error'),
                icon: 'report_problem'
              })
              return this.sendPatientActivationLink()
            }
          }
          if (response) {
            this.$q.notify({
              color: 'secondary',
              position: 'top',
              message: this.$t('patient.notification.email_sent'),
              icon: 'info'
            })
            this.updateParticipationStatus()
          }
        }).onCancel(() => {
          this.participationStatus = !this.participationStatus
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('common.notification.error_generic', { error: err }),
          icon: 'report_problem'
        })
      }
      this.$q.loading.hide()
      return
    },
    async setPatientActivation () {
      try {
        const secret = this.secret
        this.$q.loading.show()
        await nicers.delay(200)
        let response = await API.updatePatientActivation(this.patientID, secret)
        if (response.token) {
          this.authenticated = true
          let q = new URLSearchParams(window.location.search)
          if (q?.get('scan') == 'new') {
            this.$router.push({ path: this.$route.path, query: { access: this.secret } })
            await nicers.delay(100)
            this.$refs.qDialogAuth.data = this.$t('patient.authentication.success.description')
            this.$refs.qDialogAuth.show()
          }
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('patient.notification.authentication_error'),
          icon: 'report_problem'
        })
      }
      this.$q.loading.hide()
      return
    },
    async updateParticipationStatus () {
      try {
        const status = this.participationStatus
        await this.getPatientInfo()
        if (!this.authenticated) return this.participationStatus = false

        this.$q.loading.show()
        await nicers.delay(200)
        let response = await API.editPatient(undefined, undefined, undefined, undefined, {}, this.patient.id, status)
        if (response) {
          this.participationStatus = status
          this.$q.notify({
            color: 'info',
            position: 'top',
            message: this.$t('common.notification.update_consent_status', status ? 1 : 0),
            icon:'info'
          })
          await this.getPatientInfo()
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('common.notification.update_consent_status_error', { error: err }),
          icon: 'report_problem'
        })
        this.participationStatus = false
      }
      this.$q.loading.hide()
      return
    },
    async showWithdrawConsentDialog () {
      if (!this.authenticated) return
      this.$q.dialog({
        color: 'primary',
        title: this.$t('patient.home.consent.withdraw.title'),
        message: this.$t('patient.home.consent.withdraw.description'),
        ok: { color: 'primary', label: this.$t('patient.home.consent.withdraw.title'), noCaps: true },
        persistent: true,
        cancel: { class: 'q-btn--flat text-black', color: 'white', label: this.$t('common.cancel'), noCaps: true },
        html: true
      }).onOk(() => {
        this.updateParticipationStatus()
      }).onCancel(() => {
        this.participationStatus = !this.participationStatus
      })
    },
    formatExerciseData (exercises) {
      const results = exercises
      for (const e in results) {
        let exercise = exercises[e]
        exercise.poe = exercise?.endTimestamp ? exercises[e].poe : []
        exercise.type = this.$t(`exercises.form.types.${exercise.type}`)
        exercise.startTimestamp = nicers.formattedDayOfMonth(exercise.startTimestamp)
        exercise.endTimestamp = nicers.formattedDayOfMonth(exercise.endTimestamp)
      }
      return results
    },
    async handlePageExercise (no) {
      this.pagination.pageNo = no
      await this.getPatientExercises()  
    },
    formatDate (date) {
      return nicers.formattedDayOfMonth(date)
    },
    goToSurvey () {
      if (!this.patient.activated) {
        return this.$q.notify({
          color: 'negative',
          position: 'bottom',
          message: this.$t('patient.no_consent'),
          icon: 'report_problem'
        })
      }
      window.scrollTo({ top: 0 })
      return this.$refs.panelForm.goTo('survey')
    },
    async openPatientHome () {
      await this.getPatientInfo() 
      return this.$refs.panelForm.goTo('main')
    },
    async showInstallPrompt () {
      if (this.installPrompt) return this.installPrompt.prompt()
    },
    async setManifestFile () {
      let manifest = null, template = await import('../../../manifest.json'),
        patientURL = window.location.href, display_name = `${this.patient.names} - ${this.$t('common.home')}`
      manifest = Object.assign(template.default, {
        start_url: patientURL, scope: patientURL,
        name: display_name, short_name: display_name
      })

      let content = JSON.stringify(manifest)
      const blob = new Blob([content], {type: 'application/json'});
      const manifestURL = URL.createObjectURL(blob);
      document.querySelector('#manifest').setAttribute('href', manifestURL)

      let element = document.createElement('link')
      element.setAttribute('rel', 'manifest')
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + content)
    }
  },
  computed: {
    getNumOfExercises () {
      return this.results && this.numOfExercises ? `· ${this.numOfExercises}` : ''
    }
  },
  created () {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
    })
    window.addEventListener("appinstalled", () => this.installPrompt = null )
  }
}
</script>

<style>

</style>
