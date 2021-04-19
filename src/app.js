const express = require('express');
const cors = require('cors');
const http = require('http');

const router = require('./router');

class App {
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);

    this.middlewares();
    this.router();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  router() {
    this.app.use(router);
  }
}

const app = new App();

module.exports = app;
