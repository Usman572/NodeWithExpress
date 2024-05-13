// Example AuthRouter.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
module.exports = router;
