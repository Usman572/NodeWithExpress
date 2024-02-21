const fs = require('fs');
let movies = JSON.parse(fs.readFileSync('./data/movies.json'));
const checkId = (req, res, next, value) => {
    console.log('Movie ID is ' + value);
    // FIND MOVIE BASED ON PARAMETER
    let movie = movies.find(el => el.id === value * 1);
    if (!movie) {
        return res.status(404).json({
            status: "fail",
            message: "Movie With ID " + value + " is not found"
        })
    }
    next();
}
const validateBody = (req, res, next) => {
    if (!req.body.name || !req.body.releaseYear) {
        return res.status(400).json({
            status: 'fail',
            message: 'Not a valid movie data'
        })
    }
    next();
}
// GET API-MOVIES
const getAllMovies = (req, res) => {
    res.status(200).json({
        status: "success",
        requestedAt: req.requestedAt,
        count: movies.length,
        data: {
            movies: movies
        }
    })
}

// get Movie by id
const getMovieById = (req, res) => {
    // CONVERT ID INTO NUMERIC
    const id = req.params.id * 1;
    let movie = movies.find(el => el.id === id);
    // SEND MOVIE IN RESPONSE
    res.status(200).json({
        status: "success",
        data: {
            movie: movie
        }
    });
}

//  Create Movie 
const createMovie = (req, res) => {
    const newId = movies[movies.length - 1].id + 1;
    const newMovie = Object.assign({ id: newId }, req.body);
    movies.push(newMovie);
    fs.writeFile('./src/data/movies.json', JSON.stringify(movies), (err) => {
        res.status(201).json({
            status: "success",
            data: {
                movie: newMovie
            }
        })
    })
}

// update Movie 
const updateMovie = (req, res) => {
    // CONVERT ID INTO NUMERIC
    let id = req.params.id * 1;
    let movieToUpdate = movies.find(el => el.id === id);
    let index = movies.indexOf(movieToUpdate);
    Object.assign(movieToUpdate, req.body);
    movies[index] = movieToUpdate;
    fs.writeFile('./src/data/movies.json', JSON.stringify(movies), (err) => {
        res.status(200).json({
            status: 'sucsess',
            data: {
                movie: movieToUpdate
            }
        })
    })
}

// delete Movie 
const deleteMovie = (req, res) => {
    // CONVERT ID INTO NUMERIC
    let id = req.params.id * 1;
    let movieToDelete = movies.find(el => el.id === id)
    let index = movies.indexOf(movieToDelete);
    movies.splice(index, 1);
    fs.writeFile("./src/data/movies.json", JSON.stringify(movies), (err) => {
        res.status(204).json({
            status: "success",
            data: {
                movie: null
            }
        })
    })
}
// Exporting function
module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    checkId,
    validateBody
};