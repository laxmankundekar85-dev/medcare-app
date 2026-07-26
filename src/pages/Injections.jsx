import React from 'react';
import { Syringe } from 'lucide-react';

export default function Injections() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Injections</h2>
        <p className="text-slate-500">Manage and track your immunizations.</p>
      </div>
      <div className="bg-white border border-teal-800 rounded-2xl p-5 border-l-8">
         <div className="flex justify-between items-start mb-4">
           <div className="flex gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Syringe size={24}/></div>
              <div>
                <h3 className="font-bold text-lg">Influenza Vaccine</h3>
                <p className="text-xs text-slate-500">Oct 24, 2023 • 09:30 AM</p>
              </div>
           </div>
           <span className="bg-teal-800 text-white text-xs px-2 py-1 rounded-lg">Confirmed</span>
         </div>
         <div className="flex gap-2">
           <button className="flex-1 bg-teal-800 text-white py-2 rounded-xl text-sm">Details</button>
           <button className="flex-1 border border-teal-800 text-teal-800 py-2 rounded-xl text-sm">Reschedule</button>
         </div>
      </div>
    </div>
  );
}