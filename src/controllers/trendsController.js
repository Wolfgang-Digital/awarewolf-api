import googleTrends from 'google-trends-api';

const trendsController = {};

trendsController.getAutocompleteResults = async (req, res) => {
  const response = await googleTrends.autoComplete({ keyword: req.query.keyword });
  const data = response.json();
  res.status(200).json(data);
};

trendsController.getInterestOverTime = async (req, res) => {
  const response = await googleTrends.interestOverTime({ keyword: req.query.keyword });
  const data = await response.json();
  res.status(200).json(data);
};

export default trendsController;