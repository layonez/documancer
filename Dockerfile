FROM node:alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i
RUN npm run build

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "serve" ]