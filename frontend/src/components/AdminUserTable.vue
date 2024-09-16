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
          <q-item clickable v-close-popup @click="onRowClick(props.row)">
            <q-item-section avatar>
              <q-avatar icon="person_remove" size="lg"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>Delete</q-item-label>
              <q-item-label caption>Permanently delete {{props.row.email}}</q-item-label>
            </q-item-section>
          </q-item>

          </q-btn-dropdown>
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="openUserPrompt">
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
import API from '../API.js'
import routes from '../router/routeHandler.js'
import storage from '../utils/userStorage.js'
import nicers from '../utils/nicers.js'
import { ref } from 'vue'

export default {
  name: 'AdminUserTable',
  props: { users: Object },
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
      openUserPrompt: false
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
    formatDate(date) {
      return nicers.formattedDate(date)
    },
    formatDateLastLogin(date) {
      return nicers.formattedDateLastLogin(date)
    },
    onRowClick(row) {
      this.selectedUser = row
      this.openUserPrompt = !this.openUserPrompt
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
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: `Cannot delete ${this.selectedUser.email}: ${err}`,
          icon: 'warning'
        })
        return
      }
    },
    resetForm () {
      this.rows = []
      this.selectedUser = {}
      this.isLoadingUsers = true
      this.openUserPrompt = false
    }
  }
}
</script>


<style scoped>

</style>