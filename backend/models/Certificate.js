import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  commonName: String,
  csr: String,
  issueDate: { type: Date, default: Date.now },
  expDate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'issued' },
});

export default mongoose.model('Certificate', certificateSchema);
