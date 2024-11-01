import users from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import mock from '../../mock_data.js'
import db from '../../testDBTools.js'

describe('Users collection', function () {

    beforeAll(async function () {
        this.physiotherapist = mock.physiotherapist
        
        mock.db.database = 'test_users'
        config.db = mock.db
        await db.createNewDatabase(config.db)
        await db.connectToDatabase(config.db)
    })

    afterAll(async function () {
        await db.dropDatabase(config.db)
    })

    describe('createUser', function () {
        let userID
        afterAll(async function () {
            await users.deleteOneUser(userID)
        })

        it('can create one new user', async function () {
            let therapist = this.physiotherapist
            let res = await users.createUser(therapist.email, therapist.hashedPassword, therapist.role)

            expect(res).toBeInstanceOf(Object)
            expect(res).toBeDefined()
            expect(res.createdTimestamp).toBeDefined()
            expect(res.id).toBeDefined()
            
            userID = res.id
        })
    })

    describe('updateUserLoginTimestamp', function () {
        let user

        beforeEach(async function () {
            user = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
        })
        
        afterAll(async function () {
            await users.deleteOneUser(user.id)
        })

        it('login timestamp can be set', async function () {
            let res = await users.getOneUser(user.id)
            expect(res.lastLoginTimestamp).toBeNull()
            
            await users.updateUserLoginTimestamp(user.id)
            res = await users.getOneUser(user.id)

            expect(res).toBeInstanceOf(Object)
            expect(res).toBeDefined()
            expect(res.createdTimestamp).toBeDefined()
            expect(res.lastLoginTimestamp).toBeDefined()
        })
    })

    describe('getUsers', function () {
        let user, patient_1, patient_2

        beforeEach(async function () {
            user = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
            patient_1 = await users.createUser(
                'patient1@email.com', 
                'password', 
                'patient'
            )
            patient_2 = await users.createUser(
                'patient2@email.com', 
                'password', 
                'patient'
            )
        })
        
        afterAll(async function () {
            await users.deleteOneUser(user.id)
            await users.deleteOneUser(patient_1.id)
            await users.deleteOneUser(patient_2.id)
        })

        it('can retrieve all users in db', async function () {
            let res = await users.getUsers()
            expect(res).toBeInstanceOf(Array)
            expect(res.length).toEqual(3)
            for (let i = 0; i < res.length; i++) {
                expect(res[i].id).toBeDefined()
                expect(res[i].email).toBeDefined()
                expect(res[i].role).toBeDefined()
                expect(res[i].createdTimestamp).toBeDefined()
                expect(res[i].hashedPassword).toBeUndefined()
            }
        })
    })

    describe('getUsersByRole', function () {
        let user, physiotherapist_2

        beforeEach(async function () {
            user = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
            physiotherapist_2 = await users.createUser(
                'physiotherapist2@email.com', 
                this.physiotherapist.hashedPassword,
                this.physiotherapist.role
            )
        }, 1000)

        afterAll(async function () {
            await users.deleteOneUser(user.id)
            await users.deleteOneUser(physiotherapist_2.id)
        })

        it('can retrieve all users with given role', async function () {
            let res = await users.getUsersByRole(user.role)
            expect(res).toBeInstanceOf(Array)
            expect(res.length).toEqual(2)
            for (const user in res) {
                expect(res[user].id).toBeDefined()
                expect(res[user].email).toBeDefined()
                expect(res[user].role).toBe(this.physiotherapist.role)
                expect(res[user].createdTimestamp).toBeDefined()
            }
        })
    })

    describe('getOneUser', function () {
        let user

        beforeEach(async function () {
            user = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
        }, 1000)

        afterAll(async function () {
            await users.deleteOneUser(user.id)
        })

        it('can get one user given user id', async function () {
            let res = await users.getOneUser(user.id)
            expect(res).toBeInstanceOf(Object)
            expect(res).toBeDefined()

            expect(res.email).toBe(this.physiotherapist.email)
            expect(res.role).toBe(this.physiotherapist.role)
            expect(res.createdTimestamp).toBeDefined()
            expect(res.lastLoginTimestamp).toBeNull()
        })
    })

    describe('updateUserNewLogin', function () {
        let user, newPassword = 'MyNewPassword123'

        beforeEach(async function () {
            user = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
        }, 1000)

        afterAll(async function () {
            await users.deleteOneUser(user.id)
        })

        it('can update user password with id and new password', async function () {
            
            let res = await users.getOneUser(user.id)
            expect(res.hashedpassword).toBe(this.physiotherapist.hashedPassword)

            await users.updateUserNewLogin(user.id, newPassword)

            res = await users.getOneUser(user.id)
            expect(res.hashedpassword).toBe(newPassword)
            expect(res).toBeInstanceOf(Object)
            expect(res.email).toBe(this.physiotherapist.email)
            expect(res.role).toBe(this.physiotherapist.role)
        })
    })

    describe('getUserByEmail', function () {
        let user

        beforeEach(async function () {
            user = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
        }, 1000)

        afterAll(async function () {
            await users.deleteOneUser(user.id)
        })

        it('can get one user given email', async function () {
            let res = await users.getUserByEmail(user.email)
            expect(res).toBeInstanceOf(Object)
            expect(res.id).toBeDefined()
            expect(res.hashedPassword).toBe(this.physiotherapist.hashedPassword)
            expect(res.email).toBe(this.physiotherapist.email)
            expect(res.role).toBe(this.physiotherapist.role)
            expect(res.createdTimestamp).toBeDefined()
            expect(res.lastLoginTimestamp).toBeNull()
        })
    })

    describe('deleteOneUser', function () {
        let user

        beforeEach(async function () {
            user = await users.createUser(
                this.physiotherapist.email, 
                this.physiotherapist.hashedPassword, 
                this.physiotherapist.role
            )
        }, 1000)

        afterAll(async function () {
            await users.deleteOneUser(user.id)
        })

        it('can delete one user with id', async function () {
            let res = await users.getOneUser(user.id)

            expect(res).toBeDefined()
            expect(res.email).toBe(this.physiotherapist.email)
            expect(res.role).toBe(this.physiotherapist.role)
            expect(res.createdTimestamp).toBeDefined()

            await users.deleteOneUser(user.id)

            res = await users.getOneUser(user.id)
            expect(res).toBeUndefined()
        })
    })
})