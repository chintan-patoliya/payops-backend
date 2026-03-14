const mongoose = require('mongoose');
const { mongo, env } = require('./vars');

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

if (env === 'development') {
  mongoose.set('debug', true);
}

exports.connect = () => {
  mongoose.connect(mongo.uri);
  console.log('MongoDB connected successfully');
  return mongoose.connection;
};
