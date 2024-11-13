FROM node:22.11.0 as build

# install python (needed by some dev deps)
#RUN apk add --no-cache --virtual .gyp \
#    python \
#    make \
#    g++


RUN npm install -g @quasar/cli@2.4.1

RUN mkdir -p /usr/src/app
COPY . /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i
RUN quasar build -m spa -s

