import React, { useState } from 'react';
import { 
  Menu, Bell, X, Home, Calendar, BriefcaseMedical, FileText, 
  User, Settings as SettingsIcon, Pill, Syringe, 
  Activity, FileClock
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Top Header */}
      <header className="flex items-center justify-between p-4 bg-slate-50 sticky top-0 z-10">
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
              <SidebarItem icon={<FileText size={20}/>} label="Report" onClick={() => navigateTo('records')} />
              <SidebarItem icon={<Calendar size={20}/>} label="Appointments" onClick={() => navigateTo('appointments')} />
              <SidebarItem icon={<FileClock size={20}/>} label="Alarms" onClick={() => navigateTo('alarms')} active={currentView === 'alarms'} />
              
              <div className="pt-6 mt-6 border-t border-slate-200 space-y-2">
                <SidebarItem icon={<User size={20}/>} label="Profile" onClick={() => navigateTo('profile')} active={currentView === 'profile'} />
                <SidebarItem icon={<SettingsIcon size={20}/>} label="Settings" onClick={() => navigateTo('settings')} active={currentView === 'settings'} />
              </div>
            </nav>

            <div className="p-4">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-teal-700 text-teal-700 rounded-xl hover:bg-teal-50"
              >
                <X size={20} /> Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-4">
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
      <nav className="fixed bottom-0 w-full bg-slate-50 border-t border-slate-200 flex justify-around p-3 z-10 pb-6">
        <BottomNavItem icon={<Home />} label="Home" active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
        <BottomNavItem icon={<Calendar />} label="Appointments" active={currentView === 'appointments'} onClick={() => navigateTo('appointments')} />
        <BottomNavItem icon={<BriefcaseMedical />} label="Health" active={currentView === 'medications' || currentView === 'injections'} onClick={() => navigateTo('medications')} />
        <BottomNavItem icon={<FileText />} label="Records" active={currentView === 'records'} onClick={() => navigateTo('records')} />
      </nav>
    </div>
  );
}