<template>
  <q-btn 
    class="q-my-none q-pa-none" 
    size="md" 
    icon="chevron_left"
    flat no-caps 
    @click="action"
  >
    {{ $t('common.go_back') }}
  </q-btn>
</template>

<script>
export default {
  name: 'BackButton',
  emits: ['back:action'],
  methods: {
    action () {
      return this.$emit('back:action')
    }
  }
}
</script>

<style scoped></style>