export const welcomeTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color:#0b5394;">Welcome, ${name}!</h2>
    <p>Thanks for registering at our Certificate Management System.</p>
    <p>We're excited to have you on board. 🎉</p>
  </div>
`;

export const loginTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h3 style="color:#1c4587;">Hello ${name},</h3>
    <p>You have successfully logged in to your certificate panel.</p>
  </div>
`;

export const issuedTemplate = (name, commonName) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color:#38761d;">Certificate Issued</h2>
    <p>Hi ${name},</p>
    <p>Your certificate for <strong>${commonName}</strong> has been issued successfully.</p>
  </div>
`;

export const revokedTemplate = (name, commonName) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color:#cc0000;">Certificate Revoked</h2>
    <p>Hi ${name},</p>
    <p>Your certificate for <strong>${commonName}</strong> has been revoked due to security reasons or manual action.</p>
  </div>
`;

export const renewedTemplate = (name, commonName) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color:#1155cc;">Certificate Renewed</h2>
    <p>Hi ${name},</p>
    <p>Your certificate for <strong>${commonName}</strong> has been successfully renewed.</p>
  </div>
`;

export const expiryReminderTemplate = (name, commonName, daysLeft, expiryDate) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
    <h2 style="color: #e69138;">⚠️ Certificate Expiry Reminder</h2>
    <p>Dear ${name},</p>
    <p>Your certificate for <strong>${commonName}</strong> will expire in <strong>${daysLeft}</strong> days on <strong>${expiryDate}</strong>.</p>
    <p>Please renew it soon to avoid disruption.</p>
    <p style="color: #999;">This is an automated message from the Certificate Management System.</p>
  </div>
`;
