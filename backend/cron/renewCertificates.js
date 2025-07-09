import cron from 'node-cron';
import Certificate from '../models/Certificate.js';

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const CERT_DIR = 'certs';
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Checking for certificates to renew...');

  try {
    const now = new Date();
    const certs = await Certificate.find({ status: 'issued' });

    for (const cert of certs) {
      const expiry = new Date(cert.expDate);
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3) {
        const oldCertPath = cert.certificatePath;
        const newCertPath = path.join(CERT_DIR, `cert-renewed-${Date.now()}.crt`);

        const renewCmd = `step ca renew ${oldCertPath} ${newCertPath} --force --password-file ./password.txt`;

        exec(renewCmd, async (err, stdout, stderr) => {
          if (err) {
            console.error(`[CRON] Renewal failed for ${oldCertPath}:`, stderr);
            return;
          }

          cert.certificatePath = newCertPath;
          cert.issueDate = new Date();
          cert.expDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // Add 1 year (or parse if needed)
          await cert.save();

          console.log(`[CRON] Renewed certificate: ${oldCertPath}`);
        });
      }
    }
  } catch (err) {
    console.error('[CRON] Error during renewal:', err);
  }
});
