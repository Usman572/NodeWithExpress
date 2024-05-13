const Movie = require("../models/movieModel.js");
const ApiFeatures = require('../utils/ApiFeatures.js');
const CustomError = require("../utils/CustomError.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
// GET API-MOVIES
const getAllMovies = asyncErrorHandler(async (req, res, next) => {
    try {
        // Declare the query variable using let
        let query = Movie.find();

        // Create an instance of ApiFeatures
        const features = new ApiFeatures(query, req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

        // Execute the filtered query
        const movies = await features.query;
        res.status(200).json({
            status: 'success',
            length: movies.length,
            data: {
                movies
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
});

// get Movie by id
const getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if(!movie){
            const error = new CustomError('Movie with that ID is not found!', 404);
            return next(error);
        }
        res.status(200).json({
            status: "success",
            data: {
                movie
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
};

//  Create Movie 
const createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                movie
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// update Movie 
const updateMovie = async (req, res, next) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if(!updateMovie){
            const error = new CustomError('Movie with that ID is not found!', 404);
            return next(error);
        }
        res.status(200).json({
            status: 'success',
            data: {
                movie: updatedMovie
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}

// delete Movie 
const deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        if(!deleteMovie){
            const error = new CustomError('Movie with that ID is not found!', 404);
            return next(error);
        }
        res.status(200).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}
const getMovieStats = async (req, res) => {
    try {
        const stats = await Movie.aggregate([
            { $match: { releaseDate: { $lte: new Date() } } },
            { $match: { ratings: { $gte: 4.5 } } },
            {
                $group: {
                    _id: '$releaseYear',
                    avgRating: { $avg: '$ratings' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    priceTotal: { $sum: '$price' },
                    movieCount: { $sum: 1 }
                }
            },
            { $sort: { minPrice: 1 } }
            // {$match: {maxPrice : {$gte: 60}}}
        ]);

        res.status(200).json({
            status: 'success',
            count: stats.length,
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};
const getMovieByGenre = async (req, res) => {
    try {
        const genre = req.params.genre;
        const movies = await Movie.aggregate([
            { $match: { releaseDate: { $lte: new Date() } } },
            { $unwind: '$genres' },
            {
                $group: {
                    _id: '$genres',
                    movieCount: { $sum: 1 },
                    movies: { $push: '$name' }
                }
            },
            { $addFields: { genre: '$_id' } },
            { $project: { _id: 0 } },
            { $sort: { movieCount: -1 } },
            // {$limit: 6}
            { $match: { genre: genre } }
        ]);
        res.status(200).json({
            status: 'success',
            count: movies.length,
            data: {
                movies
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'success',
            data: {
                message: err.message
            }
        })
    }
}
// Exporting function
module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    getMovieStats,
    getMovieByGenre
};