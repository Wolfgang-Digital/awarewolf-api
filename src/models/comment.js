import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    _author: { type: Schema.ObjectId, ref: 'User', required: true },
    _rootPost: { type: Schema.ObjectId, ref: 'Post', required: true },
    _parent: { type: Schema.ObjectId, required: true },
    text: { 
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Comments must be at least 2 characters long.']
    },
    _votes: [{ type: Schema.ObjectId, ref: 'Vote' }],
    _comments: [{ type: Schema.ObjectId, ref: 'Comment' }],
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

function populateAuthor(next) {
  this.populate({
      path: '_author',
      select: 'username _id avatar'
  });
  this.populate({
    path: '_votes',
    select: '_user value'
  });
  this.populate({
    path: '_comments',
    match: { isDeleted: false }
  });
  next();
}

commentSchema.pre('find', populateAuthor)
             .pre('findOne', populateAuthor)
             .pre('findOneAndUpdate', populateAuthor);

export default mongoose.model('Comment', commentSchema);