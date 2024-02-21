const MoviesController = require('../controllers/MoviesController');
const express = require("express");
const router = express.Router();
router.param('id', MoviesController.checkId)
router.route("/")
    .get(MoviesController.getAllMovies)
    .post(MoviesController.validateBody, MoviesController.createMovie)
router.route("/:id")
    .get(MoviesController.getMovieById)
    .patch(MoviesController.updateMovie)
    .delete(MoviesController.deleteMovie)

module.exports = router;