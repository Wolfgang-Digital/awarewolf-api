import { google } from 'googleapis';
import {
  ADWORDS_QUERIES,
  SEO_QURIES,
  SOCIAL_QUERIES,
  ADWORDS_SHEET_ID,
  SOCIAL_SHEET_ID,
  SEO_SHEET_ID
} from './constants';

export default async () => {
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

    const adwordsData = await Promise.all(ADWORDS_QUERIES.map(n => {
      return getData(ADWORDS_SHEET_ID, n, api, auth);
    }));

    const seoData = await Promise.all(SEO_QURIES.map(n => {
      return getData(SEO_SHEET_ID, n, api, auth);
    }));

    const socialData = await Promise.all(SOCIAL_QUERIES.map(n => {
      return getData(SOCIAL_SHEET_ID, n, api, auth);
    }));

    return { adwordsData, seoData, socialData };
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

const getData = async (spreadsheetId, sheetName, api, auth) => {
  try {
    const res = await api.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:ZZ1000`,
      majorDimension: 'ROWS'
    });

    if (res.status === 200) {
      return res.data;
    } else {
      console.log(res);
      return Promise.reject(res.error);
    }
  } catch (err) {
    return Promise.reject(err.toString());
  }
};