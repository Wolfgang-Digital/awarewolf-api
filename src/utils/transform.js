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
  }).map(n => {
    return {
      gaAccount: n[0],
      lead: n[1],
      team: n[2],
      client: n[3],
      view: n[4],
      sessions: n[5],
      deltaSessions: n[6],
      bounces: n[7],
      deltaBounces: n[8],
      newUsers: n[9],
      deltaNewUsers: n[10],
      conversions: n[11],
      deltaConversions: n[12],
      revenue: n[13],
      deltaRevenue: n[14]
    };
  });
};