const express = require('express')
const router = express.Router();

router.use('/', require('./user_router.js'));
router.use('/', require('./user_intraction_router.js'));

module.exports = router;