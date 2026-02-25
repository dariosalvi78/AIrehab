<template>
   <q-layout v-touch-swipe.mouse.right.left="showNewUserPrompt ? handleSwipe : ''">
    <q-page-container>
      <q-tab-panels v-model="panel" ref="panelForm" class="shadow-2 rounded-borders" animated>
        <q-tab-panel v-show="!isLoadingPatients" id="panel" name="patients" class="q-px-none">
          <div class="text-h4 q-mx-md q-mb-md text-weight-light">{{ $t('common.tabs.patients') }}</div>
          <q-separator />
          <q-card-actions class="flex flex-center q-mt-md" v-if="showNewUserPrompt">      
            <q-btn class="prompts" padding="sm" color="accent" no-caps @click="newUserPrompt = !newUserPrompt">
              <q-icon left name="group_add"/>
              <div>{{ $t('patient.add') }}</div>
            </q-btn>
            <patient-edit-form
              :user="{}"
              formMode="new" 
              v-model="newUserPrompt" 
              @addNewPatient="addNewUser"
            />
          </q-card-actions>
          <patients-list
            v-if="users.length >= 1 && pagination.maxPageNo >= 1"
            @openView="openPatientView"
            @handleSortOrder="(sort) => handleSortOrder(sort)"
            :patients="users"
            :pagination="pagination"
          />
          <div v-else-if="panel !== 'survey' && pagination.maxPageNo <= 0" class="q-py-md text-body1 flex flex-center">
            <q-chip outline :ripple="false" icon="people" color="primary" text-color="white" >{{ $t('patient.not_found') }}</q-chip>
          </div>
          <div v-else class="q-ma-md flex flex-center">
            <q-spinner-dots color="primary" size="3em" />
          </div>
          <q-pagination
            v-if="pagination.maxPageNo >= 1"
            v-model="pagination.pageNo"
            :max="pagination.maxPageNo"
            :min="1"
            flat
            @update:model-value="(e) => handlePagePatient(e)"
            direction-links
            color="grey"
            active-color="primary"
            class="flex flex-center"
            active-design="push"
            size="md"
            gutter="sm"
          />
        </q-tab-panel>
        <q-tab-panel name="sessions" class="q-px-none">
          <div class="text-h4 q-mx-md q-mb-md text-weight-light">{{ $t('common.tabs.sessions') }}</div>
          <q-separator />
          <sessions-list @update:tabs="updateTabs" />
        </q-tab-panel>
      </q-tab-panels>
      <survey-form
        v-if="panel == 'survey'" id="survey" class="q-mx-md"
        :incomingSurvey="this.incomingSurvey"
        @panelFormGoBack="openHomePage"
      />
      <div v-else-if="panel == 'view'">
        <transition appear enter-active-class="animated fadeIn">
          <patient-view-modal 
            :selectedPatient="selectedPatient" 
            @openView="openPatientView"
            @panelFormGoBack="openHomePage"
            @update:tabs="updateTabs"
          />
        </transition>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import API from '../../API'
import PatientEditForm from '../patients/PatientEditForm.vue'
import PatientsList from '../patients/PatientsList.vue'
import PatientViewModal from '../patients/PatientViewModal.vue'
import SessionsList from '../sessions/SessionsList.vue'
import SurveyForm from '../SurveyForm.vue'
import h from '../../utils/nicers.js'
import { mergeLocaleMessages } from 'src/boot/i18n'

