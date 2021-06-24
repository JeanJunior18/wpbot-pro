const { sessions } = require('../controller/ClientManagerController');

module.exports = (req, res, next) => {
  const { token } = req.body;

  if (!token) return res.status(410).json({ error: 'Token is not Provided' });

  if (!sessions[token])
    return res
      .status(410)
      .json({ error: `Token ${token} has not a active session` });

  return next();
};
