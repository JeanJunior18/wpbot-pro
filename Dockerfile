FROM node:alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

RUN npm install pm2 -g

COPY . .

EXPOSE 3333

CMD ["pm2-runtime", "src/server.js"]