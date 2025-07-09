import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Certificate Authority" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to} - ${info.messageId}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
};
