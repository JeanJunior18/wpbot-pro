import express from 'express';
import cors from 'cors';
import http from 'http';

import router from './router';

class App {
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);

    this.middlewares();
    this.router();

    console.log('Instanced Server');
  }

  middlewares() {
    this.app.use(cors());
  }

  router() {
    this.app.use(router);
  }
}

const app = new App();

export default app;
