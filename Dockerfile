FROM node:14.17.0-alpine

WORKDIR /usr/app

RUN apk update && apk add --no-cache git

COPY package*.json ./

RUN npm install --production

RUN npm install pm2 -g

COPY . .

EXPOSE 3333

CMD ["pm2-runtime", "src/server.js"]