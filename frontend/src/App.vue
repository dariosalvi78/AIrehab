<template>
  <router-view />
</template>

<script>
import API, { axios } from './API.js';
import MainLayout from './layouts/MainLayout.vue';
import store from './utils/storage.js';

export default {
  components: { MainLayout },
  name: 'App',
  data () {
    return { }
  },
  beforeMount () {
    console.debug(`[Quasar app: ${this.$q.version}]`)

    if (
      !store.getItem('isLoggedIn') 
      && !window.location.href.includes('resetpassword') 
      && !window.location.href.includes('patient')
    ) {
      this.$router.push('login')
    }

    if (store.getItem('locale')) {
      const newLocale = store.getItem('locale')
      this.$i18n.locale = newLocale
    }

    axios.interceptors.response.use((response) => {
      return response
    }, async (err) => {
      if (err.response.status === 401 && !err.config.url.includes('login')) {
        await API.logout()
        store.removeItem('isLoggedIn')
        this.$router.push('/login')
        this.$q.notify({
          color: 'secondary',
          position: 'top',
          message: 'Session expired, please log in again',
          icon: 'info'
        })
      }
      return Promise.reject(err)
    })
  }
}
</script>
