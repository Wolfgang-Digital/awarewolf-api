const { BigQuery } = require('@google-cloud/bigquery');

const params = {
  credentials: {
    client_email: '',
    private_key: ''
  },
  projectId: '',
  location: 'EU',
  scopes: [
    'https://www.googleapis.com/auth/bigquery',
    'https://www.googleapis.com/auth/bigquery.insertdata'
  ]
};

const executeQuery = async query => {
  try {
    const bigQuery = new BigQuery(params);
    const [ rows ] = await bigQuery.query({ query });
    return { data: rows };
  } catch (err) {
    return { error: err.toString() };
  }
};

export const clientSummary = id => {
  const query = `
    SELECT
    client_id,
    SUM(sessions) organic_sessions,
    SUM(bounces) bounces
    FROM
    \`project-id-4791371014168354215.client_analytics.ga_organic\`
    WHERE
    client_id = "${id}"
    GROUP BY
    client_id
  `;
  return executeQuery(query);
};
