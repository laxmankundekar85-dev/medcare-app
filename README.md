# 🏥 Medcare — Personal Health & Medication Management Assistant

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://medcare-app.vercel.app)
[![Render Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://medcare-app-qyao.onrender.com)
[![Capacitor Android](https://img.shields.io/badge/Mobile-Capacitor%208-3880FF?logo=capacitor)](https://capacitorjs.com)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev)
[![Node.js & Express](https://img.shields.io/badge/Server-Node.js%20%7C%20Express-339933?logo=node.js)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)](https://ai.google.dev/)

A full-stack, cross-platform healthcare companion application (Web and Android) designed to help patients manage daily medications, dosage alarms, medical appointments, lab records, immunization schedules, and health vitals. Includes an intelligent AI Health Assistant and a camera-enabled Medicine & QR Code Scanner powered by Google Gemini.

---

## 📌 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Installation & Local Setup](#-installation--local-setup)
- [Running the Application](#-running-the-application)
- [Mobile App (Android)](#-mobile-app-android)
- [API Reference](#-api-reference)
- [Deployment Guide](#-deployment-guide)
- [License](#-license)

---

## ✨ Key Features

### 🩺 Health Dashboard & Vitals Tracking
- Dynamic patient profile cards with custom patient IDs (`#MCxxxx`) and avatar synchronization.
- Real-time BMI calculation based on stored height and weight with instant status feedback.
- Quick summary widgets displaying today's upcoming medication doses and appointment schedules.

### 🤖 AI Medical Assistant (`/chatbot`)
- Interactive conversational healthcare guidance powered by the **Google Gemini API**.
- First-aid guidance, non-diagnostic symptom triage, natural language explanations, and emergency warnings.
- Robust safety filters that prevent prompt leakage and safeguard against incorrect medicine claims.

### 📷 Medicine & QR Code Scanner (`/scanner`)
- **Package Label Vision Analysis**: Upload or capture photos of medication packaging to extract active ingredients, strengths, general uses, and precautions using Gemini Multimodal Vision.
- **Barcode & QR Decoding**: Built-in camera scanner via `html5-qrcode` to decode drug QR codes and fetch product info.

### 💊 Medication & Dose Scheduling (`/medications`)
- Track prescription courses, dosage instructions, and daily schedules.
- Log taken doses with automatic timestamps and visual status updates.
- Scoped to authenticated user IDs with offline local-storage fallback caching.

### ⏰ Alarms & Audio Reminders (`/alarms`)
- Custom configurable alarms for medication times and doctor consultations.
- In-browser synthesized audio alerts (Web Audio API) with customizable loop durations.
- Native browser push notification prompts.

### 💉 Immunizations & Injections (`/injections`)
- Comprehensive injection tracker recording administering physician, clinical facility, and date.
- Modal-based rescheduling and completion workflows.

### 📅 Doctor Appointments (`/appointments`)
- Schedule and view upcoming specialist visits.
- Archive past consultations with provider notes and outcome summaries.

### 📂 Clinical Records & Reports (`/records`)
- Secure repository for laboratory test results, diagnostic scans, and clinical notes.
- Support for document attachment and month-by-month archival.

### 📋 Medical History & Previous Illnesses (`/diseases`)
- Structured history tracker categorized by physiological systems (respiratory, cardiovascular, endocrine, etc.).

### 🔐 Secure Cross-Platform Authentication
- Firebase Authentication supporting Email/Password and one-tap Google Sign-In.
- Native Android Google Authentication bridging via `@capacitor-firebase/authentication`.
- Forgot password workflow with 6-digit OTP verification delivered via Brevo HTTPS API.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Frontend Clients"]
        WEB["React Web App (Vite + Tailwind)"]
        MOBILE["Android App (Capacitor 8)"]
    end

    subgraph Hosting["Deployments"]
        VERCEL["Vercel (Frontend Web)"]
        RENDER["Render (Express Backend)"]
    end

    subgraph Backend["Medcare Backend Server"]
        API["Express.js REST API"]
        AUTH_ROUTER["Firebase Admin SDK"]
        EMAIL["Brevo / Nodemailer OTP"]
        AI_SVC["Google Gemini API (Chat & Vision)"]
    end

    subgraph Database["Data Layer"]
        MONGO[("MongoDB Atlas")]
        FB_AUTH["Firebase Auth"]
    end

    WEB --> VERCEL
    MOBILE --> API
    VERCEL --> API
    RENDER --> API

    API --> MONGO
    API --> AUTH_ROUTER
    AUTH_ROUTER --> FB_AUTH
    API --> EMAIL
    API --> AI_SVC
```

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React, HTML5-QRCode |
| **Mobile** | Capacitor 8, Capacitor Android Plugin, Capacitor Firebase Auth |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose 8/9, Dotenv |
| **Database** | MongoDB Atlas |
| **Authentication** | Firebase Authentication, Firebase Admin SDK |
| **AI / Vision** | Google Gemini Generative Language API (`@google/generative-ai`) |
| **Email Service** | Brevo HTTPS API, Nodemailer |
| **Hosting & CI/CD** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```text
medcare/
├── .github/                       # GitHub workflows and issue templates
├── .gitignore                     # Git ignore rules (secrets, build output, modules)
├── .npmrc                         # CI peer dependency configuration
├── capacitor.config.json          # Capacitor mobile configuration
├── index.html                     # Vite single-page application entry point
├── package.json                   # Root package definitions and deployment scripts
├── postcss.config.js              # PostCSS plugins (Tailwind, Autoprefixer)
├── tailwind.config.js             # Tailwind design styling and tokens
├── vercel.json                    # Vercel SPA routing and rewrites
├── vite.config.js                 # Vite bundler configuration
├── server.js                      # Root server entry point for deployment platforms
│
├── public/                        # Static assets
│   └── _redirects                 # Netlify SPA redirect rules
│
├── src/                           # Frontend React Application
│   ├── app.jsx                    # Primary application shell & navigation manager
│   ├── config.js                  # Dynamic API base URL configuration (Production / Dev)
│   ├── firebase.js                # Firebase Web SDK initialization & Auth providers
│   ├── index.css                  # Global styles and Tailwind directives
│   ├── main.jsx                   # React root renderer
│   ├── components/                # Reusable UI components
│   │   ├── FloatingChatButton.jsx
│   │   ├── NotificationDropdown.jsx
│   │   ├── layout/Navigation.jsx  # Side drawer and bottom mobile navbar
│   │   └── ui/Cards.jsx           # Dashboard vital cards and widgets
│   ├── pages/                     # Application views
│   │   ├── Alarms.jsx             # Daily dose alarms & sound alerts
│   │   ├── Appointments.jsx       # Doctor visit schedules & history
│   │   ├── Chatbot.jsx            # Gemini-powered medical chat assistant
│   │   ├── Dashboard.jsx          # Patient vitals and overview
│   │   ├── Injections.jsx         # Immunization records
│   │   ├── Login.jsx              # Sign in, Sign up, OTP Password Reset
│   │   ├── Medications.jsx        # Prescription & dosage tracker
│   │   ├── MedicineScanner.jsx    # Camera label vision & QR scanner
│   │   ├── PatientProfile.jsx     # Patient details editor
│   │   ├── PreviousDiseases.jsx   # Past illness records
│   │   ├── Profile.jsx            # Profile & avatar management
│   │   └── Settings.jsx           # Account & notification preferences
│   └── utils/
│       └── user.js                # User session, scoped caching & ID helpers
│
├── medcare app/                   # Backend Express Application
│   ├── .env                       # Backend secrets (MONGO_URI, GEMINI_API_KEY, etc.)
│   ├── package.json               # Backend dependencies
│   ├── server.js                  # Main Express server, Gemini routes, OTP dispatch
│   ├── serviceAccountKey.json     # Firebase Admin credentials (local dev)
│   ├── models/                    # Mongoose database schemas
│   │   ├── Alarm.js
│   │   ├── Appointment.js
│   │   ├── Injection.js
│   │   ├── Medication.js
│   │   ├── PreviousDisease.js
│   │   ├── Record.js
│   │   ├── User.js
│   │   └── UserProfile.js
│   └── routes/                    # Modular Express REST route handlers
│       ├── alarmRoutes.js
│       ├── appointmentRoutes.js
│       ├── injectionRoutes.js
│       ├── medicationRoutes.js
│       ├── previousDiseaseRoutes.js
│       ├── profileRoutes.js
│       └── recordRoutes.js
│
└── android/                       # Native Android Project (Generated by Capacitor)
    ├── app/                       # Android application module
    └── build.gradle               # Gradle build scripts
```

---

## 🔑 Environment Variables

### 1. Frontend (`.env` in root directory — optional if defaults match)
```env
VITE_API_BASE_URL=https://medcare-app-qyao.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Backend (`medcare app/.env` or Render environment settings)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medcare?retryWrites=true&w=majority
GEMINI_API_KEY=your_google_gemini_api_key
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_sender@example.com
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or higher)
- [npm](https://www.npmjs.com/) (version 9.x or higher)
- [Git](https://git-scm.com/)
- [Android Studio](https://developer.android.com/studio) (for Android mobile build)

### Step 1: Clone the repository
```bash
git clone https://github.com/laxmankundekar85-dev/medcare-app.git
cd medcare
```

### Step 2: Install dependencies
```bash
npm install
```

---

## 🏃 Running the Application

### Start the Frontend (Vite Dev Server)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Start the Backend Server
```bash
npm run server
# or with nodemon auto-restart:
npm run dev:server
```
The server will start listening on [http://localhost:5000](http://localhost:5000) and automatically connect to MongoDB.

### Build Frontend for Production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

---

## 📱 Mobile App (Android)

Medcare is compiled into a native Android app using **Capacitor 8**.

1. **Build the latest web assets**:
   ```bash
   npm run build
   ```

2. **Sync assets and native plugins into the Android project**:
   ```bash
   npx cap sync
   ```

3. **Open the project in Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Run or Generate APK**:
   From Android Studio, select your emulator or connected physical Android device and click **Run**, or select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status check |
| `GET` | `/api/ping` | Wakeup ping for hosted backend |
| `GET` | `/api/health` | Service health & MongoDB connection state |
| `POST` | `/api/chat` | AI health assistant triage (Gemini) |
| `POST` | `/api/scan-medicine` | Label vision analysis & QR interpretation |
| `POST` | `/api/auth/send-otp` | Generate and dispatch password-reset OTP |
| `POST` | `/api/auth/verify-otp-reset` | Verify OTP and reset account password |
| `GET` | `/api/medications/:userId` | Get user's medications |
| `POST` | `/api/medications` | Add a new medication |
| `PATCH` | `/api/medications/:id/take` | Mark medication as taken |
| `DELETE` | `/api/medications/:id` | Remove a medication |
| `GET` | `/api/appointments/:userId` | Get user's appointments |
| `POST` | `/api/appointments` | Book/create an appointment |
| `DELETE` | `/api/appointments/:id` | Cancel an appointment |
| `GET` | `/api/alarms/:userId` | Fetch user's dose alarms |
| `POST` | `/api/alarms` | Create a new dose alarm |
| `PATCH` | `/api/alarms/:id/toggle` | Enable or disable an alarm |
| `DELETE` | `/api/alarms/:id` | Delete an alarm |
| `GET` | `/api/injections/:userId` | Retrieve scheduled injections |
| `POST` | `/api/injections` | Log a new injection schedule |
| `GET` | `/api/records/:userId` | Retrieve stored clinical records |
| `POST` | `/api/records` | Upload/add a clinical record |
| `GET` | `/api/profile/:userId` | Fetch patient profile |
| `POST` | `/api/profile` | Update patient profile details |
| `GET` | `/api/previous-diseases/:userId` | Fetch medical history |
| `POST` | `/api/previous-diseases` | Add condition to medical history |

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Import repository `laxmankundekar85-dev/medcare-app` into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `vite build` (or `npm run build`).
4. Output Directory: `dist`.
5. Environment Variables: add `VITE_API_BASE_URL` pointing to your hosted backend (e.g. `https://medcare-app-qyao.onrender.com`).
6. Deploy! [vercel.json](file:///r:/medcare/vercel.json) automatically handles single-page routing rewrites.

### Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com) linked to this repository.
2. Build Command: `npm install`.
3. Start Command: `npm start` (or `node server.js`).
4. Add Environment Variables: `MONGO_URI`, `GEMINI_API_KEY`, `BREVO_API_KEY`, `SENDER_EMAIL`, etc.
5. Deploy!

---

## 📄 License

This project is licensed under the **ISC License**.
