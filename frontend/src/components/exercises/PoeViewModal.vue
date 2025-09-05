<template>
  <div class="poe-assessment-results">
    <q-tabs
      v-model="panel"
      dense
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="results" label="Evaluation" icon="accessibility" no-caps />
      <q-tab name="stats" label="See results" icon="more_horiz" no-caps />
    </q-tabs>
    <q-tab-panels v-model="panel" animated ref="panelForm">
      <q-tab-panel name="results" class="">
        <div class="text-subtitle1 q-my-md">Your POE evaulation score</div>
        <div class="poe-score full-width">
          <q-item class="q-pa-none">
            <q-item-section avatar class="row" >
              <q-icon class="q-mb-md material-symbols-outlined" :color="overallScore.theme" size="52px" :name="getProgressIcon" />
            </q-item-section>
            <q-item-section>
              <q-linear-progress :value="progressResults" rounded track-color="grey-4" size="xl" :color="overallScore.theme" class="q-my-sm" />
              <div class="poe-indicator row justify-between">
                <div class="score" :key="score" v-for="score in getPOEScores">
                  <q-chip
                    outline
                    :clickable="false" 
                    :ripple="false" 
                    size="md"
                    :class="`q-mb-md ${overallScore.theme == score.theme ? 'text-bold' : ''}`"
                    :text-color="score.theme">
                    {{ score.text }}
                  </q-chip>
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-card flat class="q-my-md full-height q-mb-xl">
            <q-card-section class="q-pa-none">
              <div class="poe-figure">
                <q-avatar square class="full-width full-height">
                  <q-img src="/exercise_poe.png" >
                    <q-icon :class="`poe-item-info all-pointer-events ${poe.posturalOrientation}`" :key="poe.posturalOrientation" v-for="poe in assessmentResults" 
                      :color="getPOEScoreToTheme(poe.score)" name="info"
                    >
                      <q-tooltip class="text-subtitle2">
                        {{ formatPosturalOrientation(poe.posturalOrientation) }} ({{ poe.scoreToText }})
                      </q-tooltip>
                    </q-icon>
                  </q-img>
                </q-avatar>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>
      <q-tab-panel name="stats" class="q-px-none">
        <q-list bordered class="rounded-borders q-gutter-sm q-ma-sm" :key="poe.posturalOrientation" v-for="poe in assessmentResults">
          <q-expansion-item
            class="q-py-sm"
            expand-separator
          >
            <template v-slot:header>
            <q-item-section class="text-subtitle2">
              {{ formatPosturalOrientation(poe.posturalOrientation) }}
            </q-item-section>
            <q-item-section side>
              <q-chip
                outline
                :clickable="false" 
                :ripple="false" 
                :text-color="getPOEScoreToTheme(poe.score)">
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
                <div class="text-body2">{{ formatPosturalOrientation(poe.posturalOrientation) }}</div>
              </q-card-section>
              <q-separator inset />
              <q-card-section>
                <div class="text-subtitle2">Repetition</div>
                <div class="text-body2">{{ poe.repetition }}</div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import poeTypesEnum from '../../utils/types/poeTypesEnum'

export default {
    name: 'PoeViewModal',
    props: { assessmentResults: Object },
    data () {
      return {
        panel: 'results',
        progressResults: 0,
        overallScore: {}
      }
    },
    mounted () {
      this.$refs.panelForm.goTo('results')
      this.progressResults = this.getPOESumScoreBar()
      this.overallScore = poeTypesEnum.getPOEScoreBracket(this.assessmentResults.sumOfScores)
    },
    methods: {
      getPOEScoreToTheme(score) {
          let poes = Object.values(poeTypesEnum.scores)
          for (const poe in poes) {
            if (poes[poe].point === score) return poes[poe].theme
          }
      },
      getPOESumScoreBar() {
        return this.assessmentResults.sumOfScores / 100
      },
      formatPosturalOrientation (posturalOrientation) {
        return poeTypesEnum.formattedPosturalOrientation(posturalOrientation)
      } 
    },
    computed: {
      getPOEScores () {
        let scores = Object.values(poeTypesEnum.scores), results = []
        for (const score in scores) {
          results.push(scores[score])
        }
        return results
      },
      getProgressIcon () {
        return this.overallScore.point == 0 
          ? 'sentiment_satisfied'
            : this.overallScore.point == 1 
          ? 'sentiment_neutral'
          : 'sentiment_dissatisfied'
      }
    }
}
</script>

<style scoped>
  .poe-item-info {
    position: absolute;
    font-size: 32px;
  }
  .kneeMedialToFootPosition {
    top: 23rem;
    left: 177px;
  }
  .femurMedialToShank {
    top: 26rem;
    left: 175px;
  }
  .femoralValgus {
    top: 20rem;
    left: 188px;
  }
  .trunk {
    top: 14rem;
    left: 173px;
  }
  .hip {
    top: 265px;
    left: 210px;
  }
</style>