const app = require('./app');
// CREATE SERVER
const port = 3000;
app.listen(port, () => {
    console.log('Server has Started....');
});