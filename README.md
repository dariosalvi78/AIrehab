# AIrehab
AI based physiotherapy rehabilitation

## Pre requisites

- nodejs v 22
- a running MSQL server
- (optional) [Quasar CLI](https://quasar.dev/quasar-cli/installation)


### Setup of the database (for development):

- Start a Microsoft SQL server from the root folder of the project:

From the folder database/ run:
```sh
docker network create airrehabnet
docker build -t airehabdb  .
docker run --name airehabdb -d -p 1433:1433 --net=airrehabnet airehabdb
```

This will build a MS SQL image and run initialization files to create the user (`airehab`, `MyPassword_1234`), the schema (`AIREHAB`) and the tables.


## Backend

The backend exposes the database and the AI algorithm through a REST API adding authentication and access control. It is programmed as a nodejs application, and can be run as a Docker container.


### Setup of the nodejs server:

- In the backend folder, install all dependencies: `npm i`.
- Create a .env file in config folder. Use `.env_template` as a template.

### Start the server in development mode

Run:
```sh
npm run dev
```

_Make sure that database is running in the background_

If you want auto-reload when file chnage, install nodemon globally
```sh
npm i -g nodemon
```

Then run:
```sh
npm run dev:watch
```


### Compile and run the docker container

The docker container needs to copy source files from both the backend/ directory and the datamodel/directory, thus you need to run docker build from the root folder as:

```sh
docker build -t airehabbackend -f backend/Dockerfile .
```

Now run the docker container, remember to pass all the environemntal variables to it:

```sh
docker run -i \
--net=airrehabnet \
-p 8080:8080 \
--name airehabbackend \
-v ./public:/usr/src/public:ro \
-e ENVIRONMENT=dev \
-e DOMAIN_NAME=localhost \
-e SERVER_PORT=8080 \
-e JWT_SECRET_KEY=asdasdasdasdad \
-e JWT_EXPIRE=24h \
-e ADMIN_USERNAME=admin@test.test \
-e ADMIN_PASSWORD=MyPassword_1234 \
-e DB_HOSTNAME=airehabdb \
-e DB_PORT=1433 \
-e DB_NAME=airehab \
-e DB_USER=airehab \
-e DB_PASSWORD=MyPassword_1234 \
-e LOG_PATH=logs/ \
-e BASE_PATH_UPLOADS=uploads/ \
-e MAIL_PORT=587 \
-e MAIL_HOST=smtp.ethereal.email \
-e MAIL_SENDER=username@ethereal.email \
-e MAIL_USER=username@ethereal.email \
-e MAIL_PASSWORD=password \
-e POE_BASE_URL=airehabpoe \
-e POE_PORT=3000 \
airehabbackend 
```

Please notice that you need to set the account for ethereal.email and specify the public/ folder where the frontend static website is located.


## Frontend

This project is built using [Quasar framework](https://quasar.dev/).

### Pre requisites

- nodejs
- (optional) [Quasar CLI](https://quasar.dev/quasar-cli/installation) installed globally

Install the dependencies using:
```sh
yarn
# or
npm install
```

### Start the app in development mode

```bash
quasar dev
```

### Compile the docker container

This container does not run anything specific, it only compiles the code with `quasar build -m spa -s`.

First create a volume where to place the static code:

```sh
docker volume create airehabfrontend-store
```

Then build the image:
```sh
docker build -t airehabfrontend .
```

Then you can load the static content from the image into the volume  with:
```sh
docker run -v airehabfrontend-store:/usr/src/app/dist/spa --rm airehabfrontend true
```

You can now use this volume for example mounted on the public folder of the backend container:


```sh
docker run -i \
--net=airrehabnet \
-p 8080:8080 \
--name airehabbackend \
-v airehabfrontend-store:/usr/src/app/public:ro \

.... all the env variables here

airehabbackend 
```

## Tests
- You will need to create a test database in order to run tests locally. You can use the following command below, or configure your own connection config to match the one in /tests
`docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=TestPassword_1234" -e "MSSQL_PID=Developer" -p 1433:1433  --name poe_test_db --hostname msql -d mcr.microsoft.com/mssql/server:2022-preview-ubuntu-22.04`.

Once DB is running, start the tests using

```sh
npm run test
```

Or if you want to run tests during development

```sh
npm run test:watch
```


## Docker compose for development

There is a a docker compose file for testing in docker_compose/dev. It will spin up a database, the API server, the AI server and the frontend. While not useful for development, it can be used to check that the all setup holds up together.

Some folders are mounted on the mount/ folder so that it's possible to inspect their content easily.

## Docker compose for production

A similar docker compose file is available for production under  docker_compose/production. Make sure you modify all parameters according to your environment.
 