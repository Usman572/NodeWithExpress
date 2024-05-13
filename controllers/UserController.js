const User = require('../models/UserModel');
const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const authController = require('../controllers/AuthController');
exports.updatePassword = asyncErrorHandler(async(req, res, next) => {
    // 1. GET CURRENT USER DATA FROM DATABASE
    const user = await User.findById(req.user._id).select('+password');

    // 2. CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
    if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
        return next(new CustomError('The current password you provided is wrong', 401));
    }
    // 3. IF SUPPLIED PASSWORD IS CORRECT , UPDATE USER PASSWORD WITH NEW VALUE 
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    // LOGIN USER & SEND JWT TOKEN
    authController.createSendResponse(user, 200, res);
}); 