// Middleware for validating user HTTP requests against stage requirements
const { stageDefinitions } = require('./stageDefinitions');

function stageValidatorMiddleware(req, res, next) {
  const stageHeader = req.headers['x-stage-id'] || req.query.__stageId;
  if (!stageHeader) {
    return next();
  }

  const stageId = parseInt(stageHeader, 10);
  const stage = stageDefinitions.find(s => s.id === stageId);

  if (!stage) {
    req.stageValidation = {
      success: false,
      message: `שלב מזהה ${stageId} לא נמצא במערכת.`
    };
    return next();
  }

  // Execute server-side stage validation check
  const result = stage.validate(req);
  req.stageValidation = {
    stageId,
    success: result.valid,
    message: result.message
  };

  // Intercept res.json to inject validation metadata and headers
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    res.setHeader('X-Stage-Solved', req.stageValidation.success ? 'true' : 'false');
    res.setHeader('X-Stage-Id', String(stageId));

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      data.validation = req.stageValidation;
    } else {
      data = {
        data,
        validation: req.stageValidation
      };
    }
    return originalJson(data);
  };

  next();
}

module.exports = stageValidatorMiddleware;
