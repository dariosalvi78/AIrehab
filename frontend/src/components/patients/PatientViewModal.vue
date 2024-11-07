<template>
  <div>
    <q-btn round dense color="primary" size="lg" icon="chevron_left" @click="$emit('panelFormGoBack')" />
    <div class="q-my-md flex justify-center">
      <q-btn v-if="!selectedPatient.sessionID" size="sm" label="Start physiotherapy session" type="submit" color="secondary" v-close-popup  @click="startNewSession(selectedPatient)"/>
      <q-btn v-else icon-right="open_in_new" size="sm" label="Go to ongoing session" type="submit" color="secondary" v-close-popup  @click="navigateToSession(selectedPatient.sessionID)"/>
      <q-btn icon-right="person" size="sm" label="Edit patient" type="submit" color="primary" class="q-ml-sm" v-close-popup  @click="openUserEditPrompt = !openUserEditPrompt"/>
    </div>
    <q-card flat class="q-px-sm patient-view-card">
      <q-card-section>
        <div class="text-h6 row">
          <div class="col">{{selectedPatient.names}}</div>
          <q-btn class="q-my-sm" style="height:fit-content;padding:4px;" icon="close" size="sm" type="submit" color="negative" v-close-popup  @click="deletePatient(selectedPatient)" />
        </div>
        <div class="text-body2" style="right:2px;position:relative;">
          <q-icon style="bottom: 2px;" size="sm" name="calendar_month"/>
          {{ formatDate(selectedPatient.createdTimestamp) }}
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">Measurements</div>
        <div class="text-body2">
          {{ selectedPatient.height ? selectedPatient.height + ' cm' : 'Height not specified' }}
        </div>
        <div class="text-body2">
          {{ selectedPatient.weight ? selectedPatient.weight + ' kg' : 'Weight not specified' }}
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">Date of birth</div>
        <div class="text-body2">{{ formatDate(selectedPatient.dateofbirth) }}</div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">Injuries</div>
        <div class="text-body2">
          {{ selectedPatient.injuredBodyPart ? getInjuredBodyPart : 'Body part not specified' }}
        </div>
        <div class="text-body2">
          {{ selectedPatient.injuredSide ? getInjuredSide : 'Side not specified' }}
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-subtitle1">Description</div>
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
  </div>
</template>

<script>
import API from '../../API.js'
import exerciseEnums from '../../utils/exerciseTypesEnum.js'
import nicers from '../../utils/nicers'
import PatientEditForm from './PatientEditForm.vue'

export default {
  name: 'PatientViewModal',
  props: { selectedPatient: Object },
  emits: ['openView', 'panelFormGoBack'],
  components: { PatientEditForm },
  data () {
    return {
      openUserEditPrompt: false
    }
  },
  mounted () { },
  methods: {
    async startNewSession (selectedPatient) {
      try {
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
        title: 'Delete patient',
        message: `
          Are you sure you want to permanently delete patient <b>${deleted.names}</b>? 
        `,
        ok: { color: 'negative', label: 'Delete' },
        persistent: false,
        cancel: true,
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
      return this.$router.push('physiotherapist/sessions/' + sessionID)
    },
    formatDate (date) {
      return nicers.formattedDate(date)
    }
  },
  computed: {
    getInjuredBodyPart () {
      return 'Part of the body: ' + exerciseEnums.typeToAsc(this.selectedPatient.injuredBodyPart)
    },
    getInjuredSide () {
      let side = this.selectedPatient.injuredSide
      return side[0].toUpperCase() + side.slice(1) + ' side injured'
    }
  }
}
</script>

<style scoped>
.patient-view-card {
  margin: 0 auto;
  max-width: 300px;
}
</style>