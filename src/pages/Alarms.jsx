import React from 'react';
import { Clock, CheckCircle, Plus, Calendar, Pill } from 'lucide-react';

export default function Alarms() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500 mb-1">Thursday, Oct 24</p>
        <h2 className="text-3xl font-bold">Medication Reminders</h2>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-teal-800 text-white rounded-2xl p-4 shadow-sm">
          <Clock className="mb-2" size={24} />
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs opacity-80">Active Today</p>
        </div>
        <div className="flex-1 bg-slate-200 text-slate-700 rounded-2xl p-4 shadow-sm">
          <CheckCircle className="mb-2" size={24} />
          <p className="text-2xl font-bold">1</p>
          <p className="text-xs opacity-80">Completed</p>
        </div>
      </div>

      <div className="space-y-4">
        <ReminderCard 
          type="Daily Dose" 
          time="08:00 AM" 
          desc="Metformin 500mg" 
          active={true} 
        />
        <ReminderCard 
          type="Appointment" 
          time="12:30 PM" 
          desc="Cardiology Check-up" 
          active={true} 
          icon={<Calendar size={12} />}
        />
        <ReminderCard 
          type="Daily Dose" 
          time="09:00 PM" 
          desc="Atorvastatin 20mg" 
          active={false} 
        />
      </div>

      <button className="w-full border border-dashed border-teal-800 text-teal-800 rounded-2xl p-4 flex items-center justify-center gap-2">
        <Clock size={18} />
        <span className="font-medium">Set New Reminder</span>
      </button>
      
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-teal-800 text-white rounded-full flex items-center justify-center shadow-lg">
        <Plus size={24} />
      </button>
    </div>
  );
}

// Sub-component specifically for the Alarms page
function ReminderCard({ type, time, desc, active, icon = <Pill size={12} /> }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
          {icon} {type}
        </p>
        <p className="text-2xl font-light text-slate-800">{time.split(' ')[0]} <span className="text-sm">{time.split(' ')[1]}</span></p>
        <p className="text-sm text-slate-600 mt-1">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${active ? 'bg-teal-800' : 'bg-slate-200'}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}