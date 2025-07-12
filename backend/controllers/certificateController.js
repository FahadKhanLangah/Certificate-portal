import Certificate from '../models/Certificate.js';
import { issueCertificateFromCSR } from '../utils/stepCommands.js';
import path from 'path';
import fs from 'fs';
import AddAuditLogs from '../utils/AuditLog.js';
import { sendEmail } from '../utils/email.js';
import { issuedTemplate, renewedTemplate, revokedTemplate } from '../utils/emailTemplates.js';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export const submitCSR = async (req, res) => {
  try {
    const { csrContent, commonName } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'No user found, please login first' });
    }

    if (!csrContent || !commonName) {
      return res.status(400).json({ message: 'Common Name and CSR content are required' });
    }

    //Save CSR temporarily to disk
    const id = uuidv4();
    const tmpDir = path.join('tmp');
    const csrPath = path.join(tmpDir, `${id}.csr`);
    const certPath = path.join(tmpDir, `${id}.crt`);

    // Looking for if temporary folder exists if does not exist it will create a new one
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    fs.writeFileSync(csrPath, csrContent);

    // Run step CLI to sign the CSR by provisioner
    // This is provisioner password file location C:\step-ca\provisioner-password.txt
    const passwordFile = 'C:/step-ca/provisioner-password.txt'; // Here you can gave your own path
    const command = `step ca sign "${csrPath}" "${certPath}" --not-after=24h --password-file "${passwordFile}"`;

    exec(command, async (err, stdout, stderr) => {
      if (err) {
        console.error('Step CA Sign Error:', stderr);
        return res.status(500).json({ message: 'CSR signing failed', error: stderr });
      }

      // Read the signed certificate
      const signedCert = fs.readFileSync(certPath, 'utf-8');
      // Store certificate metadata in MongoDB
      const newCert = new Certificate({
        commonName,
        csr: csrContent,
        expDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        user: req.user.id,
        status: 'issued',
        certificate: signedCert,
      });
      await newCert.save();

      // Email notification
      // await sendEmail({
      //   to: req.user.email,
      //   subject: 'Certificate Issued ✔',
      //   html: issuedTemplate(req.user.name, commonName),
      // });

      // Clean up temp files
      fs.unlinkSync(csrPath);
      fs.unlinkSync(certPath);
      return res.status(201).json({
        success: true,
        message: 'Certificate issued successfully',
        certificate: signedCert,
      });
    });
  } catch (error) {
    console.error('submitCSR error:', error);
    res.status(500).json({ message: 'Certificate issuance failed', error: error.message });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert || cert.status === 'revoked') {
      return res.status(400).json({ message: 'Invalid certificate' });
    }

    if (!cert.certificate) {
      return res.status(404).json({ message: 'Certificate not available for download' });
    }

    const fileName = `${cert.commonName}.crt`;
    const dirPath = path.join(process.cwd(), 'tmp');
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
    fs.writeFileSync(filePath, cert.certificate);

    return res.download(filePath, fileName, () => {
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: 'Download failed', error: err.message });
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
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Welcome to Certificate Panel',
    //   html: renewedTemplate(user.name, cert.commonName)
    // });

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
    // const passwordFile = 'C:/step-ca/provisioner-password.txt';
    // const cmd = `step ca revoke --serial ${cert.serialNumber} --ca-url https://localhost:9000 --root "${process.env.HOME || process.env.USERPROFILE}\\.step\\certs\\root_ca.crt" --password-file ${passwordFile}`;

    // exec(cmd, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`Revoke error: ${stderr}`);
    //     return res.status(500).json({ message: 'Step CA revoke failed', error: stderr });
    //   }
    // })
    cert.status = 'revoked';
    await cert.save();

    // await sendEmail({
    //   to: user.email,
    //   subject: 'Welcome to Certificate Panel',
    //   html: revokedTemplate(user.name, cert.commonName)
    // });
    return res.json({
      success: true, message: 'Certificate revoked successfully'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Revoke failed', error: err.message });
  }
};






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
