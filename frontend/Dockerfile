FROM node:20.17.0 as build

RUN npm install -g @quasar/cli@2.4.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

COPY package*.json ./

RUN npm i
RUN quasar build -m spa -s
