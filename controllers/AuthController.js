const User = require('../models/UserModel');
const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const util = require('util');
const sendEmail = require('../utils/Email');
const crypto = require('crypto');
const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR,{
        expiresIn :process.env.LOGIN_EXPIRES
    })
}
const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
};
exports.signup = asyncErrorHandler(async(req, res, next) => {
    const newUser = await User.create(req.body);
    createSendResponse(newUser, 201, res);
});
exports.login = asyncErrorHandler(async(req, res, next) =>{
    const email = req.body.email;
    const password = req.body.password;
    // check if email & password is present in request body
    if(!email || !password){
        const error = new CustomError('Please provide email ID & Password for login ', 400);
        return next(error);
    }
    // check if user exists with given email
    const user = await User.findOne({email}).select('+password');
    //  const isMatch =  await user.comparePasswordInDb(password, user.password);
    //  check if user exists & password matches
    if(!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new CustomError('Incorrect email or password ', 400)
        return next(error);
    }
    createSendResponse(user, 200, res);
})
exports.protect = asyncErrorHandler(async(req, res, next) => {
    // 1. Read the token & check if it exists
    const testToken = req.headers.authorization
    let token;
    if(testToken && testToken.startsWith ('Bearer')){
        token = testToken.split(' ')[1];
    }
    if(!token){
        next(new CustomError('You are not logged in!', 401));
    }
    // 2. Validate the token 
    try {
        const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);
        console.log(decodedToken); // Log decoded token for debugging
        // You can also check token expiration here if needed

        // 3. Check if user exists based on decoded token data
        const user = await User.findById(decodedToken.id);
        if (!user) {
            return next(new CustomError('User not found', 404));
        }

        // 4. Add user information to the request for further route handling
        const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
        // If the user changed password after the token was issued 
        if(isPasswordChanged){
            const error = new CustomError('The password has been changed recently. Please login again', 402);
            return next(error);
        }
        req.user = user;
        next(); // Allow user to access the protected route

    } catch (err) {
        // Token verification failed
        return next(new CustomError('Invalid token', 401));
    }
});
exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            const error = new CustomError('You do not have permission to perform this action', 403);
            next(error);
        }
        next();
    }
};

// exports.restrict = (...role) => {
//     return (req, res, next) => {
//         if(!role.includes(req.user.role)){
//             const error = new CustomError('You do not have permission to perform this action', 403);
//             next(error);
//         }
//         next();
//     }
// };
exports.forgotPassword =asyncErrorHandler (async(req, res, next) => {
    //1. GET USER BASED ON POSTED EMAIL
    const user = await User.findOne({email: req.body.email});

    if(!user){
        const error = new CustomError('We could not find the user with given email', 404);
        next(error);
    }
    //2. GENERATE A RANDOM  RESET TOKEN
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});

    // SEND THE TOKEN BACK TO THE USER EMAIL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `We have receieved a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\n This reset link will be valid only for 10 minutes.`
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password change request receieved',
            message: message
        });
        res.status(200).json({
            status:'success',
            message: 'Password reset link send to the user email'
        })
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({validateBeforeSave: false});
        return next(new CustomError('There was an error sending password reset email. Please try again later', 500))
    }
});

exports.resetPassword = asyncErrorHandler(async(req, res, next) => {
    //1. IF THE USER EXISTS WITH THE GIVEN TOKEN & TOKEN HAS NOT EXPIRED
     const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
     const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpires: {$gt: Date.now()}});

    if(!user){
        const error = new CustomError('Token is invalid or has expired!', 400);
        next(error);
    }

    // RESETING THE USER PASSWORD
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    user.save();
    // 3. LOGIN THE USER
    createSendResponse(user, 200, res);
});

