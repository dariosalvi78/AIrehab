'use strict'

// TODO: add JSDoc datamodel to API
// import * as Types from '../../datamodel/modeljdocs.js'
import { default as instance } from 'axios'

/**
 * Prefix for URL
 * @see quasar.config.js -> build:env
 */
const URL_PRE = process.env.API_ENDPOINT

export const axios = instance.create({
  baseURL: URL_PRE,
  headers: {
    common: {
      "Accept": 'application/json',
      "x-poe-api": 1,
      "x-poe-app-version": process.env.APP_VERSION
    }
  }
})

/**
 * API object containing methods for sending/requesting backend data
 */

let API = {
  async login (email, password) {
    let response = await axios.post('/login', { email, password })
    return response.data
  },

  async logout () {
    await axios.post('/logout')
  },

  async getInfo () {
    let response = await axios.get('/info')
    return response.data
  },

  async getUsers () {
    let response = await axios.get('/users')
    return response.data
  },

  async getUser (userID) {
    let response = await axios.get('/users' + userID, {})
    return response.data
  },

  async addUser (role, email, password) {
    let response = await axios.post('/users', { role, email, password })
    return response.data
  },

  async deleteUser (userID) {
    let response = await axios.delete('/users/' + userID, {})
    return response.data
  },

  async updateUserActivation (updatedStatus) {
    let response = await axios.put('/users/activate', { updatedStatus })
    return response.data
  },

  async getPatients (pagination) {
    let response = await axios.get('/patients', { params: { pagination: pagination } })
    return response.data
  },

  async getPatient (patientID) {
    let response = await axios.get('/patients/' + patientID)
    return response.data
  },

  async addPatient (fullName, dateOfBirth, height, weight, injuries, physiotherapistEmail, isTestPatient) {
    let response = await axios.post('/patients', { fullName, dateOfBirth, height, weight, injuries: { description: injuries.description, injuredSide: injuries.side, injuredBodyPart: injuries.bodyPart }, isTestPatient }, { params: { physiotherapistEmail } })
    return response.data
  },

  async deletePatient (patientID, physiotherapistId) {
    let response = await axios.delete('/patients/' + patientID, { data: { physiotherapistID: physiotherapistId } })
    return response.data
  },

  async editPatient (fullName, dateOfBirth, height, weight, injuries, patientID, activationStatus) {
    let response = await axios.put('/patients/' + patientID, { fullName, dateOfBirth, height, weight, injuries: { description: injuries.description, injuredSide: injuries.side, injuredBodyPart: injuries.bodyPart } }, { params: { newStatus: activationStatus } })
    return response.data
  },
  
  async updatePatientActivation (patientID, secret) {
    let response = await axios.post('/patients/' + patientID + '/activate', {}, { params: { secret: secret } })
    return response.data
  },

  async getPatientInfo (patientID, secret) {
    let response = await axios.get('/patient/' + patientID + '/info', { params: { secret: secret } })
    return response.data
  },

  async sendPatientConsentEmail (patientEmail, patientID, secret) {
    let response = await axios.post('/email/consent', { patientEmail, patientID }, { params: { secret: secret } })
    return response.data
  },

  async getSessions (pagination) {
    let response = await axios.get('/sessions', { params: { pagination: pagination } })
    return response.data
  },

  async getSession (sessionID) {
    let response = await axios.get('/sessions/' + sessionID, {})
    return response.data
  },

  async addSession (patientID) {
    let response = await axios.post('/sessions', {}, { params: { patientID } })
    return response.data
  },

  async deleteSession (sessionID) {
    let response = await axios.delete('/sessions/' + sessionID, {})
    return response.data
  },

  async getExercises (sessionID, pagination) {
    let response = await axios.get('/exercises', { params: { sessionID, pagination: pagination } })
    return response.data
  },

  async getExercise (exerciseID) {
    let response = await axios.get('/exercises/' + exerciseID, {})
    return response.data
  },

  async addExercise (sessionID, startTimestamp, endTimestamp, type, notes, videoFile) {
    let response = await axios.post('/exercises/', { sessionID, startTimestamp, endTimestamp, type, notes, videoFile })
    return response.data
  },

  async deleteExercise (exerciseID, sessionID, videoFile) {
    let response = await axios.delete('/exercises/' + exerciseID, { data: { videoFile }, params: { sessionID } })
    return response.data
  },

  async editExercise (exerciseID, type, notes, videoFile) {
    let response = await axios.put('/exercises/' + exerciseID, { type, notes, videoFile })
    return response.data
  },

  async getPOE (exerciseID) {
    let response = await axios.get('/poe/' + exerciseID, {})
    return response.data
  },

  async sendPOE (metaInfo, exerciseID) {
    let response = await axios.post('/poe/' + exerciseID, { metaInfo })
    return response.data
  },

  async uploadFile (uploadedFile, exerciseID) {
    let response = await axios.post('/attachments/' + exerciseID, uploadedFile, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  },

  async getUploadFile (exerciseID) {
    let response = await axios.get('/attachments/' + exerciseID, { headers: { "Accept": 'video/*;charset=UTF-8' }, responseType: 'blob' })
    return response.data
  },

  async sendEmail (email, subject, content) {
    let response = await axios.post('/email/', { email, subject, content })
    return response.data
  },

  async sendPasswordResetEmail (email) {
    let response = await axios.post('/email/resetpassword', { email })
    return response.data
  },

  async passwordReset (newPassword, token) {
    let response = await axios.post('/resetpassword', { newPassword, token })
    return response.data
  },

  async getSurveys () {
    let response = await axios.get('/surveys')
    return response.data
  },

  async addSurvey (newSurveyData) {
    let response = await axios.post('/surveys', { newSurveyData })
    return response.data
  },

  async downloadSurveyData () {
    let response = await axios.get('/surveys/download')
    return response.data
  },
}

export default API
