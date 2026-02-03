  <template>
  <div>
    <div v-if="!isLoadingSessions" class="q-pl-lg fit row wrap justify-left">
      <q-chip :ripple="false" outline size="md" class="col-auto" icon="workspaces">
        {{ $t('admin.table.session.sessions') }}: {{this.rows.length}}
      </q-chip>
       <q-chip :ripple="false" outline size="md" class="col-auto" icon="accessibility">
        {{ $t('admin.table.exercise.exercises') }}: {{this.exercisesTotal}}
      </q-chip>
    </div>
    <q-table 
      class="q-ma-lg" 
      :title="$t('admin.table.session.header')"
      :rows="rows"
      :columns="columns"
      row-key="sessionid"
      flat
      bordered
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn-dropdown :ripple="false" rounded flat size="sm" menu-anchor="center right" menu-self="center left">
              <q-item clickable v-close-popup @click="onRowClick(props.row)">
                <q-item-section avatar>
                  <q-avatar icon="accessibility" size="lg"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('admin.table.session.actions.delete.header') }}</q-item-label>
                  <q-item-label caption>{{ $t('admin.table.session.actions.delete.caption', { date: props.row.sessionStartTimestamp }) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-btn-dropdown>
          </q-td>
          <q-td key="patientName" name="patientName" :props="props">
            {{ props.row.patientName }}
          </q-td>
          <q-td key="numOfExercises" name="role" :props="props" class="text-capitalize">
            {{ props.row.numOfExercises }}
          </q-td>
          <q-td key="sessionEndTimestamp" name="endDate" :props="props">
            {{ props.row.sessionEndTimestamp }}
          </q-td>
          <q-td key="sessionStartTimestamp" name="created" :props="props">
            {{ props.row.sessionStartTimestamp }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="openSessionDeletePrompt">
      <q-card class="q-pl-mx" style="min-width: 350px">
        <q-card-section>
          <div class="text-body1">{{ $t('admin.table.session.actions.delete.header') }}</div>
          <div class="text-body2" v-html="$t('admin.table.session.actions.delete.body', 
            { id: selectedSession.sessionID, created: selectedSession.sessionStartTimestamp })
          "></div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat :label="$t('common.cancel')" no-caps v-close-popup />
          <q-btn :label="$t('common.delete')" type="submit" color="negative" no-caps v-close-popup class="q-ml-sm" @click="deleteSession"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div v-if="isLoadingSessions" class="q-ma-md flex flex-center">
      <q-separator inset />
        <q-spinner-dots
          color="primary"
          size="3em"
        />
    </div>
  </div>
</template>

<script>
import API from '../../API.js'
import nicers from '../../utils/nicers.js'

export default {
  name: 'AdminSessionTable',
  props: { sessions: Object },
  emits: ['getSessions'],
  data () {
    return {
      columns: [
        { name: 'patientName', align:'left', label: this.$t('admin.table.session.columns.patient'), field: 'patientName', sortable: true, required: true },
        { name: 'numOfExercises', align:'left' , label: this.$t('admin.table.session.columns.exercises'), field: 'numOfExercises', sortable: true },
        { name: 'sessionEndTimestamp', align:'left' , label: this.$t('admin.table.session.columns.end'), field: 'sessionEndTimestamp', sortable: true },
        { name: 'sessionStartTimestamp', align:'left' , label: this.$t('admin.table.session.columns.created'), field: 'sessionStartTimestamp', sortable: true }
      ],
      rows: [],
      exercisesTotal: 0,
      isLoadingSessions: true,
      openSessionDeletePrompt: false,
      selectedSession: {}
    }
  },
  mounted () {
    this.resetForm()
  },
  watch: {
    sessions(rowsOfSessions) { 
      this.exercisesTotal = 0
      let sessions = rowsOfSessions

      sessions.map((session) => {
        session["sessionStartTimestamp"] = nicers.formattedDayOfMonth(session["sessionStartTimestamp"])
        session["sessionEndTimestamp"] = session["sessionEndTimestamp"] ? nicers.formattedDayOfMonth(session["sessionEndTimestamp"]) : 'No end date'
        this.exercisesTotal += session.numOfExercises
      })

      this.rows = sessions
      this.isLoadingSessions = false
    }
  },
  methods: {
    async onRowClick (row) {
      this.selectedSession = row
      this.openSessionDeletePrompt = !this.openSessionDeletePrompt
    },
    async deleteSession () {
      let deletedSession = this.selectedSession
      try {
        if (deletedSession.numOfExercises >= 1) throw new Error('Session has ongoing exercises')
        await API.deleteSession(deletedSession.sessionID)
        this.$q.notify({
          color: 'info',
          position: 'top',
          message: 'Deleted selected session',
          icon: 'info'
        })
        this.$emit('getSessions')
      } catch (err) {
        let errMsg = err
        if (err.response && err.response.status === 409) errMsg = err.response.data
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Cannot delete session: ${errMsg}`,
          icon: 'warning'
        })
        return
      }
    },
    formatDate (date) {
      return nicers.formattedDate(date)
    },
    formatDateLastLogin (date) {
      return nicers.formattedDayOfMonth(date)
    },
    resetForm () {
      this.rows = []
      this.selectedSession = {}
      this.exercisesTotal = 0
      this.isLoadingSessions = true
    }
  }
}
</script>


<style scoped>

</style>