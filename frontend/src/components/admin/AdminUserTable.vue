  <template>
  <div>
    <q-table 
      class="q-ma-lg" 
      title="Users"
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
            <q-item clickable v-close-popup @click="onRowClick('delete', props.row)">
              <q-item-section avatar>
                <q-avatar icon="person_remove" size="lg"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>Delete</q-item-label>
                <q-item-label caption>Permanently delete {{props.row.email}}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-show="props.row.role == 'patient'" clickable v-close-popup @click="onRowClick('edit', props.row)">
              <q-item-section avatar>
                <q-avatar icon="edit" size="lg"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>Edit</q-item-label>
                <q-item-label caption>Change information for {{props.row.email}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-btn-dropdown>
          </q-td>
          <q-td key="username" name="Username" :props="props">
            {{ props.row.email }}
          </q-td>
          <q-td key="role" name="role" :props="props" class="text-capitalize">
            {{ props.row.role }}
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
          <div class="text-body1">Delete {{selectedUser.role == 'patient' ? 'patient' : 'physiotherapist'}}</div>
          <div class="text-body2">
            - {{selectedUser.email}}
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Delete" type="submit" color="negative" v-close-popup class="q-ml-sm" @click="deleteUser()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <patient-edit-form :user="selectedUser" formMode="edit" v-model="openUserEditPrompt" @editPatient="editPatient" />
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
import routes from '../../router/routeHandler.js'
import storage from '../../utils/userStorage.js'
import nicers from '../../utils/nicers.js'
import { ref } from 'vue'
import PatientEditForm from '../PatientEditForm.vue'

export default {
  name: 'AdminUserTable',
  props: { users: Object },
  components: { PatientEditForm },
  data () {
    return {
      columns: [
        { name: 'username', align:'left', label: 'Username', field: 'email', sortable: true, required: true },
        { name: 'role', align:'left' , label: 'Type', field: 'role', sortable: true },
        { name: 'created', align:'left' , label: 'Created', field: 'createdTimestamp', sortable: true },
        { name: 'lastLogIn', align:'left', label: 'Last log in', field: 'lastLoginTimestamp', sortable: true }
      ],
      rows: [],
      isLoadingUsers: true,
      selectedUser: {},
      openUserDeletePrompt: false,
      openUserEditPrompt: false
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
          user["lastLoginTimestamp"] = nicers.formattedDateLastLogin(user["lastLoginTimestamp"])
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
      return nicers.formattedDateLastLogin(date)
    },
    async onRowClick (prompt, row) {
      this.selectedUser = row
      if (prompt == 'delete') {
        this.openUserDeletePrompt = !this.openUserDeletePrompt
      } else if (prompt == 'edit' && this.selectedUser.role === 'patient') {
        let resp = await API.getPatient(this.selectedUser.id)
        this.selectedUser.physiotherapistEmail = resp.physiotherapistEmail
        this.openUserEditPrompt = !this.openUserEditPrompt
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
          message: `Deleted ${this.selectedUser.email}`,
          icon: 'info'
        })
        this.$emit('getUsers')
      } catch (err) {
        let errMsg = err
        if (err.response.status === 409) errMsg = err.response.data
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Cannot delete ${this.selectedUser.email}: ${errMsg}`,
          icon: 'warning'
        })
        return
      }
    },
    async editPatient (edited) {
      try {
        const { fullName, dateOfBirth, height, weight, injuries } = edited
        await API.editPatient(fullName, dateOfBirth, height, weight, injuries, this.selectedUser.id)
        this.$q.notify({
          color: 'secondary',
          position: 'top',
          message: 'Updated ' + this.selectedUser.email,
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
          message: 'Patient update failed: ' + errMsg,
          icon: 'report_problem'
        })
      }
    },
    resetForm () {
      this.rows = []
      this.selectedUser = {}
      this.isLoadingUsers = true
      this.openUserDeletePrompt = false
      this.openUserEditPrompt = false
    }
  }
}
</script>


<style scoped>

</style>