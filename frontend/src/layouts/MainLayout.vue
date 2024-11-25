<template>
  <q-layout v-if="isLoggedIn" view="lHh Lpr lFf" class="mainLayout m-width">
    <q-header elevated class="header m-width shadow-2">
      <q-toolbar>
        <q-btn flat round dense icon="menu">
          <q-menu>
            <q-list dense style="min-width: 100px">
              <q-item>
                <q-item-section>
                  <div class="text-subtitle2">POE App v. {{appVersion}}</div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="text-subtitle2">Login: {{formatloginTimestamp}}</div>
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
        <q-chip outline square size="12px" class="q-mr-none text-white">
          {{user.email}}
        </q-chip>
        <q-space />
        <q-btn flat dense icon="logout" label="Logout" @click="logout()"/>
      </q-toolbar>
    </q-header>
    <router-view />
  </q-layout>
  <div v-else class="q-ma-md flex flex-center">
    <q-spinner-dots
      color="primary"
      size="3em"
    />
  </div>
</template>

<script>
import API from '../API'
import nicers from '../utils/nicers';
import store from '../utils/storage.js';

export default {
  name: 'MainLayout',
  data () {
    return {
      appVersion: JSON.parse(process.env.APP_VERSION),
      user: undefined
    }
  },
  async beforeMount () {
    this.user = await this.getLoggedInUser()
  },
  methods: {
    async logout () {
      await API.logout()
      store.removeLoginStatus()
      this.$router.push('/login')
    },
    async getLoggedInUser () {
      try {
        let user = await API.getInfo()
        return user 
      } catch (err) {
        this.user = undefined
        console.info('Could not retrieve logged in user: ', err.response.statusText)
        await this.logout()
      }
    }
  },
  computed: {
    isLoggedIn () {
      if (this.user) return this.$route.path !== '/login' && this.user.email
    },
    formatloginTimestamp () {
      return nicers.formattedDayOfMonth(this.user.lastLoginTimestamp)
    }
  }
}
</script>

<style scoped>
.mainLayout {
  background-color: #fff;
}
.header {
  margin: auto auto 1em auto;
  position: sticky;
  position: -webkit-sticky;
}
</style>
