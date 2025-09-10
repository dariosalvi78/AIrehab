<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-form class="resetForm">
          <q-card flat class="q-pa-sm">
            <q-card-section>
              <div class="text-h4">POE Assessment</div>
              <div class="text-h5">{{ $t('common.password_reset.title') }}</div>
            </q-card-section>
            <q-card-section>
              <form autocomplete="on">
                <q-input
                  class="q-my-md"            
                  v-model="this.email"
                  :label="$t('common.email')"
                  type="email"
                  readonly
                />
                <q-input 
                  ref="qPass"
                  class="q-my-md"
                  v-model.trim="password"
                  type="password"
                  :label="$t('common.password')"
                  :hint="`${$t('common.password_reset.password_hint')} ${password ? getPwdFeedback: ''}`"
                  :rules="[ 
                    (pwd) => !!pwd || $t('common.password_reset.password_hint'),
                    (pwd) => !getPwdStrength || getPwdStrength
                  ]"
                />
                  <q-input 
                  ref="qConfirmPass"
                  class="q-my-md"
                  v-model.trim="passwordConfirm"
                  type="password"
                  :label="$t('common.password_reset.password_confirm')"
                  :hint="$t('common.password_reset.password_confirm_hint')"
                  :rules="[(pwd) => pwd === this.password || $t('common.password_reset.password_confirm_error')]"
                />
              </form>
            </q-card-section>
            <q-card-actions class="flex flex-center">
              <q-btn size="md" :label="$t('common.password_reset.reset')" color="primary" @click="resetPassword()" />
              <q-btn outline size="md" :label="$t('common.password_reset.go_back')" color="secondary" @click="$router.push('login')" />
            </q-card-actions>
          </q-card>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import API from '../API.js'
import nicers from '../utils/nicers.js'
import pwd from '../utils/passwordValidation.js'

export default {
  name: 'PasswordResetPage',
  data () {
    return {
        email: undefined,
        password: undefined,
        passwordConfirm: undefined,
        token: undefined
    }
  },
  computed: {
      getPwdStrength () {
        return pwd.checkPwdStrength(this.password)
      },
      getPwdFeedback () {
        return pwd.getPwdFeedback(this.password)
      }
  },
  beforeCreate () {
    if (!Object.keys(this.$route.query).length) return this.$router.push('login')
  },
  mounted () {
    this.resetForm()
    this.email = this.$route.query.email
    this.token = this.$route.query.token
  },
  methods: { 
    async resetPassword () {
      this.$refs.qPass.validate()
      this.$refs.qConfirmPass.validate()
      if (this.$refs.qPass.hasError || this.$refs.qConfirmPass.hasError) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Please review fields and try again',
          icon: 'report_problem'
        })
      }
      try {
        this.$q.loading.show()
        await API.passwordReset(this.password, this.token)
        await nicers.delay(200)
        this.$q.notify({
          type: 'positive',
          color: 'positive',
          position: 'top',
          message: 'Your password has been updated',
        })
        this.$router.push('login')
      } catch (err) {
        let errMsg = err
        if (err.response.status == 400) errMsg = err.response.data
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Cannot reset password: ' + errMsg,
          icon: 'report_problem'
        })
      }
      this.$q.loading.hide()
      return
    },
    resetForm () {
      this.email = undefined
      this.password = undefined
      this.passwordConfirm = undefined
    }
  }
}
</script>


<style scoped>
.resetForm {
  width: 80%;
  max-width: 500px;
}
</style>