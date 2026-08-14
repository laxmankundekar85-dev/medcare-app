import React, { useState, useEffect } from 'react';
import { User, Activity, FileText, ChevronRight, Plus, Bot, Sparkles } from 'lucide-react';
import { StatCard } from '../components/ui/Cards';
import { API_BASE_URL } from '../config';
import { getUserId, getCacheKey } from '../utils/user';

export default function Dashboard({ onNavigate }) {
  const userId = getUserId();

  // Helper to read the current logged-in user dynamically from localStorage
  const getStoredUserInfo = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u) {
        const resolvedName = u.displayName || (u.email ? u.email.split('@')[0] : 'Patient');
        const resolvedId = u.uid ? `#MC${u.uid.slice(-4).toUpperCase()}` : '#MC1001';
        return { name: resolvedName, id: resolvedId };
      }
    } catch (e) {
      console.warn('Could not parse user from localStorage:', e);
    }
    return { name: 'Patient', id: '#MC1001' };
  };

  const initialUser = getStoredUserInfo();

  // Read immediately from LocalStorage for instant load & offline resilience (User Scoped)
  const [weight, setWeight] = useState(() => {
    return Number(localStorage.getItem(getCacheKey('userWeight'))) || 60;
  });
  const [height, setHeight] = useState(() => {
    return Number(localStorage.getItem(getCacheKey('userHeight'))) || 181;
  });

  const [patientName, setPatientName] = useState(() => {
    return localStorage.getItem(getCacheKey('patientName')) || initialUser.name;
  });
  
  const [patientId, setPatientId] = useState(() => {
    return localStorage.getItem(getCacheKey('patientId')) || initialUser.id;
  });

  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [tempName, setTempName] = useState(patientName);
  const [tempId, setTempId] = useState(patientId);

  const [medications, setMedications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('cached_medications'))) || [];
    } catch {
      return [];
    }
  });

  const [appointments, setAppointments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('cached_appointments'))) || [];
    } catch {
      return [];
    }
  });

  const [alarms, setAlarms] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('cached_alarms'))) || [];
    } catch {
      return [];
    }
  });

  const [injections, setInjections] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('cached_injections'))) || [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync user info if active userId changes
  useEffect(() => {
    if (!userId || userId === 'guest_user') return;
    
    const currentUser = getStoredUserInfo();
    setPatientName(localStorage.getItem(getCacheKey('patientName')) || currentUser.name);
    setPatientId(localStorage.getItem(getCacheKey('patientId')) || currentUser.id);

    fetchDashboardData();
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.weight) {
          setWeight(Number(data.weight));
          localStorage.setItem(getCacheKey('userWeight'), String(data.weight));
        }
        if (data.height) {
          setHeight(Number(data.height));
          localStorage.setItem(getCacheKey('userHeight'), String(data.height));
        }
        if (data.fullName) {
          setPatientName(data.fullName);
          setTempName(data.fullName);
          localStorage.setItem(getCacheKey('patientName'), data.fullName);
        }
        if (data.patientId) {
          setPatientId(data.patientId);
          setTempId(data.patientId);
          localStorage.setItem(getCacheKey('patientId'), data.patientId);
        }
      }
    } catch (error) {
      console.warn('Error fetching profile data, retaining cached values:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [medRes, apptRes, alarmRes, injRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/medications/${userId}`),
        fetch(`${API_BASE_URL}/api/appointments/${userId}`),
        fetch(`${API_BASE_URL}/api/alarms/${userId}`),
        fetch(`${API_BASE_URL}/api/injections/${userId}`)
      ]);

      if (medRes.ok) {
        const medData = await medRes.json();
        setMedications(medData);
        localStorage.setItem(getCacheKey('cached_medications'), JSON.stringify(medData));
      }
      if (apptRes.ok) {
        const apptData = await apptRes.json();
        setAppointments(apptData);
        localStorage.setItem(getCacheKey('cached_appointments'), JSON.stringify(apptData));
      }
      if (alarmRes.ok) {
        const alarmData = await alarmRes.json();
        setAlarms(alarmData);
        localStorage.setItem(getCacheKey('cached_alarms'), JSON.stringify(alarmData));
      }
      if (injRes.ok) {
        const injData = await injRes.json();
        setInjections(injData);
        localStorage.setItem(getCacheKey('cached_injections'), JSON.stringify(injData));
      }
    } catch (error) {
      console.warn('Error loading dashboard metrics, using local cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const heightInMeters = height / 100;
  const bmi = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : '18.3';

  const totalMeds = medications.length;
  const takenMeds = medications.filter(m => m.status === 'Taken' || m.status === 'Completed').length;
  const medProgress = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;
  const activeAlarmsCount = alarms.filter(a => a.isEnabled !== false && a.active !== false).length;

  const handleQuickAction = (action) => {
    setIsFabMenuOpen(false);
    if (action === 'chatbot') {
      if (onNavigate) onNavigate('chatbot');
    } else if (action === 'vitals') {
      setIsVitalsModalOpen(true);
    } else if (action === 'appointment') {
      alert('Opening new appointment scheduler...');
    } else if (action === 'record') {
      alert('Redirecting to upload/add record...');
    } else if (action === 'profile') {
      setTempName(patientName);
      setTempId(patientId);
      setIsProfileModalOpen(true);
    }
  };

  const handleSaveVitals = async (e) => {
    if (e) e.preventDefault();

    localStorage.setItem(getCacheKey('userWeight'), String(weight));
    localStorage.setItem(getCacheKey('userHeight'), String(height));
    setIsVitalsModalOpen(false);

    try {
      await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: patientName,
          patientId: patientId,
          weight: Number(weight),
          height: Number(height)
        })
      });
    } catch (error) {
      console.error('Error saving vitals to server:', error);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!tempName || !tempId) return;

    setPatientName(tempName);
    setPatientId(tempId);
    localStorage.setItem(getCacheKey('patientName'), tempName);
    localStorage.setItem(getCacheKey('patientId'), tempId);
    setIsProfileModalOpen(false);

    try {
      await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: tempName,
          patientId: tempId,
          weight: Number(weight),
          height: Number(height)
        })
      });
    } catch (error) {
      console.error('Error saving profile to server:', error);
    }
  };

  return (
    <div className="space-y-6 pb-28 relative font-sans" onClick={() => setIsFabMenuOpen(false)}>
      {/* Top Banner Card */}
      <div className="flex justify-between items-start bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Good morning, {patientName}.</h2>
          <p className="text-slate-500 mt-0.5">
            Your vitals look great today. 
            <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md ml-1">{patientId}</span>
          </p>
        </div>
        
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setTempName(patientName); 
            setTempId(patientId); 
            setIsProfileModalOpen(true);
          }}
          className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-center">
          <span className="text-2xl">💊</span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">{totalMeds}</h3>
          <p className="text-xs text-slate-500 font-medium">Medications ({medProgress}% Done)</p>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-center">
          <span className="text-2xl">🩺</span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">{appointments.length}</h3>
          <p className="text-xs text-slate-500 font-medium">Appointments</p>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-center">
          <span className="text-2xl">⏰</span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">{activeAlarmsCount}</h3>
          <p className="text-xs text-slate-500 font-medium">Active Reminders</p>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-center">
          <span className="text-2xl">💉</span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">{injections.length}</h3>
          <p className="text-xs text-slate-500 font-medium">Injections</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-500 tracking-wider">HEALTH OVERVIEW</h3>
          <a href="#" className="text-sm text-teal-700 font-semibold flex items-center gap-1 hover:underline">
            View Trends <ChevronRight size={16}/>
          </a>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div onClick={() => setIsVitalsModalOpen(true)} className="cursor-pointer flex-1 min-w-[120px]">
            <StatCard icon={<User size={16}/>} label="WEIGHT" value={weight} unit="kg" />
          </div>
          <div onClick={() => setIsVitalsModalOpen(true)} className="cursor-pointer flex-1 min-w-[120px]">
            <StatCard icon={<Activity size={16}/>} label="HEIGHT" value={height} unit="cm" />
          </div>
          <div onClick={() => setIsVitalsModalOpen(true)} className="cursor-pointer flex-1 min-w-[120px]">
            <StatCard icon={<FileText size={16}/>} label="BMI" value={bmi} unit="" />
          </div>
        </div>
      </div>

      <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-1">Heart Rate Activity</h3>
        <p className="text-xs text-slate-500 mb-4">Real-time monitoring</p>
        <div className="h-32 flex items-end gap-1">
          {[30, 40, 25, 50, 45, 60, 20, 35, 40, 70].map((h, i) => (
            <div key={i} className="flex-1 bg-teal-600/60 rounded-t-lg transition-all duration-300 hover:bg-teal-700" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>

      <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-teal-800 text-white rounded-full"><Activity size={20} /></div>
          <h3 className="font-bold text-slate-900">Health Insight</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">You've achieved 85% of goals this week. 10 more mins of walking can stabilize heart variability.</p>
        <button 
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
        >
          Full Report
        </button>
      </div>

      {/* Floating Action Control */}
      <div className="fixed bottom-20 right-5 z-40" onClick={(e) => e.stopPropagation()}>
        {/* Expanded Quick Action & AI Menu */}
        {isFabMenuOpen && (
          <div className="absolute bottom-16 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 w-56 space-y-1 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Featured AI Assistant Option */}
            <button 
              type="button" 
              onClick={() => handleQuickAction('chatbot')}
              className="w-full text-left px-3 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center gap-2.5 cursor-pointer border border-emerald-100"
            >
              <Bot size={18} className="text-emerald-700" />
              <span className="flex-1">Ask AI Assistant</span>
              <Sparkles size={14} className="text-amber-500 fill-amber-400" />
            </button>

            <div className="border-t border-slate-100 my-1"></div>

            <button 
              type="button" 
              onClick={() => handleQuickAction('profile')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <span>👤 Edit Profile & ID</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickAction('vitals')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <span>⚖️ Update Weight/BMI</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickAction('record')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <span>📄 Add Medical Record</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickAction('appointment')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <span>📅 Book Appointment</span>
            </button>
          </div>
        )}

        {/* Primary Floating Action Button */}
        <button 
          type="button" 
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className="w-14 h-14 bg-teal-800 hover:bg-teal-900 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white transition transform active:scale-95 cursor-pointer"
          title="Quick Actions & AI"
        >
          <Plus size={26} className={`transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Vitals Modal */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Update Vitals</h3>
              <button 
                type="button" 
                onClick={() => setIsVitalsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl text-center">
                <span className="text-xs text-teal-800 font-semibold">Calculated BMI: <strong>{bmi}</strong></span>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button 
                type="button" 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  required
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Weekly Health Report</h3>
                <p className="text-xs text-slate-400">Patient: {patientName} ({patientId})</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-teal-50 border border-teal-100 p-3.5 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-medium text-slate-700">Weekly Progress</span>
                <span className="text-sm font-bold text-teal-800">85% Completed</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-medium text-slate-700">Active Prescriptions</span>
                <span className="text-sm font-bold text-slate-900">{medications.length} Active</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-medium text-slate-700">Calculated BMI</span>
                <span className="text-sm font-bold text-slate-900">{bmi}</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-medium text-slate-700">Scheduled Appointments</span>
                <span className="text-sm font-bold text-slate-900">{appointments.length} Upcoming</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              💡 <strong>Recommendation:</strong> Maintaining a balanced routine with an additional 10 minutes of light exercise per day will support cardiovascular stability.
            </p>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-semibold transition text-sm cursor-pointer shadow"
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}