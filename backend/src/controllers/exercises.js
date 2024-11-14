
import * as Types from '../../../datamodel/modeljdocs.mjs'
import exercises from "../DOM/exercisesCollection.js"
import sessions from '../DOM/physiotherapySessionCollection.js'
import poe from "../DOM/poeCollection.js"
import logger from "../utils/logger.js"
import config from '../utils/config.js'
import files from '../utils/fileHandler.js'

export default {

    /**
     * Get all exercises in physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.query sessionID
     * @param {Object} res - express response
     * @returns {Promise<Array<Types.Exercise>>} array with exercises
    */
    getExercises: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let results, sessionID = req.query.sessionID
        try {
            if (req.user.role == 'admin') {
                results = await exercises.getExercises()
            } else if (req.user.role == 'physiotherapist' && sessionID) {
                const isAssignedTo = await sessions.getSessionByID(sessionID, req.user.email)
                if (!isAssignedTo) return res.sendStatus(403)

                let exercise = await exercises.getExercisesBySession(sessionID, req.query.pagination)
                results = {
                    exercises: exercise[0],
                    maxPageNo: exercise[exercise.length - 1][0].maxPage,
                    numOfExercises: exercise[exercise.length - 1][0].numOfExercises
                }
            }
            res.send(results)
            return
        } catch (err) {
            logger.error({ error: err }, 'error getting exercises: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Get one exercise in physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.params - exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise>}
    */
    getExercise: async (req, res) => {
        if (!req.user || !req.params.exerciseID) return res.sendStatus(403)
        let results, exerciseID = req.params.exerciseID
        try {
            if (req.user.role == 'admin') {
                results = await exercises.getExerciseByID(exerciseID)
            } else if (req.user.role == 'physiotherapist') {
                results = await exercises.getOneExerciseByEmail(exerciseID, req.user.email)
                if (!results) return res.status(404).send('Exercise does not exist')
                delete results.physiotherapistEmail
            }
            return res.send(results)
        } catch (err) {
            logger.error({ error: err }, 'error getting exercise: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Add one new exercise for physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.body new exercise data
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise>} added exercise
     */
    addNewExercise: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exercise = req.body
        try {
            if (req.user.role == 'physiotherapist') {
                const sessionAssignedTo = await sessions.getSessionByID(exercise.sessionID, req.user.email)
                if (sessionAssignedTo.id !== exercise.sessionID) return res.sendStatus(403)
            }

            if (!exercise || !exercise.sessionID) return res.status(400).send('Please enter required fields')

            const addedExercise = await exercises.createExercise(exercise.sessionID, exercise)
            delete addedExercise.type
            delete addedExercise.notes
            delete addedExercise.videoFile

            logger.info({ data: addedExercise }, `new exercise created for session: ${exercise.sessionID}`)
            return res.status(201).json({
                status: 'created', data: { exercise: addedExercise }
            })
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when creating exercise: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Delete one exercise in an ongoing physiotherapy session
     * This will also remove POE results & video for exercise
     * @param {Object} req - express request
     * @param {Object} req.body videoFile
     * @param {Object} req.params exerciseID
     * @param {Object} req.query sessionID
     * @param {Object} res - express response
     */
    deleteExercise: async (req, res) => {
        if (!req.user || !req.params.exerciseID) return res.sendStatus(403)
        let videoName = req.body.videoFile, exerciseID = req.params.exerciseID, sessionID = req.query.sessionID
        try {
            if (req.user.role == 'physiotherapist') {
                const sessionAssignedTo = await sessions.getSessionByID(sessionID, req.user.email)
                if (sessionAssignedTo.id !== sessionID) return res.sendStatus(403)
            }

            if (!req.body || !exerciseID || !sessionID) return res.sendStatus(400)

            if (videoName) await files.deleteVideo(sessionID, exerciseID, videoName)
            await poe.deletePOEForExerciseByID(exerciseID)
            await exercises.deleteOneExercise(exerciseID)

            logger.info({ data: { exerciseID } }, 'Deleted exercise permanently')
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error deleting exercise: ')
            res.sendStatus(500)
            return
        }
    },

    // TODO: ADD ADMIN EDIT
    /**
     * Edit one exercise in an ongoing physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.body new exercise data
     * @param {Object} req.params exerciseID
     * @param {Object} res - express response
     */
    editExercise: async (req, res) => {
        if (!req.user || !req.params.exerciseID) return res.sendStatus(403)
        let exercise = req.body, exerciseID = req.params.exerciseID
        try {
            if (!exercise) return res.status(400).send('Please enter required fields')

            const updatedExercise = await exercises.updateOneExercise(exerciseID, exercise)

            logger.info({ data: updatedExercise }, `updated exercise : ${exerciseID}`)
            return res.sendStatus(204)
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when editing exercise: ')
            res.sendStatus(500)
            return
        }
    }
}