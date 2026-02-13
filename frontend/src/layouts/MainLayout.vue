<template>
  <q-layout v-if="isLoggedIn" view="lHh Lpr lFf" class="mainLayout m-width">
    <q-header elevated class="header m-width shadow-2 layout-theme">
      <q-toolbar>
        <q-btn flat round dense icon="menu">
          <q-menu>
            <q-list dense style="min-width: 100px">
              <q-item>
                <q-item-section>
                  <div class="text-subtitle2">POE Assessment v. {{appVersion}}</div>
                </q-item-section>
              </q-item>
              <q-item v-if="this.user?.lastLoginTimestamp">
                <q-item-section>
                  <div class="text-subtitle2">Login: {{formatloginTimestamp}}</div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>{{ $t('common.header.language') }}</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
                <q-menu auto-close anchor="top end" self="top start">
                  <q-list>
                    <q-item v-for="lang in [
                        { value: 'en', label: '🇬🇧 English' },
                        { value: 'sv-SE', label: '🇸🇪 Svenska' }
                      ]" :key="lang" dense clickable>
                      <q-item-section @click="changeLocale(lang.value)"
                        :class="lang.value == $i18n.locale ? 'text-subtitle2' : ''">
                        {{ lang.label }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
              <q-item v-if="isTestleader" clickable to="/home/consent" exact>
                <q-item-section>{{ $t('common.header.consent') }}</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
              <q-item clickable to="/about" exact>
                <q-item-section>{{ $t('common.header.about') }}</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-chip outline square size="12px" class="q-mr-none layout-secondary">
          {{user.email}}
        </q-chip>
        <q-space />
        <q-btn flat dense icon="logout" :label="!onInvitationPage ? $t('common.logout') : $t('common.go_back')" no-caps @click="logout()" />
      </q-toolbar>
    </q-header>
    <router-view v-slot="{ Component }" :user="this.user" :currentTab="tab" @handle:swipe="setTabFromDirection" @update:tabs="setTabs">
      <transition appear enter-active-class="animated fadeIn">
        <component :is="Component"></component>
      </transition>
    </router-view>
    <q-footer v-if="isLoggedIn && isTestleader" bordered class="layout-theme m-width">
      <q-tabs v-model="tab" dense align="justify">
        <q-tab 
          v-for="tab in tabs" :key="tab" no-caps :name="tab.name" :label="`${this.$t(`common.tabs.${tab.name}`)} · ${tab.count}`" 
          :icon="tab.name == 'patients' ? 'group' : 'accessibility'" :class="tab.name == 'patients' ? 'text-primary' : 'text-secondary'"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
  <div v-else class="q-ma-md flex flex-center">
    <q-spinner-dots color="primary" size="3em" />
  </div>
</template>

<script>
import API from '../API'
import nicers from '../utils/nicers';
import store from '../utils/storage.js';
import { updateI18nLocale } from 'src/boot/i18n.js';

export default {
  name: 'MainLayout',
  data () {
    return {
      appVersion: JSON.parse(process.env.APP_VERSION),
      user: undefined,
      tab: undefined,
      tabs: {
        patients: { name: 'patients', count: 0 },
        sessions: { name: 'sessions', count: 0 }
      }
    }
  },
  async beforeMount () {
    await this.isOnInvitedPage()
    if (!this.user) this.user = await this.getLoggedInUser()

    if (this.isTestleader) {
      const data = this.user.count
      for (const d of Object.keys(data)) this.tabs[d].count = this.user.count[d]
      this.tab = this.updateTabs()
    }
  },
  methods: {
    async logout () {
      try {
        await API.logout()
        store.removeItem('isLoggedIn')
        this.$router.push('/login')        
      } catch (err) {
        console.info('Could not logout user: ', err.response.statusText)
      }
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
    },
    changeLocale (newLocale) {
      store.setItem('locale', newLocale)
      console.info('updated locale: ' + newLocale)
      nicers.updateLocale(newLocale)
      updateI18nLocale(newLocale)
    },
    async isOnInvitedPage () {
      if (!this.$route.path.includes('invitation')) return
      if (store.getItem('isLoggedIn')) this.$router.push('/home')

      let q = new URLSearchParams(window.location.search)
      const token = q.get('token'), email = q.get('email')
      this.user = { email, token }
      return
    },
    updateTabs () {
      if (this.$route.path !== '/home') return
      let found = Object.keys(this.tabs)[0], qTab = new URLSearchParams(window.location.search).get('view')
      for (const t of Object.keys(this.tabs)) {
        if (t == qTab) { found = qTab; break }
      }
      return found
    },
    setTabFromDirection (e) {
      if (!e.direction) return
      return e.direction == 'left'
        ? this.tab = 'sessions'
        : this.tab = 'patients'
    },
    setTabs (name, newCount) {
      newCount == 'add'
        ? this.tabs[name].count++
        : this.tabs[name].count = newCount
    }
  },
  computed: { 
    isLoggedIn () {
      if (this.user) return this.$route.path !== '/login' && this.user.email
    },
    formatloginTimestamp () {
      return nicers.formattedDayOfMonth(this.user.lastLoginTimestamp)
    },
    isTestleader () {
      if (!this.user) return
      return !this.$route.path.includes('invitation') && this.user.role !== 'admin'
    },
    onInvitationPage () { return this.$route.path.includes('invitation') }
  },
  watch: {
    tab (up) {
      if (up && !this.$route.query?.redirect) this.$router.push({ path: '/home', query: { view: up } })
    },
    $route (up) { this.tab = this.updateTabs() }
  }
}
</script>

<style scoped>
.mainLayout {
  background-color: #fff;
}
.header {
  position: sticky;
  position: -webkit-sticky;
}
</style>
