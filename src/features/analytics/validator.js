import constants from './constants.json';
import Client from '../clients/model';

export const getReports = (req, res, next) => {
  req.check('date', 'Must be a valid date range').isIn(['30days', 'lastmonth', 'yeartodate']);

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const metrics = Object.keys(req.query).reduce((obj, key) => {
      key = decodeURIComponent(key);
      const params = decodeURIComponent(req.query[key]).split(',');
      if (params && constants.valid_metrics[key]) {
        obj[key] = params.filter(param => {
          return constants.valid_metrics[key].includes(param.replace(/cross_|search_|display_|youtube_/gi, ''));
        });
        if (obj[key].length === 0) delete obj[key];
      }
      return obj;
    }, {});

    if (Object.keys(metrics).length === 0) return res.status(400).json({ messages: ['No metrics selected'] });
    req.metrics = metrics;
    next();
  } catch (err) {
    res.status(400).json({
      messages: ['Error parsing metric parameters', err.toString()]
    });
  }
};

export const getReportById = async (req, res, next) => {
  req.check('id', 'Client ID cannot be blank').notEmpty();
  req.check('date', 'Must be a valid date range').isIn(['30days', 'lastmonth', 'yeartodate']);

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const client = await Client.findById(req.params.id);
    req.services = client.services;
    next();
  } catch (err) {
    res.status(400).json({
      messages: [err.toString()]
    });
  }
};
