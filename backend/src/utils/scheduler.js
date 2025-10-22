import cron from 'node-cron'
import logger from './logger.js'
import poeMA from './poeMotionAnalysis.js'
import mailer from './mailer.js'
import exercisesCollection from '../DOM/exercisesCollection.js'

export default {

    /**
     * Check POE status for a given exercise.
     * When POE results are ready, send email reminder to user
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