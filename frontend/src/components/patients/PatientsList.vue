<template>
  <div class="q-py-md flex justify-center" id="patients">
    <div class="patientsList">
      <div style="display: flex;">
        <q-btn style="margin-left:2px;min-width:fit-content;" color="grey-8" flat fab-mini :ripple="false" 
          :icon="pagination.date.sortOrder == 'DESC' ? 'arrow_drop_down' : 'arrow_drop_up'" 
          v-touch-repeat.mouse="() => $emit('handleSortOrder', 'date')"
        >
          <q-icon name="calendar_month" />
        </q-btn>
        <q-btn style="padding-left:0px;min-width:fit-content;" color="grey-8" flat fab-mini :ripple="false" 
          :icon="pagination.name.sortOrder == 'DESC' ? 'arrow_drop_down' : 'arrow_drop_up'" 
          v-touch-repeat.mouse="() => $emit('handleSortOrder', 'name')"
        >
          <q-icon name="abc" size="md" style="height:24px;"/>
        </q-btn>
        <div class="list-line" />
        <div class="text-subtitle2 line-desc q-mr-sm">{{ $t('common.patient_list') }}</div>
      </div>
      <q-intersection
        v-for="patient in patients"
        :key="patient.id" once
        transition="jump-up"
        class="patient"
      >
        <q-item class="q-pa-md q-ma-sm rounded-borders shadow-1" clickable v-ripple @click="(e) => $emit('openView', patient)">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" class="shadow-2">
              <span class="text-subtitle2 text-uppercase">{{ formatName(patient.names) }}</span>
              <q-badge v-if="patient.isPartOfSession" floating color="secondary" rounded class="shadow-1">
                <q-icon name="accessibility" style="width:7px;height:15px;"/>
              </q-badge>
            </q-avatar> 
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-body1">{{ patient.names }}</q-item-label>
            <q-item-label caption lines="2">
              <span class="q-mr-sm">{{ formatDate(patient.createdTimestamp) }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="arrow_forward" />
          </q-item-section>
        </q-item>
      </q-intersection>
    </div>
  </div>
</template>

<script>
import nicers from '../../utils/nicers'

export default {
  name: 'PatientsList',
  props: { patients: Array, pagination: Object },
  emits: ['openView', 'handleSortOrder'],
  methods: {
    formatDate(date) {
      return nicers.formattedDate(date)
    },
    formatName (name) {
      if (!name) return
      let separate = name.split(' ')
      return separate.length > 1 ? (`${separate[0][0]}${separate[separate.length-1][0]}`) : separate[0][0]
    }
  }
}
</script>

<style scoped>

</style>