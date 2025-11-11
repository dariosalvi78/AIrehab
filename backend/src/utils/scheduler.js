import * as Types from '../datamodel/modeljdocs.mjs'
import cron from 'node-cron'
import logger from './logger.js'
import poeMA from './poeMotionAnalysis.js'
import mailer from './mailer.js'
import exercisesCollection from '../DOM/exercisesCollection.js'
import surveysCollection from '../DOM/surveysCollection.js'
import physiotherapistCollection from '../DOM/physiotherapistCollection.js'

export default {
    /**
     * Checks if there is a new survey available
     * @typedef newSurveyAvailable
     * @property {!string} currentSurveyID current survey increments
     * @property {!string} surveysCompleted surveys completed
     * @property {!string} userType type of user
     * @returns {Promise<newSurveyAvailable>} new survey
    */
    isSurveyAvailable: async (userID, role) => {
        return new Promise(async (resolve, reject) => {
            try {
                let surveys = [], available = undefined, surveyPrefix = 'T', userType = role, surveyIsAvailable = false, dateIsSixWeeksApart = undefined
                if (userType == 'patient') {
                    surveys = await surveysCollection.getSurveysByPatientID(userID)
                    const patient = await physiotherapistCollection.getOnePatientByID(userID)
                    let exercises = await exercisesCollection.getExercisesInSessionByEmail(patient.sessionID, patient.physiotherapistEmail)
                    const numOfExercises = exercises.length

                    if (surveys && surveys.length) {
                        const latestSurveyTimestamp = new Date(surveys[0].createdTimestamp)
                        const sixWeeksInMs = 6 * 7 * 24 * 60 * 60 * 1000;
                        dateIsSixWeeksApart = (latestSurveyTimestamp <= Date.now() - sixWeeksInMs)
                        if (
                            (surveys.length === 1 && numOfExercises >= 3) ||
                            (surveys.length === 2 && (dateIsSixWeeksApart && numOfExercises >= 5))
                        ) surveyIsAvailable = true
                    }
                }

                if (surveyIsAvailable || (surveys && !surveys.length)) {
                    const sCount = surveys.length + 1
                    available = {
                        currentSurveyID: (surveyPrefix + sCount),
                        surveysCompleted: surveys.length,
                        userType: userType
                    }
                }
                return resolve(available)
            } catch (err) {
                logger.error({ error: err }, 'error checking for surveys: ')
                return reject(err)
            }
        })
    },
    /**
     * Check POE status for a given exercise.
     * When POE results are ready, send email reminder to user
     * @param {Types.User['email']} userEmail
     * @param {Object} meta additional data sent to email 
     * @param {Types.Exercise['id']} exerciseID 
     * @param {Types.PhysiotherapySession['id']} sessionID 
     * @param {Types.Exercise['videoFile']} videoFile 
    */
    startPOEEvaluationTask: (userEmail, meta, exerciseID, sessionID, videoFile) => {
        /** @type {import('node-cron').ScheduledTask} */
        const task = undefined
        try {
            const task = cron.createTask('*/2 * * * *', async () => {
                const email = userEmail, mailerInfo = meta
                let ongoing = await poeMA.isEvaluationOngoing(sessionID, exerciseID, videoFile)

                const exercise = await exercisesCollection.getExerciseByID(exerciseID)
                if (!exercise) {
                    task.destroy()
                    return logger.info({ id: task.id, exerciseID: exerciseID }, 'exercise not found, quit poe task: ')
                }

                if (ongoing && ongoing.status === 201) {
                    task.destroy()
                    logger.info({ id: task.id, exerciseID: exerciseID, status: ongoing.status }, 'poe task complete: ')
                    await mailer.sendPhysiotherapistPOEResults(email, mailerInfo, sessionID, exerciseID)
                    return
                }
                logger.info({ id: task.id, exerciseID: exerciseID, status: ongoing.status }, 'poe task ongoing: ')
            }, { maxExecutions: 10 })
            task.start()
        } catch (err) {
            logger.error({ error: err }, 'error scheduling poe task: ')
            task.destroy()
            return
        }
    }
}