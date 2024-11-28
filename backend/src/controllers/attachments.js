
import * as Types from '../datamodel/modeljdocs.mjs'
import exercises from "../DOM/exercisesCollection.js"
import logger from "../utils/logger.js"
import config from '../utils/config.js'
import path from 'path'
import files from '../utils/fileHandler.js'

export default {
    /**
     * Get video for one exercise in physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.params - exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise>}
    */
    getExerciseFile: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID
        try {
            const exercise = await exercises.getOneExerciseByEmail(exerciseID, req.user.email)
            if (!exercise) return res.status(404).send('Exercise does not exist')
            if (!exercise.videoFile) {
                return res.status(400).send('Video with given filename does not exist')
            }

            return res.sendFile(path.join(import.meta.dirname,
                '../../' + config.uploads.base_path + '/session_' + exercise.physiotherapySessionId + '/exercise_' + exercise.id + '/vid_' + exercise.videoFile
            ), (err) => {
                if (err) {
                    logger.error({ status: err.status, exerciseID: exercise.id, file: exercise.videoFile }, 'error sending file to client')
                    return res.sendStatus(err.status)
                }
            })
        } catch (err) {
            logger.error({ error: err }, 'error getting file: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Upload exercise video for POE evaluation
     * @param {Object} req - express request
     * @param {Object} req.params exerciseID
     * @param {Object} req.body uploadedFile
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise["videoFile"]>} video file
     */
    uploadExerciseFile: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID
        try {
            const exercise = await exercises.getExerciseByID(exerciseID)
            if (!exercise) return res.status(404).send('Exercise does not exist')

            if (exercise.videoFile && exercise.endTimestamp) return res.status(400).send('Video has already been uploaded')

            let video = await files.saveVideo(exercise.physiotherapySessionId, exercise.id, req)
            if (!video) return res.sendStatus(500)
            return res.send(video)
        } catch (err) {
            logger.error({ error: err }, 'error uploading attachments: ')
            if (err.httpCode) return res.status(err.httpCode).send(err.reason)
            res.sendStatus(500)
            return
        }
    }
}