import React from 'react';
import { Calendar } from 'lucide-react';

export default function Appointments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Appointments</h2>
        <p className="text-slate-500">Manage your upcoming doctor visits.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm mt-10">
        <div className="w-16 h-16 bg-teal-50 text-teal-800 rounded-full flex items-center justify-center mb-4">
          <Calendar size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Upcoming Appointments</h3>
        <p className="text-sm text-slate-500 mb-6">You don't have any appointments scheduled at the moment.</p>
        <button className="bg-teal-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-900 transition-colors">
          Book New Appointment
        </button>
      </div>
    </div>
  );
}