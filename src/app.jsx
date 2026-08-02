import React, { useState } from 'react';

export default function MedcareApp() {
  const [currentTab, setCurrentTab] = useState('Home');
  const [darkMode, setDarkMode] = useState(false);

  // Global States across tabs
  const [weight, setWeight] = useState(64);
  const [sleep, setSleep] = useState('7h 20m');
  const [bp, setBp] = useState('120/80');
  const [bmi, setBmi] = useState(20.9);
  const [steps, setSteps] = useState(4231);
  const [avgBpm, setAvgBpm] = useState(72);

  const [upcoming, setUpcoming] = useState([
    { id: 1, doctor: 'Dr. Alexander River', specialty: 'General Practitioner', date: 'Aug 12, 2024', time: '09:30 AM', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Sarah Chen', specialty: 'Cardiologist', date: 'Aug 15, 2024', time: '02:00 PM', status: 'Confirmed' }
  ]);

  const [injections, setInjections] = useState([
    { id: 1, name: 'Influenza Vaccine', date: 'Oct 24, 2023 • 09:30 AM', status: 'Confirmed' }
  ]);

  const [records, setRecords] = useState([
    { id: 1, title: 'Full Blood Count', category: 'LAB RESULT', location: 'Central Diagnostic Center', date: 'Oct 24, 2023', icon: '💧' },
    { id: 2, title: 'Consultation Summary', category: 'DOCTOR NOTES', location: 'Dr. Alex River', date: 'Oct 22, 2023', icon: '📄' }
  ]);

  const [medications, setMedications] = useState([
    { id: 1, name: 'Metformin', dosage: '500mg • Twice daily', timeInfo: 'Next: 8:00 PM', status: 'Active' },
    { id: 2, name: 'Lisinopril', dosage: '10mg • Once daily', timeInfo: 'Taken: 09:15 AM ✓', status: 'Active' }
  ]);

  const [reminders, setReminders] = useState([
    { id: 1, type: 'Daily Dose', time: '08:00', period: 'AM', label: 'Metformin 500mg', active: true, icon: '💊' },
    { id: 2, type: 'Appointment', time: '12:30', period: 'PM', label: 'Cardiology Check-up', active: true, icon: '🩺' }
  ]);

  const [profile, setProfile] = useState({
    name: 'Laxman Babu Kundekar',
    patientId: '#MC-98442',
    bloodGroup: 'O+',
    age: '20',
    weight: '64',
    email: 'laxman@healthmail.com',
    phone: '+91 9876543210',
    address: 'Mumbai, India',
    role: 'Engineering Student & Patient'
  });

  const [language, setLanguage] = useState('English (US)');

  // Modal Control States
  const [modalType, setModalType] = useState(null); 
  const [modalData, setModalData] = useState(null);

  // Render Active Tab Content
  const renderTab = () => {
    switch (currentTab) {
      case 'Home':
        return <Dashboard darkMode={darkMode} {...{ weight, setWeight, sleep, setSleep, bp, setBp, bmi, setBmi, steps, setSteps, avgBpm, setAvgBpm, setModalType, setModalData }} />;
      case 'Appointments':
        return <Appointments darkMode={darkMode} {...{ upcoming, setUpcoming, setModalType, setModalData }} />;
      case 'Health':
        return <Medications darkMode={darkMode} {...{ medications, setMedications, setModalType }} />;
      case 'Records':
        return <Records darkMode={darkMode} {...{ records, setRecords, setModalType }} />;
      case 'Injections':
        return <Injections darkMode={darkMode} {...{ injections, setInjections, setModalType }} />;
      case 'Alarms':
        return <Alarms darkMode={darkMode} {...{ reminders, setReminders, setModalType }} />;
      case 'Profile':
        return <Profile darkMode={darkMode} {...{ profile, setProfile, setCurrentTab, setModalType, setModalData }} />;
      case 'Settings':
        return <Settings darkMode={darkMode} {...{ setDarkMode, setCurrentTab, profile, setProfile, language, setLanguage, setModalType, setModalData }} />;
      default:
        return <Dashboard darkMode={darkMode} {...{ weight, setWeight, sleep, setSleep, bp, setBp, bmi, setBmi, steps, setSteps, avgBpm, setAvgBpm, setModalType, setModalData }} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-28 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Top Navbar */}
      <div className={`flex justify-between items-center px-6 py-4 border-b sticky top-0 z-40 shadow-sm ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <h1 className="text-xl font-bold text-teal-700 cursor-pointer" onClick={() => setCurrentTab('Home')}>Medcare</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentTab('Alarms')} className="text-xl">🔔</button>
          <img 
            onClick={() => setCurrentTab('Profile')}
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
            alt="Profile" 
            className="w-9 h-9 rounded-full object-cover cursor-pointer border border-teal-600 shadow-sm"
          />
        </div>
      </div>

      {/* Main Tab Container */}
      <div className="max-w-4xl mx-auto p-6">
        {renderTab()}
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 border-t flex justify-around py-3 px-4 z-40 transition-colors duration-300 shadow-lg ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-600'}`}>
        <button onClick={() => setCurrentTab('Home')} className={`flex flex-col items-center ${currentTab === 'Home' ? 'text-teal-700 font-bold' : ''}`}>
          <span>🏠</span> <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => setCurrentTab('Appointments')} className={`flex flex-col items-center ${currentTab === 'Appointments' ? 'text-teal-700 font-bold' : ''}`}>
          <span>📅</span> <span className="text-xs mt-1">Appointments</span>
        </button>
        <button onClick={() => setCurrentTab('Health')} className={`flex flex-col items-center ${currentTab === 'Health' ? 'text-teal-700 font-bold' : ''}`}>
          <span>💊</span> <span className="text-xs mt-1">Health</span>
        </button>
        <button onClick={() => setCurrentTab('Records')} className={`flex flex-col items-center ${currentTab === 'Records' ? 'text-teal-700 font-bold' : ''}`}>
          <span>📄</span> <span className="text-xs mt-1">Records</span>
        </button>
        <button onClick={() => setCurrentTab('Settings')} className={`flex flex-col items-center ${currentTab === 'Settings' ? 'text-teal-700 font-bold' : ''}`}>
          <span>⚙️</span> <span className="text-xs mt-1">Settings</span>
        </button>
      </div>

      {/* GLOBAL UNIVERSAL MODAL HANDLER */}
      {modalType && <UniversalModal {...{ modalType, modalData, setModalType, weight, setWeight, sleep, setSleep, bp, setBp, bmi, setBmi, steps, setSteps, avgBpm, setAvgBpm, upcoming, setUpcoming, injections, setInjections, records, setRecords, medications, setMedications, reminders, setReminders, profile, setProfile, language, setLanguage }} />}

    </div>
  );
}

