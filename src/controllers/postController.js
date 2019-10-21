import nodemailer from 'nodemailer';

import db from '../models';

const postController = {};

postController.fetch = async (req, res) => {
  try {
    const posts = await db.Post.find({ isDeleted: false })
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (err) {
    //console.log('Error: ', err);
    res.status(500).json({ messages: ['Database error.'] });
  }
};

postController.findById = async (req, res) => {
  req.check('id', 'No post ID.').notEmpty();

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const post = await db.Post.findById(req.params.id);
    if (post.isDeleted) return res.status(400).json({ messages: ['This post has been deleted.'] });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(500).json({ messages: ['Database error.'] });
  }
};

postController.create = async (req, res) => {
  req.check('title', 'Title must be at least 6 characters.').len(6);
  req.check('text', 'Text must be at least 6 character.').len(6);

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const post = new db.Post({
      title: req.body.title,
      text: req.body.text,
      _author: req.user._id
  });

  try {
    await post.save();
    const newPost = await db.Post.findById(post._id);

    const users = await db.User.find({});

    users.forEach(user => {
      sendEmail(user, req.body.title, newPost.id).then(() => {
      }).catch(console.error);
    });

    return res.status(200).json({
      success: true,
      data: newPost
    });
  } catch (err) {
    res.status(500).json({ messages: ['Database error.'] });
  }
};

// Vote on a post.
// Limited to 1 voter per user.
// Votes are either +1 or -1.
postController.vote = async (req, res) => {
  req.check('id', 'Post ID cannot be blank.').notEmpty();
  req.check('value', 'Value cannot be blank.').notEmpty();
  req.check('value', 'Value must be 1 or -1.').isIn([1, -1]);

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { value } = req.body;

  try {
    const post = await db.Post.findById(req.params.id);
    if (!post) return res.status(400).json({ messages: ['Invalid post ID.'] });
    
    if (post.isDeleted) return res.status(400).json({ messages: ['This post has been deleted.'] });

    if (post.isResolved) return res.status(400).json({ messages: ['This post has been resolved.'] });

    let vote = await db.Vote.findOne({ _user: req.user._id, _parent: req.params.id });

    if (!vote) {
      // No vote yet so add a new one.
      vote = new db.Vote({ _user: req.user._id, _parent: req.params.id, value });
      await vote.save();
      await post.update({ $push: { '_votes': vote._id } });

    } else if (vote.value === value) {
      // Same vote value so remove.
      await post.update({ $pull: { '_votes': vote._id } });
      await db.Vote.findByIdAndRemove(vote._id);

    } else {
      // Different vote value so update.
      await vote.update({ $set: { 'value': value } });

    }
    const updatedPost = await db.Post.findById(req.params.id);
    return res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (err) {
    //console.log('Error: ', err);
    res.status(500).json({ messages: ['Database error.'] });
  }
};

// Admin control to set post as resolved.
// Resolved posts cannot be commented or voted on.
postController.resolve = async (req, res) => {
  req.check('id', 'Post ID cannot be blank.').notEmpty();

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  // Validate user permissions.
  if (!req.user.roles.includes('admin')) return res.status(401).json({ messages: ['Unauthorised action.'] });

  try {
    const old = await db.Post.findById(req.params.id);
    const post = await db.Post.findByIdAndUpdate(
      req.params.id,
      { $set: { 'isResolved': !old.isResolved } },
      { new: true }
    );
    if (!post) return res.status(400).json({ messages: ['Invalid post ID.'] });

    res.status(200).json({
      success: true,
      data: post,
      message: post.isResolved ? 'Post resolved!' : 'Post re-opened!'
    });
  } catch (err) {
    res.status(500).json({ messages: ['Database error.'] });
  }
};

postController.pin = async (req, res) => {
  req.check('id', 'Post ID cannot be blank.').notEmpty();

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  // Validate user permissions.
  if (!req.user.roles.includes('admin')) return res.status(401).json({ messages: ['Unauthorised action.'] });

  try {
    const old = await db.Post.findById(req.params.id);
    const post = await db.Post.findByIdAndUpdate(
      req.params.id,
      { $set: { 'isPinned': !old.isPinned } },
      { new: true }
    );
    if (!post) return res.status(400).json({ messages: ['Invalid post ID.'] });

    res.status(200).json({
      success: true,
      data: post,
      message: post.isPinned ? 'Post pinned!' : 'Post unpinned!'
    });
  } catch (err) {
    //console.log('Error: ', err);
    res.status(500).json({ messages: ['Database error.'] });
  }
};

const capitaliseWord = word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();

const sendEmail = async (user, title, postId) => {
  const transporter = nodemailer.createTransport({
    service: 'Sendgrid',
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD
    }
  });
  const mailOptions = {
    from: 'no-reply@awarewolf.com',
    to: user.email,
    subject: `New Suggestion: ${title}`,
    text:
      `Hi ${capitaliseWord(user.username)},\n\n`
      + `A new suggestion has been posted to Awarewolf\n\n`
      + `You can view it here: https://awarewolf.netlify.com/posts/${postId}`
  };
  await transporter.sendMail(mailOptions);
};

export default postController;