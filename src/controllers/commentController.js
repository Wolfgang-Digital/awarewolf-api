import db from '../models';

const commentController = {};

commentController.findByPostId = async (req, res) => {
  req.check('id', 'No post ID.').notEmpty();

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    // Get root comments from post ID.
    const comments = await db.Comment.find({ _parent: req.params.id });
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (err) {
    console.log('Error: ', err);
    res.status(500).json({ messages: ['Database error.'] });
  }
};

commentController.create = async (req, res) => {
  req.check('rootPostId', 'No root post ID.').notEmpty();
  req.check('parentId', 'No parent ID.').notEmpty();
  req.check('text', 'Text must be at least 2 characters.').len(2);

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { rootPostId, parentId, text } = req.body;

  try {
    const post = await db.Post.findById(rootPostId);
    if (!post) return res.status(400).json({ messages: ['Invalid post ID.'] });

    if (post.isDeleted) return res.status(400).json({ messages: ['This post has been deleted.'] });

    if (post.isResolved) return res.status(400).json({ messages: ['This post has been resolved.'] });

    // Compare root post and parent IDs to see if this is a root comment.
    // If not, get the parent comment.
    const parent = rootPostId !== parentId ? await db.Comment.findById(parentId) : post;

    if (!parent || parent.isDeleted) return res.status(400).json({ messages: ['Error locating parent. It may have been deleted'] })

    const comment = new db.Comment({
      _author: req.user._id,
      _rootPost: post._id,
      _parent: parent._id,
      text
    });
    await comment.save();

    await parent.update({ $push: { '_comments': comment._id } });
    const updatedPost = await db.Post.findById(post._id);

    res.status(200).json({
      success: true,
      data: updatedPost
    });

  } catch (err) {
    console.log('Error: ', err);
    res.status(500).json({ messages: ['Database error.'] });
  }
};

// Vote on a comment.
// Limited to 1 voter per user.
// Votes are either +1 or -1.
commentController.vote = async (req, res) => {
  req.check('id', 'Comment ID cannot be blank.').notEmpty();
  req.check('value', 'Value cannot be blank.').notEmpty();
  req.check('value', 'Value must be 1 or -1.').isIn([1, -1]);

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  const { value } = req.body;

  try {
    let comment = await db.Comment.findById(req.params.id);
    if (!comment) return res.status(400).json({ messages: ['Invalid comment ID.'] });

    if (comment.isDeleted) return res.status(400).json({ messages: ['This comment has been deleted.'] });

    const post = await db.Post.findById(comment._rootPost);
    if (post.isResolved) return res.status(400).json({ messages: ['This post has been resolved.'] });

    if (post.isDeleted) return res.status(400).json({ messages: ['This post has been deleted.'] });

    let vote = await db.Vote.findOne({ _user: req.user._id, _parent: req.params.id });

    if (!vote) {
      // No vote yet so add a new one.
      vote = new db.Vote({ _user: req.user._id, _parent: req.params.id, value });
      await vote.save();
      await comment.update({ $push: { '_votes': vote._id } });

    } else if (vote.value === value) {
      // Same vote value so remove.
      await comment.update({ $pull: { '_votes': vote._id } });
      await db.Vote.findByIdAndRemove(vote._id);

    } else {
      // Different vote value so update.
      await vote.update({ $set: { 'value': value } });

    }
    const updatedPost = await db.Post.findById(comment._rootPost);
    return res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (err) {
    console.log('Error: ', err);
    res.status(500).json({ messages: ['Database error.'] });
  }
};

export default commentController;
