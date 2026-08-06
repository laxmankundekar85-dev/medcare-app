require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Initialize Firebase Admin SDK (Supports both Environment Variables & Local File)
let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  };
} else {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.error('⚠️ Could not find serviceAccountKey.json. Make sure environment variables or key file exist.');
  }
}

if (serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

// Explicit Port 465 SSL Transporter Setup
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

app.get('/', (req, res) => {
  res.send('Medcare Backend API is running...');
});

// ==========================================
// 1. ROUTE: SEND OTP
// ==========================================
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  // Step A: Check Firebase User
  let user;
  try {
    user = await getAuth().getUserByEmail(email);
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
// 2. ROUTE: VERIFY OTP & RESET PASSWORD
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});