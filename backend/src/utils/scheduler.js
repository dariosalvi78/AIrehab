import cron from 'node-cron'
import logger from './logger.js'
import poeMA from './poeMotionAnalysis.js'
import mailer from './mailer.js'

export default {

    /**
     * Check POE status for a given exercise.
     * When POE results are ready, send email reminder to user
     */
    startPOEEvaluationTask: (userEmail, exerciseType, exerciseID, sessionID, videoFile) => {
        /** @type {import('node-cron').ScheduledTask} */
        const task = undefined
        try {
            const task = cron.createTask('*/2 * * * *', async () => {
                const email = userEmail, type = exerciseType
                const ongoing = await poeMA.isEvaluationOngoing(exerciseID, sessionID, videoFile)

                if (ongoing && ongoing.status === 201) {
                    logger.info({ id: task.id, exerciseID: exerciseID, status: ongoing.status }, 'poe task complete: ')
                    task.destroy()

                    let exerciseType = (await import('../../../frontend/src/utils/types/exerciseTypesEnum.js')).default.typeToAsc(type)
                    await mailer.sendPhysiotherapistPOEResults(email, exerciseType, sessionID, exerciseID)
                    return
                }
                logger.info({ id: task.id, exerciseID: exerciseID, status: ongoing.status }, 'poe task ongoing:  ')
            })
            task.start()
        } catch (err) {
            logger.error({ error: err }, 'error scheduling poe task: ')
            task.destroy()
            return
        }

    }
}