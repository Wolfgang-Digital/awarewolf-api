import { google } from 'googleapis';
import { transform } from '../utils'; 

const SEO_SHEET_ID = '1Ja1_T66j4oekhlQo1eQVMiqye6w2evngj3LIKWrwmgI';

const SHEETS = {
  'ga-month-mom': 'GA_LastmonthMoM',
  'ga-month-yoy': 'GA_LastmonthYoY',
  'ga-days-mom': 'GA_30daysMoM',
  'ga-days-yoy': 'GA_30daysYoY'
};

const analyticsController = {};

analyticsController.getSeoGAData = async (req, res) => {
  req.check('name', 'No sheet specified');

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { name } = req.params;
  const sheet = SHEETS[name];

  if (!sheet) return res.status(400).json({ messages: [`Couldn't find sheet: ${name}`] });

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
      spreadsheetId: SEO_SHEET_ID,
      range: `${sheet}!A3:O1000`,
      majorDimension: 'ROWS'
    });

    if (response.status === 200) {
      const results = transform.gaSeoSheet(response.data);
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

export default analyticsController;