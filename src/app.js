import express from 'express';
import cors from 'cors';
import http from 'http';

class App {
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);

    console.log('Instanced Server');
  }

  middlewares() {
    this.app.use(cors());
  }
}

const app = new App();

export default app;
