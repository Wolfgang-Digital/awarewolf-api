import { getSummaries, getClientData } from './utils';

export const getReports = async (req, res) => {
  const result = await getSummaries(req.metrics, req.params.dateRange);
  if (result.error) {
    return res.status(400).json({
      messages: [result.error]
    });
  }
  res.status(200).json({
    success: true,
    data: result.data
  });
};

export const getReportById = async (req, res) => {
  const query = await getClientData(req.params.id, req.params.dateRange);
  if (query.error) {
    return res.status(400).json({
      messages: [query.error]
    });
  }
  res.status(200).json({
    success: true,
    data: query.data
  });
};
