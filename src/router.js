const { Router } = require('express');
const VenomController = require('./app/controller/venomController');

const router = new Router();

router.get('/', (req, res) => {
  res.json({ status: 'on' });
});

router.get('/bot', VenomController.stanceBot);
router.post('/connect', VenomController.connectClient);
router.post('/teste', (req, res) => {
  console.log(req.body);
  return res.json();
});

module.exports = router;
