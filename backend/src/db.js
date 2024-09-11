
import mssql from 'mssql'
import config from './utils/config.js'
import logger from './utils/logger.js'

const mssql_port = 1433

const msSQLConnection = {
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    server: config.db.host,
    port: mssql_port,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: config.environment == 'dev' ? true : false // change to true for local dev / self-signed certs
    }
}

// make sure that any items are correctly URL encoded in the connection string
await mssql.connect(msSQLConnection)

export default {
    /**
     * Send DB query
     */
    query: async function (text) {
        let res = await mssql.query(text)
        logger.info({
            query: text,
            rows: res.output
        }, 'query executed')
        return res
    },

    /**
     * Checks if db connection is OK
     */
    tryConnection: async function () {
        try {
            const result = await this.query(`SELECT GetDate() as currDate`)
            if (result) {
                logger.info('db is running:', result.recordset[0].currDate)
                return result
            }
        } catch (err) {
            logger.info('db connection failed: ', err)
        }
    },


    close: async function () { }
}
