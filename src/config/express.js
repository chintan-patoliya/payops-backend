const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../routes');
const { errorConverter, errorHandler, notFound } = require('../middleware/error');
const { logs, frontendUrl } = require('./vars');

const app = express();

// Request logging
app.use(morgan(logs));

// Parse body params
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Gzip compression
app.use(compress());

// Secure HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api', routes);

// Error handling
app.use(errorConverter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
