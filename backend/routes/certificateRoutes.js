import express from 'express';
import { submitCSR, getCertificates, revokeCertificate, renewCertificate, downloadCertificate, requestCertificate } from '../controllers/certificateController.js';
import { authorizeRoles, isAuthenticated } from '../middleware/auth.js';
import AddAuditLogs from '../utils/AuditLog.js';

const router = express.Router();

router.post('/submit-csr', isAuthenticated, AddAuditLogs("Submit Certificate Signing Request (CSR)"), submitCSR);
router.get('/', isAuthenticated, getCertificates);
router.put('/revoke/:id', isAuthenticated, AddAuditLogs("Revoked Certificate"), revokeCertificate);
router.put('/renew/:id', isAuthenticated, AddAuditLogs("Renew Certificate"), renewCertificate);
router.get('/download/:id', isAuthenticated,AddAuditLogs("Downloaded Certificate"), downloadCertificate);
router.post('/request', isAuthenticated, requestCertificate);


export default router;
