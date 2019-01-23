import { MONTHS } from './constants';

export default (clients, data) => {
  return clients.map(client => {

    const clientData = {
      ...client._doc
    };

    if (client.services.includes('SEO')) {
      const seoData = {
        googleAnalytics: mapSeoGAData(client, data.seoData)
      };
      clientData['Organic'] = seoData;
    }

    if (client.services.includes('Social')) {
      const socialData = {
        googleAnalytics: mapSocialGAData(client, data.socialData),
        facebook: mapFBData(client, data.socialData)
      };
      clientData['Social'] = socialData;
    }

    if (client.services.includes('Paid Search')) {
      const adwordsData = {
        googleAnalytics: mapAdwordsGAData(client, data.adwordsData),
        googleAds: mapAdwordsPPCData(client, data.adwordsData)
      };
      clientData['Paid Search'] = adwordsData;
    }

    return clientData;
  });
};

const mapSeoGAData = (client, data) => {
  const gaData = {};

  const monthMoM = data
    .find(n => n.range.indexOf('GA_LastMonth_MoM') > -1).values
    .find(row => row[0] === client.gaViewName);

  const monthYoY = data
    .find(n => n.range.indexOf('GA_LastMonth_YoY') > -1).values
    .find(row => row[0] === client.gaViewName);

  const yearYoY = data
    .find(n => n.range.indexOf('GA_YearToDate_YoY') > -1).values
    .filter(row => row[0] === client.gaViewName);

  gaData['LastMonth'] = seoGADataTemplate(monthMoM, 1);

  gaData['MonthBeforeLast'] = seoGADataTemplate(monthMoM, 2);

  gaData['LastMonthLastYear'] = seoGADataTemplate(monthYoY, 2);
  
  gaData['YearToDate'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...seoGADataTemplate(n, 2)
    };
  });

  gaData['LastYear'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...seoGADataTemplate(n, 3)
    };
  });

  return gaData;
};

const mapAdwordsGAData = (client, data) => {
  const gaData = {};

  const monthMoM = data
    .find(n => n.range.indexOf('GA_LastMonth_MoM') > -1).values
    .find(row => row[0] === client.gaViewName);

  const monthYoY = data
    .find(n => n.range.indexOf('GA_LastMonth_YoY') > -1).values
    .find(row => row[0] === client.gaViewName);

  const yearYoY = data
    .find(n => n.range.indexOf('GA_YearToDate_YoY') > -1).values
    .filter(row => row[0] === client.gaViewName);
    
  gaData['LastMonth'] = adwordsGADataTemplate(monthMoM, 1);

  gaData['MonthBeforeLast'] = adwordsGADataTemplate(monthMoM, 2);

  gaData['LastMonthLastYear'] = adwordsGADataTemplate(monthYoY, 2);

  gaData['YearToDate'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...adwordsGADataTemplate(n, 2)
    };
  });

  gaData['LastYear'] = yearYoY.map((n, i) => {
    return {
      ...adwordsGADataTemplate(n, 3)
    };
  });

  return gaData;
};

const mapAdwordsPPCData = (client, data) => {
  const ppcData = {};
  
  const monthMoM = data
    .find(n => n.range.indexOf('AW_LastMonth_MoM') > -1).values
    .filter(row => row[0] === client.awAccountName);

  const monthYoY = data
    .find(n => n.range.indexOf('AW_LastMonth_YoY') > -1).values
    .filter(row => row[0] === client.awAccountName);

  const yearYoY = data
    .find(n => n.range.indexOf('AW_YearToDate_YoY') > -1).values
    .filter(row => row[0] === client.awAccountName);

  ppcData['LastMonth'] = {
    'Search Network': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'Search Network'), 2),
    'Display Network': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'Display Network'), 2),
    'YouTube Videos': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'YouTube Videos'), 2),
    'Cross-newtwork': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'Cross-network'), 2)
  };

  ppcData['MonthBeforeLast'] = {
    'Search Network': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'Search Network'), 3),
    'Display Network': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'Display Network'), 3),
    'YouTube Videos': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'YouTube Videos'), 3),
    'Cross-newtwork': adwordsPPCDataTemplate(monthMoM.find(n => n[1] === 'Cross-network'), 3)
  };

  ppcData['LastMonthLastYear'] = {
    'Search Network': adwordsPPCDataTemplate(monthYoY.find(n => n[1] === 'Search Network'), 3),
    'Display Network': adwordsPPCDataTemplate(monthYoY.find(n => n[1] === 'Display Network'), 3),
    'YouTube Videos': adwordsPPCDataTemplate(monthYoY.find(n => n[1] === 'YouTube Videos'), 3),
    'Cross-newtwork': adwordsPPCDataTemplate(monthYoY.find(n => n[1] === 'Cross-network'), 3)
  };

  ppcData['YearToDate'] = yearYoY.reduce((acc, cur) => {
    if (!acc[cur[2] - 1]) acc[cur[2] - 1] = {};
    acc[cur[2] - 1].month = MONTHS[cur[2] - 1];
    acc[cur[2] - 1][cur[1]] = adwordsPPCDataTemplate(cur, 3);
    return acc;
  }, []);

  ppcData['LastYear'] = yearYoY.reduce((acc, cur) => {
    if (!acc[cur[2] - 1]) acc[cur[2] - 1] = {};
    acc[cur[2] - 1].month = MONTHS[cur[2] - 1];
    acc[cur[2] - 1][cur[1]] = adwordsPPCDataTemplate(cur, 4);
    return acc;
  }, []);

  return ppcData;
};

