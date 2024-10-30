import users from '../../../src/DOM/usersCollection.js'
import config from '../../../src/utils/config.js'
import logger from "../../../src/utils/logger.js"
import mock from '../../mock_data.js'
import db from '../../testDBTools.js'

describe('can connect to test db', function () {

    beforeAll(async function () {
        await spyOnAllFunctions(logger)
        this.physiotherapist = mock.physiotherapist
        
        mock.db.database = 'test_users'
        config.db = mock.db
        await db.createNewDatabase(config.db)
    })

    it('get users', async function () {
        await users.createUser('email@test.com', 'password', 'physiotherapist')
        let results = await users.getUsers()
        console.log('users ', results)
    })

    afterAll(async function () {
        await db.dropDatabase(config.db)
    })
})
