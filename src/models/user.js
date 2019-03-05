import mongoose from 'mongoose';
import { hashPassword } from '../utils';

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Username must be at least 1 character long.']
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: [8, 'Password must be at least 8 characters long.']
  },
  email: { type: String, required: true, trim: true, unique: true },
  avatar: { type: String, trim: true },
  roles: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date
});

userSchema.pre('save', function (next) {
  this.password = hashPassword(this.password);
  next();
});

export default mongoose.model('User', userSchema);
