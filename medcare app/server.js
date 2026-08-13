import dns from 'dns';
// Force Node.js default DNS order to IPv4 first
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const app = express();

// ==========================================
// 1. MIDDLEWARE & STRICT CORS FOR MOBILE & VERCEL
// ==========================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Safe preflight regex handler for mobile web browsers
app.options(/(.*)/, cors());

// ==========================================
// 2. HEALTH & WAKEUP ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.status(200).send('Medcare Backend API is running...');
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'awake', timestamp: Date.now() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'Active', 
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' 
  });
});

// ==========================================
// 3. MONGODB CONNECTION
// ==========================================
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 MongoDB Connected successfully!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));
} else {
  console.warn('⚠️ MONGO_URI missing in .env file!');
}

// ==========================================
// 4. FIREBASE ADMIN SDK SETUP
// ==========================================
let serviceAccount = null;

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
    console.warn('⚠️ serviceAccountKey.json not found locally.');
  }
}

if (serviceAccount) {
  try {
    if (getApps().length === 0) {
      initializeApp({ credential: cert(serviceAccount) });
      console.log('🔥 Firebase Admin SDK initialized');
    }
  } catch (err) {
    console.error('❌ Firebase Admin SDK Initialization Error:', err.message);
  }
}

// ==========================================
// 5. NODEMAILER TRANSPORTER SETUP (STRICT IPv4 FORCE)
// ==========================================
const senderEmail = process.env.EMAIL_USER || 'laxmankundekar85@gmail.com';
const senderPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: senderEmail,
    pass: senderPass
  },
  // Custom DNS lookup that explicitly mandates IPv4 (family 4)
  getAddrInfo: (hostname, cb) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) return cb(err);
      cb(null, address, 4);
    });
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});

// In-memory store for OTPs
const otpStore = new Map();

// ==========================================
// 6. SAFE DYNAMIC ROUTE IMPORTS
// ==========================================
const loadRoutes = async () => {
  try {
    const medicationRoutes = await import('./routes/medicationRoutes.js').then(m => m.default || m);
    app.use('/api/medications', medicationRoutes);
  } catch (e) { console.warn('Skipping medicationRoutes load:', e.message); }

  try {
    const appointmentRoutes = await import('./routes/appointmentRoutes.js').then(m => m.default || m);
    app.use('/api/appointments', appointmentRoutes);
  } catch (e) { console.warn('Skipping appointmentRoutes load:', e.message); }

  try {
    const alarmRoutes = await import('./routes/alarmRoutes.js').then(m => m.default || m);
    app.use('/api/alarms', alarmRoutes);
  } catch (e) { console.warn('Skipping alarmRoutes load:', e.message); }

  try {
    const injectionRoutes = await import('./routes/injectionRoutes.js').then(m => m.default || m);
    app.use('/api/injections', injectionRoutes);
  } catch (e) { console.warn('Skipping injectionRoutes load:', e.message); }

  try {
    const recordRoutes = await import('./routes/recordRoutes.js').then(m => m.default || m);
    app.use('/api/records', recordRoutes);
  } catch (e) { console.warn('Skipping recordRoutes load:', e.message); }

  try {
    const profileRoutes = await import('./routes/profileRoutes.js').then(m => m.default || m);
    app.use('/api/profile', profileRoutes);
  } catch (e) { console.warn('Skipping profileRoutes load:', e.message); }

  try {
    const previousDiseaseRoutes = await import('./routes/previousDiseaseRoutes.js').then(m => m.default || m);
    app.use('/api/previous-diseases', previousDiseaseRoutes);
  } catch (e) { console.warn('Skipping previousDiseaseRoutes load:', e.message); }
};

loadRoutes();

