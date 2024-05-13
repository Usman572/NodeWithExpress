// IMPORT PACKAGE
const express = require('express');
const morgan = require("morgan");
const moviesRouter = require("./routes/MoviesRouter");
const authRouter = require('./routes/AuthRouter');
const CustomError = require('./utils/CustomError');
const globalErrorHandler = require('./controllers/ErrorController');
const userRoute = require('./routes/UserRoute');
let app = express();
const logger = (req, res, next) => {
    console.log("Custom middleware called!");
    next();
}
app.use(express.json());

// SERVING STATIC FILES
app.use(express.static('./public'));
app.use(logger);
app.use((req, res, next) => {
    req.requestedAt = new Date().toDateString();
    next();
})
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
// Movie Router
app.use("/api/v1/movies", moviesRouter);
// User Router
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRoute);
// DEFAULT ROUTE
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `cant find ${req.originalUrl} on the server!`
    // });
    // const err = new Error(`cant find ${req.originalUrl} on the server!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    const err =  new CustomError(`cant find ${req.originalUrl} on the server!`, 404);
    next(err);
});

// ERROR HANDLING
app.use(globalErrorHandler);
module.exports = app;
