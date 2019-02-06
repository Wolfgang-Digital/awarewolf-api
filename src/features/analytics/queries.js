const { BigQuery } = require('@google-cloud/bigquery');

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

export const clientSummary = id => {
  const query = `
    SELECT
    client_id,
    "CURRENT" date,
    SUM(sessions) sessions,
    SUM(bounces) bounces,
    SUM(new_users) new_users,
    SUM(total_conversions) total_conversions,
    ROUND(SUM(transaction_revenue), 2) transaction_revenue
    FROM
    \`project-id-4791371014168354215.client_analytics.ga_organic\`
    WHERE
    client_id = "${id}"
    AND
    date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE()
    GROUP BY
    client_id
    UNION ALL
    SELECT
    client_id,
    "PREVIOUS" date,
    SUM(sessions),
    SUM(bounces),
    SUM(new_users),
    SUM(total_conversions),
    ROUND(SUM(transaction_revenue), 2)
    FROM
    \`project-id-4791371014168354215.client_analytics.ga_organic\`
    WHERE
    client_id = "${id}"
    AND
    date BETWEEN DATE_SUB(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), INTERVAL 30 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)
    GROUP BY
    client_id
  `;
  return executeQuery(query);
};
