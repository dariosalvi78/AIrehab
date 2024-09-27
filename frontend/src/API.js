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

    async logout() {
        await axios.post(URL_PRE + '/logout')
    },

    async getUsers() {
        let response = await axios.get(URL_PRE + '/users')
        return response.data
    },

    async getUser(userID) {
        let response = await axios.get(URL_PRE + '/users' + userID, {})
        return response.data
    },

    async addUser(role, email, password) {
        let response = await axios.post(URL_PRE + '/users', { role, email, password })
        return response.data
    },

    async deleteUser(userID) {
        let response = await axios.delete(URL_PRE + '/users/' + userID, {})
        return response.data
    },

    async getPatients(pagination) {
        let response = await axios.get(URL_PRE + '/patients', { params: { pagination: pagination } })
        return response.data
    },

    async getPatient(patientID) {
        let response = await axios.get(URL_PRE + '/patients/' + patientID)
        return response.data
    },

    async addPatient(fullName, dateOfBirth, height, weight, injuries, physiotherapistEmail) {
        let response = await axios.post(URL_PRE + '/patients', { fullName, dateOfBirth, height, weight, injuries }, { params: { physiotherapistEmail } })
        return response.data
    },

    async deletePatient(patientID, physiotherapistId) {
        let response = await axios.delete(URL_PRE + '/patients/' + patientID, { data: { physiotherapistID: physiotherapistId } })
        return response.data
    },

    async editPatient(fullName, dateOfBirth, height, weight, injuries, patientID) {
        let response = await axios.put(URL_PRE + '/patients/' + patientID, { fullName, dateOfBirth, height, weight, injuries })
        return response.data
    },

    async getSessions() {
        let response = await axios.get(URL_PRE + '/sessions', { })
        return response.data
    },

    async getSession(sessionID) {
        let response = await axios.get(URL_PRE + '/sessions/' + sessionID, { })
        return response.data
    },

    async addSession(patientID) {
        let response = await axios.post(URL_PRE + '/sessions', { }, { params: { patientID } })
        return response.data
    },

    async deleteSession(sessionID) {
        let response = await axios.delete(URL_PRE + '/sessions/' + sessionID, {})
        return response.data
    },

    async getExercises(sessionID) {
        let response = await axios.get(URL_PRE + '/exercises', { params: { sessionID } })
        return response.data
    },

    async getExercise(sessionID, exerciseID) {
        let response = await axios.get(URL_PRE + '/exercises/' + exerciseID, { params: { sessionID } })
        return response.data
    },

    async addExercise(sessionID, startTimestamp, endTimestamp, type, notes, videoFile) {
        let response = await axios.post(URL_PRE + '/exercises/', { sessionID, startTimestamp, endTimestamp, type, notes, videoFile })
        return response.data
    },

    async deleteExercise(exerciseID, sessionID, videoFile) {
        let response = await axios.delete(URL_PRE + '/exercises/' + exerciseID, { data: { videoFile }, params: { sessionID } })
        return response.data
    },

    async getPOE(exerciseID, sessionID) {
        let response = await axios.get(URL_PRE + '/poe/' + sessionID + '/' + exerciseID, { })
        return response.data
    },

    async sendPOE(uploadedFile, exerciseID, sessionID) {
        let response = await axios.post(URL_PRE + '/poe/' + sessionID + '/' + exerciseID, uploadedFile, { headers: { 'Content-Type': 'multipart/form-data' } })
        return response.data
    }
}

export default API
