  <template>
  <div>
     <div v-if="!isLoadingUsers" class="q-pl-lg fit row wrap justify-left">
      <q-chip :ripple="false" outline size="md" class="col-auto" icon="person">
        {{ $t('admin.table.user.test_leaders') }}: {{this.users.therapists.length}}
      </q-chip>
       <q-chip :ripple="false" outline size="md" class="col-auto" icon="group">
        {{ $t('admin.table.user.patients') }}: {{this.users.patients.length}}
      </q-chip>
    </div>
    <q-table 
      class="q-ma-lg" 
      :title="$t('admin.table.user.header')"
      :rows="rows"
      :columns="columns"
      row-key="name"
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
            <q-item v-show="props.row.role == 'physiotherapist'" clickable v-close-popup @click="onRowClick('add', props.row)">
              <q-item-section avatar>
                <q-avatar icon="person_add" size="lg"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('admin.table.user.actions.add.header') }}</q-item-label>
                <q-item-label caption>{{ $t('admin.table.user.actions.add.caption') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onRowClick('delete', props.row)">
              <q-item-section avatar>
                <q-avatar icon="person_remove" size="lg"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('admin.table.user.actions.delete.header') }}</q-item-label>
                <q-item-label caption>{{ $t('admin.table.user.actions.delete.caption', { email: props.row.email }) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-show="props.row.role == 'physiotherapist'" clickable v-close-popup @click="onRowClick('mail', props.row)">
              <q-item-section avatar>
                <q-avatar icon="mail" size="lg"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('admin.table.user.actions.email.header') }}</q-item-label>
                <q-item-label caption>{{ $t('admin.table.user.actions.email.caption') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-show="props.row.role == 'patient'" clickable v-close-popup @click="onRowClick('edit', props.row)">
              <q-item-section avatar>
                <q-avatar icon="edit" size="lg"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('admin.table.user.actions.edit.header') }}</q-item-label>
                <q-item-label caption>{{ $t('admin.table.user.actions.edit.caption', { name: props.row.email }) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-show="props.row.role == 'patient'" clickable v-close-popup @click="onRowClick('copy', props.row)">
              <q-item-section avatar>
                <q-avatar icon="content_copy" size="lg"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('admin.table.user.actions.copy.header') }}</q-item-label>
                <q-item-label caption>{{ $t('admin.table.user.actions.copy.caption') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-btn-dropdown>
          </q-td>
          <q-td key="username" name="Username" :props="props">
            {{ props.row.email }} <q-chip v-show="props.row.role == 'patient'" outline :label="props.row.activated ? 'Consented' : 'No consent'" size="sm" :color="props.row.activated ? 'positive' : 'negative'" />
          </q-td>
          <q-td key="role" name="role" :props="props" class="text-capitalize">
            {{ getFormattedUserRole(props.row.role) }}
          </q-td>
          <q-td key="created" name="created" :props="props">
            {{ props.row.createdTimestamp }}
          </q-td>
          <q-td key="lastLogIn" name="lastLogIn" :props="props">
            {{ props.row.lastLoginTimestamp }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="openUserDeletePrompt">
      <q-card class="q-pl-mx" style="min-width: 350px">
        <q-card-section>
          <div class="text-body1">{{ $t('admin.table.user.actions.delete.header') }}</div>
          <div class="text-body2" v-html="$t('admin.table.user.actions.delete.body', {
            email: selectedUser.email, role: selectedUser.role, created: selectedUser.createdTimestamp
          })">
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat :label="$t('common.cancel')" no-caps v-close-popup />
          <q-btn :label="$t('common.delete')" type="submit" color="negative" no-caps v-close-popup class="q-ml-sm" @click="deleteUser()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openUserMailPrompt">
      <q-card class="q-pl-mx" style="width: 600px">
        <q-card-section>
          <div class="text-h6">{{ $t('admin.dialog.email.header') }}</div>
          <div class="text-body2" v-html="$t('admin.dialog.email.description', { email: selectedUser.email })"></div>
        </q-card-section>
        <q-form class="q-px-lg">
          <q-input
            ref="qEmailSubject"
            class="q-my-md"            
            filled
            v-model="this.email.subject"
            :label="$t('admin.dialog.email.form.subject')"
            type="text"
            :rules="[(subject) => !!subject || $t('admin.dialog.email.form.subject_error')]"
          />
          <q-input
            ref="qEmailBody"
            class="q-my-md"            
            filled
            v-model="this.email.content"
            :label="$t('admin.dialog.email.form.content')"
            type="textarea"
            :rules="[(body) => !!body || $t('admin.dialog.email.form.content_error')]"
          />
        </q-form>
        <q-card-actions align="right" class="q-px-lg text-primary">
          <q-btn flat :label="$t('common.cancel')" no-caps v-close-popup />
          <q-btn :label="$t('common.send')" type="submit" no-caps color="primary" class="q-ml-sm" @click="sendEmail()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <patient-edit-form 
      :user="selectedUser" 
      :formMode="openPatientForm.form" 
      v-model="openPatientForm.status" 
      @editPatient="editPatient"
      @addNewPatient="(newPatientData) => this.$emit('addPatient', newPatientData)"
    />
    <div v-if="isLoadingUsers" class="q-ma-md flex flex-center">
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
import PatientEditForm from '../patients/PatientEditForm.vue'

export default {
  name: 'AdminUserTable',
  props: { users: Object },
  emits: ['getUsers', 'addPatient'],
  components: { PatientEditForm },
  data () {
    return {
      columns: [
        { name: 'username', align:'left', label: this.$t('admin.table.user.columns.username'), field: 'email', sortable: true, required: true },
        { name: 'role', align:'left' , label: this.$t('admin.table.user.columns.type'), field: 'role', sortable: true },
        { name: 'created', align:'left' , label: this.$t('admin.table.user.columns.created'), field: 'createdTimestamp', sortable: true },
        { name: 'lastLogIn', align:'left', label: this.$t('admin.table.user.columns.last_login'), field: 'lastLoginTimestamp', sortable: true }
      ],
      rows: [],
      isLoadingUsers: true,
      selectedUser: {},
      email: { subject: 'Admin • POE Assessment', content: undefined },
      openUserDeletePrompt: false,
      openPatientForm: { status: false, form: 'adminNew' },
      openUserMailPrompt: false
    }
  },
  async mounted () {
    this.resetForm()
  },
  watch: {
    users(rowsOfUsers) { 
      let users = rowsOfUsers.therapists
      let patients = rowsOfUsers.patients

      patients.map((patient) => {
        patient["email"] = patient["names"],
        patient["role"] = 'patient'
        patient["lastLoginTimestamp"] = 'N/A'
        delete patient["names"]
      })

      let allUsers = users.concat(patients)

      allUsers.map((user) => {
        user["createdTimestamp"] = nicers.formattedDate(user["createdTimestamp"])
        if (user.role == 'physiotherapist') {
          user["lastLoginTimestamp"] = nicers.formattedDayOfMonth(user["lastLoginTimestamp"])
        }
      })

      this.rows = allUsers
      this.isLoadingUsers = false
    }
  },
  methods: {
    formatDate (date) {
      return nicers.formattedDate(date)
    },
    formatDateLastLogin (date) {
      return nicers.formattedDayOfMonth(date)
    },
    async onRowClick (prompt, row) {
      this.selectedUser = row
      if (prompt == 'delete') {
        this.openUserDeletePrompt = !this.openUserDeletePrompt
      } else if (prompt == 'edit' && this.selectedUser.role === 'patient') {
        this.openPatientForm = { status: !this.openPatientForm.status, form: 'adminEdit' }        
        let resp = await API.getPatient(this.selectedUser.id)
        this.selectedUser.physiotherapistEmail = resp.physiotherapistEmail
      } else if (prompt == 'mail' && this.selectedUser.role === 'physiotherapist') {
        this.openUserMailPrompt = !this.openUserMailPrompt
      } else if (prompt == 'add' && this.selectedUser.role === 'physiotherapist') {
        this.openPatientForm = { status: !this.openPatientForm.status, form: 'adminNew' }        
        this.selectedUser.physiotherapistEmail = this.selectedUser.email
      } else if (prompt == 'copy' && this.selectedUser.role === 'patient') {
        let response = await API.getPatient(this.selectedUser.id)
        if (response) {
          const url = window.origin + '/patient/' + response.id + '/profile?access=' + response.access
          await nicers.copyTextToClipboard(url)
        }
      }
      else return
    },
    async deleteUser () {
      let deletedUser = this.selectedUser
      try {
        if (this.selectedUser.role == 'physiotherapist') {
          await API.deleteUser(deletedUser.id)
        } else if (this.selectedUser.role == 'patient') {
          await API.deletePatient(deletedUser.id, deletedUser.physiotherapistId)
        }
        this.$q.notify({
          color: 'info',
          position: 'top',
          message: this.$t('admin.notification.delete_user', { username: this.selectedUser.email }),
          icon: 'info'
        })
        this.$emit('getUsers')
      } catch (err) {
        let errMsg = err
        if (err.response.status === 409) errMsg = err.response.data
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('admin.notification.delete_user_error', { username: this.selectedUser.email, error: errMsg }),
          icon: 'warning'
        })
        return
      }
    },
    async editPatient (edited) {
      try {
        const { fullName, dateOfBirth, height, weight, injuries, injuredBodyParts } = edited
        await API.editPatient(fullName, dateOfBirth, height, weight, { description: injuries, bodyParts: injuredBodyParts }, this.selectedUser.id)
        this.$q.notify({
          color: 'secondary',
          position: 'top',
          message: this.$t('patient.notification.edit_patient', { name: this.selectedUser.email }),
          icon: 'info'
        })
        this.resetForm()
        this.$emit('getUsers')
      } catch (err) {
        this.selectedUser = {}
        let errMsg = err
        if (err.response.status == 400) errMsg = err.response.data
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('patient.notification.edit_patient_error', { error: errMsg }),
          icon: 'report_problem'
        })
      }
    },
    async sendEmail () {
      try {
        this.$refs.qEmailSubject.validate()
        this.$refs.qEmailBody.validate()
        if (this.$refs.qEmailBody.hasError || this.$refs.qEmailSubject.hasError) {
          return this.$q.notify({
              color: 'negative',
              position: 'top',
              message: this.$t('common.notification.error'),
              icon: 'report_problem'
          })
        }
        this.$q.loading.show()
        let response = await API.sendEmail(this.selectedUser.email, this.email.subject, this.email.content )
        if (response) {
          this.$q.notify({
            color: 'secondary',
            position: 'top',
            message: this.$t('admin.notification.email_sent', { email: this.selectedUser.email }),
            icon: 'info'
          })
          this.openUserMailPrompt = !this.openUserMailPrompt
          this.email.subject = 'Admin • POE Assessment'
          this.email.content = undefined
        }
      } catch (err) {
        return this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('admin.notification.email_sent_error', { error: err }),
          icon: 'report_problem'
        })
      }
      this.$q.loading.hide()
    },
    resetForm () {
      this.rows = []
      this.selectedUser = {}
      this.isLoadingUsers = true
      this.openUserDeletePrompt = false
      this.openPatientForm.status = false
      this.openUserMailPrompt = false
    },
    getFormattedUserRole (role) {
      if (role === 'physiotherapist') {
        return 'Test leader'
      } else if (role === 'patient') {
        return 'Patient'
      } else {
        return role
      }
    }
  }
}
</script>


<style scoped>

</style>