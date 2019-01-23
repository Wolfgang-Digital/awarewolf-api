import { google } from 'googleapis';
import { MASTER_SHEET_ID, INDICES, DATES } from './constants';

export default async (action, client) => {
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

    if (res.status !== 200) throw 'Error loading Supermetrics queries';

    let clientNumUpdates = [];

    if (client.services.includes('SEO')) {
      const updatesGA = await updateGAQueries({ action, dept: 'SEO', queries: res.data.values, client, api, auth });
      if (updatesGA.error) return Promise.reject(updatesGA.error);

      clientNumUpdates.push(updateClientNums(action, client.gaAccount, 'SEO', api, auth));
    }

    if (client.services.includes('Social')) {
      const updatesFB = await updateFBQueries({ action, queries: res.data.values, client, api, auth });
      if (updatesFB.error) return Promise.reject(updatesFB.error);

      const updatesGA = await updateGAQueries({ action, dept: 'Social', queries: res.data.values, client, api, auth });
      if (updatesGA.error) return Promise.reject(updatesGA.error);

      clientNumUpdates.push(updateClientNums(action, client.gaAccount, 'Social', api, auth));
    }

    if (client.services.includes('Paid Search')) {
      const updatesGA = await updateGAQueries({ action, dept: 'Adwords', queries: res.data.values, client, api, auth });
      if (updatesGA.error) return Promise.reject(updatesGA.error);

      const updatesAW = await updateAWQueries({ action, queries: res.data.values, client, api, auth });
      if (updatesAW.error) return Promise.reject(updatesAW.error);

      clientNumUpdates.push(updateClientNums(action, client.gaAccount, 'Adwords', api, auth));
    }

    await Promise.all(clientNumUpdates);

  } catch (err) {
    return Promise.reject(err.toString());
  }
};

const updateFBQueries = async ({ action, queries, client, api, auth }) => {
  try {
    const updates = DATES.map((date) => {
      const query = queries.find(n => n[3] === `FB_${date}`);
      return updateRow({
        row: action === 'REMOVE' ? removeAccount(client, query, 'FB') : addAccount(client, query, 'FB'),
        index: queries.findIndex(n => n[3] === `FB_${date}`) + 21,
        api,
        auth
      });
    });
    await Promise.all(updates);
    return { success: true };
  } catch (err) {
    // console.log(err);
    return { error: `Error updating Facebook queries` };
  }
};

const updateGAQueries = async ({ action, dept, queries, client, api, auth }) => {
  try {
    const updates = DATES.map((date) => {
      const query = queries.find(n => n[1] === dept && n[3] === `GA_${date}` && n[46] === client.gaAccount);
      query[4] = generateFormula(dept, client.gaAccount, date, date === 'YearToDate_YoY');
      return updateRow({
        row: action === 'REMOVE' ? removeAccount(client, query, 'GA') : addAccount(client, query, 'GA'),
        index: queries.findIndex(n => n[1] === dept && n[3] === `GA_${date}` && n[46] === client.gaAccount) + 21,
        api,
        auth
      });
    });
    await Promise.all(updates);
    return { success: true };
  } catch (err) {
    // console.log(err);
    return { error: `Error updating GA queries for: ${dept}` };
  }
};

const updateAWQueries = async ({ action, queries, client, api, auth }) => {
  try {
    const updates = DATES.map((date) => {
      const query = queries.find(n => n[3] === `AW_${date}`);
      return updateRow({
        row: action === 'REMOVE' ? removeAccount(client, query, 'AW') : addAccount(client, query, 'AW'),
        index: queries.findIndex(n => n[3] === `AW_${date}`) + 21,
        api,
        auth
      });
    });
    await Promise.all(updates);
    return { success: true };
  } catch (err) {
    // console.log(err);
    return { error: `Error updating Adwords queries` };
  }
};

const addAccount = (client, row, type) => {
  try {
    let accounts = JSON.parse(row[22]);
    let account;
    if (type === 'GA') {
      account = `${client.gaViewNum}${'`'}${client.gaViewName}`;
    } else if (type === 'FB') {
      account = `${client.facebookId}${'`'}${client.name}`;
    } else if (type === 'AW') {
      account = `${client.awViewNum}${'`'}${client.awAccountName}`;
    } else {  
      throw 'Invalid analytics type';
    }
    if (accounts.includes(account)) return row;
    accounts.push(account);
    row[22] = JSON.stringify(accounts);
    return row;
  } catch (err) {
    throw err;
  }
};

const removeAccount = (client, row, type) => {
  try {
    let accounts = JSON.parse(row[22]);
    if (type === 'GA') {
      accounts = accounts.filter(n => n !== `${client.gaViewNum}${'`'}${client.gaViewName}`);
    } else if (type === 'FB') {
      accounts = accounts.filter(n => n !== `${client.facebookId}${'`'}${client.name}`);
    } else if (type === 'AW') {
      accounts = accounts.filter(n => n !== `${client.awViewNum}${'`'}${client.awAccountName}`);
    } else {
      throw 'Invalid analytics type';
    }
    row[22] = JSON.stringify(accounts);
    return row;
  } catch (err) {
    throw err;
  }
};

const updateRow = async ({ row, index, api, auth }) => {
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

const updateClientNums = async (action, account, dept, api, auth) => {
  const res = await api.spreadsheets.values.get({
    auth,
    spreadsheetId: MASTER_SHEET_ID,
    range: `RangeIndicies!A2:E22`,
    majorDimension: `ROWS`
  });

  if (res.status !== 200) throw 'Error loading range indicies';

  const index = res.data.values.findIndex(row => row[0] === account && row[4] === dept) + 2;
  let row = res.data.values.find(row => row[0] === account && row[4] === dept);

  if (!row) throw `Error updating client numbers`;

  const num = action === 'REMOVE' ? [parseInt(row[1]) - 1] : [parseInt(row[1]) + 1];

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

const generateFormula = (dept, acc, date, isYear) => {
  const index = INDICES.find(n => n.dept === dept && n.acc === acc).index;
  if (isYear) {
    `="GA_YearToDate_YoY!A$"&ADD(CELL("contents", RangeIndicies!C${index}), CELL("contents", RangeIndicies!F${index}))`
  } else {
    return `="GA_${date}!A$"&CELL("contents", RangeIndicies!C${index})`;
  }
};