import React from 'react';
import { Bell, Lock, User, LogOut } from 'lucide-react';
import { SettingsRow } from '../components/ui/Cards';

export default function Settings({ onLogout }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
         <SettingsRow icon={<Bell size={20}/>} title="Notifications" subtitle="Alerts, sounds, reminders" />
         <SettingsRow icon={<Lock size={20}/>} title="Privacy" subtitle="Data sharing, visibility" />
         <SettingsRow icon={<User size={20}/>} title="Security" subtitle="Password, 2FA, biometric" />
      </div>
      <button onClick={onLogout} className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-medium flex justify-center items-center gap-2">
         <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}