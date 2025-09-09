<template>
  <div class="poe-assessment-results">
    <q-tabs
      v-model="panel"
      dense
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="results" :label="$t('poe.evaluation')" icon="accessibility" no-caps />
      <q-tab name="stats" :label="$t('poe.see_results')" icon="more_horiz" no-caps />
    </q-tabs>
    <q-tab-panels v-model="panel" animated ref="panelForm">
      <q-tab-panel name="results" class="">
        <div class="text-h6 q-mt-md">{{ $t('poe.results.title') }}</div>
        <div class="text-body2 q-mb-xl">{{ $t('poe.results.description') }}</div>
        <div class="poe-score full-width">
          <q-item class="q-pa-none">
            <q-item-section avatar class="row" >
              <q-icon class="q-mb-md material-symbols-outlined" :color="overallScore.theme" size="52px" :name="getProgressIcon" />
            </q-item-section>
            <q-item-section>
              <q-slider v-model="progressResults" rounded readonly label-always :label-value="progressResults + ` (${$t(`poe.scores.${overallScore.text}`) })`"
                :min="0" :max="assessmentResults.maxScore" track-size="12px" track-color="grey-1" :color="overallScore.theme" class="q-my-sm"
              />
              <div class="poe-indicator row justify-between">
                <div class="score" :key="score" v-for="score in getPOEScores">
                  <q-chip
                    outline
                    :clickable="false" 
                    :ripple="false" 
                    size="md"
                    :class="`q-mb-md ${overallScore.theme == score.theme ? 'text-bold' : ''}`"
                    :text-color="score.theme">
                    {{ $t(`poe.scores.${score.text}`) }}
                  </q-chip>
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-card flat class="q-my-md full-height q-mb-xl">
            <q-card-section class="q-pa-none">
              <div class="poe-figure">
                <q-avatar square class="full-width full-height">
                  <q-img src="/exercise_poe.png" :ratio="9/16">
                    <q-icon @click="handleTPChange(poe.posturalOrientation)" :class="`poe-item-info all-pointer-events ${poe.posturalOrientation}`"
                      :key="poe.posturalOrientation" v-for="poe in assessmentResults" :color="getPOEScoreToTheme(poe.score)" name="info"
                    >
                      <q-tooltip :ref="`tp_${poe.posturalOrientation}`" max-width="300px" class="text-center bg-white text-black text-subtitle2 shadow-5">
                        {{ $t(`poe.${poe.posturalOrientation}`) }} 
                        <span :class="`text-${getPOEScoreToTheme(poe.score)}`">
                          ({{ $t(`poe.scores.${poe.scoreToText}`)  }})
                        </span>
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
              {{ $t(`poe.${poe.posturalOrientation}`) }} 
            </q-item-section>
            <q-item-section side>
              <q-chip
                outline
                :clickable="false" 
                :ripple="false" 
                :text-color="getPOEScoreToTheme(poe.score)">
                {{ $t(`poe.scores.${poe.scoreToText}`) }}
              </q-chip>
            </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <div class="text-subtitle2">{{ $t('poe.evaluation') }}</div>
                <div class="text-body2 q-mb-sm">{{ $t('poe.results.highest_confidence') }}: <b>{{ $t(`poe.scores.${poe.scoreToText}`) }}</b></div>
                <div class="text-body2">{{ $t('poe.results.predicted_confidence') }}: <b>{{ poe.highestPredictedConfidence }} %</b></div>
                <q-list dense class="rounded-borders">
                  <q-expansion-item
                    class="q-pt-sm q-pr-lg text-subtitle2"
                    :label="$t('poe.score')"
                    :caption="$t('poe.results.see_all')"
                    header-style="padding:0;"
                  >
                    <q-item-section class="q-mx-md q-pa-none">
                      <div class="q-py-sm" v-for="confidence in poe.confidences" :key="confidence">
                        <q-item-label caption><b>{{ $t(`poe.scores.${confidence.text}`) }}</b> · {{ confidence.score }} % {{ $t('poe.confidence') }}</q-item-label>
                      </div>
                    </q-item-section>
                  </q-expansion-item>
                </q-list>
              </q-card-section>
              <q-separator inset />
              <q-card-section>
                <div class="text-subtitle2">{{ $t('poe.postural_orientation') }}</div>
                <div class="text-body2">{{ $t(`poe.${poe.posturalOrientation}`) }}</div>
              </q-card-section>
              <q-separator inset />
              <q-card-section>
                <div class="text-subtitle2">{{ $t('poe.repetition') }}</div>
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
        return this.assessmentResults.sumOfScores
      },
      formatPosturalOrientation (posturalOrientation) {
        return poeTypesEnum.formattedPosturalOrientation(posturalOrientation)
      },
      handleTPChange (posturalOrientation) {
        return this.$refs[`tp_${posturalOrientation}`][0].show()
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
  .poe-figure {
    max-width: 300px;
    margin: 0 auto;
  }
  .poe-item-info {
    position: absolute;
    font-size: 32px;
  }
  .kneeMedialToFootPosition {
    top: 20rem;
    left: 142px;
  }
  .femurMedialToShank {
    top: 23rem;
    left: 140px;
  }
  .femoralValgus {
    top: 278px;
    left: 153px;
  }
  .trunk {
    top: 12rem;
    left: 140px;
  }
  .hip {
    top: 235px;
    left: 167px;
  }
</style>