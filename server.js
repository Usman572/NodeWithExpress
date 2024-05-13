const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require("mongoose");
const app = require('./app');

// DB Connection with Application
mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    // console.log(conn);
    console.log("DB Connected Successfully")
})
// .catch((error)=>{
//     console.log("Some error has occured")
// })
// CREATE SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('Server has Started....');
});
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured! Shutting down...');
    server.close(() => {
        process.exit(1);
    });
})

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...');
    process.exit(1);
})

// console.log(x);