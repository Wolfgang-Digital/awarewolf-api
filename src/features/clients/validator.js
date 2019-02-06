export const createClient = (req, res, next) => {
  req.check('name', 'Client name cannot be blank').notEmpty();
  req.check('leads', 'Client leads cannot be blank').notEmpty();
  req.check('team', 'Team cannot be blank').notEmpty();
  req
    .check('gaAccount', 'Must be a valid Wolfgang GA account')
    .isIn([
      'analytics@wolfgangdigital.com',
      'ga@wolfgangdigital.com',
      'ga.wolfgang@wolfgangdigital.com',
      'g_analytics@wolfgangdigital.com',
      'ga5@wolfgangdigital.com'
    ]);
  req.check('gaViewName', 'GA view name cannot be blank').notEmpty();
  req.check('gaViewNumber', 'GA view number must be a valid integer').isInt();

  const { services } = req.body;

  if (!services) return res.status(400).json({ messages: ['Services cannot be blank'] });

  if (services.includes('Social')) {
    req.check('fbAdsId', 'Facebook Ads ID cannot be blank').notEmpty();
    req.check('fbAdsName', 'Facebook Ads name cannot be blank').notEmpty();
  }

  if (services.includes('Paid Search')) {
    req.check('googleAdsName', 'Google Ads name cannot be blank').notEmpty();
    req.check('googleAdsNumber', 'Google Ads number must be a valid integer').isInt();
  }

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });
  next();
};

export const updateClient = (req, res, next) => {
  req
    .check('gaAccount', 'Must be a valid Wolfgang GA account')
    .optional()
    .isIn([
      'analytics@wolfgangdigital.com',
      'ga@wolfgangdigital.com',
      'ga.wolfgang@wolfgangdigital.com',
      'g_analytics@wolfgangdigital.com',
      'ga5@wolfgangdigital.com'
    ]);
  req
    .check('gaViewNumber', 'GA view number must be a valid integer')
    .optional()
    .isInt();
  req
    .check('googleAdsNumber', 'Google Ads number must be a valid integer')
    .optional()
    .isInt();
  req
    .check('leads', 'Client leads cannot be blank')
    .optional()
    .notEmpty();
  req
    .check('team', 'Team cannot be blank')
    .optional()
    .notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  req.update = Object.keys(req.body).reduce((obj, prop) => {
    if (req.body[prop] && prop !== 'password') {
      if (prop === 'leads') {
        obj._leads = req.body.leads;
      } else if (prop === 'team') {
        obj._team = req.body.team;
      } else {
        obj[prop] = req.body[prop];
      }
    }
    return obj;
  }, {});
  next();
};
