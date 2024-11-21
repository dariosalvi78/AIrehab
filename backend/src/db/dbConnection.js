import config from '../utils/config.js'

const mssql_port = parseInt(config.db.port)

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
            trustServerCertificate: true // true for self-signed certs
        }
    }
}