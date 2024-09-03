# AIrehab
AI based physiotherapy rehabilitation


## Backend

The backend exposes the database and the AI algorithm through a REST API adding authentication and access control. It is programmed as a nodejs application, and can be run as a Docker container.

### Setup of the database (for development):

- Start a Microsoft SQL server:
`docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=MyPassword_1234" -e "MSSQL_PID=Developer" -p 1433:1433  --name msql --hostname msql -d mcr.microsoft.com/mssql/server:2022-preview-ubuntu-22.04`. Notice that the administrator user for the database will be `sa` with password `MyPassword_1234`.
- Connect to the database from command line using: `docker exec -it msql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P MyPassword_1234`. Now you are running the SQL interpreter inside the container and can send commands through it. Alternatively, you can use a graphical client, such as DBeaver, and connect to the instance using localhost and port 1433.
- Create a new database:
send the following commands to the interpreter
```sql
CREATE DATABASE AIREHAB COLLATE SQL_Latin1_General_CP1_CI_AS;
USE AIREHAB
GO
```
- Create a user for the database with login information: 
```sql
CREATE LOGIN airehab
WITH PASSWORD = 'MyPassword_1234';
GO
CREATE USER airehab FOR LOGIN airehab WITH DEFAULT_SCHEMA=airehab
GO
```
- Create a schema inside the database:
```sql
CREATE SCHEMA airehab AUTHORIZATION airehab
GO
```
- Give permissions to user:
```sql
EXEC sp_addrolemember 'db_ddladmin', 'airehab';
EXEC sp_addrolemember 'db_datareader', 'airehab';
EXEC sp_addrolemember 'db_datawriter', 'airehab';
GO
```
- Create the schema tables: copy paste the schema.sql found in the datamodel folder into the SQL interpreter and run it.


When setting up the database for production, we c

### Setup of the nodejs server:

- In the backend folder, install all dependencies: `npm i`.
- Create a .env file in the same folder. Use `.env_example` as a template.


### 

## Frontend

## Tests


