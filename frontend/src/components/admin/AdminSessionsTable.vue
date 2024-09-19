  <template>
  <div>
    <q-table 
      class="q-ma-lg" 
      title="Sessions"
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
          </q-td>
          <q-td key="sessionid" name="sessionid" :props="props">
            {{ props.row.sessionID }}
          </q-td>
          <q-td key="numOfExercises" name="role" :props="props" class="text-capitalize">
            {{ props.row.numOfExercises }}
          </q-td>
          <q-td key="sessionStartTimestamp" name="created" :props="props">
            {{ props.row.sessionStartTimestamp }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
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
import nicers from '../../utils/nicers.js'

export default {
  name: 'AdminSessionTable',
  props: { sessions: Object },
  data () {
    return {
      columns: [
        { name: 'sessionid', align:'left', label: 'Session ID', field: 'sessionid', sortable: true, required: true },
        { name: 'numOfExercises', align:'left' , label: 'Ongoing Exercises', field: 'numOfExercises', sortable: true },
        { name: 'sessionStartTimestamp', align:'left' , label: 'Created', field: 'sessionStartTimestamp', sortable: true }
      ],
      rows: [],
      isLoadingSessions: true
    }
  },
  mounted () {
    this.resetForm()
  },
  watch: {
    sessions(rowsOfSessions) { 
      let sessions = rowsOfSessions

      sessions.map((session) => {
        session["sessionStartTimestamp"] = nicers.formattedDateLastLogin(session["sessionStartTimestamp"])
      })

      this.rows = sessions
      this.isLoadingSessions = false
    }
  },
  methods: {
    formatDate (date) {
      return nicers.formattedDate(date)
    },
    formatDateLastLogin (date) {
      return nicers.formattedDateLastLogin(date)
    },
    resetForm () {
      this.rows = []
      this.selectedUser = {}
      this.isLoadingSessions = true
    }
  }
}
</script>


<style scoped>

</style>