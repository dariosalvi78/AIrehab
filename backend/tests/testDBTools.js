import mssql from 'mssql'
import fs from 'fs/promises'
import path from 'path'

const mssql_port = 1443
const root_password = 'TestPassword_1234'

/**
 * @type {mssql.ConnectionPool}
 */
let db = undefined

const root = {
  server: 'localhost',
  user: 'sa',
  port: mssql_port,
  password: root_password,
  options: { trustServerCertificate: true, encrypt: true } 
}

export default {
  /**
   * Connect to db
   */
  connectToDatabase: async function (config) {
    try {
      let db_connection = await mssql.connect({ 
        server: config.server, 
        user: config.user, 
        password: config.password, 
        options: config.options, 
      })
      console.debug('connected to test db')
      return db_connection
    } catch (err) {
      console.error('test db connection failed: ', err)
    }
  },
  /**
   * Creates new test database, schema and user from test config
   * DB name should be different for every test suite
   * @param {Object} db_config
   */
  createNewDatabase: async function (db_config) {
    db = await this.connectToDatabase(root)

    try {
      if (!db) return
      let res = await db.query(`SELECT name FROM sys.databases WHERE name = '${db_config.database}';`)
      if (!res.recordset[0]) {
        console.log('creating test db: ', db_config.database)
        await db.query(`
          BEGIN
            CREATE DATABASE ${db_config.database} COLLATE SQL_Latin1_General_CP1_CI_AS;
          END
        `)
      }

      res = await db.query(`SELECT name FROM master.sys.server_principals WHERE name = '${db_config.user}'`)
      if (!res.recordset[0]) {
        console.log('creating login: ', db_config.user)
        await db.query(`
          USE ${db_config.database}
          BEGIN
            CREATE LOGIN airehab
            WITH PASSWORD = '${db_config.password}';
          END`
        )
      }
      res = await db.query(`SELECT 1 FROM master.sys.database_principals WHERE name = '${db_config.user}'`)
      if (!res.recordset[0]) {
        console.log('creating user: ', db_config.user)
        await db.query(`
          BEGIN
            CREATE USER airehab FOR LOGIN airehab WITH DEFAULT_SCHEMA=airehab;
            ALTER ROLE db_ddladmin ADD MEMBER airehab;
            ALTER ROLE db_datareader ADD MEMBER airehab;
            ALTER ROLE db_datawriter ADD MEMBER airehab;
            ALTER LOGIN airehab WITH DEFAULT_DATABASE = ${db_config.database};
          END
          `)
        }
      
      res = await db.query(`SELECT * FROM sys.schemas WHERE name = '${db_config.user}'`)
      if (!res.recordset[0]) {
        console.log('creating schema: ', db_config.user)
        await db.query(`
          CREATE SCHEMA [airehab] AUTHORIZATION [${db_config.user}]
        `)
      }
      
    } catch (err) {
      console.error(err)
      db = undefined
    }    
  },
  /**
   * Drop database
   * @param {Object} db_config 
   */
  dropDatabase: async function (db_config) {
    let res = await db.query(`SELECT name FROM sys.databases WHERE name = '${db_config.database}'`)
    if (res.recordset[0]) {
      console.log('drop database: ', db_config.database)
      await db.query(`DROP DATABASE ${db_config.database}`)
    }
  }
}
