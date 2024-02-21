// IMPORT PACKAGE
const express = require('express');
const morgan = require("morgan");
const MoviesRouter = require("./routes/MoviesRouter");
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
app.use(morgan('dev'));
app.use("/api/v1/movies", MoviesRouter);

module.exports = app;
