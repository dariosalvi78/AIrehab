#!/bin/bash

 # Start SQL server
/opt/mssql/bin/sqlservr &

# Wait until db is running
until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'MyPassword_1234' -Q 'SELECT 1' &> /dev/null;  do >&2 sleep 5; done;

# Run init-scripts
echo 'Database is ready, running .sql scripts'; 
/opt/mssql-tools/bin/sqlcmd -S localhost -l 60 -U sa -P 'MyPassword_1234' -d master -i init.sql; 
/opt/mssql-tools/bin/sqlcmd -l 5 -S localhost -l 60 -U sa -P 'MyPassword_1234' -d master -i schema.sql; 
echo 'Init scripts done';

sleep infinity;