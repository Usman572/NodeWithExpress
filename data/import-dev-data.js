const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Movie  = require('../models/movieModel');

dotenv.config({path: './config.env'});

// DB Connection with Application
mongoose.connect(process.env.CONN_STR,{
    useNewUrlParser: true
}).then((conn) => {
    // console.log(conn);
    console.log("DB Connected Successfully")
}).catch((errror)=>{
    console.log("Some error has occured")
})

// READ MOVIES.JSON FILE
const movies  = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));

// DELETE EXISTING MOVIE FROM DOCUMENTS FROM COLLECTION
const deleteMovies = async () => {
    try{
        await Movie.deleteMany();
        console.log('Data successfully deleted!');
    }catch(err){
        console.log(err.message);
    }
    process.exit();
};

// IMPORT MOVIES DATA TO MONGODB COLLECTION
const importMovies = async() =>{
    try{
        await Movie.create(movies);
        console.log('Data successfully imported!')
    }catch(err){
        console.log(err.message);
    }
};

if (process.argv[2] === '--import'){
    importMovies();
};
if(process.argv[2]  === '--delete'){
    deleteMovies();
}
