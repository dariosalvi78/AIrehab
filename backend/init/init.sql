
USE master
GO

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'AIREHAB')
BEGIN
    CREATE DATABASE AIREHAB COLLATE SQL_Latin1_General_CP1_CI_AS;
END;
GO

-- Create a user for the database with login information: 

IF NOT EXISTS(SELECT name FROM master.sys.server_principals WHERE name = 'airehab')
BEGIN
    CREATE LOGIN airehab
    WITH PASSWORD = 'MyPassword_1234';
END
GO

USE AIREHAB
GO

IF NOT EXISTS(SELECT 1 FROM master.sys.database_principals WHERE name = 'airehab')
BEGIN
    CREATE USER airehab FOR LOGIN airehab WITH DEFAULT_SCHEMA=airehab;
    -- Give permissions to user:
    ALTER ROLE db_ddladmin ADD MEMBER airehab;
    ALTER ROLE db_datareader ADD MEMBER airehab;
    ALTER ROLE db_datawriter ADD MEMBER airehab;
END
GO

-- Create a schema inside the database:

IF (NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'airehab')) 
BEGIN
    EXEC ('CREATE SCHEMA [airehab] AUTHORIZATION [airehab]')
END
GO
