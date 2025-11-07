<template>
  <div>
    <q-btn v-if="this.user && !this.user.newSurveyAvailable" class="q-ml-md" round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.push('/home')" />
    <terms-modal v-model="openConsentModal" :isPatient="false"></terms-modal>
    <q-card flat class="q-ma-sm">
      <q-card-section>
        <div class="text-h6">{{ $t('common.consent.header') }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none flex flex-center">
        <div class="text-body2" v-html="$t('common.consent.description')"></div>
        <q-btn class="q-pt-lg" icon-right="open_in_new" :label="$t('common.consent.read_information')" @click="openConsentModal = !openConsentModal" no-caps flat dense />
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="text-body2">{{ $t('common.consent.confirm_description') }}</div>
      </q-card-section>
      <q-card-actions vertical align="left" class="q-mx-none q-pa-none">
        <q-checkbox
          right-label
          size="lg"
          v-model="participationStatus"
          :label="$t('common.consent.confirm_checkbox')"
          checked-icon="task_alt"
          unchecked-icon="highlight_off"
        />
      </q-card-actions>
      <q-btn
        :disabled="(this.user && this.user.newSurveyAvailable) && !this.participationStatus"
        class="q-my-md q-pa-sm full-width" size="md" color="secondary"
        @click="updateParticipationStatus" no-caps icon-right="chevron_right"
        :label="this.user && this.user.newSurveyAvailable ? $t('common.consent.continue_to_survey') : $t('common.confirm')" 
      />
    </q-card>
  </div>
</template>

<script>
import API from '../../API'
import TermsModal from '../UserTermsModal.vue'

export default {
  name: 'TestLeaderConsentPage',
  components: { TermsModal },
  data () {
    return {
      user: undefined,
      participationStatus: false,
      openConsentModal: false
    }
  },
  async beforeMount () {
    try {
      this.user = await API.getInfo()
      if (this.user) this.participationStatus = this.user.activated
    } catch (err) {
      return this.$q.notify({
        color: 'negative',
        position: 'top',
        message: 'Error: ' + err,
        icon: 'report_problem'
      })
    }

  },
  methods: {
    async updateParticipationStatus () {
      try {
        const updatedParticipation = this.participationStatus
        let response = await API.updateUserActivation(updatedParticipation)
        if (response) {
          this.$q.notify({
            color: 'secondary',
            icon: 'info',
            position: 'top',
            message: 'Updated consent status',
          })
          return this.$router.push('/home')
        }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Could not update user consent: ' + err,
          icon: 'warning'
        })
      }
    },
  }
}
</script>

<style>

</style>