import { google } from 'googleapis';
import { transform } from '../utils';
import db from '../models';

const SHEETS = {
  'seo': '1Ja1_T66j4oekhlQo1eQVMiqye6w2evngj3LIKWrwmgI',
  'social': '12QkwN8bYvMFsqrJT-i57DIvZdztP8UlfqKnmthNTfg0'
};

const SEO = {
  'ga-lastmonth-mom': {
    sheet: 'GA_LastmonthMoM',
    start: 'A3',
    end: 'O1000'
  },
  'ga-lastmonth-yoy': {
    sheet: 'GA_LastmonthYoY',
    start: 'A3',
    end: 'O1000'
  },
  'ga-30days-mom': {
    sheet: 'GA_30daysMoM',
    start: 'A3',
    end: 'O1000'
  },
  'ga-30days-yoy': {
    sheet: 'GA_30daysYoY',
    start: 'A3',
    end: 'O1000'
  }
};

const SOCIAL = {
  'fb-lastmonth-mom': {
    sheet: 'FB_ThismonthMoM',
    start: 'A3',
    end: 'BE1000'
  },
  'fb-7days-mom': {
    sheet: 'FB_7DaysMoM',
    start: 'A3',
    end: 'BE1000'
  }
};

const analyticsController = {};

analyticsController.getDataFromSheet = async (req, res) => {
  req.check('dept', 'No department specified').notEmpty();
  req.check('range', 'No range specified').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { dept, range } = req.params;
  const spreadsheetId = SHEETS[dept];
  const config = 
    dept === 'seo' ? SEO[range] : 
    dept === 'social' ? SOCIAL[range] :
    null;

  if (!config || !spreadsheetId) return res.status(400).json({ messages: [`Couldn't find sheet for: ${dept} - ${range}`] });

  try {
    const client = await google.auth.getClient({
      credentials: {
        client_email: process.env.GOOGLE_EMAIL,
        private_key: decodeURIComponent(process.env.GOOGLE_KEY)
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });
    const sheets = google.sheets('v4');

    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range: `${config.sheet}!${config.start}:${config.end}`,
      majorDimension: 'ROWS'
    });

    if (response.status === 200) {
      let results = [];
      if (dept === 'seo') {
        results = transform.gaSeoSheet(response.data);
      } else {
        results = transform.fbSocialSheet(response.data);
      }

      return res.status(200).json({
        success: true,
        data: results
      });
    }
    res.status(400).json({ messages: ['Failed to fetch data'] });
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

analyticsController.getGADataWithDates = async (req, res) => {
  // TODO: Validate

  try {
    const client = await google.auth.getClient({
      credentials: {
        client_email: process.env.GOOGLE_EMAIL,
        private_key: decodeURIComponent(process.env.GOOGLE_KEY)
      },
      scopes: [
        'https://www.googleapis.com/auth/analytics.readonly'
      ]
    });
    const analytics = google.analyticsreporting({
      auth: client,
      version: 'v4'
    });
    const response = await analytics.reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: '82667922',
            dateRanges: [
              { startDate: '2018-11-01', endDate: '2018-11-30' }
            ],
            dimensions: [
              { name: 'ga:browser' }
            ],
            metrics: [
              { expression: 'ga:users' }
            ]
          }
        ]
      }
    });
    res.status(200).json(response.data);

  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

analyticsController.getPageSpeedData = async (req, res) => {
  req.check('clientId', 'Client ID cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const client = await db.Client.findById(req.params.clientId);
    if (!client) return res.status(400).json({ messages: [`Unable to locate client: ${req.params.clientId}`] });

    const data = await services.getPageSpeed(client.domain);
    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

export default analyticsController;