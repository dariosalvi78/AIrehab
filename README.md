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
docker run --name airehabdb -d -p 1433:1433 -t $(docker build -q .)
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

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).


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


## Docker compose for testing

There is a a docker compose file for testing in docker_compose/testing. It will spin up a database, the API server, the AI server and the frontend.


## Docker compose for production

A similar docker compose file is available for production under  docker_compose/production. Make sure you modify all parameters according to your environment.
 