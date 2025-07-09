import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
} from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/auth.js';
import AddAuditLogs from '../utils/AuditLog.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isAuthenticated, AddAuditLogs("User Logout"), logoutUser);
router.get('/me', isAuthenticated, getProfile);

export default router;
