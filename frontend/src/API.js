'use strict'

// TODO: add JSDoc datamodel to API
// import * as Types from '../../datamodel/modeljdocs.js'
import axios from 'axios'

/**
 * Prefix for URL
 * @see quasar.config.js -> build:env
 */
const URL_PRE = process.env.API_ENDPOINT

/**
 * API object containing methods for sending/requesting backend data
 */

let API = {
    async login(email, password) {
        let response = await axios.post(URL_PRE + '/login', { email, password })
        return response.data
    },
}

export default API
