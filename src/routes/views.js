// View routes for SSR pages
const express = require('express');
const router = express.Router();
const { getPublicStages } = require('../validation/stageDefinitions');
const resourceSchemas = require('../schemas/resourceSchemas');

// GET / - Main game dashboard SSR page
router.get('/', (req, res) => {
  const stages = getPublicStages();
  res.render('index', {
    title: 'HTTP & REST Educational Game',
    stages,
    totalStages: stages.length
  });
});

// GET /schemas - Resource schemas SSR documentation page
router.get('/schemas', (req, res) => {
  res.render('schemas', {
    title: 'System Schemas - HTTP & REST Lab',
    schemas: resourceSchemas
  });
});

module.exports = router;
