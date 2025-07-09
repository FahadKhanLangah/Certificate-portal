import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    action: String,
    ip_address: String,
    user_agent: String,
    method: String,
    path: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Audit', auditSchema);
