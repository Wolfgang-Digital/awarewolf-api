import mongoose from 'mongoose';

const { Schema } = mongoose;

const clientSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  gaAccount: { type: String, required: true, trim: true },
  gaViewName: { type: String, required: true, trim: true },
  gaViewNumber: { type: Number, required: true },
  password: {
    type: String,
    trim: true,
    minLength: [8, 'Password must be at least 8 characters long.']
  },
  services: [{ type: String, trim: true }],
  _leads: [{ type: Schema.ObjectId, ref: 'User', required: true }],
  _team: [{ type: Schema.ObjectId, ref: 'User', required: true }],
  fbAdsName: [{ type: String, trim: true }],
  fbAdsId: { type: String, trim: true },
  googleAdsName: { type: String, trim: true },
  googleAdsNumber: { type: Number, required: true }
});

export default mongoose.model('Client', clientSchema);