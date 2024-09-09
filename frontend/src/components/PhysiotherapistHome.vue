<template>
   <q-layout>
      <q-page-container>
          <q-card-actions class="q-ma-lg flex flex-direction-row">      
            <q-btn padding="md" color="accent" @click="() => { this.newUserPrompt = !this.newUserPrompt }">
              <q-icon left name="group_add"/>
              <div>Add new Patient</div>
            </q-btn>

            <q-dialog v-model="newUserPrompt" persistent>
              <q-card class="q-pl-mx" style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Add new patient</div>
                  <div class="text-subtitle2">Send invitation to patient</div>
                </q-card-section>
                <q-form class="q-pt-lg">
                  <q-input
                    filled
                    v-model="this.new.email"
                    label="Email"
                    type="email"
                    hint="e.g. user@email.com"
                  />
                  <q-input
                    filled
                    v-model="this.new.fullName"
                    label="full name"
                    type="text"
                    hint="e.g. user@email.com"
                  />
                  <q-input
                    filled
                    v-model="this.new.dateOfBirth"
                    label="date"
                    type="date"
                    hint="e.g. user@email.com"
                  />
                    <q-input
                    filled
                    v-model="this.new.height"
                    label="number"
                    type="number"
                    hint="e.g. user@email.com"
                  />
                    <q-input
                    filled
                    v-model="this.new.weight"
                    label="number"
                    type="number"
                    hint="e.g. user@email.com"
                  />
                    <q-input
                    filled
                    v-model="this.new.injuries"
                    label="text"
                    type="text"
                    hint="e.g. user@email.com"
                  />
                </q-form>
                <q-card-actions align="right" class="text-primary">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Submit" type="submit" color="primary" v-close-popup class="q-ml-sm" @click="addNewUser()"/>
                </q-card-actions>
              </q-card>
            </q-dialog>
            
            <q-btn padding="md" color="teal" @click="() => openExercisePrompt()">
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
          <q-tab-panels v-model="panel" ref="panelForm" vertical animated class="shadow-2 rounded-borders">
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
                <q-card class="q-px-md patient-view-card" flat>
                  <q-card-section>
                    <q-avatar icon="person"/>
                    <div class="text-h6">{{selectedPatient.names}}</div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <span>Date of birth:</span>
                    {{ selectedPatient.dateofbirth }}
                  </q-card-section>
                  <q-separator inset />
                  <q-card-section>
                    <span>List of injuries:</span>
                    {{ selectedPatient.injuries }}
                  </q-card-section>
                  <q-separator inset />
                  <q-card-section>
                    <span>Height:</span>
                    {{ selectedPatient.height }}
                    <span>Weight:</span>
                    {{ selectedPatient.weight }}
                  </q-card-section>
                  <q-separator inset />
                  <q-card-section>
                    <span>Created:</span>
                    {{ selectedPatient.createdTimestamp }}
                  </q-card-section>
                </q-card>
            </q-tab-panel>
        </q-tab-panels>
      </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API'
import storage from '../utils/userStorage'

export default {
  name: 'PhysiotherapistHome',
  data () {
    return {
      newUserPrompt: false,
      exercisePrompt: false, 
       new: {
        role: 'patient',
        email: undefined,
        password: 'password', // change this once we have sign-up with email
        fullName: undefined,
        dateOfBirth: undefined,
        height: undefined,
        weight: undefined,
        injuries: undefined
      },
      panel: undefined,
      users: [],
      selectedPatient: undefined
    }
  },
  async mounted () {
    this.resetForm()
    this.$refs.panelForm.goTo('main')
    await this.getUsers()
  },
  methods: {
     async addNewUser () {
      try {
        let user = this.new
        let resp = await API.addPatient(user.fullName, user.dateOfBirth, user.height, user.weight, user.injuries)
        console.log('added: ', resp)
      } catch (e) {
        if (e.status === 409) {
          return this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'User registration failed: ' + e.response.data,
            icon: 'report_problem'
          })
        }
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'User registration failed' + e,
          icon: 'report_problem'
        })
      }
      await this.getUsers()
    },
    async getUsers () {
      let res = await API.getPatients()
      this.users = res
      console.log(this.users)
    },
    async openExercisePrompt () {
      console.log(this.users)
      if (this.users <= 0) {
        console.log(this.users)
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
      console.log(this.selectedPatient)
      this.$refs.panelForm.goTo('view')
      // this.$router.push('view/' + e.patientID)
    },
    resetForm () {
      this.newUserPrompt = false
      this.exercisePrompt = false
      this.users = undefined
      this.selectedPatient = undefined
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
</style>