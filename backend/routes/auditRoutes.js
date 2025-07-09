import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth.js';
import { getAuditLogs } from '../controllers/auditController.js';

const router = express.Router();

router.get('/', isAuthenticated, authorizeRoles('admin'), getAuditLogs);

export default router;
