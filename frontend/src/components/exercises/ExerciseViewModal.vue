<template>
  <q-page-container class="q-pa-lg">
    <q-page>
      <q-btn round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.go(-1)" />
      <q-card class="q-mx-auto q-pa-lg exercise-card">
        <q-card-section class="flex flex-center">
          <div class="text-h6">Start recording</div>
          <q-btn label="Open Camera" color="secondary" size="md" icon-right="camera" />
        </q-card-section>
      </q-card>
    </q-page>
  </q-page-container>
</template>

<script>
export default {
  name: 'ExerciseViewModal',
  props: {
    sessionID: String,
    exerciseID: String
  },
  data () {
    return { }
  },
  mounted () { },
  methods: { }
}
</script>

<style scoped>
.exercise-card {
  max-width: 350px;
}
</style>