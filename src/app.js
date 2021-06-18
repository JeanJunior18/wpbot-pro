const express = require('express');
const cors = require('cors');

const router = require('./router');

class App {
  constructor() {
    this.express = express();

    this.middlewares();
    this.router();
  }

  middlewares() {
    this.express.use(cors());
    this.express.use(express.json());
  }

  router() {
    this.express.use(router);
  }
}

module.exports = new App().express;
