"use strict";

var _require = require('express'),
    Router = _require.Router;

var VenomController = require('./app/controller/venomController');

var router = new Router();
router.get('/', function (req, res) {
  res.json({
    status: 'on'
  });
});
router.post('/connect', VenomController.newClient);
router.post('/send_message', VenomController.sendTextMessage);
router.get('/check_sessions', VenomController.checkSessions);
router.post('/teste', function (req, res) {
  console.log(req.body);
  return res.json();
});
module.exports = router;