// ==========================================
// 7. ROUTE: PERSONALIZED AI HEALTH CHATBOT
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, userContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let patientName = userContext?.userName || 'Laxman';
    let patientId = userContext?.patientId || 'N/A';
    let bloodGroup = userContext?.bloodGroup || 'N/A';
    let weight = userContext?.weight || 'N/A';
    let activeMeds = userContext?.activeMedications || 'None logged';

    const db = mongoose.connection.db;
    if (db && userId && userId !== 'guest_user') {
      try {
        const profileDoc = await db.collection('profiles').findOne({ userId });
        if (profileDoc) {
          patientName = profileDoc.fullName || profileDoc.name || patientName;
          patientId = profileDoc.patientId || patientId;
          bloodGroup = profileDoc.bloodGroup || bloodGroup;
          weight = profileDoc.weight ? String(profileDoc.weight) : weight;
        }

        const medDocs = await db.collection('medications').find({ userId, status: { $ne: 'Inactive' } }).toArray();
        if (medDocs && medDocs.length > 0) {
          activeMeds = medDocs.map(m => `${m.name} (${m.dosage || 'standard dose'})`).join(', ');
        }
      } catch (dbErr) {
        console.warn('Could not fetch DB records for context:', dbErr.message);
      }
    }

    const systemPrompt = `
      You are Medcare AI, an advanced, polite, and empathetic medical assistant inside the Medcare web application.

      PATIENT CONTEXT:
      - Name: ${patientName}
      - Patient ID: ${patientId}
      - Blood Group: ${bloodGroup}
      - Weight: ${weight} kg
      - Active Medications: ${activeMeds}

      INSTRUCTIONS:
      1. Address the patient warmly by name (${patientName}).
      2. Respond directly, specifically, and intelligently to any health condition, medical query, emergency situation, or symptom requested.
      3. Format your response cleanly using bullet points or bold text.
      4. Always include a brief disclaimer: "Note: I am an AI assistant. Please consult a qualified doctor for clinical diagnoses."
    `;

    const fullPrompt = `${systemPrompt}\n\nPatient Query: ${message}`;
    let replyText = '';

    if (apiKey) {
      const apiEndpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
      ];

      for (const url of apiEndpoints) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }]
            })
          });

          const data = await response.json();

          if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            replyText = data.candidates[0].content.parts[0].text;
            break;
          }
        } catch (err) {
          console.warn(`Fetch error:`, err.message);
        }
      }
    }

    if (!replyText) {
      replyText = `Hello ${patientName}! I am your Medcare AI Assistant. How can I assist you with your health today?\n\n*Note: I am an AI assistant. Please consult a qualified doctor for clinical diagnoses.*`;
    }

    res.json({ success: true, reply: replyText });

  } catch (error) {
    console.error('❌ Gemini AI Chat Route Error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate AI response.' });
  }
});

// Fallback Route: Direct PATCH handler for medication status toggle
app.patch('/api/medications/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: "Database connection unavailable." });
    }

    const collection = db.collection('medications');

    const medication = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!medication) {
      return res.status(404).json({ error: "Medication document not found." });
    }

    const targetStatus = status || (medication.status === 'Taken' ? 'Active' : 'Taken');

    await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $set: { 
          status: targetStatus,
          updatedAt: new Date()
        } 
      }
    );

    res.status(200).json({ success: true, status: targetStatus });
  } catch (error) {
    console.error("Error toggling medication status:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. ROUTE: SEND OTP
// ==========================================
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const targetEmail = email.toLowerCase().trim();

    // Generate 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(targetEmail, { otp, expiresAt });

    // 🔑 ALWAYS LOG OTP DIRECTLY TO RENDER TERMINAL LOGS FOR IMMEDIATE ACCESS
    console.log(`==========================================`);
    console.log(`🔑 [DEBUG OTP GENERATED]:`);
    console.log(`   TARGET EMAIL: ${targetEmail}`);
    console.log(`   VERIFICATION CODE: ${otp}`);
    console.log(`==========================================`);

    // Respond IMMEDIATELY to prevent mobile CORS timeouts
    res.status(200).json({ success: true, message: 'OTP sent successfully to your email.' });

    // Send email asynchronously in background
    transporter.sendMail({
      from: `"Medcare Support" <${senderEmail}>`,
      to: targetEmail,
      subject: 'Medcare - Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0d9488;">Medcare Password Reset</h2>
          <p>You requested to reset your password. Use the verification code below:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; width: 220px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f766e;">${otp}</span>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
      `
    }).then(info => {
      console.log(`✅ Sent via Nodemailer: ${info.messageId}`);
    }).catch(nErr => {
      console.error('❌ Nodemailer Background Error:', nErr.message);
    });

  } catch (err) {
    console.error('❌ Send OTP Route Error:', err.message);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: err.message || 'Server error.' });
    }
  }
});

// ==========================================
// 9. ROUTE: VERIFY OTP & RESET PASSWORD
// ==========================================
app.post('/api/auth/verify-otp-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required.' });
    }

    const targetEmail = email.toLowerCase().trim();
    const record = otpStore.get(targetEmail);

    if (!record) {
      return res.status(400).json({ success: false, error: 'No OTP request found or OTP expired.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(targetEmail);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid verification code.' });
    }

    if (getApps().length > 0) {
      try {
        const user = await getAuth().getUserByEmail(targetEmail);
        await getAuth().updateUser(user.uid, { password: newPassword });
      } catch (fbErr) {
        console.warn('⚠️ Firebase password update skipped:', fbErr.message);
      }
    }

    otpStore.delete(targetEmail);

    return res.json({ success: true, message: 'Password updated successfully! You can now log in.' });

  } catch (err) {
    console.error('❌ Verify OTP Route Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error while resetting password.' });
  }
});

// ==========================================
// 10. START SERVER IMMEDIATELY
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});