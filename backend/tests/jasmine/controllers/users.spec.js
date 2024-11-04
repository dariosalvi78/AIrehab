import users from '../../../src/controllers/users.js'
import usersCollection from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import logger from "../../../src/utils/logger.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import physiotherapistCollection from '../../../src/DOM/physiotherapistCollection.js'
import mock from '../../mock_data.js'

beforeAll(async function () {
    await spyOnAllFunctions(logger)
    this.physiotherapist = JSON.parse(JSON.stringify(mock.physiotherapist))
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
        spyOn(jwt, 'sign').and.returnValue({
            expiresIn: config.JWT.EXPIRE,
            user: this.physiotherapist.id
        })
        spyOn(bcrypt, 'compareSync').and.returnValue(true)
        let userFind = spyOn(usersCollection, 'getUserByEmail').and.returnValue(this.physiotherapist)
        spyOn(usersCollection, 'createUser').and.returnValue(this.physiotherapist)
        let loginTimestamp = spyOn(usersCollection, 'updateUserLoginTimestamp')

        await users.login({ body: { email: 'email@test.com', password: 'password', role: 'physiotherapist' } }, {
            send(data) {
                expect(loginTimestamp).toHaveBeenCalled()
                expect(userFind).toHaveBeenCalled()
                expect(data.user).toBeDefined()
            },
            cookie() { }
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
        this.physiotherapist["numOfPatients"] = 2
        spyOn(usersCollection, 'deleteOneUser')
        spyOn(usersCollection, 'getOneUser').and.returnValue(this.physiotherapist)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(this.physiotherapist)
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
        this.physiotherapist["numOfPatients"] = 0
        spyOn(usersCollection, 'deleteOneUser')
        spyOn(usersCollection, 'getOneUser').and.returnValue(this.physiotherapist)
        spyOn(physiotherapistCollection, 'getOneTherapistByEmail').and.returnValue(this.physiotherapist)
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
