import Certificate from '../models/Certificate.js';
import { issueCertificateFromCSR } from '../utils/stepCommands.js';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import AddAuditLogs from '../utils/AuditLog.js';
import { sendEmail } from '../utils/email.js';
import { issuedTemplate, renewedTemplate, revokedTemplate } from '../utils/emailTemplates.js';
//8d235be2ab09d3dc96426a569443cb92b6fa6756c89619efb4bf3e2f9a921d3d
export const requestCertificate = async (req, res) => {
  try {
    const { commonName } = req.body;

    // if (!commonName) {
    //   return res.status(400).json({ message: 'Common name is required' });
    // }

    // ✅ Use absolute path to the external step-ca directory
    // const stepCaBase = path.join(process.cwd(), '..', 'step-ca'); // outside backend/
    // const certsDir = path.join(stepCaBase, 'certs');

    // const crtFile = path.join(certsDir, `${commonName}.crt`);
    // const keyFile = path.join(certsDir, `${commonName}.key`);
    // const passwordFile = path.join(stepCaBase, 'password.txt');
    // const rootCert = path.join(certsDir, 'root_ca.crt');
    // const caURL = 'https://localhost:9000';

    // const args = [
    //   'certificate', 'create',
    //   commonName,
    //   crtFile,
    //   keyFile,
    //   '--provisioner', 'fahadkhanavoid@gmail.com',
    //   '--password-file', passwordFile,
    //   '--ca', caURL,
    //   '--root', rootCert,
    //   '--insecure',
    // ];

    // console.log('Running step command:', args.join(' '));

    // ✅ No shell parsing needed — best practice
    // execFileSync('step', args, {
    //   stdio: 'inherit',
    // });

    // Save to MongoDB
    await Certificate.create({
      commonName,
      user: req.user._id,
      status: 'active',
      certPath: crtFile,
      keyPath: keyFile,
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate issued successfully'
    });
  } catch (err) {
    console.error('Step CA Error:', err.message);
    res.status(500).json({
      message: 'Certificate issuance failed',
      error: err.message,
    });
  }
};

export const submitCSR = async (req, res) => {
  try {
    const { csrContent, commonName } = req.body;
    if (!req.user) {
      return res.status(400).json({ message: 'No user found please login first' });
    }
    if (!csrContent) return res.status(400).json({ message: 'CSR content is required' });

    // const { cert, key } = await issueCertificateFromCSR(commonName, csrContent);

    const newCert = new Certificate({
      commonName,
      csr: csrContent,
      expDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      user: req.user.id
    });

    await newCert.save();
    await sendEmail({
      to: req.user.email,
      subject: 'Welcome to Certificate Panel',
      html: issuedTemplate(req.user.name, commonName)
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate issued',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Certificate issuance failed', error: error.message });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const filter = role === 'user' ? { user: _id } : {};
    const certs = await Certificate.find(filter).populate('user', 'name email');
    AddAuditLogs({ action: "Getting Certificates" })
    return res.json(certs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load certificates' });
  }
};

export const renewCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate({
      path: 'user',
      select: 'name email'
    });
    const user = cert.user;
    if (!cert) return res.status(400).json({ message: 'Invalid certificate' });

    // This is a simulation; you may run step CLI inside backend here
    cert.status = 'renewed';
    cert.expDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      await cert.save();
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Certificate Panel',
      html: renewedTemplate(user.name, cert.commonName)
    });

    res.json({ message: 'Certificate renewed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Renewal failed', error: err.message });
  }
};

export const revokeCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate({
      path: 'user',
      select: 'name email'
    });
    const user = cert.user;
    if (!cert || cert.status === 'revoked') return res.status(400).json({ message: 'Invalid certificate' });

    cert.status = 'revoked';
    await cert.save();

    // Optionally call step CLI:
    // child_process.exec(`step ca revoke ${cert.serialNumber}`, { env: { ...process.env } })
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Certificate Panel',
      html: revokedTemplate(user.name, cert.commonName)
    });
    return res.json({
      success: true, message: 'Certificate revoked successfully'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Revoke failed', error: err.message });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert || cert.status === 'revoked') return res.status(400).json({ message: 'Invalid certificate' });

    const filePath = path.join(process.cwd(), 'step-ca', 'certs', `${cert.commonName}.crt`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Certificate file not found' });

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: 'Download failed', error: err.message });
  }
};

