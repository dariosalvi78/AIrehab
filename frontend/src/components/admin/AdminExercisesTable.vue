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
              <q-item clickable v-close-popup @click="onRowClick('exercise', props.row)">
                <q-item-section avatar>
                  <q-avatar icon="book" size="lg"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exercise</q-item-label>
                  <q-item-label caption>Read notes</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="onRowClick('delete', props.row)">
                <q-item-section avatar>
                  <q-avatar icon="close" size="lg"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>Delete</q-item-label>
                  <q-item-label caption>Permanently delete {{props.row.type}}</q-item-label>
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
    <q-dialog v-model="openExerciseDeletePrompt">
      <q-card class="q-pl-mx" style="min-width: 350px">
        <q-card-section>
          <div class="text-body1">Delete exercise - {{selectedExercise.type}}</div>
          <div class="text-body2">
            <div><b>- Physiotherapist:</b> {{selectedExercise.assignedTo}}</div>
            <div><b>- Patient:</b> {{selectedExercise.patientName}}</div>
            <div><b>- Date:</b> {{`${selectedExercise.startTimestamp} -  ${selectedExercise.endTimestamp ? selectedExercise.endTimestamp : 'Ongoing'}`}}</div>
            <div><b>- Video:</b> {{selectedExercise.videoFile ? 'Uploaded' : 'No video uploaded'}}</div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Delete" type="submit" color="negative" v-close-popup class="q-ml-sm" @click="closeExercise"/>
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
import API from '../../API.js'
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
      openExerciseDeletePrompt: false,
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
    async onRowClick (prompt, row) {
      this.selectedExercise = row
      if (prompt == 'exercise') {
        this.openExerciseInfoPrompt = !this.openExerciseInfoPrompt
      } else if (prompt == 'delete') {
        this.openExerciseDeletePrompt = !this.openExerciseDeletePrompt
      }
      else return
    },
    async closeExercise () {
      let deletedExercise = this.selectedExercise
      try {
        await API.deleteExercise(deletedExercise.id, deletedExercise.physiotherapySessionId, deletedExercise.videoFile)
        this.$q.notify({
          color: 'info',
          position: 'top',
          message: 'Deleted selected exercise',
          icon: 'info'
        })
        this.$emit('getExercises')
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Cannot delete selected exercise: ${err}`,
          icon: 'warning'
        })
        return
      }
    },
    formatDateLastLogin (date) {
      return nicers.formattedDayOfMonth(date)
    },
    resetForm () {
      this.rows = []
      this.selectedExercise = {}
      this.isLoadingExercises = true
      this.openExerciseInfoPrompt = false
      this.openExerciseDeletePrompt = false
    }
  }
}
</script>


<style scoped>
#exerciseInfoDialog {
  min-width: 350px;
}
</style>