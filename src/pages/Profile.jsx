import React from 'react';
import { LogOut } from 'lucide-react';

export default function Profile({ onLogout }) {
  return (
    <div className="space-y-6">
      <div className="bg-teal-800 h-32 rounded-t-3xl relative mb-12">
         <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-slate-50 bg-slate-300 overflow-hidden relative">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" className="w-full h-full object-cover" />
            </div>
         </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold">Alex River</h2>
        <p className="text-sm text-slate-500">Patient ID: #MC-98442</p>
      </div>
      
      <div className="flex gap-4 justify-center">
        <div className="border border-slate-200 bg-white rounded-xl p-4 text-center w-24">
           <p className="text-xs text-slate-500 mb-1">Blood Group</p>
           <p className="font-bold text-teal-800 text-lg">O+</p>
        </div>
        <div className="border border-slate-200 bg-white rounded-xl p-4 text-center w-24">
           <p className="text-xs text-slate-500 mb-1">Age</p>
           <p className="font-bold text-teal-800 text-lg">29</p>
        </div>
      </div>

      <button onClick={onLogout} className="w-full bg-red-100 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-8">
         <LogOut size={20} /> Logout Account
      </button>
    </div>
  );
}