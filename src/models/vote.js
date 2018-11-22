import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const voteSchema = new Schema({
    _user: { type: Schema.ObjectId, ref: 'User', required: true },
    _parent: { type: Schema.ObjectId, required: true },
    value: { type: Number, required: true }
});

export default mongoose.model('Vote', voteSchema);
