<template>
   <q-layout>
      <q-page-container>
          <q-card-actions class="q-ma-md flex flex-center">      
            <q-btn class="action-button" padding="md" color="accent" @click="() => { this.newUserPrompt = !this.newUserPrompt }">
              <q-icon left name="group_add"/>
              <div>Add new Patient</div>
            </q-btn>
            <q-btn class="action-button" padding="md" color="teal" @click="() => openExercisePrompt()">
              <q-icon left name="accessibility" />
              <div>Exercises</div>
            </q-btn>
            <patient-edit-form
              :user="{}"
              formMode="new" 
              v-model="newUserPrompt" 
              @addNewPatient="addNewUser"
            />
            <q-dialog v-model="exercisePrompt" persistent>
              <q-card class="q-pl-mx" style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Create new exercises</div>
                </q-card-section>
                <q-form class="q-px-lg">
                  <q-input
                    class="q-py-md"
                    filled
                    v-model="this.new.email"
                    label="Name"
                    hint="Name of the exercise session"
                  />
                </q-form>
                <q-card-actions align="right" class="text-primary">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Submit" type="submit" color="primary" v-close-popup class="q-ml-sm" @click="addNewUser()"/>
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-card-actions>
          <div class="q-pa-md q-gutter-sm flex flex-center">
            <div class="text-h6">Patients list</div>
          </div>
          <q-separator inset />
          <q-tab-panels v-show="users.length >= 1 && pagination.maxPageNo >= 1" v-model="panel" ref="panelForm" vertical animated class="shadow-2 rounded-borders">
            <q-tab-panel id="panel" name="main" class="q-px-none">
              <div class="q-py-md flex justify-center">
                <div style="width: 400px;">
                  <q-btn style="marginLeft:2px;" color="grey-8" flat fab-mini :ripple="false" 
                    :icon="pagination.sortOrder == 'DESC' ? 'arrow_drop_down' : 'arrow_drop_up'" 
                    v-touch-repeat.mouse="handleSortOrder"
                  >
                  <q-icon name="calendar_month" />
                  </q-btn>
                  <q-intersection
                    v-for="user in users"
                    :key="user.id"
                    transition="jump-up"
                    class="example-item"
                  >
                  <q-item clickable v-ripple @click="(e) => openPatientView(user)">
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white" icon="person" />        
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ user.names }}</q-item-label>
                      <q-item-label caption lines="1">{{ formatDate(user.createdTimestamp) }}</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <q-icon name="arrow_forward" />
                    </q-item-section>
                    </q-item>
                  </q-intersection>
                </div>
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
              />
            </q-tab-panel>
            <q-tab-panel name="view" class="q-px-sm">
              <patients-list 
                :selectedPatient="selectedPatient" 
                @openView="openPatientView"
                @panelFormGoBack="this.$refs.panelForm.goTo('main')"
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
          <q-separator inset />
          <div class="q-pa-md q-gutter-sm flex flex-center">
            <div class="text-h6">Ongoing sessions</div>
          </div>
          <sessions-list :selectedPatient="selectedPatient" />
        </div>
      </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API'
import nicers from '../utils/nicers'
import PatientEditForm from './patients/PatientEditForm.vue'
import PatientsList from './patients/PatientsList.vue'
import SessionsList from './sessions/SessionsList.vue'

export default {
  name: 'PhysiotherapistHome',
  components: { PatientEditForm, SessionsList, PatientsList },
  data () {
    return {
      newUserPrompt: false,
      exercisePrompt: false,
      new: {
        fullName: undefined,
        dateOfBirth: undefined,
        height: undefined,
        weight: undefined,
        injuries: undefined
      },
      panel: undefined,
      users: [],
      selectedPatient: undefined,
      isLoadingPatients: true,
      pagination: {
        limit: 5,
        pageNo: 1,
        sortOrder: 'DESC',
        maxPageNo: 1
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
      let res = await API.getPatients(this.pagination)
      if (res) {
        this.users = res.patients
        this.pagination.maxPageNo = res.maxPageNo
        this.isLoadingPatients = false
      }
    },
    async openExercisePrompt () {
      if (!this.users || this.users.length <= 0) {
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: 'Please add patient before creating a new exercise',
          icon: 'info'
        })
        return
      }
      this.exercisePrompt = !this.exercisePrompt
    },
    async openPatientView (selectedUser) {
      let resp = await API.getPatient(selectedUser.patientID)
      this.selectedPatient = resp
      this.$refs.panelForm.goTo('view')
    },
    resetForm () {
      this.newUserPrompt = false
      this.exercisePrompt = false
      this.new = { }
    },
    formatDate(date) {
      return nicers.formattedDate(date)
    },
    async handlePagePatient (no) {
      this.pagination.pageNo = no
      await this.getPatients()  
    },
    async handleSortOrder () {
      this.pagination.sortOrder == 'DESC' 
        ? this.pagination.sortOrder = 'ASC' 
        : this.pagination.sortOrder = 'DESC'

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
  .action-button {
    padding: 5px !important;
  }
}

</style>