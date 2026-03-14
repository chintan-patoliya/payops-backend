const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');

// Connect to MongoDB
mongoose.connect();

// Start server
app.listen(port, () => {
  console.log(`PayoutFlow API server started on port ${port} (${env})`);
});

module.exports = app;
