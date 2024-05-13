const mongoose = require('mongoose');
const fs = require('fs');
const validator =require('validator');
const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required field!"],
        unique:true,
        maxlength: [100, "Movie length is not more than 100 characters."],
        minlength: [4, "Movie must be atleast 4 characters"],
        trim: true,
        validate: [validator.isAlpha, "Movie should only contain Alphabets."]

    },
    description:String,
    duration:{
        type:Number,
        required:[true, "Duration is required field"],
        trim:true
    },
    ratings:{
        type: Number,
        // min: [1, "Ratings must be 1.0 0r above"],
        // max: [10, "Ratings must be 10 or below"],
        validate: {
            validator: function(value){
                return value >= 1 && value <= 10
            },
            message: "Ratings ({VALUE}) should be above 1 and below 10 "
        }
    },
    totalRating: {
        type: Number
    },
    releaseYear:{
        type: Number,
        required:[true,"ReleaseYear is required field!"]
    },
    releaseDate:{
        type:Date
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        select : false
    },
    genres:{
        type: [String],
        required: [true, "Genres is required field!"],
        enum:{
            values: ["Action", "Adventure", "Sci-Fi", "Thriller", "Crime", "Drama", "Comedy", "Biofraphy","Science Fiction"],
            message: "This genre does not exist"
        },
    },
    directors:{
        type: [String],
        required: [true, "Genres is required field!"]
    },
    coverImage:{
        type: [String],
        required: [true, "Genres is required field!"]
    },
    directors:{
        type: [String],
        required: [true, "Genres is required field!"]
    },
    price:{
        type: Number,
        required: [true, "Genres is required field!"]
    },
    createdBy: String
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});
movieSchema.virtual('durationInHours').get(function(){
    return this.duration/60;
});

// EXECUTED BEFORE THE DOCUMENT IS SAVED IN DB
// .save() or create()
// insertMany, findByIdAndUpdate will not work
movieSchema.pre('save', function(next){
    this.createdBy= 'Usman'
    next();
});
movieSchema.post('save', function(doc, next){
    const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}\n`
    fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message);
    });
    next();
});
movieSchema.pre(/^find/, function(next){
    this.find({releaseDate: {$lte: Date.now()}});
    this.startTime = Date.now();
    next();
});
movieSchema.post(/^find/, function(docs, next){
    this.find({releaseDate: {$lte: Date.now()}});
    this.endTime = Date.now();
    const content = `Quick took ${this.endTime - this.startTime} milliseconds to fetch the documents.\n`
    fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message);
    });
    next();
});
movieSchema.pre('aggregate',function(next){
    console.log(this.pipeline().unshift({$match: {releaseDate: {$lte: new Date()}}}));
    next();
});
const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;