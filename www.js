require('dotenv').config(); // .env file

const app = require('./app');
const debug = require('debug')('express-sequelize');
const models = require('./models/index');

const port = process.env.PORT || 3000;

console.log({ message: `starting project in ${process.env.NODE_ENV} environment, port ${port}` });
debug({ message: `starting project in ${process.env.NODE_ENV} environment, port ${port}` });

app.listen(port, (err) => {
    if (err) {
        console.log(err); // eslint-disable-line
    } else console.log('server started');
});
