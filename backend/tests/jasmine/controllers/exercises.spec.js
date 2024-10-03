import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import poeCollection from '../../../src/DOM/poeCollection.js'
import exercises from '../../../src/controllers/exercises.js'
import config from '../../../src/utils/config.js'

beforeAll(function () {
    this.physiotherapist = {
        id: 1,
        email: 'email@test.com',
        hashedPassword: 'password',
        role: 'physiotherapist',
        createdTimestamp: new Date().toISOString()
    }
    this.patient = {
        id: 2,
        names: 'test name',
        dateOfBirth: new Date().toISOString()
    }
    this.sessions = [
        {
            sessionID: 1,
            sessionStartTimestamp: new Date().toISOString(),
            patientId: this.patient.id,
            numOfExercises: 1
        }
    ]
    this.exercises = [
        { id: 1, type: 'test', notes: 'exercise 1...', videoFile: 'filename.mp4' },
        { id: 2, type: 'test2', notes: 'exercise 2...', videoFile: 'filename.mp4' }
    ]
})

describe('getExercises access:', function () {

    it('get exercises requires authentication', async function () {
        await exercises.getExercises({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
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
        let therapist = this.physiotherapist, sessionID = this.sessions[0].sessionID
        spyOn(exercisesCollection, 'getExercisesBySession').and.returnValue(this.exercises)
        spyOn(sessions, 'getSessionByID').and.returnValue(this.sessions[0])
        await exercises.getExercises({
            user: therapist,
            query: { sessionID }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Array)
                expect(sessions.getSessionByID).toHaveBeenCalledWith(sessionID, therapist.email)
                expect(exercisesCollection.getExercisesBySession).toHaveBeenCalledWith(sessionID)
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
        spyOn(exercisesCollection, 'getOneExerciseByEmail').and.returnValue(_exercise)
        await exercises.getExercise({
            user: therapist,
            params: { exerciseID: _exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(exercisesCollection.getOneExerciseByEmail).toHaveBeenCalledWith(_exercise.id, therapist.email)
            },
            send(data) {
                expect(data).not.toBeDefined()
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
            status(status) {
                expect(status).toBe(400)
                return this
            },
            send(data) {
                expect(data).toContain('Please enter required fields')
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
            body: { exercises: this.exercises[0], sessionID: _session.sessionID }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(sessions.getSessionByID).toHaveBeenCalledWith(_session.sessionID, therapist.email)
                expect(exercisesCollection.createExercise).not.toHaveBeenCalled()
            }
        })
    })
    it('admin can create new exercise', async function () {
        let _session = this.sessions[0]
        spyOn(exercisesCollection, 'createExercise').and.returnValue(this.exercises[0])
        spyOn(sessions, 'getSessionByID')
        await exercises.addNewExercise({
            user: { role: 'admin' },
            body: { exercises: this.exercises[0], sessionID: _session.sessionID }
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
        let therapist = this.physiotherapist, _session = this.sessions[0]
        spyOn(exercisesCollection, 'createExercise').and.returnValue(this.exercises[0])
        spyOn(sessions, 'getSessionByID').and.returnValue({ id: _session.sessionID })
        await exercises.addNewExercise({
            user: therapist,
            body: { exercises: this.exercises[0], sessionID: _session.sessionID }
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
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'deletePOEForExerciseByID')
        spyOn(exercisesCollection, 'deleteOneExercise')
        await exercises.deleteExercise({ 
            user: { role: 'admin' },
            params: { exerciseID: exercise.id },
            query: { sessionID: this.sessions[0].sessionID },
            body: { videoFile: exercise.videoFile }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(poeCollection.deletePOEForExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.deleteOneExercise).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('physiotherapist can delete one assigned exercise', async function () {
        let therapist = this.physiotherapist, exercise = this.exercises[0], _session = this.sessions[0]
        spyOn(sessions, 'getSessionByID').and.returnValue({ id: _session.sessionID })
        spyOn(poeCollection, 'deletePOEForExerciseByID')
        spyOn(exercisesCollection, 'deleteOneExercise')
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
            }
        })
    })
})