import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const postSchema = new Schema({
  _author: { type: Schema.ObjectId, ref: 'User', required: true },
  title: { 
    type: String, 
    required: true,
    minlength: [6, 'Title must be at least 6 characters long.'] 
  },
  text: { 
    type: String, 
    required: true,
    minlength: [1, 'Text must be at least 1 character long.'] 
  },
  isDeleted: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  _comments: [{ type: Schema.ObjectId, ref: 'Comment' }],
  _votes: [{ type: Schema.ObjectId, ref: 'Vote' }]
}, { timestamps: true });

function populate(next) {
  this.populate({
    path: '_author',
    select: 'username _id avatar'
  });
  this.populate({
    path: '_comments',
    match: { isDeleted: false }
  });
  this.populate({
    path: '_votes',
    select: '_user value'
  });
  next();
}

postSchema.pre('find', populate)
          .pre('findOne', populate)
          .pre('findOneAndUpdate', populate);

export default mongoose.model('Post', postSchema);