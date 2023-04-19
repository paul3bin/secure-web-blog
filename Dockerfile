FROM node:16.8.0-alpine

WORKDIR /api

RUN npm install -g npm@7.24.0

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

COPY package.json package-lock.json ./

RUN npm install

COPY . ./

EXPOSE 8085
