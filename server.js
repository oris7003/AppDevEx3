// Express application server entry point
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the server-side template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount SSR page views router
const viewsRouter = require('./src/routes/views');
app.use('/', viewsRouter);

// Stage validation middleware for educational game requests
const stageValidator = require('./src/validation/stageValidator');
app.use(stageValidator);

// Mount REST API routes under /api
const apiRouter = require('./src/routes/api');
app.use('/api', apiRouter);

// Fallback 404 handler for API endpoints
app.use('/api', (req, res) => {
  const feedback = req.stageValidation
    ? req.stageValidation.message
    : `Endpoint ${req.method} ${req.originalUrl} not found`;

  res.status(404).json({
    error: 'Not Found',
    message: feedback,
    validation: req.stageValidation || { success: false, message: feedback }
  });
});

// Root healthcheck / welcome route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start listening if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
