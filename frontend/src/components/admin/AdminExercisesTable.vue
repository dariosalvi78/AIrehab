  <template>
  <div>
    <q-table 
      class="q-ma-lg" 
      :title="$t('admin.table.exercise.header')"
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
                  <q-item-label>{{ $t('admin.table.exercise.actions.read.header') }}</q-item-label>
                  <q-item-label caption>{{ $t('admin.table.exercise.actions.read.caption') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="onRowClick('delete', props.row)">
                <q-item-section avatar>
                  <q-avatar icon="close" size="lg"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('admin.table.exercise.actions.delete.header') }}</q-item-label>
                  <q-item-label caption>{{ $t('admin.table.exercise.actions.delete.caption', { type: props.row.type }) }}</q-item-label>
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
          <div class="text-body1">{{ $t('admin.table.exercise.actions.read.header') }}</div>
          <div class="text-body2">
            <div><b>{{ $t('admin.table.exercise.columns.type') }}:</b> {{selectedExercise.type}}</div>
            <div style="margin:3px 0 0 -2px;">
              <q-icon style="bottom:2px;" size="sm" name="schedule" />
              {{ selectedExercise.startTimestamp }}
              - {{ selectedExercise.endTimestamp ? '' + selectedExercise.endTimestamp : $t('exercises.ongoing') }}
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
        <q-card-actions align="center" class="q-pt-none">
          <q-btn flat :label="$t('common.close')" no-caps v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openExerciseDeletePrompt">
      <q-card class="q-pl-mx" style="min-width: 350px">
        <q-card-section>
          <div class="text-body1">{{ $t('admin.table.exercise.actions.delete.header', { type: selectedExercise.type }) }}</div>
          <div class="text-body2" v-html="$t('admin.table.exercise.actions.delete.body', { 
              type: selectedExercise.type,
              assigned_to: selectedExercise.assignedTo,
              name: selectedExercise.patientName,
              created: selectedExercise.startTimestamp,
              end: selectedExercise.endTimestamp ? selectedExercise.endTimestamp : $t('exercises.ongoing'),
              videoFile: $t('admin.video.uploaded', selectedExercise.videoFile ? 0 : 1)
            },
          )">
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat :label="$t('common.cancel')" no-caps v-close-popup />
          <q-btn :label="$t('common.delete')" type="submit" color="negative" no-caps v-close-popup class="q-ml-sm" @click="closeExercise"/>
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
        { name: 'patientName', align:'left', label: this.$t('admin.table.exercise.columns.patient'), field: 'patientName', sortable: true, required: true },
        { name: 'assignedTo', align:'left', label: this.$t('admin.table.exercise.columns.assigned_to'), field: 'assignedTo', sortable: true, required: true },
        { name: 'type', align:'left' , label: this.$t('admin.table.exercise.columns.type'), field: 'align', sortable: true },
        { name: 'startTimestamp', align:'left' , label: this.$t('admin.table.exercise.columns.created'), field: 'startTimestamp', sortable: true }
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
        exercise["type"] = !exercise["type"] ? 'Not Specified' : this.$t(`exercises.form.types.${exercise["type"]}`) 
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