import physiotherapist from '../../../src/controllers/physiotherapist.js'
import physiotherapistCollection from '../../../src/DOM/physiotherapistCollection.js'
import scheduler from '../../../src/utils/scheduler.js'
import jwt from 'jsonwebtoken'
import mock from '../../mock_data.js'
import bcrypt from 'bcrypt'
import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import surveysCollection from '../../../src/DOM/surveysCollection.js'
import poeCollection from '../../../src/DOM/poeCollection.js'

beforeAll(function () {
    this.physiotherapist = mock.physiotherapist
    this.patient = mock.patient
    this.surveys = JSON.parse(JSON.stringify(mock.surveys))
    this.exercises = JSON.parse(JSON.stringify(mock.exercises))
})

describe('addNewPatient access:', function () {

    it('creating user requires authentication', async function () {
        await physiotherapist.addNewPatient({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('missing required content', async function () {
        spyOn(physiotherapistCollection, 'getOnePatientByName')
        await physiotherapist.addNewPatient({ user: { role: 'physiotherapist' }, body: {} }, {
            sendStatus(status) {
                expect(status).toBe(400)
                expect(physiotherapistCollection.getOnePatientByName).not.toHaveBeenCalled()
            }
        })
    })
    it('cant add already existing patient', async function () {
        let patient = this.patient
        spyOn(physiotherapistCollection, 'getOnePatientByName').and.returnValue(patient)
        await physiotherapist.addNewPatient({ user: { role: 'physiotherapist' }, body: { fullName: 'test name', dateOfBirth: new Date().toISOString() } }, {
            sendStatus(status) {
                expect(status).toBe(409)
                expect(physiotherapistCollection.getOnePatientByName).toHaveBeenCalledWith(patient.names)
            }
        })
    })
    it('admin error on invalid physiotherapist email', async function () {
        let patient = this.patient
        spyOn(physiotherapistCollection, 'getOnePatientByName').and.returnValue(undefined)
        await physiotherapist.addNewPatient({
            user: { role: 'admin' },
            body: { fullName: 'test name', dateOfBirth: new Date().toISOString() },
            query: { physiotherapistEmail: undefined }
        },
            {
                status(status) {
                    expect(status).toBe(400)
                    return this
                },
                send(data) {
                    expect(data).toBe('Please enter physiotherapist email')
                    expect(physiotherapistCollection.getOnePatientByName).toHaveBeenCalledWith(patient.names)
                }
            })
    })

    it('admin error on non existing physiotherapist email', async function () {
        spyOn(physiotherapistCollection, 'getOnePatientByName').and.returnValue(undefined)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(undefined)
        await physiotherapist.addNewPatient({
            user: { role: 'admin' },
            body: { fullName: 'test name', dateOfBirth: new Date().toISOString() },
            query: { physiotherapistEmail: 'email@notexist.com' }
        },
            {
                status(status) {
                    expect(status).toBe(404)
                    return this
                },
                send(data) {
                    expect(data).toBe('No physiotherapist with given email')
                    expect(physiotherapistCollection.getOnePatientByName).toHaveBeenCalled()
                    expect(physiotherapistCollection.getOneTherapistByEmail).toHaveBeenCalledWith('email@notexist.com')
                }
            })
    })

    it('physiotherapist can add patient', async function () {
        let therapist = this.physiotherapist
        spyOn(physiotherapistCollection, 'getOnePatientByName').and.returnValue(undefined)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(therapist)
        spyOn(physiotherapistCollection, 'createPatient').and.returnValue(this.patient)
        await physiotherapist.addNewPatient({
            user: { role: 'physiotherapist', email: therapist.email },
            body: { fullName: 'test name', dateOfBirth: new Date().toISOString() }
        },
            {
                status(status) {
                    expect(status).toBe(201)
                    return this
                },
                json(response) {
                    expect(response.status).toBe('created')
                    expect(response.data.patient).toBeDefined()
                    expect(physiotherapistCollection.getOnePatientByName).toHaveBeenCalled()
                    expect(physiotherapistCollection.getOneTherapistByEmail).toHaveBeenCalledWith(therapist.email)
                    expect(physiotherapistCollection.createPatient).toHaveBeenCalled()
                }
            })
    })

    it('admin can add patient', async function () {
        let therapist = this.physiotherapist
        spyOn(physiotherapistCollection, 'getOnePatientByName').and.returnValue(undefined)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(therapist)
        spyOn(physiotherapistCollection, 'createPatient').and.returnValue(this.patient)
        await physiotherapist.addNewPatient({
            user: { role: 'admin', email: therapist.email },
            body: { fullName: 'test name', dateOfBirth: new Date().toISOString() },
            query: { physiotherapistEmail: this.physiotherapist.email }
        },
            {
                status(status) {
                    expect(status).toBe(201)
                    return this
                },
                json(response) {
                    expect(response.status).toBe('created')
                    expect(response.data.patient).toBeDefined()
                    expect(physiotherapistCollection.getOnePatientByName).toHaveBeenCalled()
                    expect(physiotherapistCollection.getOneTherapistByEmail).toHaveBeenCalledWith(therapist.email)
                    expect(physiotherapistCollection.createPatient).toHaveBeenCalled()
                }
            })
    })

    it('error when trying to retrieve user', async function () {
        spyOn(physiotherapistCollection, 'getOnePatientByName').and.returnValue(undefined)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(undefined)
        spyOn(physiotherapistCollection, 'createPatient').and.returnValue(this.patient)
        await physiotherapist.addNewPatient({
            user: { role: 'physiotherapist', email: 'email@notexist.com' },
            body: { fullName: 'test name', dateOfBirth: new Date().toISOString() }
        },
            {
                sendStatus(status) {
                    expect(status).toBe(500)
                    expect(physiotherapistCollection.getOnePatientByName).toHaveBeenCalled()
                    expect(physiotherapistCollection.getOneTherapistByEmail).toHaveBeenCalledWith('email@notexist.com')
                    expect(physiotherapistCollection.createPatient).not.toHaveBeenCalled()
                }
            })
    })
})

describe('getPatients access:', function () {

    it('get patients requires authentication', async function () {
        await physiotherapist.getPatients({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })

    it('admin can get all patients', async function () {
        spyOn(physiotherapistCollection, 'getPatients').and.returnValue([this.patient])
        await physiotherapist.getPatients({
            user: { role: 'admin' }
        }, {
            send(data) {
                expect(data instanceof Array).toBe(true)
                expect(data).toBeDefined()
                expect(physiotherapistCollection.getPatients).toHaveBeenCalled()
            }
        })
    })

    it('physiotherapist can get assigned patients', async function () {
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(this.physiotherapist)
        spyOn(physiotherapistCollection, 'getPatientsByEmail').and.returnValue([this.patient, [{ maxPage: 1 }]])
        await physiotherapist.getPatients({
            user: { role: 'physiotherapist', email: this.physiotherapist.email },
            query: { pagination: {} }
        }, {
            send(data) {
                expect(data instanceof Object).toBe(true)
                expect(data.patients).toBeDefined()
                expect(data.maxPageNo).toEqual(1)
                expect(physiotherapistCollection.getOneTherapistByEmail).toHaveBeenCalled()
                expect(physiotherapistCollection.getPatientsByEmail).toHaveBeenCalled()
            }
        })
    })

    it('physiotherapist error on invalid email', async function () {
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(undefined)
        spyOn(physiotherapistCollection, 'getPatientsByEmail').and.returnValue(undefined)
        await physiotherapist.getPatients({
            user: { role: 'physiotherapist', email: 'email@notexist.com' },
            query: { pagination: {} }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(physiotherapistCollection.getOneTherapistByEmail).toHaveBeenCalled()
                expect(physiotherapistCollection.getPatientsByEmail).toHaveBeenCalled()
            }
        })
    })
})

describe('getPatient access:', function () {

    it('get one patient requires authentication', async function () {
        await physiotherapist.getPatient({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('get one patient requires patientID', async function () {
        await physiotherapist.getPatient({
            user: this.physiotherapist,
            params: { patientID: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('physiotherapist can get one assigned patient', async function () {
        let patient = this.patient
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistEmail: this.physiotherapist.email })
        spyOn(physiotherapistCollection, 'getOnePatientByEmail').and.returnValue({ ...this.patient, physiotherapistId: 1 })
        spyOn(bcrypt, 'hashSync').and.returnValue(true)
        await physiotherapist.getPatient({
            user: this.physiotherapist,
            params: { patientID: patient.id }
        }, {
            send(data) {
                expect(data instanceof Object).toBe(true)
                expect(data).toBeDefined()
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
                expect(physiotherapistCollection.getOnePatientByEmail).toHaveBeenCalled()
            }
        })
    })
    it('admin can get one patient', async function () {
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ ...this.patient, physiotherapistId: 1 })
        spyOn(bcrypt, 'hashSync').and.returnValue(true)
        await physiotherapist.getPatient({
            user: { role: 'admin', email: 'admin@email.com' },
            params: { patientID: 1 }
        }, {
            send(data) {
                expect(data instanceof Object).toBe(true)
                expect(data).toBeDefined()
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalled()
                expect(bcrypt.hashSync).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can not retrieve other physiotherapist patient', async function () {
        let patient = this.patient
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistEmail: 'different@email.com' })
        spyOn(physiotherapistCollection, 'getOnePatientByEmail').and.returnValue(this.patient)
        await physiotherapist.getPatient({
            user: this.physiotherapist,
            params: { patientID: patient.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
                expect(physiotherapistCollection.getOnePatientByEmail).not.toHaveBeenCalled()
            }
        })
    })
    it('cant find patient with unknown ID', async function () {
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistEmail: this.physiotherapist.email })
        spyOn(physiotherapistCollection, 'getOnePatientByEmail').and.returnValue(undefined)
        spyOn(bcrypt, 'hashSync').and.callThrough()
        await physiotherapist.getPatient({
            user: this.physiotherapist,
            params: { patientID: 1 }
        }, {
            sendStatus(status) {
                expect(status).toBe(404)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(1)
                expect(physiotherapistCollection.getOnePatientByEmail).toHaveBeenCalled()
                expect(bcrypt.hashSync).not.toHaveBeenCalled()
            }
        })
    })
})

describe('deletePatient access:', function () {
    it('user can delete own patient', async function () {
        let patient = this.patient, therapist = this.physiotherapist
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistId: therapist.id, sessionID: undefined })
        await spyOn(physiotherapistCollection, 'deleteOnePatient')
        await physiotherapist.deletePatient({
            user: therapist,
            params: { patientID: patient.id },
            body: { physiotherapistID: therapist.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
                expect(physiotherapistCollection.deleteOnePatient).toHaveBeenCalledWith(therapist.id, patient.id)
            }
        })
    })
    it('user cannot delete non assigned patients', async function () {
        let patient = this.patient
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistId: 2, sessionID: undefined  })
        await physiotherapist.deletePatient({
            user: this.physiotherapist,
            params: { patientID: patient.id },
            body: { physiotherapistID: this.physiotherapist.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
            }
        })
    })
    it('error on wrong patient data', async function () {
        let patient = this.patient
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistId: 2, sessionID: undefined })
        await physiotherapist.deletePatient({
            user: { role: 'admin' },
            params: { patientID: patient.id },
            body: { physiotherapistID: this.physiotherapist.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
            }
        })
    })
    it('cant delete patient that is part of a session', async function () {
        let patient = this.patient
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistId: this.physiotherapist.id, sessionID: 1 })
        await physiotherapist.deletePatient({
            user: { role: 'admin' },
            params: { patientID: patient.id },
            body: { physiotherapistID: this.physiotherapist.id }
        }, {
            status(status) {
                expect(status).toBe(409)
                return this
            },
            send(data) {
                expect(data).toBeDefined()
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
            }
        })
    })
    it('admin can delete one patient', async function () {
        let patient = this.patient, therapist = this.physiotherapist
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistId: therapist.id, sessionID: undefined })
        await spyOn(physiotherapistCollection, 'deleteOnePatient')
        await physiotherapist.deletePatient({
            user: { role: 'admin' },
            params: { patientID: patient.id },
            body: { physiotherapistID: therapist.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
                expect(physiotherapistCollection.deleteOnePatient).toHaveBeenCalledWith(therapist.id, patient.id)
                return this
            }
        })
    })
    it('generic error on deleting patient', async function () {
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue(undefined)
        await physiotherapist.deletePatient({
            user: { role: 'admin' },
            params: { patientID: 1 },
            body: { physiotherapistID: 2 }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalled()
            }
        })
    })
})

