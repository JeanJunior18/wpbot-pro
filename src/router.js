import { Router } from 'express';

import VenomController from './app/controller/venomController';

const router = new Router();

router.get('/', (req, res) => {
  res.json({ status: 'on' });
});

router.get('/bot', VenomController.stanceBot);

export default router;
