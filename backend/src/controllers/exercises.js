
import collections from "../DOM/collections.js"
import logger from "../utils/logger.js"

export default {

    getExercises: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exercises, sessionID = req.query.sessionID
        try {
            if (req.user.role == 'admin') {
                exercises = await collections.exercises.getExercises()
            } else if (req.user.role == 'physiotherapist' && sessionID) {
                let physiotherapist = await collections.physiotherapist.getOneTherapistByEmail(req.user.email)
                delete physiotherapist.hashedPassword
                delete physiotherapist.email

                exercises = await collections.exercises.getExercisesBySession(sessionID, physiotherapist.id)
            }
            res.send(exercises)
            return
        } catch (err) {
            logger.error({ error: err }, 'error getting exercises: ')
            res.sendStatus(500)
            return
        }
    },

    addNewExercise: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exercise = req.body
        try {
            if (!exercise || !exercise.startTimestamp || !exercise.sessionID) {
                return res.status(400).send('Please enter required fields')
            }

            const addedExercise = await collections.exercises.createExercise(exercise.sessionID, exercise)
            delete addedExercise.type
            delete addedExercise.notes
            delete addedExercise.videoFile

            logger.info({ data: addedExercise }, `new exercise created for session: ${exercise.sessionID}`)
            return res.status(201).json({
                status: 'created', data: { session: addedExercise }
            })
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when creating exercise: ')
            res.sendStatus(500)
            return
        }
    },

    // TODO: delete attachments/uploads associated with exercise
    deleteExercise: async (req, res) => {
        if (!req.user || !req.params.exerciseID) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID, sessionID = req.body.sessionID
        try {
            await collections.exercises.deleteOneExercise(exerciseID, sessionID)
            logger.info({ data: { exerciseID } }, 'Deleted exercise permanently')
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error deleting exercise: ')
            res.sendStatus(500)
            return
        }
    },
}