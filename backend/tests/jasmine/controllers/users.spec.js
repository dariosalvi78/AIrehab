import users from '../../../src/controllers/users.js'
import usersCollection from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import logger from "../../../src/utils/logger.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import physiotherapistCollection from '../../../src/DOM/physiotherapistCollection.js'
import mock from '../../mock_data.js'
import scheduler from '../../../src/utils/scheduler.js'
import surveysCollection from '../../../src/DOM/surveysCollection.js'

beforeAll(async function () {
    await spyOnAllFunctions(logger)
    this.physiotherapist = JSON.parse(JSON.stringify(mock.physiotherapist))
    this.surveys = JSON.parse(JSON.stringify(mock.surveys))
})

describe('addNewUser access:', function () {

    it('creating user requires authentication', async function () {
        spyOn(usersCollection, 'getUserByEmail')
        await users.addNewUser({ user: {} }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(usersCollection.getUserByEmail).not.toHaveBeenCalled()
            }
        })
    })
    it('cant create user as physiotherapist', async function () {
        spyOn(usersCollection, 'getUserByEmail')
        await users.addNewUser({ user: { role: 'physiotherapist' }, body: {} }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(usersCollection.getUserByEmail).not.toHaveBeenCalled()
            }
        })
    })
    it('missing content', async function () {
        spyOn(usersCollection, 'createUser').and.returnValue(this.physiotherapist)
        spyOn(usersCollection, 'getUserByEmail').and.returnValue(null)
        await users.addNewUser({ user: { role: 'admin' }, body: {} }, {
            sendStatus(status) {
                expect(status).toBe(400)
            }
        })
    })
    it('user already exists', async function () {
        spyOn(usersCollection, 'createUser').and.returnValue(this.physiotherapist)
        let userFind = spyOn(usersCollection, 'getUserByEmail').and.returnValue(this.physiotherapist)
        await users.addNewUser({
            user: { role: 'admin' },
            body: {
                email: 'email@test.com',
                role: 'physiotherapist',
                password: 'password'
            }
        }, {
            status: function (status) {
                expect(userFind).toHaveBeenCalled()
                expect(status).toBe(409)
                return this
            },
            send: function (data) {
                expect(data).toBeDefined()
            }
        })
    })
    it('create user as admin', async function () {
        spyOn(jwt, 'sign').and.returnValue({
            expiresIn: config.JWT.EXPIRE,
            user: this.physiotherapist.id
        })
        spyOn(usersCollection, 'createUser').and.returnValue(this.physiotherapist)
        spyOn(usersCollection, 'getUserByEmail').and.returnValue(null)

        await users.addNewUser({
            user: { role: 'admin' },
            body: {
                email: 'email@test.com',
                password: 'password',
                role: 'physiotherapist'
            }
        }, {
            sendStatus(status) { },
            status(status) {
                expect(status).toBe(201)
                return this
            },
            json(user) {
                expect(user.status).toBeDefined()
                expect(user.token).toBeDefined()
                expect(user.data.newUser).toBeDefined()
            }
        })
    })
})

describe('login access:', function () {

    it('wrong credentials', async function () {
        spyOn(usersCollection, 'getUserByEmail')
        await users.login({ body: {} }, {
            status(status) {
                expect(status).toBe(400)
                return this
            },
            send(data) {
                expect(data).toBe('Please enter email and password')
                expect(usersCollection.getUserByEmail).not.toHaveBeenCalled()
            }
        })
    })
    it('user does not exist', async function () {
        spyOn(usersCollection, 'getUserByEmail').and.returnValue(null)
        spyOn(usersCollection, 'updateUserLoginTimestamp')
        await users.login({ body: { email: 'email@test.com', password: 'password' } }, {
            status(status) {
                expect(status).toBe(404)
                return this
            },
            send(data) {
                expect(data).toContain('Wrong credentials')
                expect(usersCollection.updateUserLoginTimestamp).not.toHaveBeenCalled()
            }
        })
    })
    it('user does exist, but wrong password', async function () {
        spyOn(bcrypt, 'compareSync').and.returnValue(false)
        spyOn(usersCollection, 'updateUserLoginTimestamp')
        spyOn(usersCollection, 'getUserByEmail').and.returnValue({ email: 'test@email.com', password: 'notmatch123.' })
        await users.login({ body: { email: 'email@test.com', password: 'password' } }, {
            status(status) {
                expect(status).toBe(404)
                return this
            },
            send(data) {
                expect(data).toContain('Wrong credentials')
                expect(usersCollection.updateUserLoginTimestamp).not.toHaveBeenCalled()
            }
        })
    })
    it('user login ok, timestamp set', async function () {
        let leader = JSON.parse(JSON.stringify(this.physiotherapist))

        spyOn(jwt, 'sign').and.returnValue({
            expiresIn: '1s',
            user: { email: leader.email, role: leader.role }
        })
        
        spyOn(bcrypt, 'compareSync').and.returnValue(true)
        spyOn(usersCollection, 'getUserByEmail').and.returnValue(leader)
        spyOn(usersCollection, 'createUser').and.returnValue(leader)
        spyOn(usersCollection, 'updateUserLoginTimestamp')

        await users.login({ body: { email: leader.email, password: leader.hashedPassword, role: leader.role } }, {
            cookie(data) {
                expect(data).toBeDefined()
                return this
            },
            send(data) {
                expect(usersCollection.updateUserLoginTimestamp).toHaveBeenCalled()
                expect(usersCollection.getUserByEmail).toHaveBeenCalled()
                expect(data.user).toBeDefined()
            }
        })
    })
})

