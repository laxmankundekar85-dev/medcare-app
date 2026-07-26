import React from 'react';
import { BriefcaseMedical, Plus } from 'lucide-react';
import { MedCard } from '../components/ui/Cards';

export default function Medications() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Your Medications</h2>
        <p className="text-slate-500">Manage your current prescriptions and daily schedule.</p>
      </div>

      <div className="bg-teal-800 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm opacity-80 mb-1">Daily Adherence</p>
          <h3 className="text-2xl font-bold mb-4">85% Complete</h3>
          <div className="h-2 bg-teal-900 rounded-full mb-3">
            <div className="h-full bg-teal-300 rounded-full" style={{width: '85%'}}></div>
          </div>
          <p className="text-xs opacity-80">1 dose remaining for today.</p>
        </div>
        <BriefcaseMedical className="absolute -right-4 -bottom-4 text-teal-700 opacity-50 w-32 h-32" />
      </div>

      <div className="space-y-3">
        <MedCard name="Metformin" dosage="500mg • Twice daily" time="Next: 8:00 PM" status="Active" color="bg-blue-100" />
        <MedCard name="Lisinopril" dosage="10mg • Once daily" time="Taken: 09:15 AM" status="Active" color="bg-red-100" taken />
        <MedCard name="Atorvastatin" dosage="20mg • At bedtime" time="Next: 10:30 PM" status="Upcoming" color="bg-teal-100" />
      </div>

      <button className="w-full border border-dashed border-slate-300 rounded-2xl p-4 flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center"><Plus size={16}/></div>
          <span>Add new medication</span>
        </div>
        <span className="bg-teal-800 text-white text-xs px-3 py-1 rounded-full">Add</span>
      </button>
    </div>
  );
}