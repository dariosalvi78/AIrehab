<template>
  <router-view v-slot="{ MainLayout }">
    <main-layout :is="MainLayout" :loggedInStatus="isloggedIn" @handle-status="handleStatus" />
  </router-view>
</template>

<script>
import storage from './utils/userStorage.js';
import axios from 'axios';
import API from './API.js';
import MainLayout from './layouts/MainLayout.vue';

export default {
  components: { MainLayout },
  name: 'App',
  data () {
    return {
      isloggedIn: false
    }
  },
  beforeMount () {
    console.debug(`[Quasar app: ${this.$q.version}]`)

    this.isloggedIn = storage.info().loggedIn
    if (!storage.info().loggedIn) {
      return this.$router.push('login')
    }

    axios.interceptors.response.use((response) => {
      return response
    }, (err) => {
      if (err.response.status === 401) {
        storage.logout()
        this.isloggedIn = storage.info().loggedIn
        this.$router.push('login')
        this.$q.notify({
          color: 'secondary',
          position: 'top',
          message: 'Session expired, please log in again',
          icon: 'info'
        })
      }
      return Promise.reject(err)
    })
  },
  methods: {
    handleStatus (status) {
      this.isloggedIn = status
    }
  }
}
</script>
