import { google } from 'googleapis';
import { transform, constants } from '../utils';

const analyticsController = {};

analyticsController.getDataFromSheet = async (req, res) => {
  req.check('dept', 'No department specified').notEmpty();
  req.check('range', 'No range specified').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { dept, range } = req.params;
  const spreadsheetId = constants.SPREADSHEET_IDS[dept];
  const config = 
    dept === 'seo' ? constants.SEO_SHEETS[range] : 
    dept === 'social' ? constants.SOCIAL_SHEETS[range] :
    null;

  if (!config || !spreadsheetId) return res.status(400).json({ messages: [`Couldn't find sheet for: ${dept} - ${range}`] });

  try {
    const client = await google.auth.getClient({
      credentials: {
        client_email: process.env.GOOGLE_EMAIL,
        private_key: decodeURIComponent(process.env.GOOGLE_KEY)
      },
      scopes: [
        'https://www.googleapis.com/auth/analytics.readonly',
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
        data: {
          dept,
          range,
          clients: results
        }
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
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/spreadsheets'
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
              { startDate: '2018-01-01', endDate: '2018-12-31' }
            ],
            metrics: [
              { expression: 'ga:avgDomContentLoadedTime' },
              { expression: 'ga:pageLoadTime' }
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