describe('getUsers access:', function () {
    it('physiotherapist cant get all users', async function () {
        await users.getUsers({ user: { email: 'email@test.com', role: 'physiotherapist' } }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('admin can get all users', async function () {
        spyOn(usersCollection, 'getUsers').and.returnValue([this.physiotherapist])
        await users.getUsers({ user: { email: 'admin@test.com', role: 'admin' } }, {
            send(data) {
                expect(usersCollection.getUsers).toHaveBeenCalled()
                expect(data).toBeDefined()
            }
        })
    })
})

describe('getUser access:', function () {
    it('physiotherapist cant get one user', async function () {
        await users.getUser({ user: { email: 'email@test.com', role: 'physiotherapist' } }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('cant find user, wrong data', async function () {
        spyOn(usersCollection, 'getOneUser').and.returnValue(this.physiotherapist)
        await users.getUser({ user: { email: 'admin@test.com', role: 'admin' } }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(usersCollection.getOneUser).not.toHaveBeenCalled()
            }
        })
    })
    it('admin can get one user', async function () {
        spyOn(usersCollection, 'getOneUser').and.returnValue(this.physiotherapist)
        await users.getUser({
            user: {
                email: 'admin@test.com',
                role: 'admin'
            },
            params: { userID: 1 }
        },
            {
                send(data) {
                    expect(usersCollection.getOneUser).toHaveBeenCalled()
                    expect(data).toBeDefined()
                }
            })
    })
})

describe('deleteUser access:', function () {
    it('physiotherapist cant delete one user', async function () {
        await users.deleteUser({ user: { email: 'email@test.com', role: 'physiotherapist' } }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('cant find user, wrong data', async function () {
        spyOn(usersCollection, 'deleteOneUser')
        await users.deleteUser({
            user: { email: 'admin@test.com', role: 'admin' },
            params: { userID: 0 }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(usersCollection.deleteOneUser).not.toHaveBeenCalled()
            }
        })
    })
    it('cannot delete physiotherapist with patients', async function () {
        spyOn(usersCollection, 'deleteOneUser')
        spyOn(usersCollection, 'getOneUser').and.returnValue(this.physiotherapist)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue({ numOfPatients: 2 }, this.physiotherapist)
        await users.deleteUser({
            user: {
                email: 'admin@test.com',
                role: 'admin'
            },
            params: { userID: 1 }
        },
            {
                status (status) {
                    expect(status).toBe(409)
                    return this
                },
                send (data) {
                    expect(data).toBeDefined()
                }
            })
    })
    it('admin can delete one physiotherapist with no patients', async function () {
        spyOn(usersCollection, 'deleteOneUser')
        spyOn(usersCollection, 'getOneUser').and.returnValue(this.physiotherapist)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue({ numOfPatients: 0 }, this.physiotherapist)
        await users.deleteUser({
            user: {
                email: 'admin@test.com',
                role: 'admin'
            },
            params: { userID: 1 }
        },
            {
                sendStatus(status) {
                    expect(status).toBe(204)
                    expect(usersCollection.getOneUser).toHaveBeenCalled()
                    expect(physiotherapistCollection.getOneTherapistByEmail).toHaveBeenCalled()
                    expect(usersCollection.deleteOneUser).toHaveBeenCalled()
                }
            })
    })
})

describe('getInfo access:', function () {
    beforeAll(() => jasmine.clock().install())
    afterAll(() => jasmine.clock().uninstall())

    it('physiotherapist can get info', async function () {
        spyOn(usersCollection, 'getUserByEmail').and.returnValue({ email: this.physiotherapist.email, lastLoginTimestamp: new Date().toISOString(), activated: true, role: this.physiotherapist.role })
        spyOn(scheduler, 'isSurveyAvailable')
        await users.getInfo({ user: { email: 'email@test.com', role: 'physiotherapist' } }, {
            json(data) {
                expect(data.email).toBeDefined()
                expect(data.lastLoginTimestamp).toBeDefined()
                expect(data.activated).toBeDefined()
                expect(data.newSurveyAvailable).toBeUndefined()
            }
        })
    })
    it('physiotherapist can get 1st survey (no surveys completed)', async function () {
        spyOn(usersCollection, 'getUserByEmail').and.returnValue({ email: this.physiotherapist.email, lastLoginTimestamp: new Date().toISOString(), activated: true, role: this.physiotherapist.role })
        spyOn(surveysCollection, 'getSurveysByPhysioID').and.returnValue([])
        spyOn(scheduler, 'isSurveyAvailable').and.callThrough()
        await users.getInfo({ user: { email: 'email@test.com', role: 'physiotherapist' } }, {
            sendStatus (status) {
                expect(status).not.toBe(500)
                return this
            },
            json(data) {
                expect(data).toBeDefined()
                expect(data.newSurveyAvailable.completed).toEqual(0)
                expect(data.newSurveyAvailable.currentSurveyID).toBe('T1')
                expect(data.newSurveyAvailable.userType).toBeDefined()
            }
        })
    })
    it('physiotherapist can get 2nd survey (14 days past)', async function () {
        let surveyDate = new Date(), survey = this.surveys[0], daysToAdd = 14
        surveyDate.setDate(surveyDate.getDate() + daysToAdd)
        spyOn(usersCollection, 'getUserByEmail').and.returnValue({ email: this.physiotherapist.email, lastLoginTimestamp: new Date().toISOString(), activated: true, role: this.physiotherapist.role })
        spyOn(surveysCollection, 'getSurveysByPhysioID').and.returnValue([survey])
        jasmine.clock().mockDate(surveyDate)
        spyOn(scheduler, 'isSurveyAvailable').and.callThrough()
        await users.getInfo({ user: { email: 'email@test.com', role: 'physiotherapist' } }, {
            sendStatus (status) {
                expect(status).not.toBe(500)
                return this
            },
            json(data) {
                expect(data.email).toBeDefined()
                expect(data.lastLoginTimestamp).toBeDefined()
                expect(data.activated).toBeDefined()
                expect(data.newSurveyAvailable.completed).toEqual(1)
                expect(data.newSurveyAvailable.currentSurveyID).toBe('T2')
                expect(data.newSurveyAvailable.userType).toBeDefined()
                expect(usersCollection.getUserByEmail).toHaveBeenCalled()
                expect(surveysCollection.getSurveysByPhysioID).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can get 3rd survey (60 days past)', async function () {
        let surveyDate = new Date(), surveys = this.surveys, daysToAdd = 60
        surveyDate.setDate(surveyDate.getDate() + daysToAdd)
        spyOn(usersCollection, 'getUserByEmail').and.returnValue({ email: this.physiotherapist.email, lastLoginTimestamp: new Date().toISOString(), activated: true, role: this.physiotherapist.role })
        spyOn(surveysCollection, 'getSurveysByPhysioID').and.returnValue(surveys)
        jasmine.clock().mockDate(surveyDate)
        spyOn(scheduler, 'isSurveyAvailable').and.callThrough()
        await users.getInfo({ user: { email: 'email@test.com', role: 'physiotherapist' } }, {
            sendStatus (status) {
                expect(status).not.toBe(500)
                return this
            },
            json(data) {
                expect(data.email).toBeDefined()
                expect(data.lastLoginTimestamp).toBeDefined()
                expect(data.activated).toBeDefined()
                expect(data.newSurveyAvailable.completed).toEqual(surveys.length)
                expect(data.newSurveyAvailable.currentSurveyID).toBe('T3')
                expect(data.newSurveyAvailable.userType).toBeDefined()
                expect(usersCollection.getUserByEmail).toHaveBeenCalled()
                expect(surveysCollection.getSurveysByPhysioID).toHaveBeenCalled()
            }
        })
    })
})
