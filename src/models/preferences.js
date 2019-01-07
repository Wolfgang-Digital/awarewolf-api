import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const preferencesSchema = Schema({
  _user: { type: Schema.ObjectId, ref: 'User', required: true },
  metrics: [{ type: String, trim: true }]
});

export default mongoose.model('Preferences', preferencesSchema);