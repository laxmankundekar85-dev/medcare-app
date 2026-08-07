import React from 'react';
import NotificationDropdown from '../NotificationDropdown';

export function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        active ? 'bg-teal-50 text-teal-800 font-medium' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function BottomNavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 ${active ? 'text-teal-800' : 'text-slate-400'}`}
    >
      {React.cloneElement(icon, { size: 24, className: active ? 'fill-teal-100' : '' })}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// Top Navbar Header Component containing the live Notification Dropdown
export default function NavigationHeader({ patientName = "Laxman" }) {
  return (
    <header className="w-full bg-white border-b border-slate-100 px-6 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-teal-900 tracking-tight">Medcare</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Notification Dropdown */}
        <NotificationDropdown />

        {/* User Avatar */}
        <div className="w-9 h-9 bg-teal-800 text-white font-bold rounded-full flex items-center justify-center text-sm shadow-sm">
          {patientName.charAt(0)}
        </div>
      </div>
    </header>
  );
}