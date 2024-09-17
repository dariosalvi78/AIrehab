<template>
   <q-layout>
      <q-page-container>
          <q-card-actions class="q-ma-md flex flex-center">      
            <q-btn class="action-button" padding="md" color="accent" @click="() => { this.newUserPrompt = !this.newUserPrompt }">
              <q-icon left name="group_add"/>
              <div>Add new Patient</div>
            </q-btn>

            <q-dialog v-model="newUserPrompt" persistent>
              <q-card class="q-pl-mx" style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Add new patient</div>
                  <!-- <div class="text-subtitle2">Send invitation to patient</div> -->
                </q-card-section>
                  <q-form class="q-px-sm">
                  <!-- <q-input
                    filled
                    v-model="this.new.email"
                    label="Email"
                    type="email"
                    hint="e.g. user@email.com"
                  /> -->
                  <q-input
                    class="q-my-md"            
                    filled
                    v-model="this.new.fullName"
                    label="Full name"
                    type="text"
                    hint="Patient full name"
                  />
                  <q-input
                    class="q-my-md"            
                    filled
                    v-model="this.new.dateOfBirth"
                    label="date"
                    type="date"
                    hint="Date of birth - in yyyy-mm-dd"
                  />
                    <q-input
                    class="q-my-md"            
                    filled
                    v-model="this.new.height"
                    label="Height (cm)"
                    type="number"
                    hint="Optional. Patient height"
                  />
                    <q-input
                    class="q-my-md"            
                    filled
                    v-model="this.new.weight"
                    label="Weight (kg)"
                    type="number"
                    hint="Optional. Patient weight"
                  />
                    <q-input
                    class="q-my-md"            
                    filled
                    v-model="this.new.injuries"
                    label="Notes"
                    type="textarea"
                    hint="Optional. List of injuries"
                  />
                </q-form>
                <q-card-actions align="right" class="text-primary">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Submit" type="submit" color="primary" v-close-popup class="q-ml-sm" @click="addNewUser()"/>
                </q-card-actions>
              </q-card>
            </q-dialog>
            
            <q-btn class="action-button" padding="md" color="teal" @click="() => openExercisePrompt()">
              <q-icon left name="accessibility" />
              <div>Exercises</div>
            </q-btn>

            <q-dialog v-model="exercisePrompt" persistent>
              <q-card class="q-pl-mx" style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Create new exercises</div>
                </q-card-section>
                <q-form class="q-pt-lg">
                  <q-input
                    filled
                    v-model="this.new.email"
                    label="Email"
                    hint="e.g. user@email.com"
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
                      <q-item-label caption lines="1">{{ user.email }}</q-item-label>
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
      </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API'
import nicers from '../utils/nicers'

export default {
  name: 'PhysiotherapistHome',
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
     async addNewUser () {
      try {
        let user = this.new
        await API.addPatient(user.fullName, user.dateOfBirth, user.height, user.weight, user.injuries)
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