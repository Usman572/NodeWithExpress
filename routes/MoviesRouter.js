const MoviesController = require('../controllers/MoviesController');
const express = require("express");
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const authController = require('../controllers/AuthController');
const router = express.Router();
router.route('/movie-stats').get(MoviesController.getMovieStats);
router.route('/movies-by-genre/:genre').get(MoviesController.getMovieByGenre);
router.route("/")
    .get(authController.protect, MoviesController.getAllMovies)
    // .get(asyncErrorHandler(MoviesController.getAllMovies))
    .post(authController.protect, MoviesController.createMovie)
    // .post(MoviesController.createMovie)
router.route("/:id")
    .get(authController.protect, MoviesController.getMovieById)
    .patch(MoviesController.updateMovie)
    .delete(authController.protect,authController.restrict('admin'),  MoviesController.deleteMovie)

module.exports = router;