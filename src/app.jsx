import React, { useState } from 'react';
import { 
  Menu, Bell, X, Home, Calendar, BriefcaseMedical, FileText, 
  User, Settings as SettingsIcon, Pill, Syringe, 
  Activity, FileClock
} from 'lucide-react';

// ================= LAYOUT COMPONENTS =================

function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition ${
        active ? 'bg-teal-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function BottomNavItem({ icon, label, onClick, active }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
        active ? 'text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {icon}
      <span className="text-[10px] mt-1">{label}</span>
    </button>
  );
}

// ================= LOGIN PAGE =================

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    } else {
      alert('Please enter credentials to login.');
    }
  };

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-900">Medcare</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to access your healthcare portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="e.g. laxman@healthmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700" 
            />
          </div>
          <button type="submit" className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-xl font-medium transition shadow-md mt-4">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// ================= PAGES =================

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hello, Laxman!</h1>
        <p className="text-slate-500 text-sm">Your health status looks stable today.</p>
      </div>
      <div className="bg-teal-800 text-white rounded-3xl p-6 shadow-sm">
        <div className="text-teal-200 font-bold text-xs tracking-wider mb-2">💡 PERSONALIZED ADVICE</div>
        <p className="text-sm mb-4">Your sleep pattern improved by 12% this week. Keeping a steady schedule helps maintain BMI levels.</p>
        <button onClick={() => alert('Full health report generated.')} className="bg-white text-teal-900 font-semibold px-4 py-2 rounded-xl text-xs">Full Report</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Weight</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">64 kg</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Sleep</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">7h 20m</h3>
        </div>
      </div>
    </div>
  );
}

