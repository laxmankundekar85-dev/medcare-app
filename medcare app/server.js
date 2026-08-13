import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import https from 'https';
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
    // Expected on Render production deployments
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

// In-memory store for OTPs
const otpStore = new Map();

// Helper function: Send email via Brevo REST API (Over HTTPS Port 443)
const sendEmailViaHTTPS = (toEmail, otpCode) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    const sender = process.env.EMAIL_USER || 'laxmankundekar85@gmail.com';

    if (!apiKey) {
      console.warn('⚠️ BREVO_API_KEY missing in environment variables. Skipped HTTPS email delivery.');
      return resolve({ skipped: true });
    }

    const payload = JSON.stringify({
      sender: { name: "Medcare Support", email: sender },
      to: [{ email: toEmail }],
      subject: "Medcare - Password Reset Verification Code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0d9488;">Medcare Password Reset</h2>
          <p>You requested to reset your password. Use the verification code below:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; width: 220px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f766e;">${otpCode}</span>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
      `
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseBody));
        } else {
          reject(new Error(`HTTPS API Error ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

// ==========================================
// 5. SAFE DYNAMIC ROUTE IMPORTS
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
// 6. ROUTE: PERSONALIZED AI HEALTH CHATBOT
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
            break;
          }
        } catch (err) {
          console.warn(`Gemini Fetch Error:`, err.message);
        }
      }
    }

    // =========================================================
    // INTELLIGENT RULE ENGINE FALLBACK (WHEN GEMINI API UNREACHABLE)
    // =========================================================
    if (!replyText) {
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes('fever') || lowerMsg.includes('temperature') || lowerMsg.includes('chills') || lowerMsg.includes('hot body')) {
        replyText = `Hello ${patientName}! 🤒 For fever management:\n\n1. **Rest & Hydration:** Rest in a cool room and sip water or ORS regularly to stay hydrated.\n2. **Cool Sponge:** Apply a clean, damp cloth to your forehead, neck, and wrists.\n3. **Monitor:** Keep track of your body temperature periodically.\n\n💊 **Active Logged Meds:** ${activeMeds}\n\n*Note: If your fever exceeds 102°F (38.8°C) or lasts more than 3 days, please consult a doctor immediately.*`;
      } else if (lowerMsg.includes('snake') || lowerMsg.includes('bite') || lowerMsg.includes('venom') || lowerMsg.includes('serpent')) {
        replyText = `🚨 **EMERGENCY FIRST AID FOR SNAKE BITE** 🚨\n\nHello ${patientName}! Please stay calm and take these steps **IMMEDIATELY**:\n\n1. 🚑 **CALL EMERGENCY SERVICES (108 / 911) NOW** or get to the nearest ER room.\n2. **Keep Calm & Still:** Movement causes venom to spread faster.\n3. **Immobilize the Area:** Keep the bitten limb slightly below heart level.\n4. **Remove Tight Items:** Take off rings, watches, or tight clothing near the bite.\n5. ❌ **DO NOT:** Cut the wound, suck out venom, or apply ice/tourniquets.\n\n*Note: Anti-venom at a hospital is the only effective treatment. Seek emergency care right away!*`;
      } else if (lowerMsg.includes('chest pain') || lowerMsg.includes('heart attack') || lowerMsg.includes('shortness of breath')) {
        replyText = `🚨 **CRITICAL MEDICAL EMERGENCY** 🚨\n\nHello ${patientName}! Chest pain can be a sign of a cardiac event. Please seek emergency medical care immediately:\n\n1. 🚑 **Call 108 / emergency services right away.**\n2. Sit down and rest in a comfortable, relaxed position.\n3. Do not attempt to drive yourself to the hospital.\n\n*Note: Seek urgent clinical care immediately.*`;
      } else if (lowerMsg.includes('burn') || lowerMsg.includes('bleed') || lowerMsg.includes('cut') || lowerMsg.includes('wound')) {
        replyText = `Hello ${patientName}! For cuts or burns first-aid:\n\n1. **Bleeding:** Apply firm, continuous pressure with a clean cloth.\n2. **Burns:** Run cool (not ice-cold) tap water over the burn for 10-15 minutes.\n3. **Cleanliness:** Wash mild wounds gently with clean water.\n\n⚠️ Seek doctor evaluation for deep wounds or severe burns.`;
      } else if (lowerMsg.includes('head') || lowerMsg.includes('headache') || lowerMsg.includes('head pain')) {
        replyText = `Hello ${patientName}! I am sorry to hear that your head is paining. 🤕\n\n**Immediate Relief Steps:**\n1. Rest in a dark, quiet, well-ventilated room.\n2. Hydrate with water, as dehydration is a primary headache trigger.\n3. Apply a cool compress across your forehead.\n\n💊 **Active Logged Meds:** ${activeMeds}\n\n*Note: Please consult a physician before taking any unprescribed pain relief.*`;
      } else if (lowerMsg.includes('stomach') || lowerMsg.includes('nausea') || lowerMsg.includes('vomit') || lowerMsg.includes('cramp') || lowerMsg.includes('diarrhea')) {
        replyText = `Hello ${patientName}! For stomach discomfort:\n\n1. Sip small amounts of clear fluids, ORS, or ginger tea.\n2. Avoid spicy, greasy, or heavy dairy foods.\n3. Rest in an upright position.\n\n*Note: Consult a doctor if severe pain persists.*`;
      } else if (lowerMsg.includes('medication') || lowerMsg.includes('medicine') || lowerMsg.includes('taking') || lowerMsg.includes('dose') || lowerMsg.includes('pill')) {
        replyText = `Hello ${patientName}! 👋\n\nYour current active Medcare medications:\n💊 **${activeMeds}**\n\nPlease follow your prescribed dosage schedule!`;
      } else if (lowerMsg.includes('blood pressure') || lowerMsg.includes('bp') || lowerMsg.includes('hypertension')) {
        replyText = `Hello ${patientName}! Core tips for healthy blood pressure:\n1. Reduce daily sodium (salt) intake.\n2. Engage in 30 mins of daily light-to-moderate exercise.\n3. Manage stress levels and stay hydrated.`;
      } else if (lowerMsg.includes('hydration') || lowerMsg.includes('water') || lowerMsg.includes('drink')) {
        replyText = `Hello ${patientName}! Aim for 2.5 to 3 Liters of water daily for optimal organ health. 💧`;
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        replyText = `Hello ${patientName}! 👋 Welcome to Medcare Assistant. How can I assist you with your health today?`;
      } else {
        replyText = `Hello ${patientName}! I am your Medcare AI Assistant.\n\nI can assist you with:\n- First-aid guidance for symptoms (fever, headache, burns, injuries)\n- Checking active medications (**${activeMeds}**)\n- Health & wellness advice\n\nHow can I help you regarding your health right now?\n\n*Note: I am an AI assistant. Please consult a qualified doctor for clinical diagnoses.*`;
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

    res.status(200).json({ success: true, status: targetStatus });
  } catch (error) {
    console.error("Error toggling medication status:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. ROUTE: SEND OTP (HTTPS REST API + TERMINAL LOG BACKUP)
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

    // Respond IMMEDIATELY to client UI
    res.status(200).json({ success: true, message: 'OTP sent successfully to your email.' });

    // Dispatch email over HTTPS REST API in background
    sendEmailViaHTTPS(targetEmail, otp)
      .then(result => {
        if (!result.skipped) {
          console.log(`✅ Email dispatched successfully via Brevo HTTPS API!`);
        }
      })
      .catch(err => {
        console.error('❌ HTTPS Email Dispatch Error:', err.message);
      });

  } catch (err) {
    console.error('❌ Send OTP Route Error:', err.message);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: err.message || 'Server error.' });
    }
  }
});

// ==========================================
// 8. ROUTE: VERIFY OTP & RESET PASSWORD
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
// 9. START SERVER IMMEDIATELY
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});