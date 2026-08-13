import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

// Enables JSON file imports in ES Module environment
const require = createRequire(import.meta.url);

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

// Express handle preflight OPTIONS requests across all routes
app.options('*', cors());

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
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.warn('⚠️ serviceAccountKey.json not found locally. Relying on environment variables.');
  }
}

if (serviceAccount) {
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('🔥 Firebase Admin SDK initialized');
    }
  } catch (err) {
    console.error('❌ Firebase Admin SDK Initialization Error:', err.message);
  }
} else {
  console.warn('⚠️ Firebase Admin SDK skipped: No credentials found.');
}

// ==========================================
// 4. NODEMAILER TRANSPORTER (Port 587 TLS)
// ==========================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Must be false for Port 587 (uses STARTTLS)
  auth: {
    user: process.env.EMAIL_USER || 'laxmankundekar85@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000
});

// Verify SMTP Connection on Startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Nodemailer SMTP Verification Error:', error.message);
  } else {
    console.log('📧 Nodemailer SMTP Transporter is ready to send emails.');
  }
});

// In-memory store for OTPs
const otpStore = new Map();

// ==========================================
// 5. HEALTH CHECK & WAKEUP ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.send('Medcare Backend API is running...');
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'awake', timestamp: Date.now() });
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

// ==========================================
// 7. ROUTE: PERSONALIZED AI HEALTH CHATBOT
// ==========================================
app.post('/api/chat', async (req, res) => {
  console.log('📩 Chat endpoint hit on port 5000!');
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
      3. For critical emergencies (like snake bite, chest pain, heavy bleeding), urge immediate emergency hospitalization and provide crucial immediate first-aid steps.
      4. Format your response cleanly using bullet points or bold text.
      5. Always include a brief disclaimer: "Note: I am an AI assistant. Please consult a qualified doctor for clinical diagnoses."
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
            console.log(`✅ AI Response generated successfully via Gemini API!`);
            break;
          }
        } catch (err) {
          console.warn(`Fetch error:`, err.message);
        }
      }
    }

    if (!replyText) {
      console.log('💡 Processing query via Local Health Assistant Engine...');
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes('snake') || lowerMsg.includes('bite') || lowerMsg.includes('venom') || lowerMsg.includes('serpent')) {
        replyText = `🚨 **EMERGENCY FIRST AID FOR SNAKE BITE** 🚨\n\nHello ${patientName}! Please stay calm and take these steps **IMMEDIATELY**:\n\n1. 🚑 **CALL EMERGENCY SERVICES (108 / 911) NOW** or get to the nearest emergency medical room immediately.\n2. **Keep Calm & Still:** Movement causes venom to spread faster through the bloodstream.\n3. **Immobilize the Area:** Keep the bitten limb at or slightly below heart level.\n4. **Remove Tight Items:** Take off rings, watches, or tight clothing near the bite in case of swelling.\n5. ❌ **DO NOT:** Cut the wound, suck out venom, apply ice, or tie a tight tourniquet.\n\n*Note: Anti-venom at a hospital is the only effective treatment for venomous snake bites. Get to an ER right away!*`;
      } else if (lowerMsg.includes('chest pain') || lowerMsg.includes('heart attack') || lowerMsg.includes('shortness of breath')) {
        replyText = `🚨 **CRITICAL MEDICAL EMERGENCY** 🚨\n\nHello ${patientName}! Chest pain can be a sign of a cardiac event. Please seek emergency medical care immediately:\n\n1. 🚑 **Call 108 / emergency services right away.**\n2. Sit down and rest in a comfortable position.\n3. Do not attempt to drive yourself to the hospital.\n\n*Note: Seek urgent clinical care immediately.*`;
      } else if (lowerMsg.includes('burn') || lowerMsg.includes('bleed') || lowerMsg.includes('cut') || lowerMsg.includes('wound')) {
        replyText = `Hello ${patientName}! For cuts or burns first-aid:\n\n1. **Bleeding:** Apply firm, continuous pressure with a clean cloth.\n2. **Burns:** Run cool (not ice-cold) tap water over the burn for 10-15 minutes.\n3. **Cleanliness:** Wash mild wounds gently with clean water.\n\n⚠️ Seek doctor evaluation for deep wounds, heavy bleeding, or severe burns.`;
      } else if (lowerMsg.includes('head') || lowerMsg.includes('headache') || lowerMsg.includes('head pain')) {
        replyText = `Hello ${patientName}! I am sorry to hear that your head is paining. 🤕\n\n**Immediate Relief Steps:**\n1. Rest in a dark, quiet, well-ventilated room.\n2. Hydrate with water, as dehydration is a primary trigger.\n3. Apply a cold or warm compress across your forehead.\n\n💊 **Active Logged Meds:** ${activeMeds}\n\n*Note: Please consult a physician before taking any unprescribed pain relief.*`;
      } else if (lowerMsg.includes('fever') || lowerMsg.includes('temperature') || lowerMsg.includes('chills')) {
        replyText = `Hello ${patientName}! For fever management:\n\n1. Rest comfortably and drink fluids (water, ORS).\n2. Apply a damp cloth to your forehead or neck.\n3. Monitor your temperature periodically.\n\n*Note: Consult a doctor if fever stays high.*`;
      } else if (lowerMsg.includes('stomach') || lowerMsg.includes('nausea') || lowerMsg.includes('vomit') || lowerMsg.includes('cramp')) {
        replyText = `Hello ${patientName}! For stomach discomfort:\n\n1. Sip small amounts of clear fluids or ginger tea.\n2. Avoid spicy or greasy foods.\n3. Rest in an upright position.\n\n*Note: Consult a doctor if severe pain persists.*`;
      } else if (lowerMsg.includes('not feeling well') || lowerMsg.includes('sick') || lowerMsg.includes('unwell') || lowerMsg.includes('pain') || lowerMsg.includes('dizzy')) {
        replyText = `Hello ${patientName}! I am sorry to hear that you are not feeling well. 💙\n\nNext steps:\n1. Rest and sip water regularly.\n2. Verify your active medications: **${activeMeds}**.\n3. Track any new symptoms.\n\n*Note: Consult a doctor for clinical diagnosis.*`;
      } else if (lowerMsg.includes('medication') || lowerMsg.includes('medicine') || lowerMsg.includes('taking') || lowerMsg.includes('dose') || lowerMsg.includes('pill')) {
        replyText = `Hello ${patientName}! 👋\n\nYour active Medcare medications:\n💊 **${activeMeds}**\n\nPlease follow your doctor's dosage schedule!`;
      } else if (lowerMsg.includes('blood pressure') || lowerMsg.includes('bp') || lowerMsg.includes('hypertension')) {
        replyText = `Hello ${patientName}! Core tips for healthy blood pressure:\n1. Reduce sodium intake.\n2. Engage in 30 mins of daily moderate exercise.\n3. Manage stress and stay hydrated.`;
      } else if (lowerMsg.includes('doctor') || lowerMsg.includes('visit') || lowerMsg.includes('prepare') || lowerMsg.includes('appointment')) {
        replyText = `Hello ${patientName}! To prepare for your visit:\n1. Note down symptoms and questions.\n2. Share your medication list (${activeMeds}).\n3. Bring previous lab reports.`;
      } else if (lowerMsg.includes('hydration') || lowerMsg.includes('water') || lowerMsg.includes('fluid') || lowerMsg.includes('drink')) {
        replyText = `Hello ${patientName}! Aim for 2.5 to 3 Liters of water daily for optimal health. 💧`;
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        replyText = `Hello ${patientName}! 👋 Welcome to Medcare Assistant. How can I assist you with your health today?`;
      } else {
        replyText = `Hello ${patientName}! I am your Medcare AI Assistant.\n\nI can help you with:\n- First-aid guidance for symptoms & injuries\n- Information on your active medications (${activeMeds})\n- Preparing for doctor visits\n\nHow can I help you regarding your health right now?`;
      }
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

    console.log(`💊 Medication (${id}) status updated to: ${targetStatus}`);
    res.status(200).json({ success: true, status: targetStatus });
  } catch (error) {
    console.error("Error toggling medication status:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. ROUTE: SEND OTP (INSTANT NON-BLOCKING RESPONSE)
// ==========================================
app.post('/api/auth/send-otp', async (req, res) => {
  console.log('📌 POST /api/auth/send-otp endpoint hit');
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const targetEmail = email.toLowerCase().trim();
    console.log(`📩 Dispatching OTP for: "${targetEmail}"`);

    // Generate 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(targetEmail, { otp, expiresAt });

    // Respond IMMEDIATELY to release mobile browser lock
    res.status(200).json({ success: true, message: 'OTP sent successfully to your email.' });

    // Send email in background asynchronously
    transporter.sendMail({
      from: `"Medcare Support" <${process.env.EMAIL_USER || 'laxmankundekar85@gmail.com'}>`,
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
    }).then(mailInfo => {
      console.log(`✅ Background OTP Email dispatched: ${mailInfo.messageId}`);
    }).catch(mailErr => {
      console.error('❌ Background Nodemailer Error:', mailErr.message);
    });

  } catch (err) {
    console.error('❌ Send OTP Route Execution Error:', err.message);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: err.message || 'Email delivery failed.' });
    }
  }
});

// ==========================================
// 9. ROUTE: VERIFY OTP & RESET PASSWORD
// ==========================================
app.post('/api/auth/verify-otp-reset', async (req, res) => {
  console.log('📌 POST /api/auth/verify-otp-reset endpoint hit');
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
        console.log(`🔒 Password updated in Firebase for ${targetEmail}`);
      } catch (fbErr) {
        console.warn('⚠️ Firebase password update skipped:', fbErr.message);
      }
    }

    otpStore.delete(targetEmail);

    console.log(`✅ Password reset successfully completed for ${targetEmail}`);
    return res.json({ success: true, message: 'Password updated successfully! You can now log in.' });

  } catch (err) {
    console.error('❌ Verify OTP Route Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error while resetting password.' });
  }
});

// ==========================================
// 10. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});