require('dotenv').config(); // .env file

require('./app');
const debug = require('debug')('express-sequelize');
const models = require('./models/index');

const port = process.env.PORT || 3000;

console.log({ message: `Seeding ${process.env.NODE_ENV} environment, port ${port}` });
debug({ message: `sSeeding ${process.env.NODE_ENV} environment, port ${port}` });

models.sequelize.sync().then(() => {
  /**
     * Listen on provided port, on all network interfaces.
     */
  // finish, process will exit
  console.log('dbSync finished');
});
