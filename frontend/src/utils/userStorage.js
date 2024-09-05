
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

let userStorage = window.localStorage.getItem('user')
if (userStorage) {
    user = JSON.parse(userStorage)
}

const storage = {
    /**
     * @returns {User} User object
     */
    info() {
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


    login(newuser) {
        user.loggedIn = true
        user.role = newuser.role
        user.email = newuser.email

        window.localStorage.setItem('user', JSON.stringify(user))
    },

    logout() {
        user = {
            loggedIn: false,
            role: undefined,
            email: undefined,
        }
        window.localStorage.removeItem('user')
    }
}

export default storage