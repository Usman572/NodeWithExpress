 class CustomError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

        this.isOperational = true;
        Error.captureStackTrace(this, this.constractor);
    }
}

module.exports  = CustomError;
// const error  = new CustomError('Some error message', 404);