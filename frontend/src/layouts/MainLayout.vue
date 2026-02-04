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
              <q-item v-if="user.role !== 'admin'" clickable to="/home/consent" exact>
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
        <q-chip outline square size="12px" class="q-mr-none text-white">
          {{user.email}}
        </q-chip>
        <q-space />
        <q-btn flat dense icon="logout" :label="$t('common.logout')" no-caps @click="logout()" />
      </q-toolbar>
    </q-header>
    <router-view :user="this.user" />
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
      user: undefined
    }
  },
  async beforeMount () {
    this.user = await this.getLoggedInUser()
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
