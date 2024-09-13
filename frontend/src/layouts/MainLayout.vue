<template>
  <q-layout view="lHh Lpr lFf" class="mainLayout m-width">
     <q-header v-show="loggedInStatus" elevated class="header m-width shadow-2 rounded-borders">
        <q-toolbar>
          <q-btn flat round dense icon="menu" />
          <q-toolbar-title>Dashboard</q-toolbar-title>
          <q-btn flat dense icon="logout" label="Logout" @click="logout()"/>
        </q-toolbar>
      </q-header>
    <router-view @handle-status="handleStatus" />
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
  props: ['loggedInStatus'],
  data () {
    return {
      appVersion: JSON.parse(process.env.APP_VERSION)
    }
  },
  methods: {
    async logout () {
      storage.logout()
      this.handleStatus(false)
      await API.logout()
      this.$router.push('login')
    },
    handleStatus(status) { 
      this.$emit('handleStatus', status)
    }
  }
}
</script>

<style scoped>
.m-width {
  max-width: 800px;
  width: 95%;
  margin: 0 auto;
}
.mainLayout {
  background-color: #fff;
}
.header {
  margin: 1em auto 1em auto;
  position: sticky;
  position: -webkit-sticky;
}
</style>
