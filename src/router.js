const router = require('express').Router();
const ClientManager = require('./app/controller/ClientManagerController');

/** Messages
 * -
 * Send  message /api/v1/app/send-message||301
 * - token
 * - type
 * - number
 * - chat_id
 * ====== Text
 * - message
 * ====== File
 * - url
 * - filename
 * - caption
 * - mimetype
 */

/** Token
 * POST status /api/v1/app/status
 * PUT /token/:token
 * DELETE /token/:token
 * POST /token
 */

/** User
 * POST /user
 * POST /login
 */

router.get('/sessions', (req, res) => {
  const { sessions } = ClientManager;

  return res.json(sessions);
});

router.get('/client/:token', ClientManager.getClientStatus);
router.post('/api/v1/app/status', ClientManager.getClientStatus);

router.post('/api/v1/app/send-message', ClientManager.sendMessage);

module.exports = router;
