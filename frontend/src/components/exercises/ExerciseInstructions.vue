<template>
  <q-list bordered class="rounded-borders q-ma-sm">
    <q-expansion-item expand-separator :label="$t('exercises.instructions.title')" icon="accessibility">
      <q-card>
        <q-card-section>
          <q-btn :label="$t('exercises.instructions.watch')" @click="openExerciseTestVideo" icon-right="open_in_new" no-caps :ripple="false" flat class="q-pl-none"/>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <span v-html="$t('exercises.instructions.content')" />
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script>
export default {
    name: 'ExerciseInstructions',
    methods: {
      async openExerciseTestVideo () {
        let video = ''
        if (!process.env.DEV) video = await import('../../../public/exercise_test_demonstration.mp4')
        return this.$q.dialog({
          title: this.$i18n.t('exercises.instructions.title'),
          message: `
            <video ref="output" class="full-width" controls autoplay playsinline webkit-playsinline>
              <source src="${video.default}" type="video/mp4">
              Your browser does not support HTML5 video.
            </video>
          `,
          html: true
        })
      }
    }
}
</script>

<style scoped>

</style>