import * as Types from '../datamodel/modeljdocs.mjs'
import cron from 'node-cron'
import logger from './logger.js'
import poeMA from './poeMotionAnalysis.js'
import mailer from './mailer.js'
import exercisesCollection from '../DOM/exercisesCollection.js'
import surveysCollection from '../DOM/surveysCollection.js'
import physiotherapistCollection from '../DOM/physiotherapistCollection.js'
import usersCollection from '../DOM/usersCollection.js'

const config = {
    survey_prefix: 'T',
    rules: {
        test_leader: [
            (latestSurveyTimestamp) => {
                // 14 days from first survey
                const dateUntilSecondSurvey = (latestSurveyTimestamp <= Date.now() - 14 * 24 * 60 * 60 * 1000)
                return dateUntilSecondSurvey
            },
            (latestSurveyTimestamp) => { 
                // 60 days from second survey
                const dateUntilThirdSurvey = (latestSurveyTimestamp <= Date.now() - 60 * 24 * 60 * 60 * 1000)
                return dateUntilThirdSurvey
            }
        ],
        patient: [
            (numOfExercises) => { return numOfExercises >= 3 },
            (numOfExercises, latestSurveyTimestamp) => {
                const sixWeeksInMs = 6 * 7 * 24 * 60 * 60 * 1000;
                const dateIsSixWeeksApart = (latestSurveyTimestamp <= Date.now() - sixWeeksInMs)
                return (dateIsSixWeeksApart && numOfExercises >= 5)
            }
        ]
    }
}

/**
 * Checks if there is a new survey available
 * @typedef newSurveyAvailable
 * @property {!string} currentSurveyID current survey increments
 * @property {!number} completed surveys completed
 * @property {!string} userType type of user
 * @returns {Promise<newSurveyAvailable>} new survey
*/
const isSurveyAvailable = async (userID, role) => {
    return new Promise(async (resolve, reject) => {
        try {
            let surveys = [], available = undefined, userType = role, surveyIsAvailable = false
            if (userType == 'physiotherapist') {
                surveys = await surveysCollection.getSurveysByPhysioID(userID)
                userType = 'test_leader'
                if (surveys && surveys.length) {
                    const latestSurveyTimestamp = new Date(surveys[0].createdTimestamp).getTime(),
                        rules = config.rules.test_leader
                    for (let i = 0; i < rules.length; i++) {
                        if ((surveys.length - 1) === i && rules[i](latestSurveyTimestamp)) surveyIsAvailable = true
                    }
                }
            } else if (userType == 'patient') {
                surveys = await surveysCollection.getSurveysByPatientID(userID)
                const patient = await physiotherapistCollection.getOnePatientByID(userID)
                if (!patient.sessionID) return resolve()
                let exercises = await exercisesCollection.getExercisesInSessionByEmail(patient.sessionID, patient.physiotherapistEmail)
                const numOfExercises = exercises.length
                if (surveys && surveys.length) {
                    const latestSurveyTimestamp = new Date(surveys[0].createdTimestamp).getTime(),
                        rules = config.rules.patient
                    for (let i = 0; i < rules.length; i++) {
                        if ((surveys.length - 1) === i && rules[i](numOfExercises, latestSurveyTimestamp)) surveyIsAvailable = true
                    }
                }
            }

            if (surveyIsAvailable || (surveys && !surveys.length)) {
                const sCount = surveys.length + 1
                available = {
                    currentSurveyID: (config.survey_prefix + sCount),
                    completed: surveys.length,
                    userType: userType
                }
            }
            return resolve(available)
        } catch (err) {
            logger.error({ error: err }, 'error checking for surveys: ')
            return reject(err)
        }
    })
}

export default {
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
    },
    isSurveyAvailable
}