import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AddAuditLogs from '../utils/AuditLog.js';
import { sendEmail } from '../utils/email.js';
import { loginTemplate, welcomeTemplate } from '../utils/emailTemplates.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    const token = generateToken(user);
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Certificate Panel',
      html: welcomeTemplate(user.name)
    });
    res
      .cookie('token', token, { httpOnly: true })
      .status(201)
      .json({ message: 'User registered', user: { name, email, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    AddAuditLogs("User Logged In")
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Certificate Panel',
      html: loginTemplate(user.name)
    });

    return res
      .cookie('token', token, { httpOnly: true })
      .json({ message: 'Login successful', user: { name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
};

export const getProfile = (req, res) => {
  res.json({ user: req.user });
};
