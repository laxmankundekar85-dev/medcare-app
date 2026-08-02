import React from 'react';
import { User, Activity, FileText, ChevronRight, Plus } from 'lucide-react';
import { StatCard } from '../components/ui/Cards';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Good morning, Sarah.</h2>
        <p className="text-slate-500">Your vitals look great today.</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-500 tracking-wider">HEALTH OVERVIEW</h3>
          <a href="#" className="text-sm text-teal-700 flex items-center gap-1">View Trends <ChevronRight size={16}/></a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          <StatCard icon={<User size={16}/>} label="WEIGHT" value="64" unit="kg" />
          <StatCard icon={<Activity size={16}/>} label="HEIGHT" value="175" unit="cm" />
          <StatCard icon={<FileText size={16}/>} label="BMI" value="20.9" unit="" />
        </div>
      </div>

      <div className="bg-slate-100 rounded-3xl p-5">
        <h3 className="font-bold mb-1">Heart Rate Activity</h3>
        <p className="text-xs text-slate-500 mb-4">Real-time monitoring</p>
        <div className="h-32 flex items-end gap-1">
           {[30, 40, 25, 50, 45, 60, 20, 35, 40, 70].map((h, i) => (
             <div key={i} className="flex-1 bg-teal-600/60 rounded-t-lg" style={{ height: `${h}%` }}></div>
           ))}
        </div>
      </div>

      <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-teal-800 text-white rounded-full"><Activity size={20} /></div>
          <h3 className="font-bold">Health Insight</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">You've achieved 85% of goals this week. 10 more mins of walking can stabilize heart variability.</p>
        <button className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">Full Report</button>
      </div>

      <button className="fixed bottom-24 right-6 w-14 h-14 bg-teal-800 text-white rounded-full flex items-center justify-center shadow-lg">
        <Plus size={24} />
      </button>
    </div>
  );
}