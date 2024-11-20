<template>
  <q-layout view="lHh Lpr lFf" class="mainLayout m-width">
    <q-header v-show="isLoggedIn" elevated class="header m-width shadow-2">
      <q-toolbar>
        <q-btn flat round dense icon="menu">
          <q-menu>
            <q-list dense style="min-width: 100px">
              <q-item>
                <q-item-section>
                  <div class="text-subtitle2">POE App v. {{appVersion}}</div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable to="/about" exact>
                <q-item-section>About</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
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
      this.$router.push('/login')
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
  width: 100%;
  margin: 0 auto;
}
.mainLayout {
  background-color: #fff;
}
.header {
  margin: auto auto 1em auto;
  position: sticky;
  position: -webkit-sticky;
}
</style>
