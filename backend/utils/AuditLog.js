import Audit from '../models/Audit.js';

const AddAuditLogs = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
      const userAgent = req.get('User-Agent');
      const method = req.method;
      const path = req.originalUrl;

      await Audit.create({
        action,
        ip_address: ip === '::1' ? '127.0.0.1' : ip,
        user: userId,
        user_agent: userAgent,
        method,
        path,
      });

      next();
    } catch (err) {
      console.error('Audit log error:', err.message);
      next();
    }
  };
};

export default AddAuditLogs;
