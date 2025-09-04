<template>
  <q-layout v-if="patient" view="lHh Lpr lFf" class="m-width">
    <q-header elevated class="header m-width shadow-2">
      <q-toolbar>
        <q-avatar>
          <img src="/icons/favicon-maskable.ico">
        </q-avatar>
        <q-toolbar-title>Home</q-toolbar-title>
        <q-chip v-show="authenticated" outline square size="md" class="q-mx-md text-white">
          {{patient.names}}
        </q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-card flat bordered class="q-my-lg q-ma-md">
        <q-card-section>
          <div class="text-h6">Patient consent</div>
        </q-card-section>
        <q-card-section class="q-pt-none flex flex-center">
            <q-btn class="q-pb-lg" icon-right="open_in_new" label="Read information letter" @click="openConsentModal = !openConsentModal" no-caps flat dense />
            <div class="text-body2">Once you have made your decision, you can click the checkbox below to participate in the study.</div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <div class="text-body2">
            Your participation can be changed at anytime.
          </div>
        </q-card-section>
        <q-card-actions vertical align="left" class="q-mx-none q-pa-none">
          <q-checkbox
            right-label
            size="lg"
            v-model="participationStatus"
            label="I agree to the terms in the information letter"
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
      <q-card flat bordered class="q-my-lg q-ma-md">
        <q-card-section>
          <div class="text-h6">Exercises</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body2">Here you can see your exercise results</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-none">
          <div v-if="!results.length" class="text-body2 text-center q-pa-md">
            No exercise results found
          </div>
          <q-list v-else-if="results.length" v-for="exercise in results" :key="exercise.id">
            <q-expansion-item
              icon="accessibility"
              :label="exercise.type"
              :caption="exercise.startTimestamp"
              class="q-py-sm text-body1"
            >
              <div class="col q-ma-md text-body2">
                <div style="margin-left:-2px;" class="text-capitalize">
                  <q-icon style="bottom:2px;" size="sm" name="schedule" />
                  {{ exercise.startTimestamp }}
                  - {{ exercise.endTimestamp ? '' + exercise.endTimestamp : 'Ongoing exercise' }}
                </div>
              </div>
              <poe-view-modal v-if="exercise.poe.length" :assessmentResults="exercise.poe"/>
              <div v-else class="q-ma-md text-body2">
                No POE assessment available
              </div>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-page-container>
    <patient-terms-modal :openModal="openConsentModal"/>
    <q-dialog ref="qDialogAuth" position="top">
      <q-card>
        <q-card-section>
          <div class="text-h6">Patient is authenticated</div>
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
import PatientTermsModal from './PatientTermsModal.vue'
import PoeViewModal from '../exercises/PoeViewModal.vue'
import exerciseType from '../../utils/types/exerciseTypesEnum'

export default {
  name: 'PatientHome',
  props: { patientID: String },
  components: { PatientTermsModal, PoeViewModal },
  data () {
    return {
      patient: {},
      participationStatus: false,
      openConsentModal: false,
      authenticated: undefined,
      secret: undefined,
      results: []
    }
  },
  async beforeMount () {
    this.openConsentModal = false
    this.authenticated = false
    this.secret = this.$route.query.access || null

    if (this.patientID && this.secret) await this.setPatientActivation()
    this.participationStatus = await this.getPatientInfo()
  },
  methods: {
    async getPatientInfo() {
      try {
        let response = await API.getPatientInfo(this.patientID, this.secret)
        if (response) {
          this.authenticated = true
          if (response.token) return await this.getPatientInfo()
          this.patient = response.patient
          this.results = await this.formatExerciseData(response.results)
          return response.patient.activated
        }
      } catch (err) {
        let errMsg = err
        this.authenticated = false
        if (err.response.data.message) {
          errMsg = err.response.data.message
          this.$q.dialog({
            color: 'primary',
            title: 'Authentication not possible',
            message: errMsg,
            ok: { color: 'primary' },
            position: 'top',
            cancel: true,
            html: true
          })
        } else {
            this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Could not retrieve patient: ' + errMsg,
            icon: 'report_problem'
          })
        }
        return this.participationStatus
      }
    },
    async sendPatientActivationLink () {
      try {
        if (!this.authenticated) return
        this.$q.dialog({
          color: 'primary',
          title: 'Email is required',
          message: `
            Before you can consent to participate in the study, you will need to provide an email so we can send important reminders.
            <br><br>
            <b>- By pressing 'Consent', you agree to the terms found in the information letter</b>
            <br><br>
            Please provide your email address below.
          `,
          prompt: {
            model: '',
            isValid: val => val.length >= 8, 
            type: 'text'
          },
          ok: { color: 'primary', label: 'Consent' },
          persistent: true,
          cancel: true,
          html: true
        }).onOk(async (email) => {
          this.$q.loading.show()
          await nicers.delay(200)
          const patientID = this.patientID, secret = this.secret
          let response = await API.sendPatientConsentEmail(email.toLowerCase(), patientID, secret)
          if (response) {
            this.$q.notify({
              color: 'secondary',
              position: 'top',
              message: 'Patient information has been sent to the provided email',
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
          message: 'Not possible to send patient access link',
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
        let response = await API.updateActivationStatus(this.patientID, secret)
        if (response.token && response.message) {
          this.authenticated = true
          this.$refs.qDialogAuth.data = response.message
          this.$refs.qDialogAuth.show()
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Not possible to authenticate patient',
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
            message: 'Updated participation status',
            icon:'info'
          })
          await this.getPatientInfo()
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Could not update participation: ' + err,
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
        title: 'Withdraw consent',
        message: `
          You are about to withdraw your consent from the study.
          Withdrawing means but not limited to:
          <br>
          <br>- <b>No further data will be collected from you</b>
          <br>- <b>Your email will be removed</b>
          <br><br>
          More details can be found in the information letter.
          <br><br>
          Press the 'Withdraw consent' button to remove your consent from the study.
        `,
        ok: { color: 'primary', label: 'Withdraw consent' },
        persistent: true,
        cancel: true,
        html: true
      }).onOk(() => {
        this.updateParticipationStatus()
      }).onCancel(() => {
        this.participationStatus = !this.participationStatus
      })
    },
    async formatExerciseData (exercises) {
      let results = exercises
      for (const e in results) {
        let exercise = exercises[e]
        exercise.type = exerciseType.typeToAsc(exercise.type)
        exercise.startTimestamp = nicers.formattedDayOfMonth(exercise.startTimestamp)
        exercise.endTimestamp = nicers.formattedDayOfMonth(exercise.endTimestamp)
        
        // TODO: This should be moved to PoeViewModal
        for (const p in exercise.poe) {
          let poe = exercise.poe[p], confidences = []

          poe["posturalOrientation"] = nicers.formattedPosturalOrientation(poe.posturalOrientation)
          poe["scoreToText"] = nicers.formattedScoreToText(poe.score)
          poe["repetition"] = poe["repetition"] === 0 ? 'Summative evaluation' : poe["repetition"]

          for (let i = 0; i < 3; i++) {
            confidences.push({score: poe['scoreConfidence_'+ i] = parseFloat((poe['scoreConfidence_'+ i]*100)).toFixed(0), text: nicers.formattedScoreToText(i)})
            poe['confidences'] = confidences
            delete poe['scoreConfidence_'+ i]
          }
          poe["highestPredictedConfidence"] = poe['confidences'][poe.score].score
        }
      }
      return results
    },
    formatDate (date) {
      return nicers.formattedDayOfMonth(date)
    } 
  }
}
</script>

<style>

</style>
