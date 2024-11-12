FROM mcr.microsoft.com/mssql/server:2022-preview-ubuntu-22.04

ENV ACCEPT_EULA=y
ENV MSSQL_SA_PASSWORD=MyPassword_1234
ENV MSSQL_PID=Developer
ENV MSSQL_BACKUP_DIR=/var/opt/mssql/backups
ENV MSSQL_LCID=1033
ENV TZ=Etc/UTC+1

COPY ./init.sql .
COPY ./entrypoint.sh .
COPY ./schema.sql .

EXPOSE 1433
CMD /bin/bash ./entrypoint.sh