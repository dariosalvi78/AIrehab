import config from '../utils/config.js'

const mssql_port = 1433

export default {

    msSQLConnection: {
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
}