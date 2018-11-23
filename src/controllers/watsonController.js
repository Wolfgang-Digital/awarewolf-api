import ToneAnalyser from 'watson-developer-cloud/tone-analyzer/v3';
import LanguageAnalyser from 'watson-developer-cloud/natural-language-understanding/v1'

const watsonController = {};

watsonController.analyseLanguage = async (req, res) => {
  req.check('text', 'No text to analyse.').notEmpty();

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const watson = new LanguageAnalyser({
    version: '2018-03-16',
    iam_apikey: process.env.WATSON_NAT_LANG_KEY,
    url: 'https://gateway-fra.watsonplatform.net/natural-language-understanding/api'
  });

  const params = {
    'text': req.body.text,
    'features': {
      'keywords': {
        'sentiment': true,
        'emotion': true
      }
    }
  };

  try {
    watson.analyze(params, (err, data) => {
      if (err) return res.status(400).json({ messages: [err.toString()] });
      res.status(200).json({ data });
    });
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

watsonController.analyseTone = async (req, res) => {
  req.check('text', 'No text to analyse.').notEmpty();

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const watson = new ToneAnalyser({
    version: '2017-09-21',
    iam_apikey: process.env.WATSON_TONE_KEY,
    url: 'https://gateway-wdc.watsonplatform.net/tone-analyzer/api'
  });

  const params = {
    tone_input: { 
      'text': req.body.text
    },
    content_type: 'application/json'
  };

  try {
    watson.tone(params, (err, data) => {
      if (err) return res.status(400).json({ messages: [err.toString()] });
      res.status(200).json({ data });
    });
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] });
  }
};

export default watsonController;