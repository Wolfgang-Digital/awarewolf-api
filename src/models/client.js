import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const clientSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  domain: { type: String, required: true, trim: true },
  gaAccount: { type: String, required: true, trim: true },
  gaViewName: { type: String, required: true, trim: true },
  gaViewNum: { type: Number, required: true },
  password: {
    type: String,
    trim: true,
    minLength: [8, 'Password must be at least 8 characters long.']
  },
  kpis: [{ type: String, trim: true }],
  services: [{ type: String, trim: true }],
  lead: [{  type: String, required: true, trim: true }],
  team: [{ type: String, required: true, trim: true }],
  pageSpeedSheetId: { type: String, trim: true },
  budgets: {
    seo: { type: Number },
    social: { type: Number }
  }
});

export default mongoose.model('Client', clientSchema);