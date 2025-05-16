const express = require('express');
const router = express.Router();
const {
  authorizeUser,
  exchangeToken,
  refreshAccessToken,
  protectedResource
} = require('../controllers/authController');

const {userProfile} = require('../controllers/userController');

router.post('/authorize', authorizeUser);
router.post('/token', exchangeToken);
router.post('/refresh', refreshAccessToken);
router.get('/protected-resource', protectedResource);
router.get('/v2/user-profile', userProfile);

module.exports = router;
