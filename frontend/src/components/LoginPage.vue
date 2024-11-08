<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-form ref="loginForm" class="loginForm">
          <q-card flat class="q-py-sm">
            <q-card-section class="q-px-sm">
              <div class="text-h4">POE Assessment</div>
              <div class="text-h5">Sign-in</div>
            </q-card-section>
            <q-card-section class="q-px-sm">
              <form autocomplete="on">
                <q-input
                  class="q-my-md"
                  v-model.trim="email"
                  type="email"
                  label="Email"
                  placeholder="e.g. email@email.com"
                  autocomplete="on"
                >
                  <template v-slot:before>
                    <q-icon name="person" />
                  </template>
                </q-input>
                <q-input 
                  class="q-my-md"
                  v-model.trim="password"
                  :type="(!showPassword) ? 'password' : 'text'"
                  label="Password"
                  autocomplete="on"
                  @keyup.enter="login()"
                >
                  <template v-slot:before>
                      <q-icon name="lock" />
                    </template>
                  <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
              <div class="flex row justify-end">
                <q-btn class="q-pr-none" flat size="sm" label="Forgot password" @click="resetPassword()" />
              </div>
              </form>
            </q-card-section>
            <q-card-actions class="flex flex-center q-py-none">
              <q-btn class="full-width" size="md" label="login" color="primary" @click="login()" />
            </q-card-actions>
          </q-card>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API.js'
import store from '../utils/storage.js';

export default {
  name: 'LoginPage',
  data () {
    return {
        email: "",
        password: "",
        showPassword: false
    }
  },
  methods: {
    async login () {
      try {
        const data = await API.login(this.email.toLowerCase(), this.password)
        if (data.user) {
          store.setLoginStatus(true)
          if (data.user.role == 'admin') this.$router.push('admin')
          else if (data.user.role == 'physiotherapist') this.$router.push('physiotherapist')
        }
      } catch (err) {
        let errMsg = err
        if (err.response.status === 400 || err.response.status === 404) errMsg = err.response.data
        this.$q.notify({
          color: 'negative',
          message: 'Login failed: ' + errMsg,
          icon: 'report_problem'
        })
      }
    },
    async resetPassword () {
      try {
      if (!this.email) {
        return this.$q.notify({
          color: 'negative',
          message: 'Please enter email address',
          icon: 'report_problem'
        })
      } 
      this.$q.dialog({
        color: 'primary',
        title: 'Password reset',
        message: `
          Password reset link will be sent to <b>${this.email}</b>.<br/> 
          Follow the instructions in the email.
        `,
        ok: { color: 'primary', label: 'Send' },
        persistent: true,
        cancel: true,
        html: true
      }).onOk(async () => {
        await API.sendPasswordResetEmail(this.email.toLowerCase())
        return this.$q.notify({
          color: 'secondary',
          message: 'Password reset link has been sent, check your inbox',
          icon: 'info'
        })   
      })
      } catch (err) {
        return
      }
    }
  }
}
</script>


<style scoped>
.loginForm {
  width: 90%;
  max-width: 500px;
}
</style>