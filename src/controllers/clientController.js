import db from '../models';
import { hashPassword } from '../utils';

const clientController = {};

clientController.addClient = async (req, res) => {
  req.check('client', 'Client name cannot be blank').notEmpty();
  req.check('lead', 'Client lead cannot be blank').notEmpty();
  req.check('domain', 'Must be a valid domain').isURL();
  req.check('ga_account', 'Must be a valid email').isEmail();
  req.check('ga_viewName', 'View name cannot be blank').notEmpty();
  req.check('ga_viewNum', 'View number must be a valid integer').isInt();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const { client, lead, team, domain, ga_account, ga_viewName, ga_viewNum, kpis, services, summaryMetrics, pageSpeedSheetId, budgets } = req.body;

    const newClient = new db.Client({
      name: client,
      lead: lead.split(', '),
      team: team ? team.split(', ') : [],
      gaAccount: ga_account,
      gaViewName: ga_viewName,
      gaViewNum: ga_viewNum,
      domain,
      kpis: kpis ? kpis.split(', ') : [],
      services: services ? services.split(', ') : [],
      summaryMetrics: summaryMetrics ? summaryMetrics.split(', ') : [],
      pageSpeedSheetId,
      budgets: budgets || { seo: 0, social: 0 }
    });

    await newClient.save();

    res.status(200).json({
      success: true,
      data: newClient
    });
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

clientController.getClients = async (req, res) => {
  try {
    const clients = await db.Client.find({}).select('-password');
    res.status(200).json({
      success: true,
      data: clients
    })
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

clientController.updateClient = async (req, res) => {
  req.check('clientId', 'Client ID cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { client, lead, team, domain, ga_account, ga_viewName, ga_viewNum, kpis, services, summaryMetrics, password, pageSpeedSheetId, budget } = req.body;

  const params = {
    name: client,
    lead: lead.split(', '),
    team: team ? team.split(', ') : [],
    gaAccount: ga_account,
    gaViewName: ga_viewName,
    gaViewNum: ga_viewNum,
    domain,
    kpis: kpis ? kpis.split(', ') : [],
    services: services ? services.split(',') : [],
    summaryMetrics: summaryMetrics ? summaryMetrics.split(', ') : [],
    pageSpeedSheetId,
    password: password ? hashPassword(password) : null,
    budgets: budgets || { seo: 0, social: 0 }
  };
  for (const prop in params) {
    if (!params[prop]) delete params[prop];
  }

  try {
    const updated = await db.Client.findByIdAndUpdate(req.params.clientId, params, { new: true }).select('-password');
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

export default clientController;