const express = require("express");
const router = express.Router();
const controller = require('../controller/user_controller.js');
const upload = require("../middleware/multer.js");
const {users} = require('../middleware/Authentication.js')

router.post('/signup',controller.signUp);
router.post('/login',controller.login);
router.post('/users_preferences',users,controller.users_preferences);
router.post('/user_profile',users,controller.user_profile);
router.get('/token',users,controller.token);    

module.exports = router;


