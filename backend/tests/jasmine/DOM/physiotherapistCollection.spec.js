import physiotherapist from '../../../src/DOM/physiotherapistCollection.js'
import users from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import mock from '../../mock_data.js'
import db from '../../testDBTools.js'

describe('Physiotherapist collection', function () {

    beforeAll(async function () {
        this.physiotherapist = mock.physiotherapist
        this.patient = mock.patient
        
        mock.db.database = 'test_physiotherapist'
        config.db = mock.db
        await db.createNewDatabase(config.db)
        await db.connectToDatabase(config.db)
    })

    afterAll(async function () {
        await db.dropDatabase(config.db)
    })

    describe('createPatient', function () {
        let patient, therapist

        beforeAll(async function () {
            therapist = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
        })

        afterAll(async function () {
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can create one patient and assign to physiotherapist', async function () {
            let res = await physiotherapist.createPatient(
                {
                    fullName: 'test',
                    dateOfBirth: new Date().toISOString(),
                    height: 170,
                    weight: 75,
                    injuries: 'test'
                },
                therapist.id)

            expect(res).toBeInstanceOf(Object)
            expect(res.physiotherapistId).toBe(therapist.id)
            expect(res.createdTimestamp).toBeDefined()
            expect(res.id).toBeDefined()

            patient = res
        })
    })

    describe('getPatients', function () {
        let patient_1, patient_2, therapist

        beforeAll(async function () {
            therapist = await users.createUser(
                this.physiotherapist.email,
                this.physiotherapist.hashedPassword,
                this.physiotherapist.role
            )
            patient_1 = await physiotherapist.createPatient({
                fullName: this.patient.names,
                dateOfBirth: new Date().toISOString(),
                height: this.patient.height,
                weight: this.patient.weight,
                injuries: this.patient.injuries
            }, therapist.id)
            patient_2 = await physiotherapist.createPatient({
                fullName: 'patient name 2',
                dateOfBirth: new Date().toISOString(),
                height: 185,
                weight: 78,
                injuries: 'test'
            }, therapist.id)
        })

        afterAll(async function () {
            await physiotherapist.deleteOnePatient(patient_1.physiotherapistId, patient_1.id)
            await physiotherapist.deleteOnePatient(patient_2.physiotherapistId, patient_2.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get all patients assigned to physiotherapist', async function () {
            let res = await physiotherapist.getPatients()

            expect(res).toBeInstanceOf(Array)
            expect(res.length).toBe(2)
            for(const patient in res) {
                expect(res[patient].id).toBeDefined()
                expect(res[patient].createdTimestamp).toBeDefined()
                expect(res[patient].dateofbirth).toBeDefined()
                expect(res[patient].names).toBeDefined()
                expect(res[patient].injuries).toBeDefined()
                expect(res[patient].physiotherapistId).toBe(therapist.id)
                expect(typeof res[patient].height).toBe('number')
                expect(typeof res[patient].weight).toBe('number')
            }
        })
    })
    describe('getPatientsByEmail', function () {
        let patient_1, patient_2, therapist

        beforeAll(async function () {
            therapist = await users.createUser(
                this.physiotherapist.email,
                this.physiotherapist.hashedPassword,
                this.physiotherapist.role
            )
            patient_1 = await physiotherapist.createPatient({
                fullName: this.patient.names,
                dateOfBirth: new Date().toISOString(),
                height: this.patient.height,
                weight: this.patient.weight,
                injuries: this.patient.injuries
            }, therapist.id)
            patient_2 = await physiotherapist.createPatient({
                fullName: 'adam smith',
                dateOfBirth: new Date().toISOString(),
                height: 185,
                weight: 78,
                injuries: 'test'
            }, therapist.id)
        })

        afterAll(async function () {
            await physiotherapist.deleteOnePatient(patient_1.physiotherapistId, patient_1.id)
            await physiotherapist.deleteOnePatient(patient_2.physiotherapistId, patient_2.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get all patients assigned to physiotherapist by email', async function () {
            let res = await physiotherapist.getPatientsByEmail(therapist.email, { pageNo: 1, limit: 5, type: 'date', date: { sortOrder: 'DESC' } })
            
            expect(Array.isArray(res)).toEqual(true)
            expect(res.length).toEqual(2)
            expect(res[1][0].maxPage).toBeGreaterThan(0)
            for(const patient in res[0]) {
                expect(res[0][patient].names).toBeDefined()
                expect(res[0][patient].patientID).toBeDefined()
                expect(res[0][patient].createdTimestamp).toBeDefined()
                expect(res[0][patient].isPartOfSession).toBeDefined()
            }
        })
        it('can get all patients by different sorting', async function () {
            let res = await physiotherapist.getPatientsByEmail(therapist.email, { pageNo: 1, limit: 5, type: 'names', name: { sortOrder: 'ASC' } })
            
            expect(Array.isArray(res)).toEqual(true)
            expect(res.length).toEqual(2)
            expect(res[1][0].maxPage).toBeGreaterThan(0)
            expect(res[0][0].names).toBe('adam smith')
            expect(res[0][1].names).toBe(this.patient.names)
            for(const patient in res[0]) {
                expect(res[0][patient].patientID).toBeDefined()
                expect(res[0][patient].createdTimestamp).toBeDefined()
                expect(res[0][patient].isPartOfSession).toBeDefined()
            }
        })
    })
    describe('getOnePatientByEmail', function () {
        let patient, therapist

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
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get one patient assigned to physiotherapist by email', async function () {
            let res = await physiotherapist.getOnePatientByEmail(therapist.email, patient.id)
            expect(res).toBeInstanceOf(Object)
            expect(res.id).toBe(patient.id)
            expect(res.physiotherapistId).toBe(patient.physiotherapistId)
            expect(res.dateofbirth).toBeDefined()
            expect(res.createdTimestamp).toBeDefined()
            expect(res.height).toBe(this.patient.height)
            expect(res.weight).toBe(this.patient.weight)
            expect(res.injuries).toBe(this.patient.injuries.description)
            expect(res.injuredSide).toBe(this.patient.injuries.injuredSide)
            expect(res.injuredBodyPart).toBe(this.patient.injuries.injuredBodyPart)
            expect(res.therapistEmail).toBe(therapist.email)
            expect(res.sessionID).toBeNull()
        })
    })
    describe('getOnePatientByID', function () {
        let patient, therapist

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
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get one patient assigned to physiotherapist by patient id', async function () {
            let res = await physiotherapist.getOnePatientByID(patient.id)
            
            expect(res).toBeInstanceOf(Object)
            expect(res.id).toBe(patient.id)
            expect(res.physiotherapistId).toBe(patient.physiotherapistId)
            expect(res.dateofbirth).toBeDefined()
            expect(res.createdTimestamp).toBeDefined()
            expect(res.height).toBe(this.patient.height)
            expect(res.weight).toBe(this.patient.weight)
            expect(res.injuries).toBe(this.patient.injuries.description)
            expect(res.injuredSide).toBe(this.patient.injuries.injuredSide)
            expect(res.injuredBodyPart).toBe(this.patient.injuries.injuredBodyPart)
            expect(res.physiotherapistEmail).toBe(therapist.email)
            expect(res.sessionID).toBeNull()
        })
    })
    describe('getOneTherapistByEmail', function () {
        let patient, therapist_1, therapist_2

        beforeAll(async function () {
            therapist_1 = await users.createUser(
                this.physiotherapist.email,
                this.physiotherapist.hashedPassword,
                this.physiotherapist.role
            )
            therapist_2 = await users.createUser(
                'physiotherapist_2@email.com',
                this.physiotherapist.hashedPassword,
                this.physiotherapist.role
            )
            patient = await physiotherapist.createPatient({
                fullName: this.patient.names,
                dateOfBirth: new Date().toISOString(),
                height: this.patient.height,
                weight: this.patient.weight,
                injuries: this.patient.injuries
            }, therapist_1.id)
        })

        afterAll(async function () {
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist_1.id)
            await users.deleteOneUser(therapist_2.id)
        })

        it('can get one physiotherapist by email assigned with patient', async function () {
            let res = await physiotherapist.getOneTherapistByEmail(therapist_1.email)
            
            expect(res).toBeInstanceOf(Object)
            expect(res.id).toBe(therapist_1.id)
            expect(res.email).toBe(therapist_1.email)
            expect(res.hashedpassword).toBe(this.physiotherapist.hashedPassword)
            expect(res.role).toBe(this.physiotherapist.role)
            expect(res.createdTimestamp).toBeDefined()
            expect(res.lastLoginTimestamp).toBeNull()
            expect(res.numOfPatients).toEqual(1)
        })
        it('can get one physiotherapist by email with no patients', async function () {
            let res = await physiotherapist.getOneTherapistByEmail(therapist_2.email)

            expect(res.id).toBe(therapist_2.id)
            expect(res.email).toBe(therapist_2.email)
            expect(res.role).toBe(this.physiotherapist.role)
            expect(res.createdTimestamp).toBeDefined()
            expect(res.numOfPatients).toEqual(0)
        })
    })
    describe('getOnePatientByName', function () {
        let patient, therapist

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
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can get one patient by name', async function () {
            let res = await physiotherapist.getOnePatientByName(this.patient.names)

            expect(res).toBeInstanceOf(Object)
            expect(res.id).toBe(patient.id)
            expect(res.names).toBe(this.patient.names)
        })
        it('can not get patient that doesnt exist', async function () {
            let res = await physiotherapist.getOnePatientByName('somerandomname')
            expect(res).toBeUndefined()
        })
    })
    describe('deleteOnePatient', function () {
        let patient, therapist

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
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can delete one patient assigned to physiotherapist', async function () {
            let res = await physiotherapist.getOnePatientByID(patient.id)
            expect(res.id).toBe(patient.id)
            expect(res.physiotherapistId).toBe(patient.physiotherapistId)
            expect(res.names).toBe(this.patient.names)

            await physiotherapist.deleteOnePatient(therapist.id, patient.id)
            res = await physiotherapist.getOnePatientByID(patient.id)
            expect(res).toBeUndefined()
        })
    })
    describe('updateOnePatient', function () {
        let patient, therapist,
            newDateOfBirth = new Date(Date.now() - 5 * (24*60*60*1000)).toISOString(),
            newName = 'updated name',
            newDesc = 'updated description',
            newHeight = 185,
            newWeight = 80

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
            await physiotherapist.deleteOnePatient(patient.physiotherapistId, patient.id)
            await users.deleteOneUser(therapist.id)
        })

        it('can update one patient', async function () {
            let res = await physiotherapist.getOnePatientByID(patient.id)
            expect(res.id).toBe(patient.id)
            expect(res.names).toBe(this.patient.names)
            expect(res.injuries).toBe(this.patient.injuries.description)
            expect(res.injuredSide).toBe(this.patient.injuries.injuredSide)
            expect(res.injuredBodyPart).toBe(this.patient.injuries.injuredBodyPart)
            expect(res.height).toBe(this.patient.height)
            expect(res.weight).toBe(this.patient.weight)            
            expect(res.dateofbirth).toBeDefined()       

            await physiotherapist.updateOnePatient({
                fullName: newName,
                dateOfBirth: newDateOfBirth,
                height: newHeight,
                weight: newWeight,
                injuries: { description: newDesc }
            }, patient.id)

            res = await physiotherapist.getOnePatientByID(patient.id)
            expect(res.id).toBe(patient.id)
            expect(res.names).toBe(newName)
            expect(res.dateofbirth.toISOString().slice(0, 10)).toBe(newDateOfBirth.slice(0, 10))
            expect(res.injuries).toBe(newDesc)
            expect(res.height).toBe(newHeight)
            expect(res.weight).toBe(newWeight)
        })
    })
})