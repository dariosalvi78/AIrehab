import * as Types from '../datamodel/modeljdocs.mjs'
import cron from 'node-cron'
import logger from './logger.js'
import poeMA from './poeMotionAnalysis.js'
import mailer from './mailer/mailer.js'
import exercisesCollection from '../DOM/exercisesCollection.js'
import surveysCollection from '../DOM/surveysCollection.js'
import physiotherapistCollection from '../DOM/physiotherapistCollection.js'
import usersCollection from '../DOM/usersCollection.js'

const config = {
    survey_prefix: 'T',
    isReminderTimestamp: (latestSurveyTimestamp, surveysCompleted, today = new Date()) => {
        if (surveysCompleted < 1 || !latestSurveyTimestamp) return false
        const start = new Date(latestSurveyTimestamp),
            numOfRemindersToSend = 2,
            daysApart = 3

        for (let i = 1; i <= numOfRemindersToSend; i++) {
            const targetDate = new Date(start)
            targetDate.setDate(start.getDate() + i * daysApart)
            if (today.toDateString() === targetDate.toDateString()) return true
        }
    },
    rules: {
        test_leader: [
            (latestSurveyTimestamp) => {
                // 14 days from first survey
                let timestamp = 14 * 24 * 60 * 60 * 1000
                const dateUntilSecondSurvey = (latestSurveyTimestamp <= Date.now() - timestamp)
                return { isAvailable: dateUntilSecondSurvey, becameAvailableOn: new Date(latestSurveyTimestamp + timestamp)}
            },
            (latestSurveyTimestamp) => { 
                // 60 days from second survey
                let timestamp = 14 * 24 * 60 * 60 * 1000
                const dateUntilThirdSurvey = (latestSurveyTimestamp <= Date.now() - timestamp)
                return { isAvailable: dateUntilThirdSurvey, becameAvailableOn: new Date(latestSurveyTimestamp + timestamp) }
            }
        ],
        patient: [
            (numOfExercises, latestSurveyTimestamp) => {
                return {
                    isAvailable: numOfExercises >= 3,
                    becameAvailableOn: new Date(latestSurveyTimestamp)
                }
            },
            (numOfExercises, latestSurveyTimestamp) => {
                const sixWeeksInMs = 6 * 7 * 24 * 60 * 60 * 1000;
                const dateIsSixWeeksApart = (latestSurveyTimestamp <= Date.now() - sixWeeksInMs)
                return {
                    isAvailable: (dateIsSixWeeksApart && numOfExercises >= 5),
                    becameAvailableOn: new Date(latestSurveyTimestamp + sixWeeksInMs)
                }
            }
        ]
    }
}

cron.schedule('0 9 * * *', async (ctx) => {
    logger.info({ date: ctx.triggeredAt.toISOString(), status: ctx.task.getStatus() }, 'scheduled morning job:')
    try {
        let users = await usersCollection.getUsers(), reminderCount = 0
        for (const u in users) {
            if (users[u] && !users[u].activated) continue
            let isNewSurvey = await isSurveyAvailable(users[u].id, users[u].role)
            if (isNewSurvey && config.isReminderTimestamp(isNewSurvey.surveyDate, isNewSurvey.completed)) {
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
            let surveys = [], available = undefined, userType = role, surveyIsAvailable = false, latestSurveyTimestamp = undefined
            if (userType == 'physiotherapist') {
                surveys = await surveysCollection.getSurveysByPhysioID(userID)
                userType = 'test_leader'
                if (surveys && surveys.length) {
                    latestSurveyTimestamp = new Date(surveys[0].createdTimestamp).getTime()
                    const rules = config.rules.test_leader
                    for (let i = 0; i < rules.length; i++) {
                        let sRules = rules[i](latestSurveyTimestamp)
                        if ((surveys.length - 1) === i && sRules.isAvailable) {
                            surveyIsAvailable = sRules.isAvailable
                            latestSurveyTimestamp = sRules.becameAvailableOn
                        }
                    }
                }
            } else if (userType == 'patient') {
                surveys = await surveysCollection.getSurveysByPatientID(userID)
                const patient = await physiotherapistCollection.getOnePatientByID(userID)
                if (!patient.sessionID) return resolve()
                let exercises = await exercisesCollection.getExercisesInSessionByEmail(patient.sessionID, patient.physiotherapistEmail)
                const numOfExercises = exercises.length
                if (surveys && surveys.length) {
                    latestSurveyTimestamp = new Date(surveys[0].createdTimestamp).getTime()
                    const rules = config.rules.patient
                    for (let i = 0; i < rules.length; i++) {
                        let sRules = rules[i](numOfExercises, latestSurveyTimestamp)
                        if ((surveys.length - 1) === i && sRules.isAvailable) {
                            surveyIsAvailable = sRules.isAvailable
                            latestSurveyTimestamp = sRules.becameAvailableOn
                        }
                    }
                }
            }

            if (surveyIsAvailable || (surveys && !surveys.length)) {
                const sCount = surveys.length + 1
                available = {
                    surveyDate: latestSurveyTimestamp,
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