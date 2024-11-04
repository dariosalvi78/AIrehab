import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import physiotherapist from '../../../src/DOM/physiotherapistCollection.js'
import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import users from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import mock from '../../mock_data.js'
import db from '../../testDBTools.js'

describe('Exercises collection', function () {

    beforeAll(async function () {
        this.exercises = mock.exercises
        this.physiotherapist = mock.physiotherapist
        this.patient = mock.patient
        mock.db.database = 'test_exercises'
        config.db = mock.db
        await db.createNewDatabase(config.db)
        await db.connectToDatabase(config.db)
    })

    afterAll(async function () {
        await db.dropDatabase(config.db)
    })

    describe('createExercise', function () {
        let patient, therapist, session, exercise_created

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
        })

        afterAll(async function () {
            await exercisesCollection.deleteOneExercise(exercise_created.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can create one exercise for patient', async function () {
            let exercise = this.exercises[0],
            res = await exercisesCollection.createExercise(session.id, { type: exercise.type, notes: exercise.notes })

            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBeDefined()
            expect(res.physiotherapySessionId).toBeDefined()
            expect(res.startTimestamp).toBeDefined()
            expect(res.type).toBe(exercise.type)
            expect(res.notes).toBe(exercise.notes)
            exercise_created = res
        })
    })

    describe('getExercises', function () {
        let patient, therapist, session, exercises = []

        beforeAll(async function () {
            let exercise = this.exercises[0]
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
            for (let i = 0; i < 3; i++) exercises.push(await exercisesCollection.createExercise(session.id, { type: exercise.type, notes: 'some notes ' + i }))
        })

        afterAll(async function () {
            for (let i = 0; i < 3; i++) await exercisesCollection.deleteOneExercise(exercises[i].id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get all exercises, ordered by latest', async function () {
            let exercise = exercises[2], res = await exercisesCollection.getExercises()

            expect(Array.isArray(res)).toEqual(true)
            expect(res.length).toEqual(exercises.length)
            expect(res[0].id).toBe(exercise.id)
            expect(res[0].startTimestamp).toBeDefined()
            expect(res[0].endTimestamp).toBeNull()
            expect(res[0].physiotherapySessionId).toBe(exercise.physiotherapySessionId)
            expect(res[0].type).toBe(exercise.type)
            expect(res[0].videoFile).toBeNull()
            expect(res[0].notes).toBe(exercise.notes)
            expect(res[0].patientName).toBe(this.patient.names)
            expect(res[0].assignedTo).toBe(therapist.email)
        })
    })

    describe('getExerciseByID', function () {
        let patient, therapist, session, exercise_created

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
            exercise_created = await exercisesCollection.createExercise(session.id, { type: this.exercises[0].type, notes: this.exercises[0].notes })
        })

        afterAll(async function () {
            await exercisesCollection.deleteOneExercise(exercise_created.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get one exercise for patient by exercise id', async function () {
            let res = await exercisesCollection.getExerciseByID(exercise_created.id)

            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBe(exercise_created.id)
            expect(res.physiotherapySessionId).toBe(exercise_created.physiotherapySessionId)
            expect(res.startTimestamp).toBeDefined()
            expect(res.endTimestamp).toBeNull()
            expect(res.type).toBe(this.exercises[0].type)
            expect(res.notes).toBe(this.exercises[0].notes)
            expect(res.patientID).toBe(patient.id)
        })
    })

    describe('getOneExerciseByEmail', function () {
        let patient, therapist, therapist_2, session, exercise_created

        beforeAll(async function () {
            therapist = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
            therapist_2 = await users.createUser(
                'different@email.com', 
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
            exercise_created = await exercisesCollection.createExercise(session.id, { type: this.exercises[0].type, notes: this.exercises[0].notes })
        })

        afterAll(async function () {
            await exercisesCollection.deleteOneExercise(exercise_created.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get one exercise assigned to physiotherapist', async function () {
            let res = await exercisesCollection.getOneExerciseByEmail(exercise_created.id, therapist.email)

            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBe(exercise_created.id)
            expect(res.physiotherapySessionId).toBe(exercise_created.physiotherapySessionId)
            expect(res.startTimestamp).toBeDefined()
            expect(res.endTimestamp).toBeNull()
            expect(res.type).toBe(this.exercises[0].type)
            expect(res.notes).toBe(this.exercises[0].notes)
            expect(res.physiotherapistEmail).toBe(therapist.email)
            expect(res.patientID).toBe(patient.id)
        })

        it('cannot get one exercise assigned to another physiotherapist', async function () {
            let res = await exercisesCollection.getOneExerciseByEmail(exercise_created.id, therapist_2.email)

            expect(Array.isArray(res)).toEqual(false)
            expect(res).toBeUndefined()
        })
    })

    describe('getExercisesInSessionByEmail', function () {
        let patient, therapist, therapist_2, session, exercise_created

        beforeAll(async function () {
            therapist = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
            therapist_2 = await users.createUser(
                'different@email.com', 
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
            exercise_created = await exercisesCollection.createExercise(session.id, { type: this.exercises[0].type, notes: this.exercises[0].notes })
        })

        afterAll(async function () {
            await exercisesCollection.deleteOneExercise(exercise_created.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get all exercises in session assigned to physiotherapist', async function () {
            let res = await exercisesCollection.getExercisesInSessionByEmail(session.id, therapist.email)

            expect(Array.isArray(res)).toEqual(true)
            expect(res[0].id).toBe(exercise_created.id)
            expect(res[0].physiotherapySessionId).toBe(exercise_created.physiotherapySessionId)
            expect(res[0].startTimestamp).toBeDefined()
            expect(res[0].endTimestamp).toBeNull()
            expect(res[0].type).toBe(this.exercises[0].type)
            expect(res[0].notes).toBe(this.exercises[0].notes)
        })

        it('cannot get exercises in session assigned to another physiotherapist', async function () {
            let res = await exercisesCollection.getExercisesInSessionByEmail(session.id, therapist_2.email)

            expect(Array.isArray(res)).toEqual(true)
            expect(res.length).toBe(0)
        })
    })

    describe('getExercisesBySession', function () {
        let patient, therapist, session, exercises = []

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
            for (let i = 0; i < this.exercises.length; i++) exercises.push(await exercisesCollection.createExercise(session.id, { type: this.exercises[i].type, notes: this.exercises[i].notes }))
        })

        afterAll(async function () {
            for (let i = 0; i < this.exercises.length; i++)  await exercisesCollection.deleteOneExercise(exercises[i].id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get all exercises for a specific physiotherapy session', async function () {
            let res = await exercisesCollection.getExercisesBySession(session.id, { pageNo: 1, limit: 5, sortOrder: 'ASC' })

            expect(Array.isArray(res)).toEqual(true)
            expect(res[0].length).toEqual(exercises.length)
            expect(res[1][0].maxPage).toEqual(1)
            expect(res[1][0].numOfExercises).toEqual(exercises.length)
            for (const exercise in res[0]) {
                expect(res[0][exercise].id).toBe(exercises[exercise].id)
                expect(res[0][exercise].startTimestamp).toBeDefined()
                expect(res[0][exercise].endTimestamp).toBeNull()
                expect(res[0][exercise].physiotherapySessionId).toBe(exercises[exercise].physiotherapySessionId)
                expect(res[0][exercise].videoFile).toBeNull()
                expect(res[0][exercise].type).toBe(exercises[exercise].type)
                expect(res[0][exercise].notes).toBe(exercises[exercise].notes)
            }
        })
    })

    describe('deleteOneExercise', function () {
        let patient, therapist, session, exercise_created

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
            exercise_created = await exercisesCollection.createExercise(session.id, { type: this.exercises[2].type, notes: this.exercises[2].notes })
        })

        afterAll(async function () {
            await exercisesCollection.deleteOneExercise(exercise_created.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can delete one exercise with id', async function () {
            let res = await exercisesCollection.getExerciseByID(exercise_created.id)
            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBe(exercise_created.id)
            expect(res.physiotherapySessionId).toBe(exercise_created.physiotherapySessionId)
            expect(res.patientID).toBe(patient.id)
            
            res = await exercisesCollection.deleteOneExercise(exercise_created.id)
            expect(res.rowsAffected).toContain(1)

            res = await exercisesCollection.getExerciseByID(exercise_created.id)
            expect(res).toBeUndefined()
        })
    })

    describe('updateExerciseVideo', function () {
        let patient, therapist, session, exercise_created, videoName = 'newVideo.mp4'

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
            exercise_created = await exercisesCollection.createExercise(session.id, { type: this.exercises[2].type, notes: this.exercises[2].notes })
        })

        afterAll(async function () {
            await exercisesCollection.deleteOneExercise(exercise_created.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can update finished exercise with video details given exercise id', async function () {
            let res = await exercisesCollection.getExerciseByID(exercise_created.id)
            expect(res.id).toBe(exercise_created.id)
            expect(res.startTimestamp).toBeDefined()
            expect(res.endTimestamp).toBeNull()
            expect(res.videoFile).toBeNull()

            res = await exercisesCollection.updateExerciseVideo(exercise_created.id, { fileName: `'${videoName}'`, endTimestamp: 'CURRENT_TIMESTAMP' })
            expect(Array.isArray(res)).toEqual(false)
            expect(res.videoFile).toBeDefined()
            expect(res.endTimestamp).toBeDefined()

            res = await exercisesCollection.getExerciseByID(exercise_created.id)
            expect(res.id).toBe(exercise_created.id)
            expect(res.startTimestamp).toBeDefined()
            expect(res.endTimestamp.toISOString().slice(0, 10)).toBe(new Date().toISOString().slice(0, 10))
            expect(res.videoFile).toBe(videoName)
        })
    })

    describe('updateOneExercise', function () {
        let patient, therapist, session, exercise_created,
            updatedExercise = { type: 'singleLeggedSquatRight', notes: 'updated exercise' }
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
            exercise_created = await exercisesCollection.createExercise(session.id, { type: this.exercises[2].type, notes: this.exercises[2].notes })
        })

        afterAll(async function () {
            await exercisesCollection.deleteOneExercise(exercise_created.id)
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can update ongoing exercise given exercise id', async function () {
            let res = await exercisesCollection.getExerciseByID(exercise_created.id)
            expect(res.id).toBe(exercise_created.id)
            expect(res.type).toBe(this.exercises[2].type)
            expect(res.notes).toBe(this.exercises[2].notes)

            res = await exercisesCollection.updateOneExercise(exercise_created.id, updatedExercise)
            expect(Array.isArray(res)).toEqual(false)
            expect(res.type).toBe(updatedExercise.type)
            expect(res.notes).toBeDefined(updatedExercise.notes)

            res = await exercisesCollection.getExerciseByID(exercise_created.id)
            expect(res.id).toBe(exercise_created.id)
            expect(res.type).toBe(updatedExercise.type)
            expect(res.notes).toBeDefined(updatedExercise.notes)
            expect(res.endTimestamp).toBeNull()
        })
    })
})