const express = require("express");
const router = express.Router();
const controller = require('../controller/user_intaction.js');
const upload = require("../middleware/multer.js");
const {users} = require('../middleware/Authentication.js')


router.get('/intractions',users,controller.intraction);
router.get('/is_reported',users,controller.is_reported);
// router.get('/test',users,controller.test);
module.exports = router;

