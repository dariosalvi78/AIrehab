import mssql from 'mssql'
import fs from 'fs/promises'
import path from 'path'

const mssql_port = 1443
const root_password = 'TestPassword_1234'
const pathToSQLFile = '../../datamodel/schema.sql'

/**
 * @type {mssql.ConnectionPool}
 */
let db = undefined

const root = {
  server: 'localhost',
  user: 'sa',
  port: mssql_port,
  password: root_password,
  database: 'master',
  options: { trustServerCertificate: true, encrypt: false } 
}

export default {
  /**
   * Connect to DB,
   * use different DB name for every test suite
   * @param {Object} config
   */
  connectToDatabase: async function (config) {
    try {
      if (db) {
        await db.close()
        db = undefined
      }
      let db_connection = await mssql.connect({ 
        server: config.server, 
        user: config.user, 
        password: config.password, 
        options: config.options,
        database: config.database
      })
      console.debug('connected to test db as user: ', config.user)
      db = db_connection
      return db_connection
    } catch (err) {
      console.error('test db connection failed: ', err)
      if (db) {
        await db.close()
        db = undefined
      }
      return
    }
  },

  /**
   * Creates new test database, schema and user from test config
   * @param {Object} db_config
   */
  createNewDatabase: async function (db_config) {
    db = undefined
    await this.connectToDatabase(root)

    try {
      if (!db) return

      let res = await db.query(`SELECT name FROM master.sys.server_principals WHERE name = '${db_config.user}'`)
      if (!res.recordset[0]) {
        console.log('creating login: ', db_config.user)
        await db.query(`
          BEGIN
            CREATE LOGIN ${db_config.user}
            WITH PASSWORD = '${db_config.password}';
          END`
        )
      }

      res = await db.query(`SELECT 1 FROM master.sys.database_principals WHERE name = '${db_config.user}'`)
      if (!res.recordset[0]) {
        console.log('creating user: ', db_config.user)
        await db.query(`
          BEGIN
            CREATE USER ${db_config.user} FOR LOGIN ${db_config.user};
            ALTER ROLE db_owner ADD MEMBER ${db_config.user};
          END
          `)
        }

      res = await db.query(`SELECT name FROM sys.databases WHERE name = '${db_config.database}';`)
      if (!res.recordset[0]) {
        console.log('creating test db: ', db_config.database)
        await db.query(`
          BEGIN
            CREATE DATABASE ${db_config.database} COLLATE SQL_Latin1_General_CP1_CI_AS;
            ALTER AUTHORIZATION ON DATABASE::[${db_config.database}] TO [${db_config.user}];
          END
        `)
      }

      await this.connectToDatabase(db_config)

      await runSQLSchema(pathToSQLFile)
      if (db) await db.close()
      db = undefined

    } catch (err) {
      console.error(err)
      if (db) await db.close()
      db = undefined
    }
  },

  /**
   * Drop database
   * needs to be connected to root user (sa)
   * @param {Object} db_config 
   */
  dropDatabase: async function (db_config) {
    try {
      if (db) {
        await db.close()
        db = undefined
      }
      await this.connectToDatabase(root)
      
      let res = await db.query(`SELECT name FROM sys.databases WHERE name = '${db_config.database}'`)
      if (res.recordset[0]) {
        console.log('drop database: ', db_config.database)
        await db.query(`DROP DATABASE ${db_config.database}`)
      }   
    } catch (err) {
      console.log(err)
      if (db) await db.close()
      db = undefined
    }
  }
}

/**
 * Execute sql script,
 * make sure to use the latest schema.sql
 * @param {Object} pathToSQLFile
 */
const runSQLSchema = async function (pathToSQLFile) {
  try {
    const sql_script = await fs.readFile(path.join(import.meta.dirname, pathToSQLFile), { encoding: 'utf-8' })
    if (sql_script) {
      console.log('populate db with schema objects')
      await db.query(sql_script)
    }
  } catch (err) {
    console.log(err)
    if (db) await db.close()
    db = undefined
  }
}
