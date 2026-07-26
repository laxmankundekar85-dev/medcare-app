import React from 'react';

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