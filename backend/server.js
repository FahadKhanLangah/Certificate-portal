import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import certificateRoutes from './routes/certificateRoutes.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import './cron/renewCertificates.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', true);
app.use(cors(
  ({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
));
app.use(cookieParser());
app.use(express.json());

// connect to MongoDB
connectDB();
app.use('/api/certificates', certificateRoutes);
app.use('/api/audits',auditRoutes);
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
