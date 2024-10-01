
import * as Types from '../../../datamodel/modeljdocs.mjs'
import poe from "../DOM/poeCollection.js"
import exercises from "../DOM/exercisesCollection.js"
import logger from "../utils/logger.js"
import formidable from 'formidable'
import { mkdir } from 'fs/promises'
import fs from 'node:fs'
import config from '../utils/config.js'

export default {

    /**
     * Get POE for given exercise
     * @param {Object} req - express request
     * @param {Object} req.params sessionID
     * @param {Object} req.params exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.POEEvaluation>} POE with computed data
    */
    getEvaluation: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let sessionID = req.params.sessionID, exerciseID = req.params.exerciseID
        try {
            let results = await poe.getEvaluationFromID(exerciseID, sessionID)
            res.send(results)
            return
        } catch (err) {
            logger.error({ error: err }, 'error getting evaluation: ')
            res.sendStatus(500)
            return
        }
    },

    // TODO: refactoring: create a separate controller for videos / attachments and endpoint should be called /video or /attachment
    // TODO: conseider removing the session ID and query it instead
    /**
     * Send video for evaluation, updates exercise
     * @param {Object} req - express request
     * @param {Object} req.params sessionID
     * @param {Object} req.params exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise["videoFile"]>} video file
     */
    // TODO: rename to sendExercise?
    sendEvaluation: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let sessionID = req.params.sessionID, exerciseID = req.params.exerciseID
        try {
            const exercise = await exercises.getExerciseByID(exerciseID, sessionID)
            if (!exercise) return res.status(404).send('Exercise does not exist')

            // TODO: extract session ID from exercise
            let filename = undefined
            let directory = config.uploads.base_path + '/session_' + sessionID

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

                    filename = file.newFilename + '_' + Date.now() + '.' + 'webm'
                    file.filepath = directory + '/exercise_' + filename
                    // TODO: consider updating the filename and timestamp on the DB at this stage
                })
                form.on('end', async () => {
                    const file_name = await poe.updateExerciseVideo(sessionID, exerciseID, filename)
                    if (file_name) {
                        // TODO: get POE from algorithms in a separate call
                        // TODO: save the POE results in the table in a separate call
                        await poe.sendEvaluation(exerciseID)
                        // TODO: send the POE evaluation back instead of the filename
                        res.send(file_name)
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