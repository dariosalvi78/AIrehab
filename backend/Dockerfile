FROM node:22.11.0

RUN mkdir -p /usr/src/app/src

WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/

RUN npm i

COPY ./public /usr/src/app/public
COPY ./src /usr/src/app/src

CMD [ "npm", "start" ]

EXPOSE 8080
