# AIrehab
AI based physiotherapy rehabilitation


## Backend

Requirements:

- Start a Microsoft SQL server:
`docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=MyPassword_1234" -e "MSSQL_PID=Developer" -p 1433:1433  --name msql --hostname msql -d mcr.microsoft.com/mssql/server:2022-preview-ubuntu-22.04`

- create the database schema with: