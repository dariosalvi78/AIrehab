<template>
  <q-layout view="lHh Lpr lFf" class="mainLayout m-width">
     <q-header v-show="isLoggedIn" elevated class="m-width">
        <q-toolbar>
          <q-btn flat round dense icon="menu" />
          <q-toolbar-title>Dashboard</q-toolbar-title>
          <q-btn flat dense icon="logout" label="Logout" @click="logout()"/>
        </q-toolbar>
      </q-header>
    <q-page-container class="q-main-container">
      <router-view @handle-status="handleStatus" />
    </q-page-container>
    <q-footer elevated class="m-width primary text-white flex flex-center">
      <div>App v. {{appVersion}}</div>
    </q-footer>
  </q-layout>
</template>

<script>
import storage from '../utils/userStorage'
import API from '../API'

export default {
  name: 'MainLayout',
  data () {
    return {
      appVersion: JSON.parse(process.env.APP_VERSION),
      isLoggedIn: false
    }
  },
  mounted () { this.isLoggedIn = storage.info().loggedIn },
  methods: {
    async logout () {
      storage.logout()
      this.isLoggedIn = false
      await API.logout()
      this.$router.push('login')
    },
    handleStatus(status) { 
      console.log('status', status)
      this.isLoggedIn = status 
    }
  }
}
</script>

<style scoped>
.m-width {
  max-width: 800px;
  margin: 0 auto;
}
.mainLayout {
  background-color: #fff;
}
</style>
