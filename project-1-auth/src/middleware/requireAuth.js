const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'A bearer token is required.' });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(req.auth);
    return next();
  } catch (_err) {
    return res.status(401).json({ message: 'The token is invalid or expired.' });
  }
};
