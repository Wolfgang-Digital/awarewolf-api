export const gaSeoSheet = data => {
  return data.values.filter(row => {
    if (row.some(n => {
      if (!isNaN(n)) return false;
      if (n.includes('GA Account')) return true;
      else if (n.includes('UNSAMPLED')) return true;
      else return false;
    })) {
      return false;
    } else if (row.every(n => n.length === 0)) {
      return false;
    } else {
      return true;
    }
  }).map(row => {
    return {
      gaAccount: row[0],
      lead: row[1],
      team: row[2],
      client: row[3],
      view: row[4],
      sessions: row[5],
      deltaSessions: row[6],
      bounces: row[7],
      deltaBounces: row[8],
      newUsers: row[9],
      deltaNewUsers: row[10],
      conversions: row[11],
      deltaConversions: row[12],
      revenue: row[13],
      deltaRevenue: row[14]
    };
  });
};

export const fbSocialSheet = data => {
  return data.values.filter(row => {
    if (row.every(n => n.length === 0)) return false;
    if (!row[1]) return false;
    return true;
  }).map(row => {
    return {
      client: row[1],
      team: row[0],
      conversions: {
        webPurchases: row[2],
        deltaWebPurchaes: row[3],
        cpWebPurchase: row[4],
        deltaCpWebPurchase: row[5],
        webConversionRate: row[6],
        deltaWebConversionRate: row[7],
        webROAS: row[8],
        deltaWebROAS: row[9]
      },
      traffic: {
        linkClicks: row[10],
        deltaLinkClicks: row[11],
        cpcAll: row[12],
        deltaCpcAll: row[13],
        ctrAll: row[14],
        deltaCtrAll: row[15],
        outboundClicks: row[16],
        deltaOutboundClicks: row[17],
        cpOutboundClick: row[18],
        deltaCpOutboundClick: row[19],
        outboundCTR: row[20],
        deltaOutboundCTR: row[21],
        landingPageViews: row[22],
        deltaLandingPageViews: row[23],
        cpLandingPageView: row[24],
        deltaCpLandingPageView: row[25]
      },
      awareness: {
        reach: row[26],
        deltaReach: row[27],
        impressions: row[28],
        deltaImpressions: row[29],
        vid3Views: row[30],
        deltaVid3Views: row[31],
        vid10Views: row[32],
        deltaVid10Views: row[33],
        vid100Views: row[34],
        deltaVid100Views: row[35],
        cpVid10View: row[36],
        deltaCpVid10View: row[37],
        avgWatchTime: row[38],
        deltaAvgWatchTime: row[39]
      },
      engagement: {
        reactions: row[40],
        deltaReactions: row[41],
        comments: row[42],
        deltaComments: row[43],
        shares: row[44],
        deltaShares: row[45]
      },
      leadGeneration: {
        webLeads: row[48],
        deltaWebLeads: row[49],
        cpWebLead: row[50],
        deltaCpWebLead: row[51],
        messagingReplies: row[52],
        deltaMessagingReplies: row[53],
        cpMessagingReply: row[54],
        deltaCpMessagingReply: row[55]
      },
      other: {
        amountSpent: row[46],
        deltaAmountSpent: row[47]
      }
    };
  });
};

export const compileSeoData = data => {
  const filteredData = data.map(gaSeoSheet); 

  return filteredData;
};