// ================= SUB-PAGES =================

function Dashboard({ darkMode, weight, sleep, bp, bmi, steps, avgBpm, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="mb-6"><h1 className="text-3xl font-bold">Hello, Laxman!</h1><p className="text-gray-400 mt-1">Your health status looks stable today.</p></div>
      <div className="bg-teal-700 text-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="text-teal-200 font-bold text-xs tracking-wider mb-2">💡 PERSONALIZED ADVICE</div>
        <p className="text-sm md:text-base mb-4">Your sleep pattern improved by 12% this week. Keeping a steady schedule helps maintain BMI levels.</p>
        <button onClick={() => alert('Full report generated.')} className="bg-white text-teal-900 font-semibold px-5 py-2.5 rounded-2xl text-sm">Full Report</button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div onClick={() => setModalType({ type: 'editStat', field: 'weight', val: weight })} className={`${cardBg} border rounded-3xl p-5 shadow-sm cursor-pointer`}>
          <p className="text-gray-400 text-sm">Weight</p><h3 className="text-2xl font-bold mt-1">{weight} kg</h3>
        </div>
        <div onClick={() => setModalType({ type: 'editStat', field: 'sleep', val: sleep })} className={`${cardBg} border rounded-3xl p-5 shadow-sm cursor-pointer`}>
          <p className="text-gray-400 text-sm">Sleep</p><h3 className="text-2xl font-bold mt-1">{sleep}</h3>
        </div>
      </div>
      <div onClick={() => setModalType({ type: 'editStat', field: 'bp', val: bp })} className={`${cardBg} border rounded-3xl p-5 shadow-sm mb-4 flex justify-between items-center cursor-pointer`}>
        <div><p className="text-gray-400 text-sm">Blood Pressure</p><h3 className="text-2xl font-bold mt-1">{bp} mmHg</h3></div>
        <span className="bg-teal-700 text-white px-3 py-1 rounded-full text-xs font-semibold">Normal</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div onClick={() => setModalType({ type: 'editStat', field: 'bmi', val: bmi })} className={`${cardBg} border rounded-3xl p-5 shadow-sm cursor-pointer`}><p className="text-gray-400 text-sm">BMI</p><h3 className="text-2xl font-bold mt-1">{bmi}</h3></div>
        <div onClick={() => setModalType({ type: 'editStat', field: 'steps', val: steps })} className={`${cardBg} border rounded-3xl p-5 shadow-sm cursor-pointer`}><p className="text-gray-400 text-sm">Activity</p><h3 className="text-2xl font-bold mt-1">{steps} steps</h3></div>
      </div>
      <div className={`${cardBg} border rounded-3xl p-6 shadow-sm`}>
        <div className="flex justify-between items-center mb-4"><span className="font-bold">❤️ Heart Rate</span><span className="text-teal-600 text-sm font-semibold">{avgBpm} Avg BPM</span></div>
        <div className="flex items-end justify-between h-24 gap-2">{[50, 35, 65, 80, 60, 45, 75].map((h, i) => <div key={i} style={{ height: `${h}%` }} className="w-10 bg-teal-100 dark:bg-teal-900 rounded-t-xl"></div>)}</div>
      </div>
    </div>
  );
}

