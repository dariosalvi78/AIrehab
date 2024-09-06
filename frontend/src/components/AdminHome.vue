<template>
  <q-layout>
    <q-card-actions class="flex flex-center">
      <q-btn size="md" label="Add new User" color="primary" @click="() => { this.newUserPrompt = !this.newUserPrompt }" />
    </q-card-actions>

    <q-dialog v-model="newUserPrompt" persistent>
      <q-card class="q-pl-mx" style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">New User</div>
        </q-card-section>
        <q-form class="q-pt-lg">
          <q-input
            filled
            v-model="this.new.email"
            label="Email"
            hint="e.g. user@email.com"
          />
          <q-option-group
            :options="optionsRadio"
            type="radio"
            v-model="this.new.role"
          />
        </q-form>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Submit" type="submit" color="primary" v-close-popup class="q-ml-sm" @click="addNewUser()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <admin-user-table :users="this.users"/>
  </q-layout>
</template>

<script>
import API from '../API.js'
import routes from '../router/routeHandler.js'
import storage from '../utils/userStorage.js'
import AdminUserTable from './AdminUserTable.vue'

export default {
  components: { AdminUserTable },
  name: 'AdminHome',
  data () {
    return {
      users: [],
      newUserPrompt: false,
      new: {
        role: undefined,
        email: undefined,
        password: 'password' // change this once we have sign-up with email
      },
      optionsRadio: [
        { label: 'Physiotherapist', value: 'physiotherapist' },
        { label: 'Patient', value: 'patient' },
      ]
    }
  },
  async created () {
    this.newUserPrompt = false
    await this.getUsers()
  },
  methods: {
     async addNewUser () {
      try {
        let user = this.new
        let resp = await API.addUser(user.role, user.email, user.password)
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
      let res = await API.getUsers()
      this.users = res
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