import Client from './model';
import { generateQueries, addToClientList, parseError } from './utils';

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({})
      .select('_id name services')
      .populate({
        path: '_leads',
        select: '_id username'
      })
      .populate({
        path: '_team',
        select: '_id username'
      });
    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (err) {
    res.status(400).json({
      messages: [parseError(err)]
    });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select('-password')
      .populate({
        path: '_leads',
        select: '_id username'
      })
      .populate({
        path: '_team',
        select: '_id username'
      });
    if (!client) {
      return res.status(400).json({
        messages: ['Client does not exist']
      });
    }
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (err) {
    res.status(400).json({
      messages: [parseError(err)]
    });
  }
};

export const createClient = async (req, res) => {
  try {
    const model = new Client({
      _leads: req.body.leads,
      _team: req.body.team,
      ...req.body
    });
    const client = await model.save();

    await generateQueries(client);
    await addToClientList(client);

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (err) {
    res.status(400).json({
      messages: [parseError(err)]
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { ...req.update }, { new: true });
    if (!client) {
      return res.status(400).json({
        messages: ['Client does not exist']
      });
    }
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (err) {
    res.status(400).json({
      messages: [parseError(err)]
    });
  }
};
