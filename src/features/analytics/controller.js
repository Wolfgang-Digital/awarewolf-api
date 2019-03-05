import { getFullReport, getCustomReports } from './utils';

export const getReports = async (req, res) => {
  try {
    const results = await Promise.all([
      getCustomReports(req.metrics, req.query.date),
      getCustomReports(req.metrics, req.query.date, `_mom`),
      getCustomReports(req.metrics, req.query.date, `_yoy`)
    ]);
    if (results[0].error) {
      return res.status(400).json({ messages: [results[0].error] });
    }
    res.status(200).json({
      success: true,
      data: {
        date: req.query.date,
        current: results[0].data,
        monthOnMonth: results[1].data,
        yearOnYear: results[2].data
      }
    });
  } catch (err) {
    res.status(400).json({
      messages: [err.toString()]
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const results = await Promise.all([
      getFullReport(req.params.id, req.services, req.query.date),
      getFullReport(req.params.id, req.services, req.query.date, `_mom`),
      getFullReport(req.params.id, req.services, req.query.date, `_yoy`)
    ]);
    if (results[0].error) {
      return res.status(400).json({ messages: [results[0].error] });
    }
    res.status(200).json({
      success: true,
      data: {
        date: req.query.date,
        current: results[0].data,
        monthOnMonth: results[1].data,
        yearOnYear: results[2].data
      }
    });
  } catch (err) {
    res.status(400).json({
      messages: [err.toString()]
    });
  }
};
