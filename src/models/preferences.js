import mongoose from 'mongoose';

const preferencesSchema = mongoose.Schema({
  _user: { type: Schema.ObjectId, ref: 'User', required: true },
  metrics: [{ type: String, trim: true }],
  services: [{ type: String, trim: true }]
});

export default mongoose.model('Preferences', preferencesSchema);