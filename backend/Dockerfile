FROM node:22.11.0

RUN mkdir -p /usr/src/app/src

WORKDIR /usr/src/app

COPY ./backend/package.json /usr/src/app/

RUN npm i

COPY ./datamodel /usr/src/datamodel
COPY ./backend/public /usr/src/app/public
COPY ./backend/src /usr/src/app/src

CMD [ "npm", "start" ]

EXPOSE 8080
