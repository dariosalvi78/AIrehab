<template>
  <div class="q-pa-md fixed-center q-gutter-y-lg">
    <div class="text-h3 text-weight-light">{{ $t('common.not_found.header') }}</div>
    <div class="text-h6 text-weight-light text-left" style="min-width: 300px; opacity:0.6" v-html="$t('common.not_found.description')" />
    <back-button 
      @back:action="$router.push('home')" 
      style="font-size: large;"
      class="q-mt-xl" 
    />
  </div>
</template>

<script setup>
import BackButton from './reusables/BackButton.vue';

defineOptions({
  name: 'ErrorNotFound',
  components: { BackButton }
});
</script>
