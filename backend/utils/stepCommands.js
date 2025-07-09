import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export const issueCertificateFromCSR = async (commonName, csrContent) => {
  const tempDir = './temp';
  const csrPath = path.join(tempDir, `${commonName}.csr`);
  const crtPath = path.join(tempDir, `${commonName}.crt`);
  const keyPath = path.join(tempDir, `${commonName}.key`);

  await writeFile(csrPath, csrContent);

  const cmd = `docker exec step-ca step ca sign ${csrPath} ${crtPath} --not-after=8760h --provisioner fahadkhanavoid@gmail.com --password-file /home/step/password.txt`;

  return new Promise((resolve, reject) => {
    exec(cmd, async (err, stdout, stderr) => {
      if (err) return reject(stderr);

      const cert = await readFile(crtPath, 'utf8');
      const key = await readFile(keyPath, 'utf8').catch(() => '');

      // Cleanup
      await unlink(csrPath).catch(() => {});
      await unlink(crtPath).catch(() => {});
      await unlink(keyPath).catch(() => {});

      resolve({ cert, key });
    });
  });
};
