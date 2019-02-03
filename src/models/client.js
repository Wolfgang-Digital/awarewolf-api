import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const clientSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  domain: { type: String, trim: true },
  gaAccount: { type: String, required: true, trim: true },
  gaViewName: { type: String, required: true, trim: true },
  gaViewNum: { type: Number, required: true },
  password: {
    type: String,
    trim: true,
    minLength: [8, 'Password must be at least 8 characters long.']
  },
  kpis: [{
    name: { type: String, trim: true },
    monthlyTarget: { type: Number }
  }],
  services: [{ type: String, trim: true }],
  lead: [{  type: String, required: true, trim: true }],
  team: [{ type: String, required: true, trim: true }],
  pagespeedSheetId: { type: String, trim: true },
  facebookId: { type: String, trim: true },
  awAccountName: { type: String, trim: true },
  awViewNum: { type: Number, required: true }
});

export default mongoose.model('Client_Old', clientSchema);