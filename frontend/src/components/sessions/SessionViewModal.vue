<template>
  <q-page-container class="q-pa-lg">
    <q-page>
      <q-btn round dense color="primary" size="lg" icon="chevron_left" @click="this.$router.go(-1)" />        
       <q-card flat class="q-pa-lg">
        <q-card-section>
          <div class="text-h6">Session for {{session.patientName}}</div>
          <div class="text-body2">
            <q-icon style="bottom: 2px" size="sm" name="calendar_month"/>
            {{ formatDate(session.startTimestamp) }}
          </div>
          <div>
            {{ session.endTimestamp ? formatDate(session.endTimestamp) : 'No end date' }}
            <!-- <q-btn
              v-if="!session.endTimestamp"
              label="Set end date"
              size="sm"
              dense
              color="secondary"
            >
              <q-popup-proxy>
                <q-date
                  ref="datePicker"
                  v-model="endDate"
                  minimal
                  :options="date => formatDate(date) >= session.startTimestamp"
                  mask="YYYY-MM-DD"
                  today-btn
                >
                  <template v-slot>
                    <div class="row items-center justify-end q-gutter-sm">
                      <div class="text-weight-bold">{{endDate}}</div>
                      <q-btn label="Cancel" color="primary" size="sm" v-close-popup />
                      <q-btn label="Confirm" color="primary" size="sm" @click="submitNewEndDate" />
                    </div>
                  </template>
                </q-date>
              </q-popup-proxy>
            </q-btn> -->
          </div>
        </q-card-section>
        <q-separator inset />
      </q-card>
    </q-page>
  </q-page-container>
</template>

<script>
import { ref } from 'vue'
import API from '../../API'
import nicers from '../../utils/nicers'

export default {
  name: 'ExerciseViewModal',
  props: { sessionID: String },
  data () {
    return {
      session: {},
      endDate: undefined
    }
  },
  async created () {
    await this.getSessionData()
  },
  methods: {
    async getSessionData () {
      let resp = await API.getSession(this.sessionID)
      this.session = resp
      this.endDate = this.formatDate(resp.endTimestamp)
    },
    async submitNewEndDate () {
      try {
        if (this.endDate && this.sessionID) {
          let resp = await API.editSession(this.sessionID, { editEndTimestamp: this.endDate })
          console.log('edit. ',  resp)
        }  
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Something went wrong when updating session: ' + err,
          icon: 'warning'
        })
      }
      
    },
    selectDate (date) {
      return this.formatDate(date) >= this.date.from
    },
    formatDate (date) {
      return nicers.formattedDate(date)
    }
  }
}
</script>

<style scoped>
</style>