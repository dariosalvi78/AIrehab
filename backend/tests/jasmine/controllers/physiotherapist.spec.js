import physiotherapist from '../../../src/controllers/physiotherapist.js'
import physiotherapistCollection from '../../../src/DOM/physiotherapistCollection.js'
import config from '../../../src/utils/config.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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
        names: 'test name'
    }
})

describe('addNewPatient access:', function () {

    it('creating user requires authentication', async function () {
        await physiotherapist.addNewPatient({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('missing content', async function () {
        await physiotherapist.addNewPatient({ user: { role: 'physiotherapist' }, body: {} }, {
            status(status) {
                expect(status).toBe(400)
                return this
            },
            send(data) {
                expect(data).toBeDefined()
            }
        })
    })
    it('cant add already existing patient', async function () {
        spyOn(physiotherapistCollection, 'getOnePatientByName').and.returnValue(this.patient)
        await physiotherapist.addNewPatient({ user: { role: 'physiotherapist' }, body: { fullName: 'test name', dateOfBirth: new Date().toISOString() } }, {
            status(status) {
                expect(status).toBe(409)
                return this
            },
            send(data) {
                expect(data).toBeDefined()
            }
        })
    })
    it('admin error on invalid email', async function () {
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
                    expect(data).toBeDefined()
                }
            })
    })
})