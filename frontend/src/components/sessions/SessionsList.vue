<template>
  <div>
    <div v-if="sessions.length >= 1 && pagination.maxPageNo >= 1">
      <div class="q-py-md flex justify-center">
        <div class="sessionsList">
          <div style="display: flex;">
            <q-btn style="marginLeft:2px;minWidth:fit-content;" color="grey-8" flat fab-mini :ripple="false" 
              :icon="pagination.sortOrder == 'DESC' ? 'arrow_drop_down' : 'arrow_drop_up'" 
              v-touch-repeat.mouse="handleSortOrder"
            >
              <q-icon name="calendar_month" />
            </q-btn>
            <div class="list-line" />
            <div class="text-subtitle2 line-desc q-mr-sm">{{ $t('common.session_list') }}</div>
          </div>
          <q-intersection
            v-for="session in sessions"
            :key="session.id"
            transition="jump-up"
            class="example-item"
          >
            <q-item clickable v-ripple @click="(e) => openSessionView(session)">
              <q-item-section avatar>
                <q-avatar color="secondary" text-color="white" icon="accessibility" class="shadow-2"/>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body2">{{ session.names }}</q-item-label>
                <q-item-label caption>Start: {{ formatDate(session.startTimestamp) }}</q-item-label>
                <q-item-label caption>{{ session.endTimestamp ? `End: ${formatDate(session.endTimestamp)}` : $t('exercises.sessions.no_end_date') }}</q-item-label>
                <q-item-label caption>
                  {{ 
                    session.numOfExercises 
                      ? `${session.numOfExercises} ${$t('exercises.sessions.exercise', session.numOfExercises == 1 ? 1 : 2)}` 
                      : $t('exercises.sessions.no_exercises') 
                  }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="arrow_forward" />
              </q-item-section>
            </q-item>
          </q-intersection>
        </div>
      </div>
      <q-pagination
        v-if="pagination.maxPageNo >= 1"
        v-model="pagination.pageNo"
        :max="pagination.maxPageNo"
        :min="1"
        flat
        @update:model-value="(e) => handlePageSession(e)"
        direction-links
        color="grey"
        active-color="primary"
        class="q-mb-md flex flex-center"
        active-design="push"
        size="md"
        gutter="sm"
      />
    </div>
    <div v-if="isLoadingSessions" class="q-ma-md flex flex-center">
      <q-spinner-dots
          color="primary"
          size="3em"
        />
    </div>
    <div v-else-if="pagination.maxPageNo <= 0" class="q-py-md text-body1 flex flex-center">
      <q-chip outline :ripple="false" icon="accessibility" color="secondary" text-color="white" >{{ $t('exercises.sessions.not_found') }}</q-chip>
    </div>
  </div>
</template>

<script>
import API from '../../API'
import nicers from '../../utils/nicers'

export default {
  name: 'ExerciseSessions',
  props: { selectedPatient: Object },
  data () {
    return {
      sessions: [],
      isLoadingSessions: true,
      pagination: {
        limit: 3,
        pageNo: 1,
        sortOrder: 'DESC',
        maxPageNo: 1
      }
    }
  },
  async mounted () {
    await this.getSessions()
  },
  updated () { },
  methods: {
    async getSessions () {
      try {
        let resp = await API.getSessions(this.pagination)
        if (resp) {
          this.sessions = resp.sessions
          this.pagination.maxPageNo = resp.maxPageNo
          this.isLoadingSessions = false
        }     
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Something went wrong when retrieving sessions: ' + err,
          icon: 'warning'
        })
      }
   
    },
    async handlePageSession (no) {
      this.pagination.pageNo = no
      await this.getSessions()  
    },
    async handleSortOrder () {
      this.pagination.sortOrder == 'DESC' 
        ? this.pagination.sortOrder = 'ASC' 
        : this.pagination.sortOrder = 'DESC'

      await this.getSessions()
    },
    openSessionView (session) {
      return this.$router.push('home/sessions/' + session.id)
    },
    formatDate (date) {
      return nicers.formattedDayOfMonth(date)
    } 
  }
}
</script>

<style>

</style>