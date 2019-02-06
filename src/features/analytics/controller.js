import { clientSummary } from './queries';

export const getClientSummary = async (req, res) => {
  const query = await clientSummary(req.params.id);
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
