FROM node:20.17.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package* /usr/src/app/

RUN npm i

COPY . /usr/src/app

CMD [ "npm run node:start" ]

EXPOSE 8080
