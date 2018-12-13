import { google } from 'googleapis'; 

const spreadsheetId = '1Ja1_T66j4oekhlQo1eQVMiqye6w2evngj3LIKWrwmgI';

const analyticsController = {};

analyticsController.getSeoGAData = async (req, res) => {
  req.check('sheet', 'No sheet specified');

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const { sheet } = req.params;

    const client = await google.auth.getClient({
      credentials: {
        client_email: process.env.GOOGLE_EMAIL,
        private_key: process.env.GOOGLE_KEY
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });
    const sheets = google.sheets('v4');

    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range: `${sheet}!A3:O1000`,
      majorDimension: 'ROWS'
    });

    if (response.status === 200) {
      const results = response.data.values.filter(row => {
        if (row.some(n => {
          if (!isNaN(n)) return false;
          if (n.includes('GA Account')) return true;
          else if (n.includes('UNSAMPLED')) return true;
          else return false;
        })) {
          return false;
        } else if (row.every(n => n.length === 0)) {
          return false;
        } else {
          return true;
        }
      }).map(n => {
        return {
          gaAccount: n[0],
          lead: n[1],
          team: n[2],
          client: n[3],
          view: n[4],
          sessions: n[5],
          deltaSessions: n[6],
          bounces: n[7],
          deltaBounces: n[8],
          newUsers: n[9],
          deltaNewUsers: n[10],
          conversions: n[11],
          deltaConversions: n[12],
          revenue: n[13],
          deltaRevenue: n[14]
        };
      });
      return res.status(200).json({
        success: true,
        data: results
      });
    }
    console.log('Error');
    res.status(400).json({ messages: ['Failed to fetch data'] });
  } catch (err) {
    console.log(err);
    res.status(400).json({ messages: [err.toString()] });
  }
};

export default analyticsController;