describe('editPatient access:', function () {
    it('get edit patient requires authentication', async function () {
        await physiotherapist.editPatient({ user: undefined, query: { newStatus: undefined } }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('error on missing patient edit data', async function () {
        let patient = this.patient
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistEmail: this.physiotherapist.id })
        await physiotherapist.editPatient({
            user: { role: 'admin' },
            body: { fullName: patient.names, dateOfBirth: undefined },
            params: { patientID: patient.id }, query: { newStatus: undefined }
        }, {
            status(status) {
                expect(status).toBe(400)
                return this
            },
            send(data) {
                expect(data).toBeDefined()
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
            }
        })
    })
    it('physiotherapist can not edit other physiotherapist patients', async function () {
        let patient = this.patient
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistEmail: 2 })
        await physiotherapist.editPatient({
            user: this.physiotherapist,
            body: { fullName: patient.names, dateOfBirth: new Date().toISOString() },
            params: { patientID: patient.id }, query: { newStatus: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
            }
        })
    })
    it('admin can edit one patient', async function () {
        let patient = this.patient
        await spyOn(physiotherapistCollection, 'getOnePatientByID')
        await spyOn(physiotherapistCollection, 'updateOnePatient')
        await physiotherapist.editPatient({
            user: { role: 'admin' },
            body: { fullName: patient.names, dateOfBirth: new Date().toISOString() },
            params: { patientID: patient.id }, query: { newStatus: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
                expect(physiotherapistCollection.updateOnePatient).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can edit assigned patient', async function () {
        let patient = this.patient, therapist = this.physiotherapist
        await spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({ physiotherapistEmail: therapist.email })
        await spyOn(physiotherapistCollection, 'updateOnePatient')
        await physiotherapist.editPatient({
            user: therapist,
            body: { fullName: patient.names, dateOfBirth: new Date().toISOString() },
            params: { patientID: patient.id }, query: { newStatus: undefined }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalledWith(patient.id)
                expect(physiotherapistCollection.updateOnePatient).toHaveBeenCalled()
            }
        })
    })
})

describe('getInfo access:', function () {
    let cookie_name = undefined
    beforeAll(async () => {
        jasmine.clock().install()
        spyOn(jwt, 'verify').and.callFake((token, secret, callback) => callback(null, { patient: { secret: true } }))
        cookie_name = (await import('../../../src/utils/cookies.js')).default.patient.name.toString()
    })
    afterAll(() => jasmine.clock().uninstall())

    it('patient can get info', async function () {
        let patient = this.patient
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue(patient)
        spyOn(scheduler, 'isSurveyAvailable')
        await physiotherapist.getInfo({
            user: this.physiotherapist,
            params: { patientID: patient.id },
            query: { secret: true },
            cookies: {[cookie_name]: true}
        }, {
            send(data) {
                expect(data.patient).toBeDefined()
                expect(data.newSurveyAvailable).toBeUndefined()
            }
        })
    })
    it('patient can get 1st survey (no surveys completed)', async function () {
        let patient = this.patient
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({...patient, sessionID: 1})
        spyOn(surveysCollection, 'getSurveysByPatientID').and.returnValue([])
        spyOn(exercisesCollection, 'getExercisesInSessionByEmail').and.returnValue([])
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue([])
        spyOn(scheduler, 'isSurveyAvailable').and.callThrough()
        await physiotherapist.getInfo({
            user: this.physiotherapist,
            params: { patientID: patient.id },
            query: { secret: true },
            cookies: {[cookie_name]: true}
        }, {
            send(data) {
                expect(data.patient).toBeDefined()
                expect(data.newSurveyAvailable).toBeDefined()
                expect(data.newSurveyAvailable.completed).toEqual(0)
                expect(data.newSurveyAvailable.currentSurveyID).toBe('T1')
            }
        })
    })
    it('patient can get 2nd survey (min 3 exercises)', async function () {
        let patient = this.patient, survey = this.surveys[0], exercises = this.exercises
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({...patient, sessionID: 1})
        spyOn(surveysCollection, 'getSurveysByPatientID').and.returnValue([survey])
        spyOn(exercisesCollection, 'getExercisesInSessionByEmail').and.returnValue(exercises)
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue(true)
        spyOn(scheduler, 'isSurveyAvailable').and.callThrough()
        await physiotherapist.getInfo({
            user: this.physiotherapist,
            params: { patientID: patient.id },
            query: { secret: true },
            cookies: { [cookie_name]: true }
        }, {
            send(data) {
                expect(data.patient).toBeDefined()
                expect(data.newSurveyAvailable).toBeDefined()
                expect(data.newSurveyAvailable.completed).toEqual(1)
                expect(data.newSurveyAvailable.currentSurveyID).toBe('T2')
                expect(data.newSurveyAvailable.userType).toBeDefined()
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalled()
                expect(surveysCollection.getSurveysByPatientID).toHaveBeenCalled()
            }
        })
    })
    it('patient can get 3rd survey (min 5 exercises & 6 weeks)', async function () {
        let surveyDate = new Date(), patient = this.patient, surveys = this.surveys, exercises = this.exercises, daysToAdd = 43
        surveyDate.setDate(surveyDate.getDate() + daysToAdd)
        jasmine.clock().mockDate(surveyDate)
        spyOn(physiotherapistCollection, 'getOnePatientByID').and.returnValue({...patient, sessionID: 1})
        spyOn(surveysCollection, 'getSurveysByPatientID').and.returnValue(surveys)
        spyOn(exercisesCollection, 'getExercisesInSessionByEmail').and.returnValue([...exercises, { id: 1 }, { id: 2 }])
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue(true)
        spyOn(scheduler, 'isSurveyAvailable').and.callThrough()
        await physiotherapist.getInfo({
            user: this.physiotherapist,
            params: { patientID: patient.id },
            query: { secret: true },
            cookies: { [cookie_name]: true }
        }, {
            send(data) {
                expect(data.patient).toBeDefined()
                expect(data.newSurveyAvailable).toBeDefined()
                expect(data.newSurveyAvailable.completed).toEqual(2)
                expect(data.newSurveyAvailable.currentSurveyID).toBe('T3')
                expect(data.newSurveyAvailable.userType).toBeDefined()
                expect(physiotherapistCollection.getOnePatientByID).toHaveBeenCalled()
                expect(surveysCollection.getSurveysByPatientID).toHaveBeenCalled()
            }
        })
    })
})
