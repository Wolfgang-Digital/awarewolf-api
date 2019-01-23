import db from '../models';
import { hashPassword, updateQueries, getClientData, transform } from '../utils';

const clientController = {};

clientController.addClient = async (req, res) => {
  req.check('client', 'Client name cannot be blank').notEmpty();
  req.check('lead', 'Client lead cannot be blank').notEmpty();
  req.check('gaAccount', 'Must be a valid Wolfgang GA account').isIn([
    'analytics@wolfgangdigital.com',
    'ga@wolfgangdigital.com',
    'ga.wolfgang@wolfgangdigital.com',
    'g_analytics@wolfgangdigital.com',
    'ga5@wolfgangdigital.com'
  ]);
  req.check('gaViewName', 'View name cannot be blank').notEmpty();
  req.check('gaViewNum', 'View number must be a valid integer').isInt();

  const { client, lead, team, domain, gaAccount, gaViewName, gaViewNum, kpis, services, pagespeedSheetId, facebookId, awAccountName, awViewNum } = req.body;

  if (services.includes('SEO')) {
    req.check('domain', 'Domain must be a valid URL').isURL();
  }

  if (services.includes('Social')) {
    req.check('facebookId', 'Facebook ID cannot be blank').notEmpty();
  }

  if (services.includes('Paid Search')) {
    req.check('awAccountName', 'Adwords account name cannot be blank').notEmpty();
    req.check('awViewNum', 'Adwords view number must be a valid integer').isInt();
  }

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const newClient = new db.Client({
    name: client,
    lead,
    team,
    gaAccount,
    gaViewName,
    gaViewNum,
    domain,
    kpis,
    services,
    pagespeedSheetId,
    facebookId,
    awAccountName,
    awViewNum
  });

  try {
    await Promise.all([newClient.save(), updateQueries('ADD', newClient)]);

    res.status(200).json({
      success: true,
      data: newClient
    });
  } catch (err) {
    let errMsg = err.toString();
    if (errMsg.indexOf('duplicate key error') > -1) {
      errMsg = `Client '${client}' already exists`;
    } else {
      await db.Client.findOneAndDelete({ name: client });
    }
    res.status(400).json({ messages: [errMsg] });
  }
};

clientController.getClients = async (req, res) => {
  try {
    const clients = await db.Client.find({}).select('-password');
    const raw = await getClientData();
    const data = transform(clients, raw);

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    let errMsg = err.toString();
    if (errMsg.indexOf('find of undefined')) {
      errMsg = 'No data found';
    }
    res.status(400).json({ messages: [errMsg] });
  }
};

clientController.updateClient = async (req, res) => {
  req.check('clientId', 'Client ID cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { client, lead, team, domain, gaAccount, gaViewName, gaViewNum, kpis, services, password, pagespeedSheetId, facebookId, awAccountName, awViewNum  } = req.body;

  const params = {
    name: client,
    lead,
    team,
    gaAccount,
    gaViewName,
    gaViewNum,
    domain,
    kpis,
    services,
    password: password ? hashPassword(password) : undefined,
    pagespeedSheetId,
    facebookId,
    awAccountName,
    awViewNum
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

