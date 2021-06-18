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
    this.express.use((req, res) => {
      return res.status(404).json({ error: 'Path Not Found' });
    });
    this.express.use((err, req, res, next) => {
      res.status(err.status || 500);
      next(err.message);
      res.json({ error: err.message });
    });
  }
}

module.exports = new App().express;
