<template>
  <router-view />
</template>

<script>
import storage from './utils/userStorage.js';
import axios from 'axios';

export default {
  name: 'App',
  created () {
    console.debug(`[Quasar app: ${this.$q.version}]`)
    if (!storage.info().loggedIn) {
      return this.$router.push('login')
    }

    // Add a 401 response interceptor
    axios.interceptors.response.use((response) => {
      return response
    }, (err) => {
      console.log(this.$router.currentRoute)
      if (err.response.status === 401 && this.$router.currentRoute.value.href !== '/login') {
        storage.logout()
        console.log('test')
        this.$router.push('login')
      }
      return Promise.reject(err)
    })
  }
}
</script>
