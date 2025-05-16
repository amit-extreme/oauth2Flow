const jwt = require('jsonwebtoken');

const generateAccessToken = (user, clientId) => {
  return jwt.sign({
    sub: user.id,
    username: user.username,
    email: user.email,
    aud: clientId,
    iss: 'https://your-auth-server.com',
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user, clientId) => {
  return jwt.sign({
    sub: user.id,
    aud: clientId,
    type: 'refresh_token'
  }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
