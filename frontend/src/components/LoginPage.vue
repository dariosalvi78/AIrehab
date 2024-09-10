<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-form ref="loginForm">
          <q-card class="q-pa-sm">
            <q-card-section>
              <div class="text-h4">Physiotherapist Sign-in</div>
            </q-card-section>
            <q-card-section>
              <form autocomplete="on">
                <q-input v-model.trim="email" type="email" label="Email" placeholder="e.g. email@email.com"
                  autocomplete="on" />
                <q-input v-model.trim="password" type="password" label="Password" autocomplete="on"
                  @keyup.enter="login()"/>
              </form>
            </q-card-section>
            <q-card-actions class="flex flex-center">
              <q-btn size="lg" label="login" color="primary" @click="login()" />
            </q-card-actions>
          </q-card>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API.js'
import storage from '../utils/userStorage.js'
import router from '../router/routeHandler.js'

export default {
  name: 'LoginPage',
  data () {
    return {
        // TODO: add email form validation
        email: undefined,
        password: undefined
    }
  },
  methods: {
    async login () {
      try {
        const data = await API.login(this.email.toLowerCase(), this.password)
        console.log('user:', data)
        if (data.user) {
          storage.login(data)
          this.$emit('handleStatus', true)
          if (data.user.role == 'admin') this.$router.push('admin')
          else if (data.user.role == 'physiotherapist') this.$router.push('physiotherapist')
          // else if (data.user.role == 'patient') this.$router.push('patient')
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: 'Login failed: ' + err.message,
          icon: 'report_problem'
        })
      }
    },

    // TODO: add user sign-up and reset pwd
    newUser () { },
    resetPassword () { }
  }
}
</script>


<style scoped>

</style>