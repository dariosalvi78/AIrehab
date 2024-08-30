# AIrehab
AI based physiotherapy rehabilitation


## Backend

Setup:

- Start a Microsoft SQL server:
`docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=MyPassword_1234" -e "MSSQL_PID=Developer" -p 1433:1433  --name msql --hostname msql -d mcr.microsoft.com/mssql/server:2022-preview-ubuntu-22.04`. Notice that the administrator user for the database will be `sa` with password `MyPassword_1234`.
- create a user for the database:
- create the the database schema:
- in the backend folder, install all dependencies: `npm i`


## Frontend

## Tests