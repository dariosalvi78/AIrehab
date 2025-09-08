<template>
  <q-list bordered class="rounded-borders q-ma-sm">
    <q-expansion-item expand-separator label="Exercise instructions" icon="accessibility">
      <q-card>
        <q-card-section>
          <q-btn label="Watch exercise demonstration" @click="openExerciseTestVideo" icon-right="open_in_new" no-caps :ripple="false" flat class="q-pl-none"/>
          <q-select
            v-model="locale"
            :options="[
              { value: 'en', label: 'English' },
              { value: 'sv-SE', label: 'Svenska' }
            ]"
            label="Language"
            emit-value
            map-options
          />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <span v-html="$t('exercises.instructions')" />
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
    name: 'ExerciseInstructions',
    data () {
      return {
        locale: undefined
      }
    },
    mounted () {
      this.locale = this.getLocale()
    },
    methods: {
      async openExerciseTestVideo () {
        let video = ''
        if (!process.env.DEV) video = await import('../../../public/exercise_test_demonstration.mp4')
        return this.$q.dialog({
          title: 'Exercise demonstration',
          message: `
            <video ref="output" class="full-width" controls autoplay playsinline webkit-playsinline>
              <source src="${video.default}" type="video/mp4">
              Your browser does not support HTML5 video.
            </video>
          `,
          html: true
        })
      },
      getLocale () {
        return useI18n({ useScope: 'global' }).locale
      }
    }
}
</script>

<style scoped>

</style>