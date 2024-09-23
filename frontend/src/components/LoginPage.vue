<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-form ref="loginForm" class="loginForm">
          <q-card flat class="q-pa-sm">
            <q-card-section>
              <div class="text-h4">AI Rehab Sign-in</div>
            </q-card-section>
            <q-card-section>
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
              <!-- <div class="flex row justify-end">
                <q-btn class="q-pr-none" flat size="sm" label="Forgot password" @click="resetPassword()" />
              </div> -->
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

export default {
  name: 'LoginPage',
  data () {
    return {
        // TODO: add email form validation
        email: undefined,
        password: undefined,
        showPassword: false
    }
  },
  methods: {
    async login () {
      try {
        const data = await API.login(this.email.toLowerCase(), this.password)
        console.log('user:', data)
        if (data.user) {
          if (data.user.role == 'admin') this.$router.push('admin')
          else if (data.user.role == 'physiotherapist') this.$router.push('physiotherapist')
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
.loginForm {
  width: 80%;
  max-width: 500px;
}
</style>