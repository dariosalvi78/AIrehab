<template>
  <div class="poe-assessment-results q-pa-sm q-gutter-md">
    <q-list bordered class="rounded-borders" :key="poe.posturalOrientation" v-for="poe in assessmentResults">
      <q-expansion-item
        class="q-py-sm"
        expand-separator
      >
        <template v-slot:header>
        <q-item-section class="text-subtitle2">
          {{ poe.posturalOrientation }}
        </q-item-section>
        <q-item-section side>
          <q-chip
            outline
            :clickable="false" 
            :ripple="false" 
            :text-color="`${ 
              poe.score === 0 ? 'positive' 
              : poe.score === 1 ? 'warning' 
              : 'negative'
            }`" 
          >
            {{ poe.scoreToText }}
          </q-chip>
        </q-item-section>
        </template>
        <q-card>
          <q-card-section>
            <div class="text-subtitle2">Evaluation</div>
            <div class="text-body2 q-mb-sm">Highest confidence score: <b>{{ poe.scoreToText }}</b></div>
            <div class="text-body2">Predicted confidence in this score: <b>{{ poe.highestPredictedConfidence }} %</b></div>
            <q-list dense class="rounded-borders">
              <q-expansion-item
                class="q-pt-sm q-pr-lg text-subtitle2"
                label="Score"
                caption="See all scores for evaluation"
                header-style="padding:0;"
              >
                <q-item-section class="q-mx-md q-pa-none">
                  <div class="q-py-sm" v-for="confidence in poe.confidences" :key="confidence">
                    <q-item-label caption><b>{{confidence.text}}</b> · {{ confidence.score }} % confidence</q-item-label>
                  </div>
                </q-item-section>
              </q-expansion-item>
            </q-list>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle2">Postural orientation</div>
            <div class="text-body2">{{ poe.posturalOrientation }}</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle2">Repetition</div>
            <div class="text-body2">{{ poe.repetition }}</div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
export default {
    name: 'PoeViewModal',
    props: { assessmentResults: Object }
}
</script>

<style scoped>

</style>