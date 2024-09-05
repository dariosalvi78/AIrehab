<template>
  <router-view />
</template>

<script>
import storage from './utils/userStorage.js';

export default {
  name: 'App',
  created () {
    console.debug(`[Quasar app: ${this.$q.version}]`)

    // Redirect to login page if no localstorage session
    if (!storage.info().loggedIn) {
      this.$router.push('login')
    }
  }
}
</script>
