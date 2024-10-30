<template>
   <q-layout>
    <q-page-container>
      <q-card-actions class="flex flex-center">      
        <q-btn class="prompt-button" padding="md" color="accent" @click="() => { this.newUserPrompt = !this.newUserPrompt }">
          <q-icon left name="group_add"/>
          <div>Add new Patient</div>
        </q-btn>
        <patient-edit-form
          :user="{}"
          formMode="new" 
          v-model="newUserPrompt" 
          @addNewPatient="addNewUser"
        />
      </q-card-actions>
      <q-tab-panels v-show="users.length >= 1 && pagination.maxPageNo >= 1" v-model="panel" ref="panelForm" vertical animated class="shadow-2 rounded-borders">
        <q-tab-panel id="panel" name="main" class="q-px-none">
          <patients-list
            @openView="openPatientView"
            @handleSortOrder="(sort) => handleSortOrder(sort)"
            :patients="users"
            :pagination="pagination"
          />
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
          />
        </q-tab-panel>
        <q-tab-panel name="view" class="q-px-sm">
          <patient-view-modal 
            :selectedPatient="selectedPatient" 
            @openView="openPatientView"
            @panelFormGoBack="openHomePage"
          />
        </q-tab-panel>
      </q-tab-panels>
      <div v-if="isLoadingPatients" class="q-ma-md flex flex-center">
        <q-spinner-dots
          color="primary"
          size="3em"
        />
      </div>
      <div v-else-if="pagination.maxPageNo <= 0" class="q-py-md text-body1 flex flex-center">
        No patients found
      </div>
      <div v-if="panel == 'main'">
        <q-separator />
        <sessions-list :selectedPatient="selectedPatient" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API'
import PatientEditForm from './patients/PatientEditForm.vue'
import PatientsList from './patients/PatientsList.vue'
import PatientViewModal from './patients/PatientViewModal.vue'
import SessionsList from './sessions/SessionsList.vue'

export default {
  name: 'PhysiotherapistHome',
  components: { PatientEditForm, SessionsList, PatientViewModal, PatientsList },
  data () {
    return {
      newUserPrompt: false,
      panel: undefined,
      users: [],
      selectedPatient: undefined,
      isLoadingPatients: true,
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
    this.$refs.panelForm.goTo('main')
    await this.getPatients()
  },
  methods: {
     async addNewUser (newUser) {
      try {
        const { fullName, dateOfBirth, height, weight, injuries } = newUser
        let resp = await API.addPatient(fullName, dateOfBirth, height, weight, injuries)
        if (resp.data) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: 'Added new patient',
          })
        }
      } catch (e) {
        let errorMsg = e
        if (e.status === 409 || e.status === 400) errorMsg = e.response.data
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Patient registration failed: ' + errorMsg,
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
        }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Something went wrong when retrieving patients: ' + err,
          icon: 'warning'
        })
      }
    },
    async openPatientView (selectedUser) {
      let resp = await API.getPatient(selectedUser.patientID)
      this.selectedPatient = resp
      this.$refs.panelForm.goTo('view')
    },
    async openHomePage () {
      await this.getPatients()
      this.$refs.panelForm.goTo('main')
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
    }
  }
}
</script>


<style scoped>
#panel {
  overflow-y: hidden;
}
.shadow-2 {
  box-shadow: none;
}

@media only screen and (max-width: 450px) {
  .prompt-button {
    padding: 5px !important;
    width: 90%
  }
}

</style>