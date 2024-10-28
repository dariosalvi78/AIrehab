<template>
  <div class="q-py-md flex justify-center" id="patients">
    <div style="width: 400px;">
      <div style="display: flex;">
        <q-btn style="marginLeft:2px;paddingRight:0px;minWidth:fit-content;" color="grey-8" flat fab-mini :ripple="false" 
          :icon="pagination.date.sortOrder == 'DESC' ? 'arrow_drop_down' : 'arrow_drop_up'" 
          v-touch-repeat.mouse="() => $emit('handleSortOrder', 'date')"
        >
          <q-icon name="calendar_month" />
        </q-btn>
        <q-btn style="paddingLeft:0px;minWidth:fit-content;" color="grey-8" flat fab-mini :ripple="false" 
          :icon="pagination.name.sortOrder == 'DESC' ? 'arrow_drop_down' : 'arrow_drop_up'" 
          v-touch-repeat.mouse="() => $emit('handleSortOrder', 'name')"
        >
          <q-icon name="abc" size="md" style="height:24px;"/>
        </q-btn>
        <div class="list-line" />
        <div class="text-subtitle2 line-desc q-mr-sm">Patients list</div>
      </div>
      <q-intersection
        v-for="patient in patients"
        :key="patient.id"
        transition="jump-up"
        class="patient"
      >
        <q-item clickable v-ripple @click="(e) => $emit('openView', patient)">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" icon="person">
              <q-badge v-if="patient.isPartOfSession" floating color="teal" rounded>
                  <q-icon name="accessibility" style="width:7px;height:15px;"/>
              </q-badge>
            </q-avatar> 
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ patient.names }}</q-item-label>
            <q-item-label caption lines="1">{{ formatDate(patient.createdTimestamp) }}</q-item-label>
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
    }
  }
}
</script>

<style scoped>

</style>