function Appointments() {
  const [upcoming, setUpcoming] = useState([
    { id: 1, doctor: 'Dr. Alexander River', specialty: 'General Practitioner', date: 'Aug 12, 2026', time: '09:30 AM' },
    { id: 2, doctor: 'Dr. Sarah Chen', specialty: 'Cardiologist', date: 'Aug 15, 2026', time: '02:00 PM' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doc, setDoc] = useState('');
  const [date, setDate] = useState('');

  const handleBook = (e) => {
    e.preventDefault();
    if (!doc || !date) return;
    setUpcoming([{ id: Date.now(), doctor: doc, specialty: 'Specialist', date, time: '10:00 AM' }, ...upcoming]);
    setIsModalOpen(false); setDoc(''); setDate('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Book</button>
      </div>
      {upcoming.map(app => (
        <div key={app.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">{app.doctor}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{app.specialty} • {app.date} at {app.time}</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">Confirmed</span>
        </div>
      ))}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <form onSubmit={handleBook} className="space-y-4">
              <input type="text" required placeholder="Doctor Name" value={doc} onChange={e => setDoc(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
              <input type="text" required placeholder="Date (e.g., Aug 20, 2026)" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Alarms() {
  const [reminders, setReminders] = useState([
    { id: 1, time: '08:00', period: 'AM', label: 'Metformin 500mg', active: true },
    { id: 2, time: '09:00', period: 'PM', label: 'Atorvastatin 20mg', active: false }
  ]);

  const toggle = (id) => setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Medication Reminders</h2>
      {reminders.map(r => (
        <div key={r.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{r.time} <span className="text-xs text-slate-400">{r.period}</span></h3>
            <p className="text-xs text-slate-500 mt-1">{r.label}</p>
          </div>
          <button onClick={() => toggle(r.id)} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${r.active ? 'bg-teal-800 justify-end' : 'bg-slate-300 justify-start'}`}>
            <div className="bg-white w-4 h-4 rounded-full shadow"></div>
          </button>
        </div>
      ))}
    </div>
  );
}

function Medications() {
  const [meds, setMeds] = useState([
    { id: 1, name: 'Metformin', dosage: '500mg • Twice daily', status: 'Active' },
    { id: 2, name: 'Lisinopril', dosage: '10mg • Once daily', status: 'Active' }
  ]);
  const [isModal, setIsModal] = useState(false);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');

  const addMed = (e) => {
    e.preventDefault();
    if (!name || !dose) return;
    setMeds([...meds, { id: Date.now(), name, dosage: dose, status: 'Active' }]);
    setIsModal(false); setName(''); setDose('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Medications</h2>
        <button onClick={() => setIsModal(true)} className="bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add</button>
      </div>
      {meds.map(m => (
        <div key={m.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">{m.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{m.dosage}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">{m.status}</span>
        </div>
      ))}

      {isModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Medication</h3>
            <form onSubmit={addMed} className="space-y-4">
              <input type="text" required placeholder="Medication Name" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
              <input type="text" required placeholder="Dosage (e.g., 500mg)" value={dose} onChange={e => setDose(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModal(false)} className="flex-1 border py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Injections() {
  const [inj, setInj] = useState([
    { id: 1, name: 'Influenza Vaccine', date: 'Oct 24, 2023', status: 'Completed' }
  ]);
  const [isModal, setIsModal] = useState(false);
  const [name, setName] = useState('');

  const addInj = (e) => {
    e.preventDefault();
    if (!name) return;
    setInj([{ id: Date.now(), name, date: 'Today', status: 'Completed' }, ...inj]);
    setIsModal(false); setName('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Injections</h2>
        <button onClick={() => setIsModal(true)} className="bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add</button>
      </div>
      {inj.map(i => (
        <div key={i.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">{i.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{i.date}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">{i.status}</span>
        </div>
      ))}

      {isModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Injection</h3>
            <form onSubmit={addInj} className="space-y-4">
              <input type="text" required placeholder="Vaccine Name" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModal(false)} className="flex-1 border py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Records() {
  const [recs, setRecs] = useState([
    { id: 1, title: 'Full Blood Count', lab: 'Central Diagnostic', date: 'Oct 24, 2023' }
  ]);
  const [isModal, setIsModal] = useState(false);
  const [title, setTitle] = useState('');
  const [lab, setLab] = useState('');

  const addRec = (e) => {
    e.preventDefault();
    if (!title || !lab) return;
    setRecs([{ id: Date.now(), title, lab, date: 'Today' }, ...recs]);
    setIsModal(false); setTitle(''); setLab('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
        <button onClick={() => setIsModal(true)} className="bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Record</button>
      </div>
      {recs.map(r => (
        <div key={r.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">{r.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{r.lab} • {r.date}</p>
          </div>
          <button onClick={() => alert(`Downloading ${r.title}...`)} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full">📥</button>
        </div>
      ))}

      {isModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Medical Record</h3>
            <form onSubmit={addRec} className="space-y-4">
              <input type="text" required placeholder="Record Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
              <input type="text" required placeholder="Laboratory / Doctor" value={lab} onChange={e => setLab(e.target.value)} className="w-full border rounded-xl px-3.5 py-2.5" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModal(false)} className="flex-1 border py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Profile({ onLogout }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-slate-300 rounded-full mx-auto overflow-hidden mb-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sarah Johnson</h2>
        <p className="text-xs text-slate-400">Patient ID: #MC8829</p>
      </div>
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between text-sm"><span className="text-slate-500">Email</span><span className="font-medium">sarah.j@healthmail.com</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Phone</span><span className="font-medium">+1 (555) 012-3456</span></div>
      </div>
      <button onClick={onLogout} className="w-full bg-rose-50 border border-rose-100 text-rose-600 font-medium py-3 rounded-2xl shadow-sm">Logout Account</button>
    </div>
  );
}

function Settings({ onLogout }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Settings</h2>
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex justify-between items-center">
        <span className="font-medium text-sm">Push Notifications</span>
        <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-3 py-1 rounded-full">Enabled</span>
      </div>
      <button onClick={onLogout} className="w-full bg-rose-50 border border-rose-100 text-rose-600 font-medium py-3 rounded-2xl shadow-sm mt-6">Sign Out</button>
    </div>
  );
}

// ================= MAIN APP CONTAINER =================

export default function MedcareApp() {
  const [currentView, setCurrentView] = useState('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  if (currentView === 'login') {
    return <Login onLogin={() => navigateTo('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between p-4 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-teal-800">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-teal-800">Medcare</h1>
        </div>
        {currentView === 'profile' || currentView === 'settings' ? (
           <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
           </div>
        ) : (
          <button className="relative p-1 text-teal-800">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        )}
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-80 bg-slate-50 shadow-xl z-50 flex flex-col transition-transform transform translate-x-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 flex items-center gap-4 border-b border-slate-200">
               <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" />
               </div>
               <div>
                 <h2 className="font-bold text-lg">Sarah Johnson</h2>
                 <p className="text-sm text-slate-500">Patient ID: #MC8829</p>
               </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
              <SidebarItem icon={<Home size={20}/>} label="Dashboard" onClick={() => navigateTo('dashboard')} active={currentView === 'dashboard'} />
              <SidebarItem icon={<Pill size={20}/>} label="Medications" onClick={() => navigateTo('medications')} active={currentView === 'medications'} />
              <SidebarItem icon={<Syringe size={20}/>} label="Injections" onClick={() => navigateTo('injections')} active={currentView === 'injections'} />
              <SidebarItem icon={<Activity size={20}/>} label="Previous Diseases" onClick={() => navigateTo('records')} active={currentView === 'records'} />
              <SidebarItem icon={<FileText size={20}/>} label="Report" onClick={() => navigateTo('records')} active={false} />
              <SidebarItem icon={<Calendar size={20}/>} label="Appointments" onClick={() => navigateTo('appointments')} active={currentView === 'appointments'} />
              <SidebarItem icon={<FileClock size={20}/>} label="Alarms" onClick={() => navigateTo('alarms')} active={currentView === 'alarms'} />
              
              <div className="pt-6 mt-6 border-t border-slate-200 space-y-2">
                <SidebarItem icon={<User size={20}/>} label="Profile" onClick={() => navigateTo('profile')} active={currentView === 'profile'} />
                <SidebarItem icon={<SettingsIcon size={20}/>} label="Settings" onClick={() => navigateTo('settings')} active={currentView === 'settings'} />
              </div>
            </nav>

            <div className="p-4">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-teal-700 text-teal-700 rounded-xl hover:bg-teal-50 font-medium"
              >
                <X size={20} /> Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-6 max-w-4xl mx-auto">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'appointments' && <Appointments />}
        {currentView === 'alarms' && <Alarms />}
        {currentView === 'medications' && <Medications />}
        {currentView === 'injections' && <Injections />}
        {currentView === 'records' && <Records />}
        {currentView === 'profile' && <Profile onLogout={() => navigateTo('login')} />}
        {currentView === 'settings' && <Settings onLogout={() => navigateTo('login')} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-slate-50 border-t border-slate-200 flex justify-around p-3 z-15 pb-6">
        <BottomNavItem icon={<Home size={22} />} label="Home" active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
        <BottomNavItem icon={<Calendar size={22} />} label="Appointments" active={currentView === 'appointments'} onClick={() => navigateTo('appointments')} />
        <BottomNavItem icon={<BriefcaseMedical size={22} />} label="Health" active={currentView === 'medications' || currentView === 'injections'} onClick={() => navigateTo('medications')} />
        <BottomNavItem icon={<FileText size={22} />} label="Records" active={currentView === 'records'} onClick={() => navigateTo('records')} />
      </nav>
    </div>
  );
}