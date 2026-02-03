<template>
  <q-layout>
    <div class="q-pb-xl q-px-none flex flex-center">
      <q-btn-group class="full-width" spread>
        <q-btn padding="md" no-caps color="secondary" 
          @click="() => { newUserPrompt = !newUserPrompt }">
          <q-icon left name="person" />
          <div>{{ $t('admin.actions.new_user') }}</div>
        </q-btn>
        <q-btn padding="md" no-caps color="accent"
          @click="() => { newPatientPrompt = !newPatientPrompt }">
          <q-icon left name="group_add" />
          <div>{{ $t('admin.actions.new_patient') }}</div>
        </q-btn>
        <q-btn padding="md" no-caps color="grey"
          @click="downloadLatestSurveyData">
          <q-icon left name="download" />
          <div>{{ $t('admin.actions.download_data') }}</div>
        </q-btn>
      </q-btn-group>
    </div>
    <patient-edit-form :user="{}" formMode="adminNew" v-model="newPatientPrompt" @addNewPatient="addNewPatient" />
    <new-user-form role="physiotherapist" v-model="newUserPrompt" @newUser="addNewUser" />
    <admin-user-table :users="users" @getUsers="getUsers()" @addPatient="addNewPatient" />
    <admin-sessions-table :sessions="sessions" @getSessions="getSessions()" />
    <admin-exercises-table :exercises="exercises" @getExercises="getExercises()" />
  </q-layout>
</template>

<script>
import nicers from 'src/utils/nicers.js'
import API from '../../API.js'
import NewUserForm from './NewUserForm.vue'
import PatientEditForm from '../patients/PatientEditForm.vue'
import AdminExercisesTable from './AdminExercisesTable.vue'
import AdminSessionsTable from './AdminSessionsTable.vue'
import AdminUserTable from './AdminUserTable.vue'

export default {
  components: { AdminUserTable, AdminSessionsTable, PatientEditForm, NewUserForm, AdminExercisesTable },
  name: 'AdminHome',
  data () {
    return {
      users: [],
      sessions: [],
      exercises: [],
      newUserPrompt: false,
      newPatientPrompt: false
    }
  },
  async created () {
    this.newUserPrompt = false
    await this.getUsers()
    await this.getSessions()
    await this.getExercises()
  },
  methods: {
    async addNewUser (newUser) {
      const createdNotify = this.$q.notify({
        group: false,
        color: 'secondary',
        position: 'top',
        message: 'Sending email, please wait',
        spinner: true
      })
      try {
        let user = newUser
        let resp = await API.addUser(user.role, user.email, user.password)
        if (resp) {
          createdNotify({
            type: 'positive',
            color: 'positive',
            message: 'Test leader created: ' + resp.data.newUser.email,
            spinner: false
          })
        }
      } catch (e) {
        let errorMsg = e.status === 409 ? e.response.data : e
        return createdNotify({
          color: 'negative',
          position: 'top',
          message: 'User registration failed: ' + errorMsg,
          icon: 'report_problem',
          spinner: false
        })
      }
      await this.getUsers()
    },
    async addNewPatient (newPatient) {
      try {
        const { fullName, dateOfBirth, height, weight, injuries, injuredSide, injuredBodyPart, physiotherapistEmail } = newPatient
        let resp = await API.addPatient(fullName, dateOfBirth, height, weight, { description: injuries, side: injuredSide, bodyPart: injuredBodyPart }, physiotherapistEmail)
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
    },
    async getExercises () {
      try {
        let exercises = await API.getExercises()
        this.exercises = exercises
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Error retrieving exercises table: ${err}`,
          icon: 'warning'
        })
      }
    },
    async downloadLatestSurveyData () {
      try {
        this.$q.loading.show()
        await nicers.delay(500)
        let response = await API.downloadSurveyData()
        if (response) {
          let file = new Blob([response.data], { type: 'application/zip' }),
            filename = response.headers['content-disposition'].split('filename=')[1]
          let url = URL.createObjectURL(file)
          let a = document.createElement('a')
          a.style = 'display: none'
          a.href = url
          a.download = filename
          a.click()
          URL.revokeObjectURL(url)
        }
      } catch (err) {
        let errMsg = err.response && err.response.status === 404 ? 'No survey data available' : err.message
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `${errMsg}`,
          icon: 'warning'
        })
      }
      this.$q.loading.hide()
      return
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