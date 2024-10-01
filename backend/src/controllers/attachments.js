
import * as Types from '../../../datamodel/modeljdocs.mjs'
import poe from "../DOM/poeCollection.js"
import exercises from "../DOM/exercisesCollection.js"
import logger from "../utils/logger.js"
import formidable from 'formidable'
import { mkdir } from 'fs/promises'
import fs from 'node:fs'
import config from '../utils/config.js'
import path from 'path'

export default {
    /**
     * Get video for one exercise in physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.params - exerciseID
     * @param {Object} req.query videoFilename
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise>}
    */
    getExerciseFile: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID, videoFile = req.query.videoFilename
        try {
            // TODO: add some validation
            const exercise = await exercises.getExerciseByID(exerciseID)
            if (!exercise.videoFile) return res.status(400).send('Video with given filename does not exist')

            res.sendFile(path.join(import.meta.dirname, '../../' + config.uploads.base_path + '/session_' + exercise.physiotherapySessionId + '/exercise_' + exercise.videoFile))
        } catch (err) {
            logger.error({ error: err }, 'error getting file: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Send video for evaluation, updates exercise
     * @param {Object} req - express request
     * @param {Object} req.params exerciseID
     * @param {Object} req.body uploadedFile
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise["videoFile"]>} video file
     */
    sendExerciseFile: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID
        try {
            const exercise = await exercises.getExerciseByID(exerciseID)
            if (!exercise) return res.status(404).send('Exercise does not exist')

            let filename = undefined
            let directory = config.uploads.base_path + '/session_' + exercise.physiotherapySessionId

            if (!fs.existsSync(directory)) {
                await mkdir(directory, { recursive: true })
            }

            if (exercise.videoFile && exercise.endTimestamp) return res.status(400).send('Video has already been uploaded')

            const form = formidable()
            return new Promise(async (resolve, reject) => {
                form.parse(req)
                form.on('error', (err) => {
                    // TODO: delete filename and timestamp if any

                    logger.error({ error: err }, 'Cannot save file: ')
                    res.sendStatus(500)
                    reject()
                    return
                })
                form.on('fileBegin', (formName, file) => {
                    if (!file) return res.sendStatus(500)
                    console.log(file.mimetype.slice(6))
                    filename = file.newFilename + '_' + Date.now() + '.' + file.mimetype.slice(6)
                    file.filepath = directory + '/exercise_' + filename
                    // TODO: consider updating the filename and timestamp on the DB at this stage
                })
                form.on('end', async () => {
                    const file_name = await poe.updateExerciseVideo(exerciseID, filename)
                    if (file_name) {
                        // TODO: get POE from algorithms in a separate call
                        // TODO: save the POE results in the table in a separate call
                        // poe.sendVideoForEvaluation()
                        const poe_results = await poe.updateEvaluationResults(exerciseID)
                        // TODO: send the POE evaluation back instead of the filename
                        res.send(poe_results)
                        resolve()
                        return
                    }
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'error saving POE: ')
            res.sendStatus(500)
            return
        }
    }
}