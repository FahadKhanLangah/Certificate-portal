import forge from 'node-forge';

export const generateCSR = async (commonName) => {
  return new Promise((resolve, reject) => {
    try {
      const keys = forge.pki.rsa.generateKeyPair(2048);

      const csr = forge.pki.createCertificationRequest();
      csr.publicKey = keys.publicKey;
      csr.setSubject([
        {
          name: 'commonName',
          value: commonName,
        },
      ]);

      csr.sign(keys.privateKey);

      const pemCsr = forge.pki.certificationRequestToPem(csr);
      const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

      resolve({ pemCsr, pemKey });
    } catch (err) {
      reject(err);
    }
  });
};
