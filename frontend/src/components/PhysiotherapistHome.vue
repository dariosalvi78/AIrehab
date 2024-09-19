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
              @addNewUser="addNewUser"
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
          <q-tab-panels v-show="users.length >= 1" v-model="panel" ref="panelForm" vertical animated class="shadow-2 rounded-borders">
            <q-tab-panel id="panel" name="main">
            <div class="q-pa-md flex justify-center">
              <div style="max-width: 90%; width: 300px;">
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
            </q-tab-panel>
            <q-tab-panel name="view">
              <q-btn round dense color="primary" size="lg" icon="chevron_left" @click="this.$refs.panelForm.goTo('main')" />        
              <q-btn v-if="!selectedPatient.sessionID" size="sm" label="Start physiotherapy session" type="submit" color="secondary" class="q-ml-md" v-close-popup  @click="startNewSession(selectedPatient)"/>
              <q-btn v-else icon-right="open_in_new" size="sm" label="Go to ongoing session" type="submit" color="secondary" class="q-ml-md" v-close-popup  @click="navigateToSession(selectedPatient.sessionID)"/>
              <q-card flat class="q-px-md patient-view-card">
                <q-card-section>
                  <div class="text-h6">{{selectedPatient.names}}</div>
                  <div class="text-body2">
                    <q-icon style="bottom: 2px" size="sm" name="calendar_month"/>
                    {{ formatDate(selectedPatient.createdTimestamp) }}
                    </div>
                </q-card-section>
                <q-separator inset />
                <q-card-section>
                  <div class="text-subtitle1">Height and weight</div>
                  <div class="text-body2">
                    {{ selectedPatient.height }} cm
                  </div>
                  <div class="text-body2">
                    {{ selectedPatient.weight }} kg
                  </div>
                </q-card-section>
                <q-separator inset />
                 <q-card-section>
                  <div class="text-subtitle1">Date of birth</div>
                  <div class="text-body2">{{ formatDate(selectedPatient.dateofbirth) }}</div>
                </q-card-section>                
                <q-separator inset />
                  <q-card-section>
                  <div class="text-subtitle1">Description</div>
                  <div style="whiteSpace: break-spaces" class="text-body2">{{ selectedPatient.injuries }}</div>
                </q-card-section>
              </q-card>
            </q-tab-panel>
        </q-tab-panels>
        <div v-if="isLoadingPatients" class="q-ma-md flex flex-center">
          <q-spinner-dots
              color="primary"
              size="3em"
            />
        </div>
        <div v-if="panel == 'main'">
          <q-separator inset />
          <div class="q-pa-md q-gutter-sm flex flex-center">
            <div class="text-h6">Ongoing sessions</div>
          </div>
          <exercise-sessions :selectedPatient="selectedPatient" />
        </div>
      </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API'
import nicers from '../utils/nicers'
import PatientEditForm from './PatientEditForm.vue'
import ExerciseSessions from './sessions/SessionsList.vue'

export default {
  name: 'PhysiotherapistHome',
  components: { PatientEditForm, ExerciseSessions },
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
      isLoadingPatients: true
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
        await API.addPatient(fullName, dateOfBirth, height, weight, injuries)
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
      let res = await API.getPatients()
      if (res) {
        this.users = res
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
    navigateToSession (sessionID) {
      return this.$router.push('physiotherapist/sessions/' + sessionID)
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
.patient-view-card {
  margin: 0 auto;
  max-width: 300px;
}

@media only screen and (max-width: 450px) {
  .action-button {
    padding: 5px !important;
  }
}

</style>