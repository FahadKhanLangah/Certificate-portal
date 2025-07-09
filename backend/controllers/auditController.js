import Audit from '../models/Audit.js';

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.find().sort({ createdAt: -1 }).populate('user', 'email');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};
