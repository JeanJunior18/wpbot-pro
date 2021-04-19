const { Router } = require('express');
const VenomController = require('./app/controller/venomController');

const router = new Router();

router.get('/', (req, res) => {
  res.json({ status: 'on' });
});

router.post('/connect', VenomController.newClient);
router.post('/send_message', VenomController.sendTextMessage);
router.get('/check_sessions', VenomController.checkSessions);
router.post('/teste', (req, res) => {
  console.log(req.body);
  return res.json();
});

module.exports = router;
