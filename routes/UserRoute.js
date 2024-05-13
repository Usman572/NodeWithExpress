const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const userController = require('../controllers/UserController');
router.route('/updatePassword').patch(
    authController.protect,
    userController.updatePassword
);
module.exports =router;