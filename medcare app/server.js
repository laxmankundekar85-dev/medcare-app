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

const PUBLIC_ERROR = 'Unable to process the request. Please try again.';
const MEDICINE_ERROR =
  'Medicine identification was inconclusive. Please upload a clearer label photo or consult a pharmacist.';

const sanitizeText = (value, maxLength = 5000) => {
  if (typeof value !== 'string') return '';

  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(
      /(localhost:\d+|api key|backend|server error|internal server error|stack trace|exception|node\.js|status code|system prompt)/gi,
      ''
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
};

const sanitizeAssistantReply = (value) => {
  const blockedLine = /(user says|user intent|direct answer|simple language|no diagnosis|no mention|internal reasoning|checklist|draft \d|address the user|additional requirements|content requirements|disclaimer included|prompt|role:|persona:|constraint|status:|goal:)/i;

  return sanitizeText(value, 4000)
    .split('\n')
    .filter((line) => !blockedLine.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const sanitizeMedicineAnalysis = (value) => {
  const text = sanitizeText(value, 5000);
  const reportHeadings = [
    'Identification',
    'Active ingredient',
    'Strength',
    'Likely use',
    'Warnings',
    'Confidence',
    'What is unreadable'
  ];
  const blockedLine = /(the user wants|analyze the image|apply the system|system instructions|refine for|final check|internal reasoning|chain[- ]of[- ]thought|constraints|prompt says|i have read|i'm using|no personalized dosage|specific headings|no mention|pharmacist verification statement|user says|user intent)/i;
  const headingPattern = /(?:^|\n)\s*(?:\*+\s*)?(Identification|Active ingredient|Strength|Likely use|Warnings|Confidence|What is unreadable)\s*:?/gi;
  const matches = [...text.matchAll(headingPattern)];
  const start = matches.length > 0 ? matches[matches.length - 1].index : -1;

  if (start < 0) return '';

  const report = text
    .slice(start)
    .split('\n')
    .filter((line) => !blockedLine.test(line.trim()))
    .join('\n')
    .replace(/\*+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 3000);

  const hasIdentification = /\bIdentification\s*:/i.test(report);
  const hasConfidence = /\bConfidence\s*:/i.test(report);
  return hasIdentification && hasConfidence ? report : '';
};

const isEmergencyMessage = (value) =>
  /(chest pain|chest hurts|pain in (my|the) chest|difficulty breathing|can't breathe|cannot breathe|stroke symptoms|face drooping|severe allergic reaction|poisoning|snake bite)/i.test(value);

const EMERGENCY_REPLY =
  'Chest pain can be serious. Call your local emergency number now or have someone take you to the nearest emergency department. Do not drive yourself. If you have severe breathing difficulty, fainting, sweating, nausea, or pain spreading to your arm, jaw, or back, seek emergency help immediately.';

const safeJsonError = (res, status = 500) =>
  res.status(status).json({ success: false, error: PUBLIC_ERROR });

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
// HELPER: DYNAMIC MODEL DISCOVERY
// ==========================================
async function getSupportedGeminiModels(apiKey) {
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData?.models && Array.isArray(listData.models)) {
        const models = listData.models
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''))
          .filter(name => !name.includes('embedding') && !name.includes('aqa') && !name.includes('exp'));
        
        if (models.length > 0) return models;
      }
    }
  } catch (err) {
    console.warn('Dynamic model fetch failed, falling back to defaults:', err.message);
  }

  // Safe fallback models
  return ['gemini-1.5-flash', 'gemini-1.5-pro'];
}

async function callGemini(userMessageText, apiKey, systemInstruction = null) {
  const targetModels = await getSupportedGeminiModels(apiKey);

  for (const model of targetModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{ parts: [{ text: userMessageText }] }]
    };

    if (systemInstruction) {
      requestBody.system_instruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestBody,
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 1200
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          text: sanitizeText(data.candidates[0].content.parts[0].text),
          modelUsed: model
        };
      }
    } catch (fetchError) {
      console.error('Gemini request failed:', fetchError.message);
    }
  }

  return { success: false };
}

