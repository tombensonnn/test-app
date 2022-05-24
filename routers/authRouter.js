const express = require('express');

const authController = require('../controllers/authController');
const getAccessToRoute = require('../middlewares/auth/auth');

const router = express.Router();


router.post('/register', authController.createUser);
router.post('/login', authController.login);
router.get('/profile',  getAccessToRoute,authController.getUser);

module.exports = router;
