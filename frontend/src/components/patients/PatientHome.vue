<template>
  <q-layout v-if="patient" view="lHh Lpr lFf" class="m-width">
    <q-header elevated class="header m-width shadow-2">
      <q-toolbar>
        <q-avatar>
          <img src="/icons/favicon-maskable.ico">
        </q-avatar>
        <q-toolbar-title>Home</q-toolbar-title>
        <q-chip outline square size="md" class="q-mx-md text-white">
          {{patient.names}}
        </q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-card flat class="q-my-lg">
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
            v-model="activationStatus"
            label="I agree to the terms in the information letter"
            checked-icon="task_alt"
            unchecked-icon="highlight_off"
            @click="updateParticipationStatus"
          />
        </q-card-actions>
      </q-card>
    </q-page-container>
    <patient-terms-modal :openModal="openConsentModal"/>
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

export default {
  name: 'PatientHome',
  props: { patientID: String },
  components: { PatientTermsModal },
  data () {
    return {
      patient: undefined,
      activationStatus: false,
      openConsentModal: false
    }
  },
  async beforeMount () {
    this.openConsentModal = false
    await this.getPatientInfo()
  },
  methods: {
    async getPatientInfo() {
      try {
        let response = await API.getPatient(this.patientID)
        if (response) {
          this.patient = response
          this.activationStatus = response.activated
        }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Could not retrieve patient: ' + err,
          icon: 'report_problem'
        })
      }
    },
    async updateParticipationStatus () {
      try {
        this.$q.loading.show()
        await nicers.delay(200)
        let response = await API.editPatient(undefined, undefined, undefined, undefined, {}, this.patient.id, this.activationStatus)
        if (response) {
          this.$q.notify({
            color: 'info',
            position: 'top',
            message: 'Updated participation status',
            icon:'info'
          })
        }
      } catch (err) {
        console.log(err)
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Could not update participation: ' + err,
          icon: 'report_problem'
        })
        this.activationStatus = false
      }
      this.$q.loading.hide()
      return
    }
  }
}
</script>

<style>

</style>
