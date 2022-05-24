const express = require('express');
const user = require('./userRouter');
const auth = require('./authRouter');


const router = express.Router();


router.use('/users', user);
router.use('/auth', auth);

module.exports = router;