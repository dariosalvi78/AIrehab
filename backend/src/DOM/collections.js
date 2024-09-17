
import connection from '../db/dbConnection.js'
import db from '../db/dbDriver.js'
import logger from '../utils/logger.js'

import { users } from './usersCollection.js'
import { physiotherapist } from './physiotherapistCollection.js'
import { exercises } from './exercisesCollection.js'

/**
 * Initialize access methods for querying db
 */
export default {
    db: undefined,

    async init() {
        try {
            this.db = await db.init(connection.msSQLConnection)

            // access properties for db layer
            await users.init(this.db)
            await physiotherapist.init(this.db)
            await exercises.init(this.db)

        } catch (err) {
            logger.error({ error: err }, 'cannot initialize db')
        }

        logger.debug('connected to db')
    },

    users,
    physiotherapist,
    exercises
}
