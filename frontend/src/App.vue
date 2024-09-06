<template>
  <router-view />
</template>

<script>
import storage from './utils/userStorage.js';
import routes from '../src/router/routeHandler.js'

export default {
  name: 'App',
  created () {
    console.debug(`[Quasar app: ${this.$q.version}]`)
    routes.init(storage.info())
  }
}
</script>
