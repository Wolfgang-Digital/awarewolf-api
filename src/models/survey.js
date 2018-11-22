import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const surveySchema = new Schema({
  _author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [6, 'Title must be at least 6 characters long.']
  },
  description: { type: String, trim: true },
  isResolved: { type: Boolean, default: false },
  questions: [{
    id: { type: String, required: true },
    type: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    options: [{ type: Schema.Types.Mixed }],
    allowMultipleAnswers: { type: Boolean, default: false },
    isRequired: { type: Boolean, default: false },
    scale: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 5 },
      minLabel: { type: String },
      maxLabel: { type: String }
    }
  }],
  userResponses: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  answers: [{ type: Schema.Types.Mixed }]
}, { timestamps: true });

function populate(next) {
  this.populate({
    path: '_author',
    select: 'username _id avatar'
  });
  next();
}

surveySchema.pre('find', populate)
            .pre('findOne', populate)
            .pre('findOneAndUpdate', populate);

export default mongoose.model('Survey', surveySchema);