const CustomError = require("../utils/CustomError");

const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}
const castErrorHandler = (err) => {
    const msg = `Invalid value ${err.path} : ${err.value}!`
    return new CustomError(msg, 400);
}
const duplicateKeyErrorHandler = (err) => {
    const name = err.keyValue.name;
    const msg = `There is already a movie with name ${name}. Please use another name!`;
    return new CustomError(msg, 400);
}
const validatorErrorHanlder = (err) =>{
    const errors = Object.values(err.errors).map(val => val.message);
    const errorMessages = errors.join('. ');
    const msg = `Invalid input data: ${errorMessages}`;
    return new CustomError(msg, 400);
}
const handleExpiredJWT = (err) => {
    return new CustomError('JWT is expired. PLease login again!', 401);
}
const hanldeJWTError = (err) => {
    return new CustomError('Invalid token.Please login again', 401);
}
const prodErrors = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message
        });
    }else{
        res.status(500).json({
            status: 'fail',
            message: 'Some thing went wrong! Please try again later.'
        });
    }
}
module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    if(process.env.NODE_ENV === 'development') {
        console.log('IN devlopment mode');
        devErrors(res, error);
    } else if(process.env.NODE_ENV === 'production') {
        console.log('IN production mode');
        if(error.name === 'CastError') error = castErrorHandler(error);
        // if(configDotenv.error === 11000) error => duplicateKeyErrorHandler(error);
        if(error.name === 'validatorError') error = validatorErrorHanlder(error);
        if(error.name === 'TokenExpiredError') error = handleExpiredJWT(error);
        if(error.name === 'JsonWebTokenError') error = hanldeJWTError(error);
        prodErrors(res, error);
    }
}