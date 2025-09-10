<template>
  <div>
    <q-separator />
    <q-btn class="q-ma-md" round dense color="primary" size="lg" icon="chevron_left" @click="$emit('panelFormGoBack')" />
    <div class="q-pa-md flex justify-between patient-view-width">
      <q-btn icon-right="person" size="sm" :label="$t('patient.edit')" type="submit" color="primary" v-close-popup  @click="openUserEditPrompt = !openUserEditPrompt"/>
      <q-btn v-if="!selectedPatient.sessionID" icon-right="start" size="sm" :label="$t('patient.start')" type="submit" color="secondary" v-close-popup  @click="startNewSession(selectedPatient)"/>
      <q-btn v-else icon-right="open_in_new" size="sm" :label="$t('patient.ongoing')" type="submit" color="secondary" v-close-popup  @click="navigateToSession(selectedPatient.sessionID)"/>
    </div>
    <q-card flat class="patient-view-width">
      <q-card-section>
        <div class="text-h6 row">
          <div class="col">{{selectedPatient.names}}</div>
          <q-btn class="q-my-sm" style="height:fit-content;padding:4px;" icon="close" size="sm" type="submit" color="negative" v-close-popup  @click="deletePatient(selectedPatient)" />
        </div>
        <div class="text-body2" style="right:2px;position:relative;">
          <q-icon style="bottom: 2px;" size="sm" name="calendar_month"/>
          {{ formatDate(selectedPatient.createdTimestamp) }}
          <div class="text-body2">
            <q-badge class="q-my-sm" :color="selectedPatient.activated ? 'positive' : 'negative'">
              {{selectedPatient.activated ? $t('patient.consent') : $t('patient.no_consent') }} 
            </q-badge>
          </div>
          <q-btn icon-right="open_in_new" size="sm" :label="$t('patient.code')" type="submit" color="primary" class="q-my-sm" v-close-popup  @click="openPatientModal = !openPatientModal"/>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">{{ $t('patient.profile.measurements') }}</div>
        <div class="text-body2">
          {{ selectedPatient.height ? selectedPatient.height + ' cm' : $t('patient.profile.height_not_specified') }}
        </div>
        <div class="text-body2">
          {{ selectedPatient.weight ? selectedPatient.weight + ' kg' : $t('patient.profile.weight_not_specified') }}
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">{{ $t('patient.profile.dob') }}</div>
        <div class="text-body2">{{ formatDate(selectedPatient.dateofbirth) }}</div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">{{ $t('patient.profile.injuries') }}</div>
        <div class="text-body2">
          {{ selectedPatient.injuredBodyPart ? getInjuredBodyPart : $t('patient.profile.part_not_specified') }}
        </div>
        <div class="text-body2">
          {{ selectedPatient.injuredSide ? getInjuredSide : $t('patient.profile.side_not_specified') }}
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">{{ $t('patient.profile.notes') }}</div>
        <div style="whiteSpace: break-spaces" class="text-body2">
          <div class="q-py-sm text-body2">
            <q-scroll-area :visible="true" style="height: 160px;">
              {{ selectedPatient.injuries ? selectedPatient.injuries : '...' }}
            </q-scroll-area>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <patient-edit-form 
      :user="selectedPatient"
      formMode="edit" v-model="openUserEditPrompt" 
      @editPatient="editPatient" 
    />
    <q-dialog v-model="openPatientModal">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('patient.activate') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-body2 q-py-sm">
            {{ $t('patient.activate_instructions') }}
          </div>
          <q-separator />
          <div class="qr-code flex flex-center q-ma-sm">
            <qrcode-svg :value="qr.value" :size="qr.size" :level="qr.lvl" render-as="svg" />
          </div>
          <q-separator />
          <div class="text-center q-my-md">
            <q-btn icon-right="content_copy" :label="$t('patient.activate_copy')" @click="this.copyPatientVerificationURL" no-caps flat dense />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import API from '../../API.js'
import nicers from '../../utils/nicers'
import PatientEditForm from './PatientEditForm.vue'
import { QrcodeSvg } from 'qrcode.vue'