export default {
  name: 'TestLeaderHome',
  components: { PatientEditForm, SessionsList, PatientViewModal, PatientsList, SurveyForm },
  props: { user: Object, currentTab: String },
  emits: ['handle:swipe', 'update:tabs'],
  i18n: await mergeLocaleMessages(['exercises', 'patient']),
  data () {
    return {
      newUserPrompt: false,
      panel: this.currentTab,
      users: [],
      selectedPatient: undefined,
      isLoadingPatients: true,
      incomingSurvey: undefined,
      pagination: {
        limit: 5,
        pageNo: 1,
        maxPageNo: 1,
        type: 'date',
        date: {
          sortOrder: 'DESC'
        },
        name: {
          sortOrder: 'DESC'
        }
      }
    }
  },
  async mounted () {
    this.resetForm()
    let qPatientID = new URLSearchParams(window.location.search).get('p')
    await this.isNewSurveyAvailable()
    if (this.panel == 'patients') {
      if (qPatientID) return this.openPatientView({ patientID: qPatientID })
      await this.getPatients()
    }
  },
  watch: {
    async panel(updatedView) {
      if (updatedView !== 'survey') await this.isNewSurveyAvailable()
      if (!this.incomingSurvey && updatedView == 'patients') await this.getPatients()
    },
    $route(up) {
      if (up.path == '/home' && !Object.keys(up?.query).length) return this.$refs.panelForm.goTo('patients')
      else if (up.query.p) return this.openPatientView({ patientID: up.query.p })
      else if (up.query.view) return this.$refs.panelForm.goTo(up.query.view)
    }
  },
  methods: {
     async addNewUser (newUser) {
      try {
        const { fullName, dateOfBirth, height, weight, injuries, injuredSide, injuredBodyPart, isTestPatient } = newUser
        let resp = await API.addPatient(fullName, dateOfBirth, height, weight, { description: injuries, side: injuredSide, bodyPart: injuredBodyPart }, null, isTestPatient)
        if (resp.data) {
          if (resp.data.testSession) {
            this.$q.notify({
              type: 'positive',
              position: 'top',
              message: this.$t('exercises.notification.created_test_exercise'),
            })
            return this.goToTestExercise(resp.data.sessionID, resp.data.exerciseID)
          }
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: this.$t('patient.notification.add_patient'),
          })
        }
      } catch (e) {
        let errorMsg = 
          e.status === 400 ? this.$t('common.notification.error') :
          e.status === 409 ? this.$t('patient.notification.patient_exist_error', { name: newUser.fullName }) :
          e.status === 403 && !e.response.data?.activated ? this.$t('exercises.notification.user_consent_missing') : e
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('patient.notification.add_patient_error', { error: errorMsg }),
          icon: 'report_problem'
        })
      }
      await this.getPatients()
      this.resetForm()
    },
    async getPatients () {
      try {
        let res = await API.getPatients(this.pagination)
        if (res) {
          this.users = res.patients
          this.pagination.maxPageNo = res.maxPageNo
          this.isLoadingPatients = false
          this.updateTabs(this.currentTab, res.count)
        }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('patient.notification.get_patients_error', { error: err.message }),
          icon: 'warning'
        })
      }
    },
    async isNewSurveyAvailable () {
      try {
        const { activated, newSurveyAvailable } = await API.getInfo()
        if (!newSurveyAvailable) return
        // We need user to consent in order to do survey
        if (!activated && newSurveyAvailable) return this.$router.push('home/consent')
        this.incomingSurvey = newSurveyAvailable

        let q = new URLSearchParams(window.location.search)
        if (q?.get('redirect') === 'survey') return this.panel = 'survey'

        this.$q.dialog({
          color: 'primary', 
          title: this.$t('common.new_survey.header'),
          message: this.$t('common.new_survey.description', { date: h.formattedDateFromNow(this.incomingSurvey?.surveyDate) }),
          ok: { color: 'primary', label:this.$t('common.new_survey.action'), noCaps: true, push: true, size: 'lg', style: 'width: 100%;' },
          persistent: true,
          html: true,
        }).onOk(() => {
          this.panel = 'survey'
          this.$router.push({ path: this.$route.path, query: { redirect: 'survey' } })
        })
      } catch (err) { return }
    },
    async openPatientView (selectedUser) {
      let resp = await API.getPatient(selectedUser.patientID)
      this.selectedPatient = resp
      this.panel = 'view'
      this.$router.push({ path: this.$route.path, query: { p: selectedUser.patientID } })
    },
    async openHomePage () {
      this.$refs.panelForm.goTo('patients')
      this.incomingSurvey = undefined
      this.$router.push(this.$route.path)
      window.scrollTo({ top: 0 })
    },
    resetForm () {
      this.newUserPrompt = false
      this.selectedPatient = undefined
    },
    async handlePagePatient (no) {
      this.pagination.pageNo = no
      await this.getPatients()  
    },
    async handleSortOrder (selectedType) {
      this.pagination.type = selectedType
      this.pagination[selectedType].sortOrder == 'DESC'
        ? this.pagination[selectedType].sortOrder = 'ASC'
        : this.pagination[selectedType].sortOrder = 'DESC'

      await this.getPatients()
    },
    async goToTestExercise (sessionID, exerciseID) {
      return this.$router.push('home/sessions/' + sessionID + '/exercise/' + exerciseID)
    },
    handleSwipe (e) { return this.$emit('handle:swipe', e) },
    updateTabs(name, newCount) { return this.$emit('update:tabs', name, newCount) }
  },
  computed: { showNewUserPrompt () { return this.panel !== 'consent' && this.panel !== 'survey' && this.panel !== 'view' } }
}
</script>


<style scoped>
#panel {
  overflow-y: hidden;
}
.shadow-2 {
  box-shadow: none;
}

</style>