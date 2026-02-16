import physiotherapistCollection from '../../../src/DOM/physiotherapistCollection.js'
import physiotherapySession from '../../../src/controllers/physiotherapySession.js'
import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import mock from '../../mock_data.js'

beforeAll(function () {
    this.physiotherapist = mock.physiotherapist
    this.patient = mock.patient
    this.sessions = mock.sessions
})

describe('getSessions access:', function () {

    it('get physiotherapy sessions requires authentication', async function () {
        await physiotherapySession.getSessions({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })

    it('admin can get all physiotherapy sessions', async function () {
        spyOn(sessions, 'getSessions').and.returnValue(this.sessions)
        await physiotherapySession.getSessions({
            user: { role: 'admin' }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data instanceof Array).toBeTrue()
                expect(sessions.getSessions).toHaveBeenCalled()
            }
        })
    })

    it('physiotherapist can only get own physiotherapy sessions', async function () {
        let therapist = this.physiotherapist
        spyOn(sessions, 'getSessionsByEmail').and.returnValue([this.sessions, [{ maxPage: 1 }] ])
        await physiotherapySession.getSessions({
            user: therapist,
            query: { pagination: {} }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data instanceof Object).toBeTrue()
                expect(data.maxPageNo).toEqual(1)
                expect(sessions.getSessionsByEmail).toHaveBeenCalledWith(therapist.email, { })
            }
        })
    })

    it('generic error on getting sessions', async function () {
        spyOn(sessions, 'getSessionsByEmail').and.returnValue(this.sessions)
        await physiotherapySession.getSessions({
            user: { role: 'admin' }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
            }
        })
    })
})

describe('getSession access:', function () {
    it('get one physiotherapy session requires authentication', async function () {
        await physiotherapySession.getSession({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('physiotherapy session requires params', async function () {
        await physiotherapySession.getSession({
            user: { role: 'physiotherapist' },
            params: { sessionID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('physiotherapist can get one own session', async function () {
        let therapist = this.physiotherapist, sessionID = this.sessions[0].sessionID
        spyOn(sessions, 'getSessionByID').and.returnValue(this.sessions[0])
        await physiotherapySession.getSession({
            user: this.physiotherapist,
            params: { sessionID }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data instanceof Object).toBeTrue()
                expect(sessions.getSessionByID).toHaveBeenCalledWith(sessionID, therapist.email)
            }
        })
    })
    it('error on unknown session ID', async function () {
        let therapist = this.physiotherapist, sessionID = this.sessions[0].sessionID
        spyOn(sessions, 'getSessionByID').and.returnValue(undefined)
        await physiotherapySession.getSession({
            user: this.physiotherapist,
            params: { sessionID }
        }, {
            sendStatus(status) {
                expect(status).toBe(404)
                expect(sessions.getSessionByID).toHaveBeenCalled()
            }
        })
    })
})

describe('addNewSession access:', function () {
    it('creating physiotherapy session requires authentication', async function () {
        await physiotherapySession.addNewSession({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('creating physiotherapy session requires query', async function () {
        await physiotherapySession.addNewSession({ 
            user: this.physiotherapist,
            query: { patientID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('physiotherapist must consent before creating session', async function () {
        let patient = this.patient
        spyOn(sessions, 'createSession')
        spyOn(physiotherapistCollection, 'getOnePatientByEmail').and.returnValue(undefined)
        await physiotherapySession.addNewSession({ 
            user: {...this.physiotherapist, activated: false},
            query: { patientID: patient.id }
        }, {
            status(status) {
                expect(status).toBe(403)
                return this
            },
            send (data) {
                expect(data.activated).toBeDefined()
                expect(physiotherapistCollection.getOnePatientByEmail).not.toHaveBeenCalled()
                expect(sessions.createSession).not.toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist cant create session for non assigned patient', async function () {
        let patient = this.patient
        spyOn(sessions, 'createSession')
        spyOn(physiotherapistCollection, 'getOnePatientByEmail').and.returnValue(undefined)
        await physiotherapySession.addNewSession({ 
            user: this.physiotherapist,
            query: { patientID: patient.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(sessions.createSession).not.toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can create session for assigned patient', async function () {
        let patient = this.patient
        spyOn(sessions, 'createSession').and.returnValue(this.sessions[0])
        spyOn(physiotherapistCollection, 'getOnePatientByEmail').and.returnValue(patient)
        await physiotherapySession.addNewSession({ 
            user: this.physiotherapist,
            query: { patientID: patient.id }
        }, {
            status(status) {
                expect(status).toBe(201)
                return this
            },
            json(data) {
                expect(data.status).toBe('created')
                expect(data).toBeInstanceOf(Object)
                expect(data).toBeDefined()
                expect(data.patientID).toBeUndefined()
                expect(physiotherapistCollection.getOnePatientByEmail).toHaveBeenCalled()
                expect(sessions.createSession).toHaveBeenCalledOnceWith(patient.id)
            }
        })
    })
})

describe('deleteSession access:', function () {
    it('delete physiotherapy session requires authentication', async function () {
        await physiotherapySession.deleteSession({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('delete physiotherapy session requires params', async function () {
        await physiotherapySession.deleteSession({ 
            user: { role: 'admin' },
            params: { sessionID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('cannot delete physiotherapy session with exercises', async function () {
        let therapist = this.physiotherapist, sessionID = this.sessions[0].sessionID
        spyOn(exercisesCollection, 'getExercisesInSessionByEmail').and.returnValue([{id: 1}])
        await physiotherapySession.deleteSession({ 
            user: therapist,
            params: { sessionID }
        }, {
            sendStatus(status) {
                expect(status).toBe(409)
                expect(exercisesCollection.getExercisesInSessionByEmail).toHaveBeenCalledWith(sessionID, therapist.email)
            }
        })
    })
    it('physiotherapist can delete physiotherapy session', async function () {
        let therapist = this.physiotherapist, sessionID = this.sessions[0].sessionID
        spyOn(exercisesCollection, 'getExercisesInSessionByEmail').and.returnValue([])
        spyOn(sessions, 'deleteOneSession')
        await physiotherapySession.deleteSession({ 
            user: therapist,
            params: { sessionID }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(exercisesCollection.getExercisesInSessionByEmail).toHaveBeenCalledWith(sessionID, therapist.email)
                expect(sessions.deleteOneSession).toHaveBeenCalledTimes(1)
            }
        })
    })
})