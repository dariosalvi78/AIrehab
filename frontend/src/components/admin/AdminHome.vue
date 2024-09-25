<template>
  <q-layout>
    <q-card-actions class="q-pb-xl flex flex-center">
      <q-btn padding="md" color="secondary" @click="() => { this.newUserPrompt = !this.newUserPrompt }">
        <q-icon left name="person"/>
        <div>Add new Physiotherapist</div>
      </q-btn>
      <q-btn class="action-button" padding="md" color="accent" @click="() => { this.newPatientPrompt = !this.newPatientPrompt }">
        <q-icon left name="group_add"/>
        <div>Add new Patient</div>
      </q-btn>
    </q-card-actions>
    <patient-edit-form
      :user="{}"
      formMode="adminNew" 
      v-model="newPatientPrompt" 
      @addNewUser="addNewPatient"
    />
    <q-dialog v-model="newUserPrompt">
      <q-card class="q-pl-mx" style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">New Physiotherapist</div>
        </q-card-section>
        <q-form class="q-px-lg">
          <q-input
            class="q-my-lg"            
            filled
            v-model="this.new.email"
            label="Email"
            hint="e.g. user@email.com"
          />
          <q-input
            class="q-my-lg"            
            filled
            v-model="this.new.password"
            label="Password"
            type="password"
            hint="Password for physiotherapist"
          />
           <q-input
            class="q-my-lg"            
            filled
            v-model="this.new.passwordConfirm"
            label="Confirm password"
            type="password"
            hint="Must be the same password"
          />
          <!-- <q-option-group
            :options="optionsRadio"
            type="radio"
            v-model="this.new.role"
          /> -->
        </q-form>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Submit" type="submit" color="primary" v-close-popup class="q-ml-sm" @click="addNewUser()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <admin-user-table 
      :users="users" 
      @getUsers="getUsers()"
    />
    <admin-sessions-table 
      :sessions="sessions" 
      @getSessions="getSessions()"
    />
  </q-layout>
</template>

<script>
import API from '../../API.js'
import PatientEditForm from '../patients/PatientEditForm.vue'
import AdminSessionsTable from './AdminSessionsTable.vue'
import AdminUserTable from './AdminUserTable.vue'

export default {
  components: { AdminUserTable, AdminSessionsTable, PatientEditForm },
  name: 'AdminHome',
  data () {
    return {
      users: [],
      sessions: [],
      newUserPrompt: false,
      newPatientPrompt: false,
      new: {
        role: 'physiotherapist',
        email: undefined,
        password: undefined
      },
      optionsRadio: [
        { label: 'Physiotherapist', value: 'physiotherapist' },
      ]
    }
  },
  async created () {
    this.newUserPrompt = false
    await this.getUsers()
    await this.getSessions()
  },
  methods: {
     async addNewUser () {
      try {
        let user = this.new
        let resp = await API.addUser(user.role, user.email, user.password)
        if (resp) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: 'Physiotherapist created: ' + user.email,
          })
        }
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
    async addNewPatient (newPatient) {
      try {
        const { fullName, dateOfBirth, height, weight, injuries, physiotherapistEmail } = newPatient
        let resp = await API.addPatient(fullName, dateOfBirth, height, weight, injuries, physiotherapistEmail)
        if (resp) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: 'Patient created for ' + physiotherapistEmail,
          })
        }
      } catch (e) {
        let errorMsg = e
        if (e.status === 404 || e.status === 400) errorMsg = e.response.data
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Patient registration failed: ' + errorMsg,
          icon: 'report_problem'
        })
      }
      await this.getUsers()
    },
    async getUsers () {
      try {
        let users = await API.getUsers()
        let patients = await API.getPatients()
        this.users = { therapists: users, patients: patients }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Error retrieving users table: ${err}`,
          icon: 'warning'
        })
      }
    },
    async getSessions () {
      try {
        let sessions = await API.getSessions()
        this.sessions = sessions
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Error retrieving sessions table: ${err}`,
          icon: 'warning'
        })
      }
    }
  }
}
</script>


<style scoped>
.userList {
  max-width: 350px;
  margin: 0 auto;
}
</style>