FROM node:16.8.0-alpine

RUN mkdir /api

WORKDIR /api

RUN npm install -g npm@7.24.0

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

COPY ./ /api/

RUN npm install

EXPOSE 8085
