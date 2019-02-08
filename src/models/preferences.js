import mongoose from 'mongoose';

const { Schema } = mongoose;

const preferencesSchema = Schema({
  _user: { type: Schema.ObjectId, ref: 'User', required: true },
  metrics: {
    gaOrganic: [{ type: String, trim: true }],
    gaSocial: [{ type: String, trim: true }],
    gaPaid: [{ type: String, trim: true }],
    fbAds: [{ type: String, trim: true }],
    googleAds: [{ type: String, trim: true }]
  }
});

export default mongoose.model('Preferences', preferencesSchema);
