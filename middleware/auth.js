// Middleware for handling authorisation

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Read header passed in to get token
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token -- authorisation denied' });
  }
  try {
    // Verify token. jwtSecret comes from 'default.json' config file
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    console.log(req.user);
    req.user = decoded.user;
    console.log(req.user);

    // Call the function passed in as callback
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};
