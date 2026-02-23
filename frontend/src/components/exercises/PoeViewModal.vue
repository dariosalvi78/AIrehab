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
    <q-tab-panels v-model="panel" animated ref="panelForm" swipeable>
      <q-tab-panel name="results" class="">
        <div class="text-h6 q-mt-md text-weight-regular">{{ $t('poe.results.title') }}</div>
        <div class="text-subtitle1 q-mt-sm">{{ $t('poe.results.description') }}</div>
        <div class="poe-score full-width q-mt-xl">
          <q-item v-if="poe && poe.bracket" class="q-pa-none">
            <q-item-section avatar class="row" >
              <q-icon class="q-mb-md material-symbols-outlined" :color="poe.bracket.theme" size="52px" :name="getProgressIcon" />
            </q-item-section>
            <q-item-section>
              <q-slider v-model="poe.sumOfScores" rounded readonly label-always :label-value="poe.sumOfScores + ` (${$t(`poe.scores.${poe.bracket.text}`) })`"
                :min="0" :max="poe.maxScore" track-size="12px" track-color="grey-1" :color="poe.bracket.theme" class="q-my-sm"
              />
              <div class="poe-indicator row justify-between">
                <div class="score" :key="score" v-for="score in getPOEScores">
                  <q-chip
                    :color="score.theme"
                    text-color="white" :clickable="false" 
                    :ripple="false" size="md"
                    :class="`glossy q-mb-md ${poe.bracket.theme == score.theme ? 'text-bold' : ''}`"
                    :text-color="score.theme">
                    {{ $t(`poe.scores.${score.text}`) }}
                  </q-chip>
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-card flat class="q-mt-md full-height">
            <q-card-section class="q-pa-none">
              <div class="poe-figure">
                <q-avatar square class="full-width full-height">
                  <q-img src="/exercise_poe.png" :ratio="9/16">
                    <q-icon @click="handleTPChange(poe.posturalOrientation)" :class="`poe-item-info all-pointer-events ${poe.posturalOrientation}`"
                      :key="poe.posturalOrientation" v-for="poe in poe.results" :color="getPOEScoreToTheme(poe.score)" name="info"
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
        <q-list v-if="poe && poe.results" bordered class="rounded-borders q-gutter-sm q-ma-sm" :key="poe.posturalOrientation" v-for="poe in poe.results">
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
import { mergeLocaleMessages } from 'src/boot/i18n';
import poeTypesEnum from '../../utils/types/poeTypesEnum'

export default {
    name: 'PoeViewModal',
    i18n: await mergeLocaleMessages(['poe']),
    props: { assessmentResults: Object },
    emits: ['getPOEBracket'],
    data () {
      return {
        panel: 'results',
        poe: {}
      }
    },
    mounted () {
      this.$refs.panelForm.goTo('results')
      if (this.assessmentResults) this.poe = this.formatPOEData()
    },
    methods: {
      formatPOEData () {
        const results = this.assessmentResults
        let sumOfScores = 0, confidencesCount = Object.keys(poeTypesEnum.scores).length
        for (const p in results) {
          let poe = results[p], confidences = []
          sumOfScores += poe.score
          poe["posturalOrientation"] = poe.posturalOrientation
          poe["scoreToText"] = poeTypesEnum.formattedScoreToText(poe.score)
          poe["repetition"] = poe["repetition"] === 0 ? 'Summative evaluation' : poe["repetition"]

          for (let i = 0; i < confidencesCount; i++) {
            confidences.push({ score: poe['scoreConfidence_' + i] = parseFloat((poe['scoreConfidence_' + i] * 100)).toFixed(0), text: poeTypesEnum.formattedScoreToText(i) })
            poe['confidences'] = confidences
            delete poe['scoreConfidence_' + i]
          }
          poe["highestPredictedConfidence"] = poe['confidences'][poe.score].score
        }

        const calculateSumOfScores = ((sumOfScores / 10) * 100)
        const poe = {
          results: results,
          sumOfScores: calculateSumOfScores,
          maxScore: ((poeTypesEnum.scores.POOR.point * results.length) * 10),
          bracket: poeTypesEnum.getPOEScoreBracket(calculateSumOfScores)
        }
        this.$emit('getPOEBracket', poe.bracket)
        return poe
      },
      getPOEScoreToTheme(score) {
          let poes = Object.values(poeTypesEnum.scores)
          for (const poe in poes) {
            if (poes[poe].point === score) return poes[poe].theme
          }
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
        return this.poe.bracket.point == 0 
          ? 'sentiment_satisfied'
            : this.poe.bracket.point == 1 
          ? 'sentiment_neutral'
          : 'sentiment_dissatisfied'
      }
    }
}
</script>

<style scoped>
  .poe-figure {
    width: 300px;
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