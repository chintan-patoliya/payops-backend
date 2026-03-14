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

// Enable CORS - allow multiple origins
const allowedOrigins = [
  frontendUrl,
  'https://payops-frontend-34pd-b8puevovi-chintan-patoliyas-projects.vercel.app',
];

// In development, allow all local network origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow any localhost or local network IP
    if (process.env.NODE_ENV !== 'production') {
      if (origin.match(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):\d+$/)) {
        return callback(null, true);
      }
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

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
