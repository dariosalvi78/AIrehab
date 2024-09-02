# AIrehab
AI based physiotherapy rehabilitation


## Backend

Setup of the database:

- Start a Microsoft SQL server:
`docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=MyPassword_1234" -e "MSSQL_PID=Developer" -p 1433:1433  --name msql --hostname msql -d mcr.microsoft.com/mssql/server:2022-preview-ubuntu-22.04`. Notice that the administrator user for the database will be `sa` with password `MyPassword_1234`.
- connect to the database from command line using: `docker exec -it msql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P MyPassword_1234`
- create a new database:
```sql
CREATE DATABASE AIREHAB COLLATE SQL_Latin1_General_CP1_CI_AS;
USE AIREHAB
GO
```
- create a user for the database: 
```sql
CREATE LOGIN airehab
WITH PASSWORD = 'MyPassword_1234';
GO
CREATE USER airehab FOR LOGIN airehab WITH DEFAULT_SCHEMA=airehab
GO
```
- create a schema:
```sql
CREATE SCHEMA airehab AUTHORIZATION airehab
GO
```
- give permissions to user:
```sql
EXEC sp_addrolemember 'db_ddladmin', 'airehab';
EXEC sp_addrolemember 'db_datareader', 'airehab';
EXEC sp_addrolemember 'db_datawriter', 'airehab';
GO
```
- create the schema tables: copy paste the schema.sql into the SQL interpreter and run it


Setup of the nodejs server:

- in the backend folder, install all dependencies: `npm i`


## Frontend

## Tests


