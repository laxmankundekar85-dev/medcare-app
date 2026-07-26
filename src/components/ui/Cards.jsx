import React from 'react';
import { Pill, FileClock, Activity, ChevronRight } from 'lucide-react';

export function StatCard({ icon, label, value, unit }) {
  return (
    <div className="min-w-[100px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex-1">
      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">
        {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </p>
    </div>
  );
}

export function MedCard({ name, dosage, time, status, color, taken }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-slate-700`}>
        <Pill size={24} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-slate-800">{name}</h4>
          <span className={`text-[10px] px-2 py-1 rounded-full ${status === 'Active' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-slate-500">{dosage}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
          <FileClock size={12}/> {time} {taken && '✓'}
        </p>
      </div>
    </div>
  );
}

export function TimelineItem({ year, title, date, desc, status }) {
  return (
    <div className="relative">
      <div className="absolute -left-10 top-0 w-8 h-8 bg-teal-800 rounded-full flex items-center justify-center text-white border-4 border-slate-50">
        <Activity size={14}/>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between mb-2">
           <h4 className="font-bold text-lg">{title}</h4>
           <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg">{status}</span>
        </div>
        <p className="text-sm text-slate-500 mb-2">{date}</p>
        <p className="text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

export function SettingsRow({ icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">{icon}</div>
        <div>
           <p className="font-bold text-slate-800">{title}</p>
           <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-slate-400" />
    </div>
  );
}