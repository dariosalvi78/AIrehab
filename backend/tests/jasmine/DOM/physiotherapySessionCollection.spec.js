import physiotherapist from '../../../src/DOM/physiotherapistCollection.js'
import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import users from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import mock from '../../mock_data.js'
import db from '../../testDBTools.js'

describe('Physiotherapy session collection', function () {

    beforeAll(async function () {
        this.physiotherapist = mock.physiotherapist
        this.patient = mock.patient
        
        mock.db.database = 'test_physiotherapySession'
        config.db = mock.db
        await db.createNewDatabase(config.db)
        await db.connectToDatabase(config.db)
    })

    afterAll(async function () {
        await db.dropDatabase(config.db)
    })

    describe('createSession', function () {
        let patient, therapist, session

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
        })

        afterAll(async function () {
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can create one session for patient', async function () {
            let res = await sessions.createSession(patient.id)

            expect(res).toBeInstanceOf(Object)
            expect(res.id).toBeDefined()
            expect(res.patientId).toBe(patient.id)
            expect(res.startTimestamp).toBeDefined()
            expect(res.endTimestamp).toBeNull()
            session = res
        })
    })

    describe('getSessions', function () {
        let patient, therapist, sessions_list=[]

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
            
            for (let i = 0; i < 3; i++) sessions_list.push(await sessions.createSession(patient.id))
        })

        afterAll(async function () {
            for (let i = 0; i < sessions_list.length; i++) await sessions.deleteOneSession(sessions_list[i].id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get all physiotherapy sessions', async function () {
            let res = await sessions.getSessions()

            expect(Array.isArray(res)).toEqual(true)
            expect(res.length).toEqual(sessions_list.length)
            for (const session in sessions_list) {
                expect(sessions_list[session].sessionID).toBe(res[session].id)
                expect(sessions_list[session].patientId).toBe(res[session].patientId)
                expect(sessions_list[session].endTimestamp).toBeDefined()
                expect(res[session].sessionStartTimestamp).toBeDefined()
                expect(res[session].numOfExercises).toEqual(0)
            }
        })
    })

    describe('getSessionsByEmail', function () {
        let patients = [], therapists = [], session_list = []

        beforeAll(async function () {
            for (let i = 0; i < 2; i++) {
                therapists.push(await users.createUser(
                    'physiotherapist@email.com_' + i,
                    this.physiotherapist.hashedPassword,
                    this.physiotherapist.role
                ))
            }
            for (let i = 0; i < 2; i++) {
                patients.push(await physiotherapist.createPatient({
                    fullName: 'patient_name' + i,
                    dateOfBirth: new Date().toISOString(),
                    height: this.patient.height,
                    weight: this.patient.weight,
                    injuries: this.patient.injuries
                }, therapists[i].id))
            }

            for (let i = 0; i < patients.length; i++) session_list.push(await sessions.createSession(patients[i].id))
        })

        afterAll(async function () {
            for (let i = 0; i < session_list.length; i++) await sessions.deleteOneSession(session_list[i].id)
            for (let i = 0; i < patients.length; i++) await physiotherapist.deleteOnePatient(patients[i].physiotherapistId, patients[i].id)
            for (let i = 0; i < therapists.length; i++) await users.deleteOneUser(therapists[i].id)
        })

        it('can get physiotherapy sessions assigned to physiotherapist', async function () {
            let therapist_1_email = therapists[0].email
            let res = await sessions.getSessionsByEmail(therapist_1_email, {limit: 5, pageNo: 1, sortOrder: 'DESC'})

            expect(Array.isArray(res)).toEqual(true)
            expect(res[1][0].maxPage).toBeGreaterThan(0)
            expect(res[1].length).toEqual(1)
            for (const session in res[0]) {
                expect(res[0][session].id).toBe(session_list[session].id)
                expect(res[0][session].startTimestamp).toEqual(session_list[session].startTimestamp)
                expect(res[0][session].endTimestamp).toEqual(session_list[session].endTimestamp)
                expect(res[0][session].names).toBeDefined()
                expect(res[0][session].numOfExercises).toEqual(0)
            }
        })
    })
    describe('getSessionByID', function () {
        let patients = [], therapists = [], session_list = []

        beforeAll(async function () {
            for (let i = 0; i < 2; i++) {
                therapists.push(await users.createUser(
                    'physiotherapist@email.com_' + i,
                    this.physiotherapist.hashedPassword,
                    this.physiotherapist.role
                ))
            }
            for (let i = 0; i < 2; i++) {
                patients.push(await physiotherapist.createPatient({
                    fullName: 'patient_name' + i,
                    dateOfBirth: new Date().toISOString(),
                    height: this.patient.height,
                    weight: this.patient.weight,
                    injuries: this.patient.injuries
                }, therapists[i].id))
            }

            for (let i = 0; i < patients.length; i++) session_list.push(await sessions.createSession(patients[i].id))
        })

        afterAll(async function () {
            for (let i = 0; i < session_list.length; i++) await sessions.deleteOneSession(session_list[i].id)
            for (let i = 0; i < patients.length; i++) await physiotherapist.deleteOnePatient(patients[i].physiotherapistId, patients[i].id)
            for (let i = 0; i < therapists.length; i++) await users.deleteOneUser(therapists[i].id)
        })

        it('can get one physiotherapy session for patient', async function () {
            let therapist_1_email = therapists[0].email, session_1 = session_list[0]
            let res = await sessions.getSessionByID(session_1.id, therapist_1_email)

            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBe(session_1.id)
            expect(res.patientId).toEqual(session_1.patientId)
            expect(res.startTimestamp).toBeDefined()
            expect(res.endTimestamp).toBeNull()
            expect(res.patientName).toBeDefined()
        })
        it('cannot get non assigned physiotherapy session', async function () {
            let res = await sessions.getSessionByID(session_list[0].id, therapists[1].email)
            expect(res).toBeUndefined()
        })
    })
    describe('deleteOneSession', function () {
        let patient, therapist, session

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
            await sessions.deleteOneSession(session.id)
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can delete one physiotherapy session', async function () {
            let res = await sessions.getSessionByID(session.id, therapist.email)
           
            expect(Array.isArray(res)).toEqual(false)
            expect(res.id).toBe(session.id)
            expect(res.patientId).toEqual(session.patientId)
            expect(res.startTimestamp).toBeDefined()
            expect(res.endTimestamp).toBeNull()
            expect(res.patientName).toBe(this.patient.names)

            await sessions.deleteOneSession(session.id, therapist.email)
            res = await sessions.getSessionByID(session.id, therapist.email)
            expect(res).toBeUndefined()
        })
    })
})
