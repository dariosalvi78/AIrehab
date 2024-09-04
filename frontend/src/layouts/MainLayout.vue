<template>
  <q-layout view="lHh Lpr lFf" class="mainLayout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
    }
  },
}
</script>

<style scoped>
.mainLayout {
  max-width: 800px;
  background-color: #f2f2f2;
  margin: 0 auto;
}
</style>