function Appointments({ darkMode, upcoming, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Upcoming Appointments</h2><button onClick={() => setModalType({ type: 'addAppointment' })} className="bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Book</button></div>
      <div className="space-y-4">
        {upcoming.map(app => (
          <div key={app.id} className={`${cardBg} border rounded-3xl p-6 shadow-sm flex justify-between items-center`}>
            <div><h3 className="font-bold text-lg">{app.doctor}</h3><p className="text-xs text-gray-400">{app.specialty} • {app.date} at {app.time}</p></div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Confirmed</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Injections({ darkMode, injections, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold">Injections</h1><button onClick={() => setModalType({ type: 'addInjection' })} className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">+ Add</button></div>
      <div className="space-y-4">
        {injections.map(inj => (
          <div key={inj.id} className={`${cardBg} border rounded-2xl p-5 shadow-sm flex justify-between items-center`}>
            <div><h3 className="font-bold">{inj.name}</h3><p className="text-xs text-gray-400">{inj.date}</p></div>
            <span className="text-xs font-bold text-emerald-600">{inj.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Records({ darkMode, records, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold">Records</h1><button onClick={() => setModalType({ type: 'addRecord' })} className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">+ Add Record</button></div>
      <div className="space-y-4">
        {records.map(rec => (
          <div key={rec.id} className={`${cardBg} border rounded-3xl p-5 shadow-sm flex justify-between items-center`}>
            <div><h4 className="font-bold">{rec.title}</h4><p className="text-xs text-gray-400">{rec.location} • {rec.date}</p></div>
            <button onClick={() => alert(`Downloading ${rec.title}`)} className="text-xl">📥</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Medications({ darkMode, medications, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold">Medications</h1><button onClick={() => setModalType({ type: 'addMedication' })} className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">+ Add</button></div>
      <div className="space-y-4">
        {medications.map(med => (
          <div key={med.id} className={`${cardBg} border rounded-3xl p-5 shadow-sm flex justify-between items-center`}>
            <div><h3 className="font-bold">{med.name}</h3><p className="text-xs text-gray-400">{med.dosage}</p></div>
            <span className="text-xs font-bold text-emerald-600">{med.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Alarms({ darkMode, reminders, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold">Reminders</h1><button onClick={() => setModalType({ type: 'addAlarm' })} className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">+ Set Alarm</button></div>
      <div className="space-y-4">
        {reminders.map(rem => (
          <div key={rem.id} className={`${cardBg} border rounded-3xl p-5 shadow-sm flex justify-between items-center`}>
            <div><h3 className="text-2xl font-bold">{rem.time} {rem.period}</h3><p className="text-xs text-gray-400">{rem.label}</p></div>
            <span className={`w-12 h-6 flex items-center rounded-full p-1 ${rem.active ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}><div className="bg-white w-4 h-4 rounded-full"></div></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ darkMode, profile, setCurrentTab, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="flex justify-between items-center mb-6"><button onClick={() => setCurrentTab('Home')} className="font-bold">←</button><h1 className="text-xl font-bold">Profile</h1><button onClick={() => setModalType({ type: 'editProfileField', field: 'name', val: profile.name })}>✏️</button></div>
      <div className="text-center mb-6"><h2 className="text-2xl font-bold">{profile.name}</h2><p className="text-xs text-gray-400">Patient ID: {profile.patientId}</p></div>
      <div className={`${cardBg} border rounded-3xl p-5 shadow-sm space-y-3`}>
        <div className="flex justify-between"><span>Email:</span><span className="font-medium">{profile.email}</span></div>
        <div className="flex justify-between"><span>Phone:</span><span className="font-medium">{profile.phone}</span></div>
        <div className="flex justify-between"><span>Address:</span><span className="font-medium">{profile.address}</span></div>
      </div>
    </div>
  );
}

function Settings({ darkMode, setDarkMode, setCurrentTab, profile, setModalType }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900';
  return (
    <div>
      <div className="flex justify-between items-center mb-6"><button onClick={() => setCurrentTab('Home')} className="font-bold">←</button><h1 className="text-xl font-bold">Settings</h1><div></div></div>
      <div className={`${cardBg} border rounded-3xl p-4 shadow-sm mb-4 flex justify-between items-center`}>
        <span>Dark Mode</span>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 flex items-center rounded-full p-1 ${darkMode ? 'bg-teal-700 justify-end' : 'bg-gray-300 justify-start'}`}><div className="bg-white w-4 h-4 rounded-full"></div></button>
      </div>
      <div className={`${cardBg} border rounded-3xl p-4 shadow-sm cursor-pointer`} onClick={() => setModalType({ type: 'support' })}><span>❓ Help & Support</span></div>
    </div>
  );
}

// ================= UNIVERSAL MODAL CONTROLLER =================

function UniversalModal({ modalType, setModalType, weight, setWeight, sleep, setSleep, bp, setBp, bmi, setBmi, steps, setSteps, upcoming, setUpcoming, injections, setInjections, records, setRecords, medications, setMedications, reminders, setReminders, profile, setProfile, language, setLanguage }) {
  const [inputVal, setInputVal] = useState(modalType.val || '');
  const [inputVal2, setInputVal2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType.type === 'editStat') {
      if (modalType.field === 'weight') setWeight(inputVal);
      if (modalType.field === 'sleep') setSleep(inputVal);
      if (modalType.field === 'bp') setBp(inputVal);
      if (modalType.field === 'bmi') setBmi(inputVal);
      if (modalType.field === 'steps') setSteps(inputVal);
    } else if (modalType.type === 'addAppointment') {
      setUpcoming([{ id: Date.now(), doctor: inputVal, specialty: inputVal2 || 'General', date: 'Aug 20, 2026', time: '10:00 AM', status: 'Confirmed' }, ...upcoming]);
    } else if (modalType.type === 'addInjection') {
      setInjections([{ id: Date.now(), name: inputVal, date: 'Today', status: 'Completed' }, ...injections]);
    } else if (modalType.type === 'addRecord') {
      setRecords([{ id: Date.now(), title: inputVal, category: 'LAB RESULT', location: inputVal2 || 'Clinic', date: 'Today', icon: '📄' }, ...records]);
    } else if (modalType.type === 'addMedication') {
      setMedications([...medications, { id: Date.now(), name: inputVal, dosage: inputVal2 || '1 pill', timeInfo: 'Daily', status: 'Active' }]);
    } else if (modalType.type === 'addAlarm') {
      setReminders([...reminders, { id: Date.now(), type: 'Dose', time: inputVal, period: 'AM', label: inputVal2 || 'Medicine', active: true, icon: '💊' }]);
    } else if (modalType.type === 'editProfileField') {
      setProfile({ ...profile, [modalType.field]: inputVal });
    }
    setModalType(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold capitalize">Add / Edit Entry</h3>
          <button onClick={() => setModalType(null)} className="text-gray-400 font-bold text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Value / Title / Name" value={inputVal} onChange={e => setInputVal(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
          {['addAppointment', 'addRecord', 'addMedication', 'addAlarm'].includes(modalType.type) && (
            <input type="text" placeholder="Secondary Detail (e.g., Dosage, Time, Doctor)" value={inputVal2} onChange={e => setInputVal2(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setModalType(null)} className="flex-1 border py-2.5 rounded-xl font-medium">Cancel</button>
            <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl font-medium shadow">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}