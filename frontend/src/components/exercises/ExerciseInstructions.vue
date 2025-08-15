<template>
  <q-list bordered class="rounded-borders q-ma-sm">
    <q-expansion-item expand-separator label="Exercise instructions" icon="accessibility">
      <q-card>
        <q-card-section>
          <q-btn label="Watch exercise demonstration" @click="openExerciseTestVideo" icon-right="open_in_new" no-caps :ripple="false" flat class="q-pl-none"/>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle2">How to perform exercise:</div>
          Place something behind the person being tested, e.g., a box or bench, so that the knee is bent to about 60-70 degrees at the lowest position.
          <br>
          <br>
          Ask the person to place the foot straight (preferably on a longitudinal line), keep the other leg lifted, and let the arms hang by the sides. 
          <br>
          <br>
          <div class="text-subtitle2">Instruct the person the following:</div>
          Slowly bend your knee until your buttocks touches the bench/box without sitting down, then return to the starting position. One single-leg squat should take about 3 seconds. Repeat 5 times. 
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle2">Placement and recording</div>
          Record the participant from the front with a mobile phone/tablet in portrait mode, making sure the whole body is visible in the video. 
          <br>
          <br>
          Ideally, place the phone/tablet on a stable surface while recording. 
        </q-card-section>
        <q-separator />
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
          title: 'Exercise demonstration',
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