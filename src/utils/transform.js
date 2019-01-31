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

  const last30daysMoM = data
    .find(n => n.range.indexOf('GA_30Days_MoM') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const last30daysYoY = data
    .find(n => n.range.indexOf('GA_30Days_YoY') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const monthMoM = data
    .find(n => n.range.indexOf('GA_LastMonth_MoM') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const monthYoY = data
    .find(n => n.range.indexOf('GA_LastMonth_YoY') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const yearYoY = data
    .find(n => n.range.indexOf('GA_YearToDate_YoY') > -1)
    .values.filter(row => row[0] === client.gaViewName);

  gaData['Last30Days'] = seoGADataTemplate(last30daysMoM, 1);

  gaData['Last30DaysLastMonth'] = seoGADataTemplate(last30daysMoM, 2);

  gaData['Last30DaysLastYear'] = seoGADataTemplate(last30daysYoY, 2);

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

  const last30daysMoM = data
    .find(n => n.range.indexOf('GA_30Days_MoM') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const last30daysYoY = data
    .find(n => n.range.indexOf('GA_30Days_YoY') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const monthMoM = data
    .find(n => n.range.indexOf('GA_LastMonth_MoM') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const monthYoY = data
    .find(n => n.range.indexOf('GA_LastMonth_YoY') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const yearYoY = data
    .find(n => n.range.indexOf('GA_YearToDate_YoY') > -1)
    .values.filter(row => row[0] === client.gaViewName);

  gaData['Last30Days'] = adwordsGADataTemplate(last30daysMoM, 1);

  gaData['Last30DaysLastMonth'] = adwordsGADataTemplate(last30daysMoM, 2);

  gaData['Last30DaysLastYear'] = adwordsGADataTemplate(last30daysYoY, 2);

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
      month: MONTHS[i],
      ...adwordsGADataTemplate(n, 3)
    };
  });

  return gaData;
};

const mapAdwordsPPCData = (client, data) => {
  const ppcData = {};

  const last30daysMoM = data
    .find(n => n.range.indexOf('AW_30Days_MoM') > -1)
    .values.find(row => row[0] === client.awAccountName);

  const last30daysYoY = data
    .find(n => n.range.indexOf('AW_30Days_YoY') > -1)
    .values.find(row => row[0] === client.awAccountName);

  const monthMoM = data
    .find(n => n.range.indexOf('AW_LastMonth_MoM') > -1)
    .values.find(row => row[0] === client.awAccountName);

  const monthYoY = data
    .find(n => n.range.indexOf('AW_LastMonth_YoY') > -1)
    .values.find(row => row[0] === client.awAccountName);

  const yearYoY = data
    .find(n => n.range.indexOf('AW_YearToDate_YoY') > -1)
    .values.filter(row => row[0] === client.awAccountName);

  ppcData['Last30Days'] = adwordsPPCDataTemplate(last30daysMoM, 1);

  ppcData['Last30DaysLastMonth'] = adwordsPPCDataTemplate(last30daysMoM, 2);

  ppcData['Last30DaysLastYear'] = adwordsPPCDataTemplate(last30daysYoY, 2);

  ppcData['LastMonth'] = adwordsPPCDataTemplate(monthMoM, 1);

  ppcData['MonthBeforeLast'] = adwordsPPCDataTemplate(monthMoM, 2);

  ppcData['LastMonthLastYear'] = adwordsPPCDataTemplate(monthYoY, 2);

  ppcData['YearToDate'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...adwordsPPCDataTemplate(n, 2)
    };
  });

  ppcData['LastYear'] = yearYoY.map((n, i) => {
    return {
      month: MONTHS[i],
      ...adwordsPPCDataTemplate(n, 3)
    };
  });

  return ppcData;
};

const mapSocialGAData = (client, data) => {
  const gaData = {};

  const last30daysMoM = data
    .find(n => n.range.indexOf('GA_30Days_MoM') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const last30daysYoY = data
    .find(n => n.range.indexOf('GA_30Days_YoY') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const monthMoM = data
    .find(n => n.range.indexOf('GA_LastMonth_MoM') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const monthYoY = data
    .find(n => n.range.indexOf('GA_LastMonth_YoY') > -1)
    .values.find(row => row[0] === client.gaViewName);

  const yearYoY = data
    .find(n => n.range.indexOf('GA_YearToDate_YoY') > -1)
    .values.filter(row => row[0] === client.gaViewName);

  gaData['Last30Days'] = socialGADataTemplate(last30daysMoM, 1);

  gaData['Last30DaysLastMonth'] = socialGADataTemplate(last30daysMoM, 2);

  gaData['Last30DaysLastYear'] = socialGADataTemplate(last30daysYoY, 2);

  gaData['LastMonth'] = socialGADataTemplate(monthMoM, 1);

  gaData['MonthBeforeLast'] = socialGADataTemplate(monthMoM, 2);

  gaData['LastMonthLastYear'] = socialGADataTemplate(monthYoY, 2);

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

  const last30daysMoM = data
    .find(n => n.range.indexOf('FB_30Days_MoM') > -1)
    .values.find(row => row[0] === client.name);

  const last30daysYoY = data
    .find(n => n.range.indexOf('FB_30Days_YoY') > -1)
    .values.find(row => row[0] === client.name);

  const monthMoM = data.find(n => n.range.indexOf('FB_LastMonth_MoM') > -1).values.find(row => row[0] === client.name);

  const monthYoY = data.find(n => n.range.indexOf('FB_LastMonth_YoY') > -1).values.find(row => row[0] === client.name);

  const yearYoY = data
    .find(n => n.range.indexOf('FB_YearToDate_YoY') > -1)
    .values.filter(row => row[0] === client.name);

  fbData['Last30Days'] = fbDataTemplate(last30daysMoM, 1);

  fbData['Last30DaysLastMonth'] = fbDataTemplate(last30daysMoM, 2);

  fbData['Last30DaysLastYear'] = fbDataTemplate(last30daysYoY, 2);

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
    Sessions: data[start],
    Bounces: data[start + 2],
    'New Users': data[start + 4],
    'Total Conversions': data[start + 4],
    'Transaction Revenue': data[start + 6]
  };
};

const adwordsGADataTemplate = (data, start) => {
  if (!data) return;
  return {
    Sessions: data[start],
    'Goal Completion (all)': data[start + 2],
    'Goal Conversion Rate (all)': data[start + 4],
    Transactions: data[start + 6],
    'Ecommerce Conversion Rate': data[start + 8]
  };
};

const adwordsPPCDataTemplate = (data, start) => {
  if (!data) return;
  return {
    '[Search] Clicks': data[start],
    '[Cross] Clicks': data[start + 2],
    '[Display] Clicks': data[start + 4],
    '[YouTube] Clicks': data[start + 6],
    '[Search] Impressions': data[start + 8],
    '[Cross] Impressions': data[start + 10],
    '[Display] Impressions': data[start + 12],
    '[YouTube] Impressions': data[start + 14],
    '[Search] CTR': data[start + 16],
    '[Cross] CTR': data[start + 18],
    '[Display] CTR': data[start + 20],
    '[YouTube] CTR': data[start + 22],
    '[Search] CPC': data[start + 24],
    '[Cross] CPC': data[start + 26],
    '[YouTube] CPC': data[start + 28],
    '[Search] Avg Position': data[start + 30],
    '[Cross] Avg Position': data[start + 32],
    '[Display] Avg Position': data[start + 34],
    '[YouTube] Avg Position': data[start + 36],
    '[Search] Cost': data[start + 38],
    '[Display] Cost': data[start + 40],
    '[Cross] Cost': data[start + 42],
    '[YouTube] Cost': data[start + 44],
    '[Search] Search Budget Lost Impression Share': data[start + 46],
    '[Cross] Search Budget Lost Impression Share': data[start + 48],
    '[Display] Search Budget Lost Impression Share': data[start + 50],
    '[YouTube] Search Budget Lost Impression Share': data[start + 52],
    '[Search] Conversions': data[start + 54],
    '[Cross] Conversions': data[start + 56],
    '[Display] Conversions': data[start + 58],
    '[YouTube] Conversions': data[start + 60],
    '[Search] Conversion Rate': data[start + 62],
    '[Cross] Conversion Rate': data[start + 64],
    '[Display] Conversion Rate': data[start + 66],
    '[YouTube] Conversion Rate': data[start + 68],
    '[Search] Total Conversion Value': data[start + 70],
    '[Cross] Total Conversion Value': data[start + 72],
    '[Display] Total Conversion Value': data[start + 74],
    '[YouTube] Total Conversion Value': data[start + 76],
    '[Search] ROAS': data[start + 78],
    '[Cross] ROAS': data[start + 80],
    '[Display] ROAS': data[start + 82],
    '[YouTube] ROAS': data[start + 84],
    '[Search] Cost per Conversion': data[start + 86],
    '[Cross] Cost per Conversion': data[start + 88],
    '[Display] Cost per Conversion': data[start + 90],
    '[YouTube] Cost per Conversion': data[start + 92],
    '[Search] Video Views': data[start + 94],
    '[Cross] Video Views': data[start + 96],
    '[Display] Video Views': data[start + 98],
    '[YouTube] Video Views': data[start + 100],
    '[Search] Video View Rate': data[start + 102],
    '[Cross] Video View Rate': data[start + 104],
    '[Display] Video View Rate': data[start + 106],
    '[YouTube] Video View Rate': data[start + 108]
  };
};

const socialGADataTemplate = (data, start) => {
  if (!data) return;
  return {
    Sessions: data[start],
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
    Reach: data[start + 24],
    Impressions: data[start + 26],
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
