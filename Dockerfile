FROM node:lts-bullseye-slim AS build

WORKDIR /usr/src/app

COPY . .

RUN npm i
RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "serve" ]