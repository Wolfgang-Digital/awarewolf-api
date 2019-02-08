import { BigQuery } from '@google-cloud/bigquery';
import squel from 'squel';

const executeQuery = async query => {
  const params = {
    credentials: {
      client_email: process.env.GOOGLE_EMAIL,
      private_key: process.env.SERVICE_ACCOUNT_KEY
    },
    projectId: 'project-id-4791371014168354215',
    location: 'EU',
    scopes: ['https://www.googleapis.com/auth/bigquery', 'https://www.googleapis.com/auth/bigquery.insertdata']
  };
  try {
    const bigQuery = new BigQuery(params);
    const [rows] = await bigQuery.query({ query });
    return { data: rows };
  } catch (err) {
    return { error: err.toString() };
  }
};

const addMetrics = (query, metrics, alias, channel = ``) => {
  return metrics.reduce((obj, metric) => {
    return obj.field(`IFNULL(${alias}.${metric}, 0)`, `${channel}${metric}`);
  }, query);
};

const joinGoogleAds = (query, dateRange, network, alias) => {
  return query.outer_join(
    squel
      .select({ autoQuoteAliasNames: false })
      .from(`reports.google_ads_${dateRange}`)
      .where(`network = "${network}"`),
    alias,
    `${alias}.client_id = a.client_id`
  );
};

export const getSummaries = (metrics, dateRange) => {
  let query = squel
    .select({ autoQuoteAliasNames: false })
    .field(`a.client_id`)
    .field(`a.client_name`)
    .field(`"${dateRange.toUpperCase()}"`, `date_range`)
    .from(`admin.accounts`, `a`);

  if (metrics.ga_organic) {
    query = addMetrics(query, metrics.ga_organic, `b`, `organic_`);
    query.outer_join(`reports.ga_organic_${dateRange}`, `b`, `b.client_id = a.client_id`);
  }

  if (metrics.ga_social) {
    query = addMetrics(query, metrics.ga_social, `c`, `social_`);
    query.outer_join(`reports.ga_social_${dateRange}`, `c`, `c.client_id = a.client_id`);
  }

  if (metrics.fb_ads) {
    query = addMetrics(query, metrics.fb_ads, `d`);
    query.outer_join(`reports.fb_ads_${dateRange}`, `d`, `d.client_id = a.client_id`);
  }

  if (metrics.google_ads) {
    const crossNetwork = metrics.google_ads.filter(metric => metric.indexOf(`cross`) > -1);
    if (crossNetwork.length > 0) {
      query = addMetrics(query, crossNetwork.map(m => m.replace(`cross_`, ``)), `e`, `cross_`);
      query = joinGoogleAds(query, dateRange, `CROSS`, `e`);
    }
    const displayNetwork = metrics.google_ads.filter(metric => metric.indexOf(`display`) > -1);
    if (displayNetwork.length > 0) {
      query = addMetrics(query, displayNetwork.map(m => m.replace(`display_`, ``)), `f`, `display_`);
      query = joinGoogleAds(query, dateRange, `DISPLAY`, `f`);
    }
    const searchNetwork = metrics.google_ads.filter(metric => metric.indexOf(`search`) > -1);
    if (searchNetwork.length > 0) {
      query = addMetrics(query, searchNetwork.map(m => m.replace(`search_`, ``)), `g`, `search_`);
      query = joinGoogleAds(query, dateRange, `SEARCH`, `g`);
    }
    const youtubeVideos = metrics.google_ads.filter(metric => metric.indexOf(`youtube`) > -1);
    if (youtubeVideos.length > 0) {
      query = addMetrics(query, youtubeVideos.map(m => m.replace(`youtube_`, ``)), `h`, `youtube_`);
      query = joinGoogleAds(query, dateRange, `YOUTUBE`, `h`);
    }
  }

  query = query.toString().replace(/OUTER JOIN/g, `FULL OUTER JOIN`);
  return executeQuery(query);
};

export const getClientData = (id, dateRange) => {
  const query = squel
    .select({ autoQuoteAliasNames: false })
    .field(`a.*`)
    .from(`admin.accounts`, `a`)
    .where(`a.client_id = "${id}"`)
    .field(`b.*`)
    .inner_join(`reports.ga_organic_${dateRange}`, `b`, `b.client_id = a.client_id`)
    .toString();
  console.log(query);
  return executeQuery(query);
};
