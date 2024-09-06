<template>
    <q-markup-table class="q-ma-lg" v-if="users.length">
        <thead>
            <tr>
                <th class="text-left">Email</th>
                <th class="text-right">Role</th>
                <th class="text-right">Created</th>
                <th class="text-right">Last log in</th>
            </tr>
        </thead>
        <tbody v-for="(user, i) in users" :key="i">
          <tr :data-id="user.id">
              <td class="text-left">{{user.email}}</td>
              <td class="text-right">{{user.role}}</td>
              <td class="text-right">{{user.createdTimestamp}}</td>
              <td class="text-right">{{user.lastLoginTimestamp}}</td>
          </tr>
        </tbody>
    </q-markup-table>
    <div v-else>No user found</div>
</template>

<script>
import API from '../API.js'
import routes from '../router/routeHandler.js'
import storage from '../utils/userStorage.js'

export default {
  name: 'AdminUserTable',
  props: { users: Array },
  data () {
    return {
      columns: [],
      rows: [],
      userList: []
    }
  },
  async mounted () { },
  watch: {
    users(newValue) { this.userList = newValue }
  },
  methods: {

  }
}
</script>


<style scoped>

</style>