export default {
  name: 'PatientViewModal',
  props: { selectedPatient: Object },
  emits: ['openView', 'panelFormGoBack'],
  components: { PatientEditForm, QrcodeSvg },
  data () {
    return {
      openUserEditPrompt: false,
      openPatientModal: false,
      qr: {
        value: "",
        size: 300,
        lvl: 'L'
      }
    }
  },
  mounted () {
    this.openPatientModal = false
    this.getPatientPageURL()
  },
  methods: {
    async startNewSession (selectedPatient) {
      try {
        if (!this.selectedPatient.activated) {
          return this.$q.notify({
            type: 'negative',
            position: 'top',
            message: 'Patient needs to consent to research study before creating session',
            icon: 'report_problem'
          })
        }
        this.$q.loading.show()
        let resp = await API.addSession(selectedPatient.id)
        await nicers.delay(500)
        if (resp.data && resp.data.session.id) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: 'Created new session for ' + selectedPatient.names,
          })
          this.navigateToSession(resp.data.session.id)
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Creating new session failed: ' + err,
          icon: 'report_problem'
        })
      }
      this.$q.loading.hide()
      return
    },
    async editPatient (edited) {
      try {
        const { fullName, dateOfBirth, height, weight, injuries, injuredSide, injuredBodyPart } = edited
        await API.editPatient(fullName, dateOfBirth, height, weight, { description: injuries, side: injuredSide, bodyPart: injuredBodyPart }, this.selectedPatient.id)
        this.$q.notify({
          color: 'secondary',
          position: 'top',
          message: 'Updated ' + fullName,
          icon: 'info'
        })
        this.$emit('openView', { patientID: this.selectedPatient.id })
      } catch (err) {
        let errMsg = err
        if (err.response.status == 400) errMsg = err.response.data
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Patient update failed: ' + errMsg,
          icon: 'report_problem'
        })
      }
    },
    async deletePatient (selectedPatient) {
      const deleted = selectedPatient
      this.$q.dialog({
        color: 'primary',
        title: this.$i18n.t('patient.delete'),
        message: this.$i18n.t('patient.delete_confirm', { name: deleted.names }),
        ok: { color: 'negative', label: this.$i18n.t('common.delete') },
        persistent: false,
        cancel: { flat: true, label: this.$i18n.t('common.cancel') },
        html: true
      })
      .onOk(async () => {
        try {
          this.$q.loading.show()
          await nicers.delay(500)
          await API.deletePatient(deleted.id, deleted.physiotherapistId)
          this.$q.notify({
            color: 'info',
            position: 'top',
            message: `Deleted ${deleted.names}`,
            icon: 'info'
          })
          this.$emit('panelFormGoBack')
        } catch (err) {
          let errMsg = err
          if (err.response.status === 409) errMsg = err.response.data
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `Cannot delete ${deleted.names}: ${errMsg}`,
            icon: 'warning'
          })
        }
        this.$q.loading.hide()
        return 
      })
    },
    navigateToSession (sessionID) {
      return this.$router.push('home/sessions/' + sessionID)
    },
    async copyPatientVerificationURL () {
      const url = await this.getPatientPageURL()
      await nicers.copyTextToClipboard(url)
    },
    async getPatientPageURL () {
      try {
        let response = await API.getPatient(this.selectedPatient.id)
        if (response.access) {
          let patientURL = '/patient/' + this.selectedPatient.id + '/profile?access=' + response.access
          this.qr.value = window.origin + patientURL
          return this.qr.value
        }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Cannot generate patient url: ${err}`,
          icon: 'warning'
        })
      }
    },
    formatDate (date) {
      return nicers.formattedDate(date)
    }
  },
  computed: {
    getInjuredBodyPart () {
      return `${this.$i18n.t('patient.profile.part_of_body')}: ` + this.$i18n.t(`patient.injuries.${this.selectedPatient.injuredBodyPart}`)
    },
    getInjuredSide () {
      let side = this.selectedPatient.injuredSide
      side = this.$i18n.t(`patient.injuries.${side}`)
      return this.selectedPatient.injuredSide !== 'both' ? (side + ` ${this.$i18n.t('patient.injuries.side')}`) : side + ` ${this.$i18n.t('patient.injuries.sides')}`
    }
  }
}
</script>

<style scoped>
.patient-view-width {
  margin: 0 auto;
  max-width: 400px;
}
</style>