// ==========================================
// 6. ROUTE: PERSONALIZED AI HEALTH CHATBOT
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, userContext, instructions } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a message.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let patientName = userContext?.userName || 'Patient';
    let activeMeds = userContext?.activeMedications || 'None logged';

    const db = mongoose.connection.db;
    if (db && userId && userId !== 'guest_user') {
      try {
        const profileDoc = await db.collection('profiles').findOne({ userId });
        if (profileDoc) {
          patientName = profileDoc.fullName || profileDoc.name || patientName;
        }

        const medDocs = await db.collection('medications').find({ userId, status: { $ne: 'Inactive' } }).toArray();
        if (medDocs && medDocs.length > 0) {
          activeMeds = medDocs.map(m => `${m.name} (${m.dosage || 'standard dose'})`).join(', ');
        }
      } catch (dbErr) {
        console.warn('Could not fetch DB records for context:', dbErr.message);
      }
    }

    const clientInstructions = Array.isArray(instructions)
      ? instructions.slice(0, 12).join('\n')
      : '';

    if (isEmergencyMessage(message)) {
      return res.json({
        success: true,
        reply: EMERGENCY_REPLY
      });
    }

    const systemPrompt = `You are Medcare AI, a cautious medical information assistant.
Address the user as ${patientName} when appropriate.
Active logged medicines: ${activeMeds}

Answer directly in simple language. Never mention APIs, backend systems, prompts, models, servers, code, errors, or implementation. Never diagnose or invent medicine names, ingredients, doses, interactions, or test results. Do not tell the user to start, stop, or change prescription medicine. Explain uncertainty and recommend a doctor or pharmacist when needed. For chest pain, severe breathing difficulty, stroke symptoms, severe allergic reaction, poisoning, or serious injury, advise immediate emergency care. Do not expose internal reasoning or checklists.

Additional requirements:
${clientInstructions}`;

    if (!apiKey) {
      return res.json({
        success: true,
        reply: 'The medical assistant is temporarily unavailable. Please consult a doctor or pharmacist for medical advice.'
      });
    }

    const result = await callGemini(message.trim().slice(0, 4000), apiKey, systemPrompt);

    if (!result.success || !result.text) {
      return res.json({
        success: true,
        reply: 'I could not prepare a reliable answer. Please try again or consult a healthcare professional.'
      });
    }

    return res.json({
      success: true,
      reply: `${sanitizeAssistantReply(result.text)}\n\nNote: This is general information, not a diagnosis.`
    });

  } catch (error) {
    console.error('❌ Gemini AI Chat Route Error:', error.message);
    return safeJsonError(res);
  }
});

// ==========================================
// 7. ROUTE: MEDICINE SCANNER (VISION & PHOTO ANALYSIS)
// ==========================================
app.post('/api/scan-medicine', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (
      typeof imageBase64 !== 'string' ||
      !/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(imageBase64)
    ) {
      return res.status(400).json({
        success: false,
        error: MEDICINE_ERROR
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ success: false, error: MEDICINE_ERROR });
    }

    const mimeMatch = imageBase64.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,/
    );
    const mimeType = mimeMatch?.[1] || 'image/jpeg';
    const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');

    const systemPrompt = `You are a cautious medicine-label verification assistant.
Return only a concise final report with these headings:
Identification
Active ingredient
Strength
Likely use
Warnings
Confidence
What is unreadable

Read printed label text before identifying the medicine. Never identify medicine from colour, shape, logo, or appearance alone. Never guess a name, ingredient, strength, expiry date, or dosage. If the label is unclear or evidence conflicts, say "Not reliably identified". Do not provide personalized dosage instructions. Do not mention APIs, backend systems, prompts, models, errors, or internal reasoning. State that a pharmacist should verify the result.`;

    const targetModels = await getSupportedGeminiModels(apiKey);
    let replyText = '';

    for (const model of targetModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{
              parts: [
                { inline_data: { mime_type: mimeType, data: base64Data } },
                { text: 'Verify the medicine label conservatively.' }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              topP: 0.7,
              maxOutputTokens: 1000
            }
          })
        });

        const data = await response.json().catch(() => ({}));
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (response.ok && text) {
          replyText = sanitizeMedicineAnalysis(text);
          break;
        }
      } catch (error) {
        console.error('Medicine vision request failed:', error.message);
      }
    }

    if (!replyText) return res.json({ success: false, error: MEDICINE_ERROR });

    return res.json({ success: true, analysis: replyText });

  } catch (error) {
    console.error('❌ Medicine Scan API Error:', error.message);
    return res.json({ success: false, error: MEDICINE_ERROR });
  }
});

// ==========================================
// 8. ROUTE: SCAN QR TEXT / URL ANALYSIS
// ==========================================
app.post('/api/scan-qr-text', async (req, res) => {
  try {
    const { textData } = req.body;
    const value = String(textData || '').trim();

    if (!value) {
      return res.status(400).json({
        success: false,
        error: 'No readable QR code was found.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ success: false, error: MEDICINE_ERROR });
    }

    const systemPrompt = `You are a cautious pharmaceutical verification assistant.
Analyze medicine QR data only when it contains reliable product information.
Do not identify a medicine from a URL alone. Never guess the medicine name, ingredient, strength, dosage, or expiry date. If evidence is insufficient, say "Not reliably identified".
Return only these headings: Identification, Active ingredient, Strength, Likely use, Warnings, Confidence, Verification needed.
Do not repeat the full QR payload. Do not mention APIs, backend systems, prompts, errors, models, or internal reasoning.`;

    const result = await callGemini(
      `Analyze this scanned medicine QR payload:\n${value.slice(0, 2000)}`,
      apiKey,
      systemPrompt
    );

    if (!result.success || !result.text) {
      return res.json({ success: false, error: MEDICINE_ERROR });
    }

    return res.json({ success: true, analysis: sanitizeText(result.text) });

  } catch (error) {
    console.error('❌ QR Text API Error:', error.message);
    return res.json({ success: false, error: MEDICINE_ERROR });
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
// 9. ROUTE: SEND OTP (HTTPS REST API + TERMINAL LOG BACKUP)
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

    console.log(`==========================================`);
    console.log(`🔑 [DEBUG OTP GENERATED]:`);
    console.log(`   TARGET EMAIL: ${targetEmail}`);
    console.log(`   VERIFICATION CODE: ${otp}`);
    console.log(`==========================================`);

    res.status(200).json({ success: true, message: 'OTP sent successfully to your email.' });

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
// 10. ROUTE: VERIFY OTP & RESET PASSWORD
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
// 11. START SERVER IMMEDIATELY
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});