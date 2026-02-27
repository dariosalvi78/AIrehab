import * as Types from '../datamodel/modeljdocs.mjs'
import cron from 'node-cron'
import logger from './logger.js'
import poeMA from './poeMotionAnalysis.js'
import mailer from './mailer/mailer.js'
import exercisesCollection from '../DOM/exercisesCollection.js'
import surveysCollection from '../DOM/surveysCollection.js'
import usersCollection from '../DOM/usersCollection.js'

const config = {
    survey_prefix: 'T'
}

cron.schedule('0 9 * * *', async (ctx) => {
    logger.info({ date: ctx.triggeredAt.toISOString(), status: ctx.task.getStatus() }, 'scheduled morning job:')
    try {
        let users = await usersCollection.getUsers(), reminderCount = 0
        for (const u in users) {
            if (users[u] && !users[u].activated) continue
            let isNewSurvey = await isSurveyAvailable(users[u].id, users[u].role)
            if (!isNewSurvey) continue

            let isReminder = await surveysCollection.isReminderTimestamp(users[u].id, isNewSurvey.surveyDate)
            if (isReminder?.sendReminder && isNewSurvey) {
                await mailer.sendPhysiotherapistSurveyAvailable(users[u].email)
                reminderCount++
            }
        }
        logger.info({ surveyRemindersSent: reminderCount, nextJobDate: ctx.task.getNextRun().toISOString() }, 'morning job stats:')
    } catch (err) {
        logger.error({ error: err, status: ctx.task.getStatus() }, 'morning job error:')
    }
})

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
            let survey = undefined, 
                available = undefined, 
                userType = role,
                surveyIndex = undefined

            if (userType == 'physiotherapist') {
                survey = await surveysCollection.isPhysioSurveyAvailable(userID)
                userType = 'test_leader'
                surveyIndex = survey.completed + 1

            } else if (userType == 'patient') {
                survey = await surveysCollection.isPatientSurveyAvailable(userID)
                surveyIndex = survey.currentSurveyIndex   
            }

            if (survey.isAvailable) {
                available = {
                    surveyDate: survey.availableOnTimestamp,
                    currentSurveyID: (config.survey_prefix + surveyIndex),
                    completed: survey.completed,
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
     * Create a new task that will check POE status for a given exercise in intervals.
     * - When POE results are ready, send email reminder to user.
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
            const task = cron.createTask('*/1 * * * *', async () => {
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