
import * as Types from '../../../datamodel/modeljdocs.mjs'
import exercises from "../DOM/exercisesCollection.js"
import physiotherapist from "../DOM/physiotherapistCollection.js"
import logger from "../utils/logger.js"

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
                let user = await physiotherapist.getOneTherapistByEmail(req.user.email)
                delete user.hashedPassword
                delete user.email

                results = await exercises.getExercisesBySession(sessionID, user.id)
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
     * @param {Object} req.query sessionID
     * @param {Object} res - express response
     * @returns {Promise<Types.Exercise>}
    */
    getExercise: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID, sessionID = req.query.sessionID
        try {
            const exercise = await exercises.getExerciseByID(exerciseID, sessionID)
            return res.send(exercise)
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
            if (!exercise || !exercise.sessionID) {
                return res.status(400).send('Please enter required fields')
            }

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

    // TODO: delete attachments/uploads associated with exercise
    /**
     * Delete one exercise in an ongoing physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.params exerciseID
     * @param {Object} req.body sessionID
     * @param {Object} res - express response
     */
    deleteExercise: async (req, res) => {
        if (!req.user || !req.params.exerciseID) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID, sessionID = req.body.sessionID
        try {
            await exercises.deleteOneExercise(exerciseID, sessionID)
            logger.info({ data: { exerciseID } }, 'Deleted exercise permanently')
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error deleting exercise: ')
            res.sendStatus(500)
            return
        }
    },
}