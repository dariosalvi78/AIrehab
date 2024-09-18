<template>
  <div v-if="sessions.length >= 1" class="q-py-md">
    <div class="q-pa-md flex justify-center">
      <div style="max-width: 90%; width: 300px;">
        <q-intersection
          v-for="session in sessions"
          :key="session.id"
          transition="jump-up"
          class="example-item"
        >
          <q-item clickable v-ripple @click="(e) => openSessionView(session)">
            <q-item-section avatar>
              <q-avatar color="secondary" text-color="white" icon="accessibility" />        
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ session.names }}</q-item-label>
              <q-item-label caption>Start: {{ formatDate(session.startTimestamp) }}</q-item-label>
              <q-item-label caption>{{ session.endTimestamp ? formatDate(session.endTimestamp) : 'No end date' }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="arrow_forward" />
            </q-item-section>
          </q-item>
        </q-intersection>
      </div>
    </div>
  </div>
  <div v-else class="text-body1 flex flex-center">No sessions found</div>
</template>

<script>
import API from '../../API'
import nicers from '../../utils/nicers'

export default {
  name: 'ExerciseSessions',
  props: { selectedPatient: Object },
  data () {
    return {
      sessions: []
    }
  },
  async mounted () {
    await this.getSessions()
  },
  updated () { },
  methods: {
    async getSessions () {
      console.log(this.selectedPatient)
      let resp = await API.getSessions()
      this.sessions = resp
    },

    openSessionView (session) {
      console.log(session)
      this.$router.push('physiotherapist/sessions/' + session.id)
    },

    formatDate (date) {
      return nicers.formattedDateLastLogin(date)
    } 
  }
}
</script>

<style>

</style>