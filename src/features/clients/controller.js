import Clients from './model';
import { addClientToSheet } from './utils';

export const getClients = async (req, res) => {

};

export const createClient = async (req, res) => {
  try {
    const data = await addClientToSheet();

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({
      messages: [err.toString()]
    });
  }
};