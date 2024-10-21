
const storage = {
  /**
   * @returns {Boolean} login status
   */
  getLoginStatus () {
    return JSON.parse(window.localStorage.getItem('isLoggedIn'))
  },

  /**
   * set login status in storage
   * @param {Boolean} loggedInStatus 
   */
  setLoginStatus (loggedInStatus) {
    window.localStorage.setItem('isLoggedIn', JSON.stringify(loggedInStatus))
  },

  /**
   * remove login status from storage
   */
  removeLoginStatus () {
    window.localStorage.removeItem('isLoggedIn')
  }
}

export default storage
