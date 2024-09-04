<template>
  <q-layout view="lHh Lpr lFf" class="m-width mainLayout">
    <q-page-container class="q-main-container">
      <router-view />
    </q-page-container>
    <q-footer elevated class="m-width bg-grey-8 text-white flex flex-center">
      <div>App v. {{appVersion}}</div>
    </q-footer>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
      appVersion: JSON.parse(process.env.APP_VERSION)
    }
  },
  mounted () { }
}
</script>

<style scoped>
.m-width {
  max-width: 800px;
  margin: 0 auto;
}
.mainLayout {
  background-color: #f4f4f4;
}
.q-main-container {
  padding: 0px !important;
}
</style>
