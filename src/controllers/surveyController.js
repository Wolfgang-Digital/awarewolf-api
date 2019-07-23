import db from '../models';

const surveyController = {};

surveyController.fetch = async (req, res) => {
  try {
    if (!req.user.roles.includes('manager')) {
      return res.status(200).json({ success: true, data: [] });
    }

    const surveys = await db.Survey.find({}).populate('visibleTo', '_id');

    res.status(200).json({
      success: true,
      data: surveys.reduce((result, survey) => {
        if (survey.visibleTo && survey.visibleTo.length > 0) {
          const isVisible = survey.visibleTo.map(n => n._id.toString());
          if (isVisible.indexOf(req.user.id) > -1) {
            result.push(Object.assign(survey, { answers: [] }));
            return result;
          }
          return result;
        }
        result.push(Object.assign(survey, { answers: [] }));
        return result;
      }, [])
    });
  } catch (err) {
    res.status(400).json({ messages: ['Error fetching surveys.'] });
  }
};

surveyController.findById = async (req, res) => {
  req.check('id', 'Error: Blank ID.').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const survey = await db.Survey.findById(req.params.id);

    if (!req.user.roles.includes('admin')) {
      survey.userResponses = [];
      survey.answers = [];
    }

    if (survey.visibleTo.length > 0 && !survey.visibleTo.includes(req.user.id)) {
      return res.status(404).json({ messages: ['Unauthorised'] });
    }

    res.status(200).json({
      success: true,
      data: survey
    });
  } catch (err) {
    res.status(400).json({ messages: ['No matches found.'] });
  }
};

surveyController.create = async (req, res) => {
  req.check('title', 'Title must be at least 6 characters.').len(6);

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  if (!req.body.questions || req.body.questions.length < 1) return res.status(400).json({ messages: ['Must be at least 1 question.'] });

  req.body.questions.forEach(q => {
    if (q.type === 'multiple' && (!q.options || q.options.length < 2)) {
      return res.status(400).json({ messages: ['Must be at least 2 options.'] });
    }
  });

  try {
    const { title, description, questions, visibleTo } = req.body;
    const survey = new db.Survey({
      _author: req.user._id,
      title,
      description,
      questions,
      visibleTo
    });
    await survey.save();
    const updated = await db.Survey.findById(survey._id);

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(400).json({ messages: ['Error creating survey.'] });
  }
};

surveyController.submitResponse = async (req, res) => {
  req.check('id', 'Error: Blank ID.').notEmpty();
  req.check('surveyResponse', 'Error: No response.').notEmpty();

  // TODO: Validate user response.

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const survey = await db.Survey.findById(req.params.id);

    if (survey.isResolved) return res.status(400).json({ messages: ['This survey has been resolved.'] });

    if (survey.userResponses.filter(n => n.toString() === req.user._id.toString()).length > 0) {
      return res.status(400).json({ messages: ['Survey already completed.'] });
    }

    survey.userResponses.push(req.user._id);
    survey.answers.push(req.body.surveyResponse);
    await survey.save();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ messages: ['Error submitting response.'] });
  }
};

export default surveyController;
