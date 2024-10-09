  <template>
  <div>
    <q-table 
      class="q-ma-lg" 
      title="Exercises"
      :rows="rows"
      :columns="columns"
      row-key="patientName"
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
                  <q-avatar icon="book" size="lg"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exercise</q-item-label>
                  <q-item-label caption>Read notes</q-item-label>
                </q-item-section>
              </q-item>
            </q-btn-dropdown>
          </q-td>
          <q-td key="patientName" name="patientName" :props="props">
            {{ props.row.patientName }}
          </q-td>
          <q-td key="assignedTo" name="assignedTo" :props="props">
            {{ props.row.assignedTo }}
          </q-td>
          <q-td key="type" name="type" :props="props">
            {{ props.row.type }}
          </q-td>
          <q-td key="startTimestamp" name="startTimestamp" :props="props">
            {{ props.row.startTimestamp }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="openExerciseInfoPrompt">
      <q-card class="q-ma-md" id="exerciseInfoDialog">
        <q-card-section>
          <div class="text-body1">Exercise</div>
          <div class="text-body2">
            <div><b>Type of exercise:</b> {{selectedExercise.type}}</div>
            <div style="margin:3px 0 0 -2px;">
              <q-icon style="bottom:2px;" size="sm" name="schedule" />
              {{ selectedExercise.startTimestamp }}
              - {{ selectedExercise.endTimestamp ? '' + selectedExercise.endTimestamp : 'Ongoing exercise' }}
            </div>
            <q-separator class="q-my-md" />
            <div style="white-space:break-spaces;">
              <q-scroll-area :visible="true" style="height: 200px;">
                {{selectedExercise.notes}}
              </q-scroll-area>
            </div>
            <q-separator class="q-mt-md" />
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div v-if="isLoadingExercises" class="q-ma-md flex flex-center">
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
  name: 'AdminExercisesTable',
  props: { exercises: Object },
  emits: ['getExercises'],
  data () {
    return {
      columns: [
        { name: 'patientName', align:'left', label: 'Patient', field: 'patientName', sortable: true, required: true },
        { name: 'assignedTo', align:'left', label: 'Physiotherapist', field: 'assignedTo', sortable: true, required: true },
        { name: 'type', align:'left' , label: 'Type', field: 'align', sortable: true },
        { name: 'startTimestamp', align:'left' , label: 'Start', field: 'startTimestamp', sortable: true }
      ],
      rows: [],
      isLoadingExercises: true,
      openExerciseInfoPrompt: false,
      selectedExercise: {}
    }
  },
  mounted () {
    this.resetForm()
  },
  watch: {
    exercises (newExercises) {
      let exercises = newExercises

      exercises.map((exercise) => {
          exercise["type"] = !exercise["type"] ? 'Not Specified' : exercise["type"] 
          exercise["startTimestamp"] = nicers.formattedDayOfMonth(exercise["startTimestamp"])
          exercise["endTimestamp"] = nicers.formattedDayOfMonth(exercise["endTimestamp"])
      })

      this.rows = newExercises
      this.isLoadingExercises = false
    }
  },
  methods: {
    async onRowClick (row) {
      this.selectedExercise = row
      this.openExerciseInfoPrompt = !this.openExerciseInfoPrompt
    },
    formatDateLastLogin (date) {
      return nicers.formattedDayOfMonth(date)
    },
    resetForm () {
      this.rows = []
      this.selectedExercise = {}
      this.isLoadingExercises = true
    }
  }
}
</script>


<style scoped>
#exerciseInfoDialog {
  min-width: 350px;
}
</style>