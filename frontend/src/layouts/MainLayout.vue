<template>
  <q-layout view="lHh Lpr lFf" class="mainLayout m-width">
    <q-header v-show="isLoggedIn" elevated class="header m-width shadow-2 rounded-borders">
      <q-toolbar>
        <q-btn flat round dense icon="menu">
          <q-menu>
            <q-list dense style="min-width: 100px">
              <q-item clickable>
                <q-item-section>POE App v. {{appVersion}}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-toolbar-title>Dashboard</q-toolbar-title>
        <q-btn flat dense icon="logout" label="Logout" @click="logout()"/>
      </q-toolbar>
    </q-header>
    <router-view />
  </q-layout>
</template>

<script>
import API from '../API'
import store from '../utils/storage.js';

export default {
  name: 'MainLayout',
  data () {
    return {
      appVersion: JSON.parse(process.env.APP_VERSION)
    }
  },
  methods: {
    async logout () {
      await API.logout()
      store.removeLoginStatus()
      this.$router.push('login')
    },
  },
  computed: {
    isLoggedIn () {
      return this.$route.path !== '/login' && store.getLoginStatus()
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
