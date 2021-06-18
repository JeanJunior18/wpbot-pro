const router = require('express').Router();
const ClientManager = require('./app/controller/ClientManagerController');

router.get('/', (req, res) => {
  const { sessions } = ClientManager;
  console.log(sessions);
  res.json(sessions);
});

module.exports = router;
