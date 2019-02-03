const { BigQuery } = require('@google-cloud/bigquery');

const params = {
  credentials: {
    client_email: 'dashboard@project-id-4791371014168354215.iam.gserviceaccount.com',
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZhePxwYA/LEBI\nDb2uotK0EiMRX4ZsBnblnN4S4qBcSI77M10uZnpfqKslf439Fxrglruj2VQRGnnQ\n+s82GIvMyaQ525kq5sQYUl/2rRdx83sveNCfCeROb8hTETfgPc/nor1DcR5aF8JI\ngnGIjha/tO5rLaRYQsJpxDj05HVbxI0ao5gM+77PoSo2qAwMABeyw72TEqoN8ySk\n6xY9ovaxIzvhkXbqzg9fF6Yt0VvnB4IFqvWje37QAB2VOxy7IMBoXR1gfptX1mbs\nHpTA6QBK2nLOC4WRsqlysRLKaONpLRyrTsnyEJ7mQVzQv0U3eY0S7JxWN+r3XKFJ\nksfhYiiBAgMBAAECggEAIRaFyvOFP5bKnGtCrDrmVC/iF7VxLCN7mIfZHARPIlqD\nLWDtzq4V9VEh341cmuAV3Y3wMwdPC178orZUKMVpFpihm4906Bq8P3rgUBSaWWIR\nHfKBwX9utCO61C/tUPX2FyUhJw4g8NFmY0M8Y+pBOZ4bGkCSHD7jddU8WLwbwf6H\nLmV337rQslMHTqlZOnIxc0SA9iHuBHxhDSBbP66DWOc9soFSuiCrbB8WOvqFBhhx\n0ena8UOx7xcseiBCRarj3jw3Klpk6Oa6A9d1G924VaOrRp57Nt+RVMHoNRfXi/U0\nnS3ltg2E6RaxP6f6Mh8n4SDn3cwvvHFnA5PbappHsQKBgQDwarL1EnHJQkHCzuG/\niimCzkwAWO0tK5SF1mdQeoEi7/OlpWC3X8CSHNcIiTIx4Ll4oWMBMzdyW/4OPY3C\ndjE/tTYB441OploG85ClnAJAVkutYOlNYqu7Vb3UMMOO3Q2s06/ZeiQynSaHN3Pd\nREptPed2GlN+kT9nbDsB7aTuFQKBgQDnn08Ak2RT3q5t9i1G43ynf5LgauOdpAj3\nDfVlJ5I53yogmnWxJqkyQQhKl/FDBVElZiNqnO6U8h4qHl33e1If1UdgWJ4DjNmy\nXLfr7QblQi/jIVVtyyooROA3gznr9Z75CdzbDY18hnAbkRjSLxXoLVZ6D0+l0/fM\nkp5XSXCXvQKBgQC9SVTTDY2XBtqd1aL52n7qZSCDmYBLcyeB5Jf9TiaEamXrwnSO\njA4jPB+1scdaa/O7XV2E4V1DZdh2P9JwC/ykizkVbaKhDOqO1I/LRDSlkQwOWuH1\nMr3BRjWqbiZaQgL1Usn+MWN0kjR2e5t218C9l+K4IuwgF53TAOzIjOGxLQKBgBn5\n/ew8m4XkdX+TmmRW4wYOArT0h+6IFRFQGXNsyrN+2cSqTgS+Jz+hl4J2I/K2R/F/\n0P0F+KPvu35RxYwZ4o37Z3PgvGf9hfTA/UeSX7GaiLBabrBPlrzJbLQNHZPfCiM3\n/fL7RCDxGuWckkIQUc6mNwqdaPtaGHJzBxsW+2+pAoGAe7his6PfCM8oZ5wmFZiC\n4D7tuofZSgphbhgHkhFaZGt7ilTIBZjyuA+OlZmR5xfeA+l8XOAhm+35gt905Wgp\nItOEv4rPJscy8TERgfdd1WG5QkZ+2ZxVYdb/+ri3/U0hSctnM8DEmzatPgKQ62Fj\n6/nLM3ecNljB66Ii5P0YMLc=\n-----END PRIVATE KEY-----\n"
  },
  projectId: 'project-id-4791371014168354215',
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