import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

// ==========================================
// ROUTE IMPORTS
// ==========================================
import medicationRoutes from './routes/medicationRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import injectionRoutes from './routes/injectionRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import previousDiseaseRoutes from './routes/previousDiseaseRoutes.js';

// Enables JSON file imports in ES Module environment
const require = createRequire(import.meta.url);

const app = express();

// ==========================================
// 1. MIDDLEWARE (Updated with 50mb limit for large PDF/image uploads)
// ==========================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================
// 2. MONGODB CONNECTION
// ==========================================
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 MongoDB Connected successfully!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));
} else {
  console.warn('⚠️ MONGO_URI missing in .env file!');
}

// ==========================================
// 3. FIREBASE ADMIN SDK SETUP
// ==========================================
let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  };
} else {
  try {
    // Safely attempt local fallback without crashing on cloud deployments
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.warn('⚠️ serviceAccountKey.json not found locally. Relying on environment variables.');
  }
}

if (serviceAccount) {
  try {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('🔥 Firebase Admin SDK initialized');
  } catch (err) {
    console.error('❌ Firebase Admin SDK Initialization Error:', err.message);
  }
} else {
  console.warn('⚠️ Firebase Admin SDK skipped: No credentials found.');
}

// ==========================================
// 4. NODEMAILER TRANSPORTER (Port 465 SSL)
// ==========================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER || 'laxmankundekar85@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Prevents local SSL certificate blocking
  }
});

// In-memory store for OTPs
const otpStore = new Map();

// ==========================================
// 5. HEALTH CHECK ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.send('Medcare Backend API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Active', 
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' 
  });
});

// ==========================================
// 6. API FEATURE ROUTES
// ==========================================
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/injections', injectionRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/previous-diseases', previousDiseaseRoutes);

// Fallback Route: Direct PATCH handler for medication status toggle if needed
app.patch('/api/medications/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: "Database connection unavailable." });
    }

    const collection = db.collection('medications');

    // Find current document
    const medication = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!medication) {
      return res.status(404).json({ error: "Medication document not found." });
    }

    // Determine target status
    const targetStatus = status || (medication.status === 'Taken' ? 'Active' : 'Taken');

    // Update document in MongoDB
    await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $set: { 
          status: targetStatus,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`💊 Medication (${id}) status updated to: ${targetStatus}`);
    res.status(200).json({ success: true, status: targetStatus });
  } catch (error) {
    console.error("Error toggling medication status:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. ROUTE: SEND OTP
// ==========================================
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  // Step A: Check Firebase User
  try {
    await getAuth().getUserByEmail(email);
  } catch (firebaseErr) {
    console.error('🔥 Firebase Admin Error:', firebaseErr.message);
    if (firebaseErr.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }
    return res.status(500).json({ error: `Firebase error: ${firebaseErr.message}` });
  }

  // Step B: Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, { otp, expiresAt });

  // Step C: Send Email
  try {
    await transporter.sendMail({
      from: `"Medcare Support" <${process.env.EMAIL_USER || 'laxmankundekar85@gmail.com'}>`,
      to: email,
      subject: 'Medcare - Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0d9488;">Medcare Password Reset</h2>
          <p>You requested to reset your password. Use the verification code below:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; width: 200px; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0f766e;">${otp}</span>
          </div>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
        </div>
      `
    });

    console.log(`✅ OTP successfully sent to ${email}`);
    return res.json({ success: true, message: 'OTP sent successfully to your email.' });

  } catch (emailErr) {
    console.error('📧 Nodemailer Error:', emailErr);
    return res.status(500).json({ error: `Email delivery failed: ${emailErr.message}` });
  }
});

// ==========================================
// 8. ROUTE: VERIFY OTP & RESET PASSWORD
// ==========================================
app.post('/api/auth/verify-otp-reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
  }

  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ error: 'No OTP request found or OTP expired.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  try {
    const user = await getAuth().getUserByEmail(email);
    await getAuth().updateUser(user.uid, { password: newPassword });

    otpStore.delete(email);

    console.log(`🔒 Password updated successfully for ${email}`);
    res.json({ success: true, message: 'Password updated successfully! You can now log in.' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: error.message || 'Failed to update password.' });
  }
});

// ==========================================
// 9. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});