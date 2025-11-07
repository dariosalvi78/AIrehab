
import * as Types from '../datamodel/modeljdocs.mjs'
import surveys from "../DOM/surveysCollection.js"
import patient from "../DOM/physiotherapistCollection.js"
import users from "../DOM/usersCollection.js"
import logger from "../utils/logger.js"

export default {
    /**
     * Get all surveys
     * @param {Object} req - express request
     * @param {Object} res - express response
     * @returns {Promise<Array<Types.SurveyAnswer>>}
     */
    getSurveys: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        try {
            const results = await surveys.getSurveys()
            res.send(results)
        } catch (err) {
            logger.error({ error: err }, 'error getting surveys')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Add a new survey for user
     * @param {Object} req - express request
     * @param {Object} req.body - new survey data
     * @param {Object} res - express response
     * @returns {Promise<Types.SurveyAnswer>} added survey
     */
    addNewSurvey: async (req, res) => {
        if (req.user.role === 'admin') return res.sendStatus(403)

        try {
            let surveyData = req.body.newSurveyData, physioID = undefined, patientID = null
            if (!surveyData) return res.sendStatus(400)
            
            if (req.user) {
                let user = await users.getUserByEmail(req.user.email)
                if (!user.activated) return res.sendStatus(403)
                physioID = user.id
            } 
            else if (req.patient) {
                let p = await patient.getOnePatientByID(req.patient.id)
                if (!p.activated) return res.sendStatus(403)
                physioID = p.physiotherapistId
                patientID = p.id
            }            
            const newSurvey = await surveys.createSurvey(physioID, patientID, surveyData.surveyName, surveyData.results)
            logger.info({ data: newSurvey }, 'new survey created: ')

            return res.status(201).json({
                status: 'created', survey: newSurvey
            })
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when creating survey')
            res.sendStatus(500)
            return
        }
    },
}