import { google } from 'googleapis';

const SUPERMETRICS_SHEET_ID = '';

const getAuth = async () => {
  return await google.auth.getClient({
    credentials: {
      client_email: process.env.GOOGLE_EMAIL,
      private_key: decodeURIComponent(process.env.GOOGLE_KEY)
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  });
};

export const addClientToSheet = async () => {
  const auth = await getAuth();
  const api = google.sheets('v4');

  const clients = await api.spreadsheets.values.get({
    auth,
    spreadsheetId: SUPERMETRICS_SHEET_ID,
    range: 'Clients!A2:K1000',
    majorDimension: 'ROWS'
  });
  if (!clients || clients.status !== 200) throw new Error('Error loading Supermetrics client list');

  const queries = await api.spreadsheets.values.get({
    auth,
    spreadsheetId: SUPERMETRICS_SHEET_ID,
    range: 'SupermetricsQueries!A21:AV26',
    majorDimension: 'ROWS'
  });
  if (!queries || queries.status !== 200) throw new Error('Error loading Supermetrics queries');

  return {
    clients: clients.data.values,
    queries: queries.data.values
  };
};