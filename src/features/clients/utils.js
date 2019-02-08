import { google } from 'googleapis';
import constants from './constants';

const api = google.sheets('v4');

const getAuth = () => {
  const auth = google.auth.getClient({
    credentials: {
      client_email: process.env.GOOGLE_EMAIL,
      private_key: decodeURIComponent(process.env.GOOGLE_KEY)
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return auth;
};

const updateSheet = async ({ range, values }) => {
  const auth = await getAuth();
  return api.spreadsheets.values.update({
    auth,
    spreadsheetId: constants.spreadsheet_id,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values
    }
  });
};

const clearQueryIds = () => {
  updateSheet({
    range: `SupermetricsQueries!A21:A37`,
    values: [[''], [''], [''], [''], [''], [''], ['']]
  });
};

// Adds the client details to the Supermetrics Daily Upload sheet.
export const generateQueries = async client => {
  const auth = await getAuth();
  const queries = await api.spreadsheets.values.get({
    auth,
    spreadsheetId: constants.spreadsheet_id,
    range: 'SupermetricsQueries!A21:AV37',
    majorDimension: 'ROWS'
  });
  if (!queries || queries.status !== 200) throw new Error('Error loading Supermetrics queries');

  // Organic Search
  if (client.services.includes('SEO')) {
    const accounts = JSON.parse(queries.data.values[constants.ga_mappings.organic[client.gaAccount]][22]);
    if (!accounts.includes(`${client.gaViewNumber}\`${client.gaViewName}`)) {
      accounts.push(`${client.gaViewNumber}\`${client.gaViewName}`);
    }
    const res = await updateSheet({
      range: `SupermetricsQueries!W${constants.ga_mappings.organic[client.gaAccount] + 21}`,
      values: [[JSON.stringify(accounts)]]
    });
    if (res.status !== 200) {
      throw new Error('Error generating Supermetrics query. You may need to do this manually');
    }
  }

  // Social
  if (client.services.includes('Social')) {
    const gaAccounts = JSON.parse(queries.data.values[constants.ga_mappings.social[client.gaAccount]][22]);
    if (!gaAccounts.includes(`${client.gaViewNumber}\`${client.gaViewName}`)) {
      gaAccounts.push(`${client.gaViewNumber}\`${client.gaViewName}`);
    }
    const gaRes = await updateSheet({
      range: `SupermetricsQueries!W${constants.ga_mappings.social[client.gaAccount] + 21}`,
      values: [[JSON.stringify(gaAccounts)]]
    });

    const fbAccounts = JSON.parse(queries.data.values[10][22]);
    if (!fbAccounts.includes(`${client.fbAdsId}\`${client.fbAdsName}`)) {
      fbAccounts.push(`${client.fbAdsId}\`${client.fbAdsName}`);
    }
    const fbRes = await updateSheet({
      range: `SupermetricsQueries!W31`,
      values: [[JSON.stringify(fbAccounts)]]
    });

    if (gaRes.status !== 200 || fbRes.status !== 200) {
      throw new Error('Error generating Supermetrics query. You may need to do this manually');
    }
  }

  // Paid Search
  if (client.services.includes('Paid Search')) {
    const gaAccounts = JSON.parse(queries.data.values[constants.ga_mappings.paidSearch[client.gaAccount]][22]);
    if (!gaAccounts.includes(`${client.gaViewNumber}\`${client.gaViewName}`)) {
      gaAccounts.push(`${client.gaViewNumber}\`${client.gaViewName}`);
    }
    const gaRes = await updateSheet({
      range: `SupermetricsQueries!W${constants.ga_mappings.paidSearch[client.gaAccount] + 21}`,
      values: [[JSON.stringify(gaAccounts)]]
    });

    const awAccounts = JSON.parse(queries.data.values[10][22]);
    if (!awAccounts.includes(`${client.googleAdsNumber}\`${client.googleAdsName}`)) {
      awAccounts.push(`${client.googleAdsNumber}\`${client.googleAdsName}`);
    }
    const awRes = await updateSheet({
      range: `SupermetricsQueries!W37`,
      values: [[JSON.stringify(awAccounts)]]
    });

    if (gaRes.status !== 200 || awRes.status !== 200) {
      throw new Error('Error generating Supermetrics query. You may need to do this manually');
    }
  }

  await clearQueryIds();
};

export const addToClientList = async client => {
  const auth = await getAuth();
  const res = await api.spreadsheets.values.append({
    auth,
    spreadsheetId: constants.spreadsheet_id,
    range: `Clients!A1`,
    valueInputOption: `USER_ENTERED`,
    requestBody: {
      values: [
        [
          client.name,
          client._id,
          client.gaAccount,
          client.gaViewName,
          client.gaViewNumber,
          client.fbAdsName,
          client.fbAdsId,
          client.googleAdsName,
          client.googleAdsNumber
        ]
      ]
    }
  });
  if (res.status !== 200) throw new Error('Error adding client to spreadsheet list. You may need to do this manually');
};

export const parseError = err => {
  const message = err.toString();
  if (message.indexOf('duplicate key error') > -1) {
    return 'Client already exists';
  }
  if (message.indexOf('Cast to ObjectId failed') > -1) {
    return 'Invalid client ID';
  }
  return message;
};
