module.exports = (req, res, next) => {
  const { token } = req.body;

  if (!token) return res.status(410).json({ error: 'Token is not Provided' });

  return next();
};
