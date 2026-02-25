<template>
  <q-layout>
    <q-page-container>
      <q-btn v-if="installPrompt" color="primary" class="q-ma-md" :label="$t('common.add_to_homescreen')" no-caps @click="showInstallPrompt"/>
      <q-page class="flex flex-center">
        <q-form ref="loginForm" class="loginForm">
          <q-card flat class="q-py-sm">
            <q-card-section class="q-px-sm text-center">
              <q-avatar size="250px" square style="height:150px;" class="q-mb-xl">
                <q-img src="logos/POE_logo_noframe.png"/>
              </q-avatar>
              <div class="text-h4 text-left text-weight-light">{{ $t('common.signin.header') }}</div>
              <div class="text-body2 q-mt-sm text-left text-grey-8">{{ $t('common.signin.subtitle') }}</div>
            </q-card-section>
            <q-card-section class="q-px-sm">
              <form autocomplete="on">
                <q-input
                  class="q-my-md text-body1"
                  v-model.trim="email"
                  type="email"
                  :label="$t('common.email')"
                  placeholder="e.g. user@email.com"
                  autocomplete="on"
                >
                  <template v-slot:before>
                    <q-icon name="person" />
                  </template>
                </q-input>
                <q-input 
                  class="q-my-md text-body1"
                  v-model.trim="password"
                  :type="(!showPassword) ? 'password' : 'text'"
                  :label="$t('common.password')"
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
                <div class="text-subtitle2 q-pr-none cursor-pointer" @click="resetPassword()">{{ $t('common.forgot_password') }}</div>
              </div>
              </form>
            </q-card-section>
            <q-card-actions class="flex flex-center q-py-none q-mt-lg">
              <q-btn class="full-width" rounded size="16px" :label="$t('common.login')" color="primary" @click="login()" no-caps />
            </q-card-actions>
          </q-card>
        </q-form>
      </q-page>
    </q-page-container>
    <q-footer class="bg-white text-black">
      <div class="flex justify-evenly q-pa-sm">
        <q-btn flat dense no-caps :label="$t('common.header.about')" @click="$router.push('/about')" />
      </div>
    </q-footer>
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
      showPassword: false,
      installPrompt: null
    }
  },
  methods: {
    async login () {
      try {
        const data = await API.login(this.email.toLowerCase(), this.password)
        if (data.user) {
          store.setItem('isLoggedIn', true)
          if (data.user.role == 'admin') this.$router.push('admin')
          else if (data.user.role == 'physiotherapist') this.$router.push('home')
        }
      } catch (err) {
        let errMsg = err
        err.response.status === 400 ? errMsg = this.$t('common.notification.login_missing')
          : err.response.status === 404 ? errMsg = this.$t('common.notification.login_wrong') : ''
        this.$q.notify({
          color: 'negative',
          message: this.$t('common.notification.login_error', { error: errMsg }),
          icon: 'report_problem'
        })
      }
    },
    async resetPassword () {
      try {
      if (!this.email) {
        return this.$q.notify({
          color: 'negative',
          message: this.$t('common.notification.password_reset_email'),
          icon: 'report_problem'
        })
      } 
      this.$q.dialog({
        color: 'primary',
        title: this.$i18n.t('common.password_reset.title'),
        message: this.$i18n.t('common.password_reset.desc', { email: this.email }),
        ok: { color: 'primary', label: this.$i18n.t('common.send') },
        cancel: { flat: true, label: this.$i18n.t('common.cancel') },
        persistent: true,
        html: true
      }).onOk(async () => {
        await API.sendPasswordResetEmail(this.email.toLowerCase())
        return this.$q.notify({
          color: 'secondary',
          message: this.$t('common.notification.password_reset_sent'),
          icon: 'info'
        })   
      })
      } catch (err) {
        return
      }
    },
    async showInstallPrompt () {
      if (this.installPrompt) return this.installPrompt.prompt()
    }
  },
  async created () {
    let template = await import('../../manifest.json')
    let content = JSON.stringify(template.default)
    const blob = new Blob([content], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    document.querySelector('#manifest').setAttribute('href', manifestURL)

    let element = document.createElement('link')
    element.setAttribute('rel', 'manifest')
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + content)
    window.addEventListener('beforeinstallprompt', async (e) => {
      e.preventDefault();
      this.installPrompt = e;
    })
    window.addEventListener("appinstalled", () => this.installPrompt = null )
  }
}
</script>


<style scoped>
.loginForm {
  width: 90%;
  max-width: 500px;
  display: flex;
  height: 100%;
  align-self: flex-start;
  flex-direction: column;
}
</style>