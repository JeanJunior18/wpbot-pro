const router = require('express').Router();
const { clientManager } = require('./app/controller/ClientManagerController');
const sessionController = require('./app/controller/SessionController');
const hasActiveSession = require('./app/middlewares/hasActiveSession');
const hasToken = require('./app/middlewares/hasToken');

router.get('/api/v1/app/info/:token', sessionController.renderQRcode);

router.get('/api/v1/app/sessions/', sessionController.sessions);
router.get('/api/v1/app/sessions/:host', sessionController.sessions);

router.post('/api/v1/token', hasToken, clientManager.createToken);
router.put('/api/v1/token/:host/:token', clientManager.updateToken);
router.delete('/api/v1/token/:host/:token', clientManager.deleteToken);

// Chat API
router.post('/api/v2/user', clientManager.createUser);

// Middleware to Check Active Session
router.use(hasActiveSession);
router.get('/client/:token', clientManager.getClientStatus);

router.post('/api/v1/app/status', clientManager.getClientStatus);
router.post('/api/v1/app/send-message', clientManager.sendMessage);
router.post('/api/v1/app/start', clientManager.restartAndLogout);
router.post('/api/v1/app/validate-phone', clientManager.validateNumber);

router.post('/api/v1/app/close-session/', sessionController.closeSession);


// Chat API
router.get('/api/v2/attendances', clientManager.attendanceList);
router.get('/api/v2/attendance/:phone', clientManager.attendanceMessages);
module.exports = router;