const mapSocialGAData = (client, data) => {
  const gaData = {};

  const monthMoM = data
    .find(n => n.range.indexOf('GA_LastMonth_MoM') > -1).values
    .find(row => row[0] === client.gaViewName);

  const monthYoY = data
    .find(n => n.range.indexOf('GA_LastMonth_YoY') > -1).values
    .find(row => row[0] === client.gaViewName);

  const yearYoY = data
    .find(n => n.range.indexOf('GA_YearToDate_YoY') > -1).values
    .filter(row => row[0] === client.gaViewName);

  gaData['LastMonth'] = socialGADataTemplate(monthMoM, 1)

  gaData['MonthBeforeLast'] = socialGADataTemplate(monthMoM, 2)

  gaData['LastMonthLastYear'] = socialGADataTemplate(monthYoY, 2)

  gaData['YearToDate'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...socialGADataTemplate(n, 2)
    };
  });

  gaData['LastYear'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...socialGADataTemplate(n, 3)
    };
  });

  return gaData;
};

const mapFBData = (client, data) => {
  const fbData = {};

  const monthMoM = data
    .find(n => n.range.indexOf('FB_LastMonth_MoM') > -1).values
    .find(row => row[0] === client.name);

  const monthYoY = data
    .find(n => n.range.indexOf('FB_LastMonth_YoY') > -1).values
    .find(row => row[0] === client.name);

  const yearYoY = data
    .find(n => n.range.indexOf('FB_YearToDate_YoY') > -1).values
    .filter(row => row[0] === client.name);

  fbData['LastMonth'] = fbDataTemplate(monthMoM, 1);

  fbData['MonthBeforeLast'] = fbDataTemplate(monthMoM, 2);

  fbData['LastMonthLastYear'] = fbDataTemplate(monthYoY, 2);

  fbData['YearToDate'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...fbDataTemplate(n, 2)
    };
  });

  fbData['LastYear'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...fbDataTemplate(n, 3)
    };
  });

  return fbData;
};

const seoGADataTemplate = (data, start) => {
  if (!data) return;
  return {
    'Sessions': data[start],
    'Bounces': data[start + 2],
    'New Users': data[start + 4],
    'Total Conversions': data[start + 4],
    'Transaction Revenue': data[start + 6]
  };
};

const adwordsGADataTemplate = (data, start) => {
  if (!data) return;
  return {
    'Sessions': data[start],
    'Goal Completion (all)': data[start + 2],
    'Goal Conversion Rate (all)': data[start + 4],
    'Transactions': data[start + 6],
    'Ecommerce Conversion Rate': data[start + 8]
  };
};

const adwordsPPCDataTemplate = (data, start) => {
  if (!data) return;
  return {
    'Clicks': data[start],
    'Impressions': data[start + 2],
    'CTR': data[start + 4],
    'CPC': data[start + 6],
    'Average Position': data[start + 8],
    'Cost': data[start + 10],
    'Search Budget Lost Impression Share': data[start + 12],
    'Conversions': data[start + 14],
    'Conversion Rate': data[start + 16],
    'Total Conversion Value': data[start + 18],
    'ROAS': data[start + 20],
    'Cost per Conversion': data[start + 22],
    'Video Views': data[start + 24],
    'Video View Rate': data[start + 26]
  };
};

const socialGADataTemplate = (data, start) => {
  if (!data) return;
  return {
    'Sessions': data[start],
    'Transaction Revenue': data[start + 2]
  };
};

const fbDataTemplate = (data, start) => {
  if (!data) return;
  return {
    'Website Purchases': data[start],
    'Cost per Website Purchase': data[start + 2],
    'Website Conversions': data[start + 4],
    'Website Purchase ROAS': data[start + 6],
    'Link Clicks': data[start + 8],
    'CPC (all)': data[start + 10],
    'CTR (all)': data[start + 12],
    'Outbound Clicks': data[start + 14],
    'Cost per Outbound Click': data[start + 16],
    'Outbound CTR': data[start + 18],
    'Landing Page Views': data[start + 20],
    'Cost per Landing Page View': data[start + 22],
    'Reach': data[start + 24],
    'Impressions': data[start + 26],
    '3s Video Views': data[start + 28],
    '10s Video Views': data[start + 30],
    '100% Video Views': data[start + 32],
    'Cost per 10s Video View': data[start + 34],
    'Video Avg Watch Time': data[start + 36],
    'Post Reactions': data[start + 38],
    'Post Comments': data[start + 40],
    'Post Shares': data[start + 42],
    'Amount Spent': data[start + 44],
    'Website Leads': data[start + 46],
    'Cost per Website Lead': data[start + 48],
    'Messaging Replies': data[start + 50],
    'Cost per Messaging Reply': data[start + 50]
  };
};