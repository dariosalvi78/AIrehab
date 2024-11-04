import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import physiotherapist from '../../../src/DOM/physiotherapistCollection.js'
import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import poeCollection from '../../../src/DOM/poeCollection.js'
import users from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import mock from '../../mock_data.js'
import db from '../../testDBTools.js'

describe('POE collection', function () {

    beforeAll(async function () {
        this.exercises = mock.exercises
        this.physiotherapist = mock.physiotherapist
        this.patient = mock.patient
        this.poe = mock.poe
        mock.db.database = 'test_poe'
        config.db = mock.db
        await db.createNewDatabase(config.db)
        await db.connectToDatabase(config.db)
    })

    afterAll(async function () {
        await db.dropDatabase(config.db)
    })

    describe('getEvaluationFromID', function () {
        let patient, therapist, session, exercise, poe_created
        beforeAll(async function () {
            let poe = this.poe
            therapist = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
            patient = await physiotherapist.createPatient({
                fullName: this.patient.names,
                dateOfBirth: new Date().toISOString(),
                height: this.patient.height,
                weight: this.patient.weight,
                injuries: this.patient.injuries
            }, therapist.id)
            session = await sessions.createSession(patient.id)
            exercise = await exercisesCollection.createExercise(session.id, { type: this.exercises[2].type, notes: this.exercises[2].notes })
            poe_created = await poeCollection.updateEvaluationResults(exercise.id, poe.posturalOrientation, poe.score, poe.confidence0, poe.confidence1, poe.confidence2, poe.repetition)
        })

        afterAll(async function () {
            await poeCollection.deletePOEForExerciseByID(exercise.id)
            await exercisesCollection.deleteOneExercise(exercise.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get POE results from exercise using exercise id', async function () {
            let res = await poeCollection.getEvaluationFromID(exercise.id)

            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBeDefined()
            expect(res.exerciseId).toBe(exercise.id)
            expect(res.posturalOrientation).toBe(poe_created.posturalOrientation)
            expect(res.score).toEqual(poe_created.score)
            expect(res.scoreConfidence_0).toEqual(poe_created.scoreConfidence_0)
            expect(res.scoreConfidence_1).toEqual(poe_created.scoreConfidence_1)
            expect(res.scoreConfidence_2).toEqual(poe_created.scoreConfidence_2)
            expect(res.repetition).toEqual(poe_created.repetition)
        })
    })

    describe('updateEvaluationResults', function () {
        let patient, therapist, session, exercise
        beforeAll(async function () {
            therapist = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
            patient = await physiotherapist.createPatient({
                fullName: this.patient.names,
                dateOfBirth: new Date().toISOString(),
                height: this.patient.height,
                weight: this.patient.weight,
                injuries: this.patient.injuries
            }, therapist.id)
            session = await sessions.createSession(patient.id)
            exercise = await exercisesCollection.createExercise(session.id, { type: this.exercises[2].type, notes: this.exercises[2].notes })
        })

        afterAll(async function () {
            await poeCollection.deletePOEForExerciseByID(exercise.id)
            await exercisesCollection.deleteOneExercise(exercise.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can update POE results from exercise using exercise id', async function () {
            let poe = this.poe, res = await poeCollection.getEvaluationFromID(exercise.id)
            expect(res).toBeUndefined()

            res = await poeCollection.updateEvaluationResults(exercise.id, poe.posturalOrientation, poe.score, poe.confidence0, poe.confidence1, poe.confidence2, poe.repetition)
            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBeDefined()
            expect(res.exerciseId).toBeUndefined()
            expect(res.posturalOrientation).toBe(poe.posturalOrientation)
            expect(res.score).toEqual(poe.score)
            expect(res.scoreConfidence_0).toEqual(poe.confidence0)
            expect(res.scoreConfidence_1).toEqual(poe.confidence1)
            expect(res.scoreConfidence_2).toEqual(poe.confidence2)
            expect(res.repetition).toEqual(poe.repetition)
        })
    })

    describe('deletePOEForExerciseByID', function () {
        let patient, therapist, session, exercise, poe_created
        beforeAll(async function () {
            let poe = this.poe
            therapist = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
            patient = await physiotherapist.createPatient({
                fullName: this.patient.names,
                dateOfBirth: new Date().toISOString(),
                height: this.patient.height,
                weight: this.patient.weight,
                injuries: this.patient.injuries
            }, therapist.id)
            session = await sessions.createSession(patient.id)
            exercise = await exercisesCollection.createExercise(session.id, { type: this.exercises[2].type, notes: this.exercises[2].notes })
            poe_created = await poeCollection.updateEvaluationResults(exercise.id, poe.posturalOrientation, poe.score, poe.confidence0, poe.confidence1, poe.confidence2, poe.repetition)
        })

        afterAll(async function () {
            await poeCollection.deletePOEForExerciseByID(exercise.id)
            await exercisesCollection.deleteOneExercise(exercise.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can delete POE results from exercise using exercise id', async function () {
            let res = await poeCollection.getEvaluationFromID(exercise.id)
            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBeDefined()
            expect(res.exerciseId).toBe(exercise.id)

            await poeCollection.deletePOEForExerciseByID(exercise.id)

            res = await poeCollection.getEvaluationFromID(exercise.id)
            expect(res).toBeUndefined()
        })
    })
})