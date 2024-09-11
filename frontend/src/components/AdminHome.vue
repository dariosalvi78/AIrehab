<template>
  <q-layout>
    <q-card-actions class="flex flex-center">
      <q-btn padding="md" color="secondary" @click="() => { this.newUserPrompt = !this.newUserPrompt }">
        <q-icon left name="group_add"/>
        <div>Add new Physiotherapist</div>
      </q-btn>
    </q-card-actions>

    <q-dialog v-model="newUserPrompt" persistent>
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