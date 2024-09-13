
// Module containing object for the current user

/**
 * @typedef {Object} User
 * @property loggedIn
 * @property role
 * @property email
 */
var user = {
  loggedIn: false,
  role: undefined,
  email: undefined
}

const storage = {
  /**
   * @returns {User} User object
   */
  info () {
    let userstr = window.localStorage.getItem('user')
    if (userstr) {
      try {
        return JSON.parse(userstr)
      } catch (err) {
        this.logout()
        return user
      }
    } else {
      this.logout()
      return user
    }
  },


  login (newuser) {
    user.loggedIn = newuser.user.loggedIn
    user.role = newuser.user.role
    user.email = newuser.user.email

    window.localStorage.setItem('user', JSON.stringify(user))
  },

  logout () {
    user = {
      loggedIn: false,
      role: undefined,
      email: undefined,
    }
    window.localStorage.removeItem('user')
    document.cookie = "token=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}

export default storage
