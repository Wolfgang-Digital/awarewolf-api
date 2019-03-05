import mongoose from 'mongoose';

const { Schema } = mongoose;

const preferencesSchema = Schema({
  _user: { type: Schema.ObjectId, ref: 'User', required: true },
  metrics: [
    {
      name: { type: String, trim: true, required: true },
      channel: { type: String, trim: true, required: true },
      source: { type: String, trim: true, required: true },
      network: { type: String }
    }
  ]
});

export default mongoose.model('Preferences', preferencesSchema);
