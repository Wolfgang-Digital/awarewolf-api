import { google } from 'googleapis';

const MASTER_SHEET_ID = '17cGiP68GNRmQcLEUOob8GkC-MfMVBezRa9WuvuAEONo';

export const addClient = async client => {
  try {
    const auth = await google.auth.getClient({
      credentials: {
        client_email: process.env.GOOGLE_EMAIL,
        private_key: decodeURIComponent(process.env.GOOGLE_KEY)
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });
    const api = google.sheets('v4');

    const res = await api.spreadsheets.values.get({
      auth,
      spreadsheetId: MASTER_SHEET_ID,
      range: `SupermetricsQueries!A21:AV1000`,
      majorDimension: `ROWS`
    });
    
    if (res.status !== 200) throw 'Error loading Supetrics queries';

    if (client.services.includes('SEO')) {
      await updateGASeoQueries(client, res.data.values, api, auth);
    }
    
    if (client.services.includes('Social')) {
      await updateFBQueries(client, res.data.values, api, auth);
      await updateGASocialQueries(client, res.data.values, api, auth);
    }

    if (client.services.includes('Paid Search')) {
      await updateGAAdwordsQueries(client, res.data.values, api, auth);
    }

  } catch (err) {
    return { messages: [err.toString()] };
  }
};

const updateGASeoQueries = async (client, queries, api, auth) => {
  let GA_LastMonth_MoM = queries.find(n => n[1] === 'SEO' && n[3] === 'GA_LastMonth_MoM' && n[46] === client.gaAccount);
  const i = queries.findIndex(n => n[1] === 'SEO' && n[3] === 'GA_LastMonth_MoM' && n[46] === client.gaAccount) + 21;
  const new_GA_LastMonth_MoM = addAccount(client, GA_LastMonth_MoM, 'GA');
  await updateRow(new_GA_LastMonth_MoM, i, api, auth);

  let GA_LastMonth_YoY = queries.find(n => n[1] === 'SEO' && n[3] === 'GA_LastMonth_YoY' && n[46] === client.gaAccount);
  const j = queries.findIndex(n => n[1] === 'SEO' && n[3] === 'GA_LastMonth_YoY' && n[46] === client.gaAccount) + 21;
  const new_GA_LastMonth_YoY = addAccount(client, GA_LastMonth_YoY, 'GA');
  await updateRow(new_GA_LastMonth_YoY, j, api, auth);

  let GA_YearToDate_YoY = queries.find(n => n[1] === 'SEO' && n[3] === 'GA_YearToDate_YoY' && n[46] === client.gaAccount);
  const k = queries.findIndex(n => n[1] === 'SEO' && n[3] === 'GA_YearToDate_YoY' && n[46] === client.gaAccount) + 21;
  const new_GA_YearToDate_YoY = addAccount(client, GA_YearToDate_YoY, 'GA');
  await updateRow(new_GA_YearToDate_YoY, k, api, auth);

  await updateClientNums(client.gaAccount, 'SEO', api, auth);
};

const updateFBQueries = async (client, queries, api, auth) => {
  let FB_LastMonth_MoM = queries.find(n => n[1] === 'Social' && n[3] === 'FB_LastMonth_MoM' && n[14] === 'FA');
  const i = queries.findIndex(n => n[1] === 'Social' && n[3] === 'FB_LastMonth_MoM' && n[14] === 'FA') + 21;
  const new_FB_LastMonth_MoM = addAccount(client, FB_LastMonth_MoM, 'FB');
  await updateRow(new_FB_LastMonth_MoM, i, api, auth);

  let FB_LastMonth_YoY = queries.find(n => n[1] === 'Social' && n[3] === 'FB_LastMonth_YoY' && n[14] === 'FA');
  const j = queries.findIndex(n => n[1] === 'Social' && n[3] === 'FB_LastMonth_YoY' && n[14] === 'FA') + 21;
  const new_FB_LastMonth_YoY = addAccount(client, FB_LastMonth_YoY, 'FB');
  await updateRow(new_FB_LastMonth_YoY, j, api, auth);

  let FB_YearToDate_YoY = queries.find(n => n[1] === 'Social' && n[3] === 'FB_YearToDate_YoY' && n[14] === 'FA');
  const k = queries.findIndex(n => n[1] === 'Social' && n[3] === 'FB_YearToDate_YoY' && n[14] === 'FA') + 21;
  const new_FB_YearToDate_YoY = addAccount(client, FB_YearToDate_YoY, 'FB');
  await updateRow(new_FB_YearToDate_YoY, k, api, auth);

  await updateClientNums(client.gaAccount, 'Social', api, auth);
};

const updateGASocialQueries = async (client, queries, api, auth) => {
  let GA_LastMonth_MoM = queries.find(n => n[1] === 'Social' && n[3] === 'GA_LastMonth_MoM' && n[46] === client.gaAccount);
  const i = queries.findIndex(n => n[1] === 'Social' && n[3] === 'GA_LastMonth_MoM' && n[46] === client.gaAccount) + 21;
  const new_GA_LastMonth_MoM = addAccount(client, GA_LastMonth_MoM, 'GA');
  await updateRow(new_GA_LastMonth_MoM, i, api, auth);

  let GA_LastMonth_YoY = queries.find(n => n[1] === 'Social' && n[3] === 'GA_LastMonth_YoY' && n[46] === client.gaAccount);
  const j = queries.findIndex(n => n[1] === 'Social' && n[3] === 'GA_LastMonth_YoY' && n[46] === client.gaAccount) + 21;
  const new_GA_LastMonth_YoY = addAccount(client, GA_LastMonth_YoY, 'GA');
  await updateRow(new_GA_LastMonth_YoY, j, api, auth);

  let GA_YearToDate_YoY = queries.find(n => n[1] === 'Social' && n[3] === 'GA_YearToDate_YoY' && n[46] === client.gaAccount);
  const k = queries.findIndex(n => n[1] === 'Social' && n[3] === 'GA_YearToDate_YoY' && n[46] === client.gaAccount) + 21;
  const new_GA_YearToDate_YoY = addAccount(client, GA_YearToDate_YoY, 'GA');
  await updateRow(new_GA_YearToDate_YoY, k, api, auth);

  await updateClientNums(client.gaAccount, 'Social', api, auth);
};

const updateGAAdwordsQueries = async (client, queries, api, auth) => {
  let GA_LastMonth_MoM = queries.find(n => n[1] === 'Adwords' && n[3] === 'GA_LastMonth_MoM' && n[46] === client.gaAccount);
  const i = queries.findIndex(n => n[1] === 'Adwords' && n[3] === 'GA_LastMonth_MoM' && n[46] === client.gaAccount) + 21;
  const new_GA_LastMonth_MoM = addAccount(client, GA_LastMonth_MoM, 'GA');
  await updateRow(new_GA_LastMonth_MoM, i, api, auth);

  let GA_LastMonth_YoY = queries.find(n => n[1] === 'Adwords' && n[3] === 'GA_LastMonth_YoY' && n[46] === client.gaAccount);
  const j = queries.findIndex(n => n[1] === 'Adwords' && n[3] === 'GA_LastMonth_YoY' && n[46] === client.gaAccount) + 21;
  const new_GA_LastMonth_YoY = addAccount(client, GA_LastMonth_YoY, 'GA');
  await updateRow(new_GA_LastMonth_YoY, j, api, auth);

  let GA_YearToDate_YoY = queries.find(n => n[1] === 'Adwords' && n[3] === 'GA_YearToDate_YoY' && n[46] === client.gaAccount);
  const k = queries.findIndex(n => n[1] === 'Adwords' && n[3] === 'GA_YearToDate_YoY' && n[46] === client.gaAccount) + 21;
  const new_GA_YearToDate_YoY = addAccount(client, GA_YearToDate_YoY, 'GA');
  await updateRow(new_GA_YearToDate_YoY, k, api, auth);

  await updateClientNums(client.gaAccount, 'Adwords', api, auth);
};

const addAccount = (client, row, type) => {
  let accounts = JSON.parse(row[22]);
  if (type === 'GA') {
    accounts.push(`${client.gaViewNum}${'`'}${client.gaViewName}`);
  } else if (type === 'FB') {
    accounts.push(`${client.facebookId}${'`'}${client.name}`);
  } else {
    throw 'Invalid analytics type';
  }
  row[22] = JSON.stringify(accounts);
  return row;
};

const updateRow = async (row, index, api, auth) => {
  await api.spreadsheets.values.update({
    auth,
    spreadsheetId: MASTER_SHEET_ID,
    range: `SupermetricsQueries!A${index}:AV${index}`,
    valueInputOption: `USER_ENTERED`,
    requestBody: {
      values: [row]
    }
  });
};

const updateClientNums = async (account, dept, api, auth) => {
  const res = await api.spreadsheets.values.get({
    auth,
    spreadsheetId: MASTER_SHEET_ID,
    range: `RangeIndicies!A2:E14`,
    majorDimension: `ROWS`
  });

  if (res.status !== 200) throw 'Error loading range indicies';

  const index = res.data.values.findIndex(row => row[0] === account && row[4] === dept) + 2;
  let row = res.data.values.find(row => row[0] === account && row[4] === dept);

  const num = [parseInt(row[1]) + 1];

  await api.spreadsheets.values.update({
    auth,
    spreadsheetId: MASTER_SHEET_ID,
    range: `RangeIndicies!B${index}`,
    valueInputOption: `USER_ENTERED`,
    requestBody: {
      values: [num]
    }
  });
};