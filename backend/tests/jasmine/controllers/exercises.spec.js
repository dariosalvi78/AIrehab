import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import poeCollection from '../../../src/DOM/poeCollection.js'
import exercises from '../../../src/controllers/exercises.js'
import mock from '../../mock_data.js'
import fileHandler from '../../../src/utils/fileHandler.js'
import physiotherapistCollection from '../../../src/DOM/physiotherapistCollection.js'
import usersCollection from '../../../src/DOM/usersCollection.js'

beforeAll(function () {
    this.physiotherapist = mock.physiotherapist
    this.patient = mock.patient
    this.sessions = mock.sessions
    this.exercises = JSON.parse(JSON.stringify(mock.exercises))
})

describe('getExercises access:', function () {

    it('requires query from physiotherapist to get exercises', async function () {
        spyOn(exercisesCollection, 'getExercisesBySession').and.returnValue(this.exercises)
        await exercises.getExercises({
            user: this.physiotherapist,
            query: { sessionID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(exercisesCollection.getExercisesBySession).not.toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can not retrieve non assigned exercises', async function () {
        let therapist = this.physiotherapist, sessionID = this.sessions[0].sessionID
        spyOn(sessions, 'getSessionByID').and.returnValue(undefined)
        spyOn(exercisesCollection, 'getExercisesBySession')
        await exercises.getExercises({
            user: therapist,
            query: { sessionID }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(sessions.getSessionByID).toHaveBeenCalledWith(sessionID, therapist.email)
                expect(exercisesCollection.getExercisesBySession).not.toHaveBeenCalled()
            }
        })
    })
    it('admin can get all exercises', async function () {
        spyOn(exercisesCollection, 'getExercises').and.returnValue(this.exercises)
        await exercises.getExercises({
            user: { role: 'admin' },
            query: { sessionID: undefined }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Array)
                expect(exercisesCollection.getExercises).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can get all own exercises', async function () {
        let therapist = this.physiotherapist, sessionID = this.sessions[0].sessionID, _exercises = JSON.parse(JSON.stringify(this.exercises))
        spyOn(exercisesCollection, 'getExercisesBySession').and.returnValue([_exercises, [{ maxPage: 1, numOfExercises: _exercises.length }]])
        spyOn(sessions, 'getSessionByID').and.returnValue(this.sessions[0])
        await exercises.getExercises({
            user: therapist,
            query: { sessionID, pagination: {} }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(data.maxPageNo).toBeDefined()
                expect(data.numOfExercises).toBeDefined()
                expect(sessions.getSessionByID).toHaveBeenCalledWith(sessionID, therapist.email)
                expect(exercisesCollection.getExercisesBySession).toHaveBeenCalled()
            }
        })
    })
    it('patient can get all own exercises', async function () {
        let patient = this.patient, physio = this.physiotherapist, _session = {sessionID: 1, patientId: patient.id}, _exercises = JSON.parse(JSON.stringify(this.exercises))
        spyOn(usersCollection, 'getOneUser').and.returnValue(physio)
        spyOn(exercisesCollection, 'getExercisesBySession').and.returnValue([_exercises, [{ maxPage: 1, numOfExercises: _exercises.length }]])
        spyOn(sessions, 'getSessionByID').and.returnValue(_session)
        spyOn(poeCollection, 'getEvaluationsFromID')
        await exercises.getExercises({
            patient: {...patient, physiotherapistId: physio.id},
            query: { sessionID: _session.sessionID, pagination: {} }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(data.exercises[0].type).toBeDefined()
                expect(data.exercises[0].poe).toBeInstanceOf(Array)
                expect(data.maxPageNo).toBeDefined()
                expect(data.numOfExercises).toBeDefined()
                expect(sessions.getSessionByID).toHaveBeenCalledWith(_session.sessionID, physio.email)
                expect(usersCollection.getOneUser).toHaveBeenCalled()
                expect(exercisesCollection.getExercisesBySession).toHaveBeenCalled()
            }
        })
    })
})

describe('getExercise access:', function () {
    it('get exercise requires authentication', async function () {
        await exercises.getExercise({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('requires params to get one exercise', async function () {
        spyOn(exercisesCollection, 'getExerciseByID')
        await exercises.getExercise({
            user: this.physiotherapist,
            params: { exerciseID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(exercisesCollection.getExerciseByID).not.toHaveBeenCalled()
            }
        })
    })
    it('generic error for unknown exercise id', async function () {
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(undefined)
        await exercises.getExercise({
            user: { role: 'admin' },
            params: { exerciseID: 3 }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist cannot get one non assigned exercise', async function () {
        let therapist = this.physiotherapist, _exercise = this.exercises[0]
        _exercise.physiotherapistEmail = 'different@email.com'
        spyOn(exercisesCollection, 'getOneExerciseByEmail').and.returnValue(undefined)
        await exercises.getExercise({
            user: therapist,
            params: { exerciseID: _exercise.id }
        }, {
            status(status) {
                expect(status).toBe(404)
                return this
            },
            send(data) {
                expect(data).toBeDefined()
                expect(exercisesCollection.getOneExerciseByEmail).toHaveBeenCalledWith(_exercise.id, therapist.email)
            }
        })
    })
    it('admin can get one exercise', async function () {
        let exerciseID = this.exercises[0].id
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(this.exercises[0])
        await exercises.getExercise({
            user: { role: 'admin' },
            params: { exerciseID }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exerciseID)
            }
        })
    })
    it('physiotherapist can get one assigned exercise', async function () {
        let therapist = this.physiotherapist, _exercise = this.exercises[0]
        _exercise.physiotherapistEmail = therapist.email
        spyOn(exercisesCollection, 'getOneExerciseByEmail').and.returnValue(_exercise)
        await exercises.getExercise({
            user: therapist,
            params: { exerciseID: _exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(data.physiotherapistEmail).not.toContain(therapist.email)
                expect(exercisesCollection.getOneExerciseByEmail).toHaveBeenCalledWith(_exercise.id, therapist.email)
                delete _exercise.physiotherapistEmail
            }
        })
    })
})

describe('addNewExercise access:', function () {
    it('creating exercise requires authentication', async function () {
        await exercises.addNewExercise({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('error on missing data when creating exercise', async function () {
        spyOn(exercisesCollection, 'createExercise')
        await exercises.addNewExercise({
            user: { role: 'admin' },
            body: { type: 'test', sessionID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(400)
                expect(exercisesCollection.createExercise).not.toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist cannot create exercise for non assigned patients', async function () {
        let therapist = this.physiotherapist, _session = this.sessions[0]
        spyOn(exercisesCollection, 'createExercise')
        spyOn(sessions, 'getSessionByID').and.returnValue({ id: 2 })
        await exercises.addNewExercise({
            user: therapist,
            body: { ...this.exercises[0], sessionID: _session.sessionID }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(sessions.getSessionByID).toHaveBeenCalledWith(_session.sessionID, therapist.email)
                expect(exercisesCollection.createExercise).not.toHaveBeenCalled()
            }
        })
    })
    it('admin can create new exercise', async function () {
        let _session = this.sessions[0], exercise = JSON.parse(JSON.stringify(this.exercises[0]))
        spyOn(exercisesCollection, 'createExercise').and.returnValue(exercise)
        spyOn(sessions, 'getSessionByID')
        await exercises.addNewExercise({
            user: { role: 'admin' },
            body: { ...exercise, sessionID: _session.sessionID }
        }, {
            status(status) {
                expect(status).toBe(201)
                return this
            },
            json(created) {
                expect(created.status).toBe('created')
                expect(created.data.exercise).toBeDefined()
                expect(created.data.exercise.type).not.toBeDefined()
                expect(created.data.exercise.notes).not.toBeDefined()
                expect(created.data.exercise.videoFile).not.toBeDefined()
                expect(sessions.getSessionByID).not.toHaveBeenCalled()
                expect(exercisesCollection.createExercise).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can create exercise for own patients', async function () {
        let therapist = this.physiotherapist, _session = this.sessions[0], exercise = JSON.parse(JSON.stringify(this.exercises[0]))
        spyOn(exercisesCollection, 'createExercise').and.returnValue(exercise)
        spyOn(sessions, 'getSessionByID').and.returnValue({ id: _session.sessionID, activated: true })
        await exercises.addNewExercise({
            user: therapist,
            body: { ...exercise, sessionID: _session.sessionID }
        }, {
            status(status) {
                expect(status).toBe(201)
                return this
            },
            json(created) {
                expect(created.status).toBe('created')
                expect(created.data.exercise).toBeDefined()
                expect(created.data.exercise.type).not.toBeDefined()
                expect(created.data.exercise.notes).not.toBeDefined()
                expect(created.data.exercise.videoFile).not.toBeDefined()
                expect(sessions.getSessionByID).toHaveBeenCalled()
                expect(exercisesCollection.createExercise).toHaveBeenCalled()
            }
        })
    })
    it('cant create exercise if patient not activated', async function () {
        let therapist = this.physiotherapist, _session = this.sessions[0]
        spyOn(exercisesCollection, 'createExercise')
        spyOn(sessions, 'getSessionByID').and.returnValue({ id: _session.sessionID, activated: false })
        await exercises.addNewExercise({
            user: therapist,
            body: { ...this.exercises[0], sessionID: _session.sessionID }
        }, {
            sendStatus(status) {
                expect(status).toBe(400)
                expect(sessions.getSessionByID).toHaveBeenCalled()
                expect(exercisesCollection.createExercise).not.toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist needs to consent to create exercise', async function () {
        let therapist = this.physiotherapist, _session = this.sessions[0]
        spyOn(exercisesCollection, 'createExercise')
        spyOn(sessions, 'getSessionByID')
        await exercises.addNewExercise({
            user: { ...therapist, activated: false },
            body: { ...this.exercises[0], sessionID: _session.sessionID }
        }, {
            status(status) {
                expect(status).toBe(403)
                return this
            },
            send(data) {
                expect(data.activated).toBe(false)
                expect(sessions.getSessionByID).not.toHaveBeenCalled()
                expect(exercisesCollection.createExercise).not.toHaveBeenCalled()
            }
        })
    })
})

describe('deleteExercise access:', function () {
    it('delete exercise requires authentication', async function () {
        await exercises.deleteExercise({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('delete exercise requires params exercise id', async function () {
        await exercises.deleteExercise({ 
            user: { role: 'admin' },
            params: { exerciseID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('admin can delete one exercise', async function () {
        let leader = this.physiotherapist, exercise = this.exercises[0], _session = this.sessions[0]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue({ patientID: 1 })
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistEmail: leader.email })
        spyOn(fileHandler, 'deleteVideo').and.returnValue(undefined)
        spyOn(poeCollection, 'deletePOEForExerciseByID')
        spyOn(exercisesCollection, 'deleteOneExercise')
        spyOn(exercisesCollection, 'getExercisesInSessionByEmail').and.returnValue([])
        spyOn(sessions, 'updateSessionTimestamp')
        await exercises.deleteExercise({ 
            user: { role: 'admin' },
            params: { exerciseID: exercise.id },
            query: { sessionID: _session.sessionID },
            body: { videoFile: exercise.videoFile }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalled()
                expect(poeCollection.deletePOEForExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.deleteOneExercise).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.getExercisesInSessionByEmail).toHaveBeenCalledWith(_session.sessionID, leader.email)
                expect(sessions.updateSessionTimestamp).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can delete one assigned exercise', async function () {
        let therapist = this.physiotherapist, exercise = this.exercises[0], _session = this.sessions[0]
        spyOn(sessions, 'getSessionByID').and.returnValue({ id: _session.sessionID })
        spyOn(fileHandler, 'deleteVideo').and.returnValue(undefined)
        spyOn(poeCollection, 'deletePOEForExerciseByID')
        spyOn(exercisesCollection, 'deleteOneExercise')
        spyOn(exercisesCollection, 'getExercisesInSessionByEmail').and.returnValue([])
        spyOn(sessions, 'updateSessionTimestamp')
        await exercises.deleteExercise({ 
            user: therapist,
            params: { exerciseID: exercise.id },
            query: { sessionID: _session.sessionID },
            body: { videoFile: exercise.videoFile }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(sessions.getSessionByID).toHaveBeenCalledWith(_session.sessionID, therapist.email)
                expect(poeCollection.deletePOEForExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.deleteOneExercise).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.getExercisesInSessionByEmail).toHaveBeenCalledWith(_session.sessionID, therapist.email)
                expect(sessions.updateSessionTimestamp).toHaveBeenCalled()
            }
        })
    })
})

describe('editExercise access:', function () {
    it('editing exercise requires authentication', async function () {
        await exercises.editExercise({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('editing exercise requires params exercise id', async function () {
        await exercises.editExercise({
            user: this.physiotherapist,
            params: { exerciseID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('editing exercise requires new data', async function () {
        let therapist = this.physiotherapist, exercise = this.exercises[0]
        spyOn(exercisesCollection, 'updateOneExercise')
        await exercises.editExercise({
            user: therapist,
            params: { exerciseID: exercise.id },
            body: undefined
        }, {
            sendStatus(status) {
                expect(status).toBe(400)
                expect(exercisesCollection.updateOneExercise).not.toHaveBeenCalled()
            }
        })
    })
    it('generic error when editing exercise', async function () {
        let therapist = this.physiotherapist, exercise = this.exercises[0]
        spyOn(exercisesCollection, 'updateOneExercise').and.rejectWith()
        await exercises.editExercise({
            user: therapist, body: { type: exercise.type },  params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(exercisesCollection.updateOneExercise).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can edit own exercise', async function () {
        let therapist = this.physiotherapist, exercise = this.exercises[0]
        spyOn(exercisesCollection, 'updateOneExercise').and.returnValue({ type: exercise.type, notes: exercise.notes })
        await exercises.editExercise({
            user: therapist,
            params: { exerciseID: exercise.id },
            body: { type: exercise.type, notes: exercise.notes }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(exercisesCollection.updateOneExercise).toHaveBeenCalledWith(exercise.id, { type: exercise.type, notes: exercise.notes })
            }
        })
    })
})