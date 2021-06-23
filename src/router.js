const router = require('express').Router();
const { clientManager } = require('./app/controller/ClientManagerController');
const sessionController = require('./app/controller/SessionController');
const hasActiveSession = require('./app/middlewares/hasActiveSession');
const hasToken = require('./app/middlewares/hasToken');

router.get('/sessions', sessionController.sessions);
router.get('/client/:token', clientManager.getClientStatus);

router.post('/api/v1/token', hasToken, clientManager.createToken);
router.put('/api/v1/token/:token', clientManager.updateToken);
router.delete('/api/v1/token/:token', clientManager.deleteToken);

// Middleware to Check Active Session
router.use(hasActiveSession);
router.post('/api/v1/app/status', clientManager.getClientStatus);
router.post('/api/v1/app/send-message', clientManager.sendMessage);
router.post('/api/v1/app/start', clientManager.restartAndLogout);
router.post('/api/v1/app/validate-phone', clientManager.validateNumber);

module.exports = router;
