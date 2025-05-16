const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenService');

const authorizeUser = async (req, res) => {
  const { clientId, redirectURI, userId, scope } = req.body;

  if (!clientId || !redirectURI || !userId || !scope || !scope.includes('openid')) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  try {
    const [clients] = await db.query(`SELECT * FROM oauthdetails WHERE clientId = ? AND redirectURI = ?`, [clientId, redirectURI]);
    const [users] = await db.query(`SELECT * FROM user WHERE id = ?`, [userId]);

    if (!clients.length || !users.length) {
      return res.status(400).json({ error: 'Invalid client or user' });
    }

    const code = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db.query(`INSERT INTO authorization_code (code, userId, clientId, expiresAt) VALUES (?, ?, ?, ?)`, [code, userId, clientId, expiresAt]);

    res.json({ code, redirect_uri: redirectURI });
  } catch (err) {
    console.error('Authorization Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const exchangeToken = async (req, res) => {
  const { code, clientId, redirectURI } = req.body;
  if (!code || !clientId || !redirectURI) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [authCodes] = await db.query(`SELECT * FROM authorization_code WHERE code = ? AND clientId = ?`, [code, clientId]);
    if (!authCodes.length || new Date(authCodes[0].expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const [clients] = await db.query(`SELECT * FROM oauthdetails WHERE clientId = ? AND redirectURI = ?`, [clientId, redirectURI]);
    if (!clients.length) return res.status(400).json({ error: 'Invalid clientId or redirectURI' });

    const [users] = await db.query(`SELECT * FROM user WHERE id = ?`, [authCodes[0].userId]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });

    const user = users[0];
    const accessToken = generateAccessToken(user, clientId);
    const refreshToken = generateRefreshToken(user, clientId);

    await db.query(`DELETE FROM authorization_code WHERE code = ?`, [code]);

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken
    });
  } catch (err) {
    console.error('Token Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Missing refresh token' });

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
    const [users] = await db.query(`SELECT * FROM user WHERE id = ?`, [decoded.sub]);
    const [clients] = await db.query(`SELECT * FROM oauthdetails WHERE clientId = ?`, [decoded.aud]);

    if (!users.length || !clients.length) return res.status(400).json({ error: 'Invalid user or client' });

    const accessToken = generateAccessToken(users[0], decoded.aud);
    const newRefreshToken = generateRefreshToken(users[0], decoded.aud);

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken
    });
  } catch (err) {
    console.error('Refresh Error:', err);
    res.status(400).json({ error: 'Invalid or expired refresh token' });
  }
};

const protectedResource = (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: 'Protected resource accessed', user });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  authorizeUser,
  exchangeToken,
  refreshAccessToken,
  protectedResource
};
