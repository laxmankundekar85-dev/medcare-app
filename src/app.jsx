import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, X, Home, Calendar, BriefcaseMedical, FileText, 
  User, Settings as SettingsIcon, Pill, Syringe, 
  Activity, FileClock, Bot
} from 'lucide-react';

// Import Layout Components
import { SidebarItem, BottomNavItem } from './components/layout/Navigation';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import Injections from './pages/Injections';
import Records from './pages/Records';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Appointments from './pages/Appointments';
import Alarms from './pages/Alarms';
import PreviousDiseases from './pages/PreviousDiseases';
import Chatbot from './pages/Chatbot';

import { API_BASE_URL } from './config';

export default function MedcareApp() {
  const [currentView, setCurrentView] = useState('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reference for notification container to handle clicking outside
  const notificationRef = useRef(null);

  // =========================================================
  // BACKGROUND WAKEUP PING FOR RENDER FREE TIER
  // =========================================================
  useEffect(() => {
    // Fire a silent background ping when App loads to wake up Render
    fetch(`${API_BASE_URL}/api/ping`, { method: 'GET' })
      .catch(() => {
        // Silent catch for background ping
      });
  }, []);

  // Helper to read current logged-in user ID
  const getCurrentUserId = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      return stored?.uid || stored?.email || 'guest_user';
    } catch {
      return 'guest_user';
    }
  };

  // Dynamic User State from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // Avatar State scoped per user ID
  const [userAvatar, setUserAvatar] = useState(() => {
    const uid = getCurrentUserId();
    return localStorage.getItem(`userAvatar_${uid}`) || localStorage.getItem(`cached_userAvatar_${uid}`) || null;
  });

  // Fetch avatar & profile from MongoDB and synchronize whenever user session changes
  useEffect(() => {
    const loadUserAndAvatar = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
          const uid = storedUser.uid || storedUser.email || 'guest_user';

          // Try loading local cache first for instant load
          const cachedAvatar = localStorage.getItem(`userAvatar_${uid}`) || localStorage.getItem(`cached_userAvatar_${uid}`);
          if (cachedAvatar) setUserAvatar(cachedAvatar);

          // Fetch fresh profile from MongoDB server
          if (uid !== 'guest_user') {
            const res = await fetch(`${API_BASE_URL}/api/profile/${uid}`);
            if (res.ok) {
              const profileData = await res.json();
              if (profileData.avatar) {
                setUserAvatar(profileData.avatar);
                localStorage.setItem(`userAvatar_${uid}`, profileData.avatar);
              }
            }
          }
        } else {
          setUser(null);
          setUserAvatar(null);
        }
      } catch (e) {
        console.error('Error loading user data or avatar:', e);
      }
    };

    loadUserAndAvatar();
  }, [currentView]);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Medication Reminder', desc: 'Time to take Metformin 500mg', time: '10m ago' },
    { id: 2, title: 'Appointment Confirmed', desc: 'Dr. Alex River on Aug 12, 2026', time: '1h ago' },
    { id: 3, title: 'Health Report Ready', desc: 'Your weekly progress report is available', time: '1d ago' }
  ]);

  // =========================================================
  // CLOSE NOTIFICATION DROPDOWN ON OUTSIDE CLICK
  // =========================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    setHasUnread(false);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
    setShowNotifications(false);
  };

  // Safely purge session and active UI cache without destroying stored per-user avatars
  const handleLogout = () => {
    localStorage.removeItem('user');
    
    // Clean active session caches, while leaving userAvatar_[UID] safe
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('cached_') || 
        key.startsWith('user_profile_cache')
      ) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
    setUserAvatar(null);
    navigateTo('login');
  };

  if (currentView === 'login') {
    return <Login onLogin={() => navigateTo('dashboard')} />;
  }

  const userDisplayName = user?.displayName || 'Patient';
  const userPatientId = user?.patientId || '#MC8829';
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userDisplayName)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 relative">
      {/* Top Header */}
      <header className="flex items-center justify-between p-4 bg-slate-50 sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-teal-800 cursor-pointer">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-teal-800">Medcare</h1>
        </div>

        {currentView === 'profile' || currentView === 'settings' ? (
          <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden border border-slate-200">
            <img src={userAvatar || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          /* Wrapped container with ref to detect outside clicks */
          <div className="relative" ref={notificationRef}>
            {/* Clickable Notification Button */}
            <button onClick={handleOpenNotifications} className="relative p-1 text-teal-800 hover:bg-teal-50 rounded-full transition cursor-pointer">
              <Bell size={24} />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50"></span>
              )}
            </button>

            {/* Notification Dropdown Box */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 text-left">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                  {notifications.length > 0 && (
                    <button onClick={handleClearNotifications} className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:bg-teal-50/50 transition">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
              <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden border border-slate-200 shrink-0">
                <img src={userAvatar || defaultAvatar} alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{userDisplayName}</h2>
                <p className="text-sm text-slate-500">Patient ID: {userPatientId}</p>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
              <SidebarItem icon={<Home size={20}/>} label="Dashboard" onClick={() => navigateTo('dashboard')} active={currentView === 'dashboard'} />
              <SidebarItem icon={<Bot size={20}/>} label="AI Assistant" onClick={() => navigateTo('chatbot')} active={currentView === 'chatbot'} />
              <SidebarItem icon={<Pill size={20}/>} label="Medications" onClick={() => navigateTo('medications')} active={currentView === 'medications'} />
              <SidebarItem icon={<Syringe size={20}/>} label="Injections" onClick={() => navigateTo('injections')} active={currentView === 'injections'} />
              <SidebarItem icon={<Activity size={20}/>} label="Previous Diseases" onClick={() => navigateTo('diseases')} active={currentView === 'diseases'} />
              <SidebarItem icon={<FileText size={20}/>} label="Report" onClick={() => navigateTo('records')} active={currentView === 'records'} />
              <SidebarItem icon={<Calendar size={20}/>} label="Appointments" onClick={() => navigateTo('appointments')} active={currentView === 'appointments'} />
              <SidebarItem icon={<FileClock size={20}/>} label="Alarms" onClick={() => navigateTo('alarms')} active={currentView === 'alarms'} />
              
              <div className="pt-6 mt-6 border-t border-slate-200 space-y-2">
                <SidebarItem icon={<User size={20}/>} label="Profile" onClick={() => navigateTo('profile')} active={currentView === 'profile'} />
                <SidebarItem icon={<SettingsIcon size={20}/>} label="Settings" onClick={() => navigateTo('settings')} active={currentView === 'settings'} />
              </div>
            </nav>

            <div className="p-4">
              <button 
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-teal-700 text-teal-700 rounded-xl hover:bg-teal-50 cursor-pointer"
              >
                <X size={20} /> Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-4">
        {currentView === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
        {currentView === 'chatbot' && <Chatbot />}
        {currentView === 'appointments' && <Appointments />}
        {currentView === 'alarms' && <Alarms />}
        {currentView === 'medications' && <Medications />}
        {currentView === 'injections' && <Injections />}
        {currentView === 'records' && <Records />}
        {currentView === 'diseases' && <PreviousDiseases />}
        {currentView === 'profile' && <Profile onLogout={handleLogout} />}
        {currentView === 'settings' && <Settings onLogout={handleLogout} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-slate-50 border-t border-slate-200 flex justify-around p-3 z-10 pb-6">
        <BottomNavItem icon={<Home />} label="Home" active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
        <BottomNavItem icon={<Calendar />} label="Appointments" active={currentView === 'appointments'} onClick={() => navigateTo('appointments')} />
        <BottomNavItem icon={<BriefcaseMedical />} label="Health" active={currentView === 'medications' || currentView === 'injections'} onClick={() => navigateTo('medications')} />
        <BottomNavItem icon={<FileText />} label="Records" active={currentView === 'records'} onClick={() => navigateTo('records')} />
      </nav>
    </div>
  );
}