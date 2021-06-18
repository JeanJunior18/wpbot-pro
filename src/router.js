const router = require('express').Router();
const ClientManager = require('./app/controller/ClientManagerController');

router.get('/sessions', (req, res) => {
  const { sessions } = ClientManager;

  return res.json(sessions);
});

router.get('/client/:token', (req, res) => {
  const data = ClientManager.getClientData(req.params.token);

  if (!data) return res.status(404).json({ error: 'Token not found' });

  return res.json(data);
});

module.exports = router;
