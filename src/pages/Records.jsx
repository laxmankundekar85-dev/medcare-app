import React from 'react';
import { FileClock, Activity } from 'lucide-react';
import { TimelineItem } from '../components/ui/Cards';

export default function Records() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Medical History</h2>
        <p className="text-slate-500">A comprehensive timeline of your past conditions.</p>
      </div>
      <div className="flex gap-4">
         <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <FileClock className="text-teal-800 mb-2"/>
            <p className="text-xs text-slate-500">Total Records</p>
            <p className="text-xl font-bold text-teal-800">12</p>
         </div>
         <div className="flex-1 bg-teal-50 border border-teal-100 rounded-2xl p-4 shadow-sm">
            <Activity className="text-teal-600 mb-2"/>
            <p className="text-xs text-teal-600">Recovered</p>
            <p className="text-xl font-bold text-teal-800">10</p>
         </div>
      </div>
      
      <div className="relative pl-6 border-l-2 border-dashed border-slate-200 space-y-8 mt-4">
         <TimelineItem year="2023" title="Acute Bronchitis" date="Oct 12 - Oct 28" doc="Dr. Alex River" status="Recovered" desc="Diagnosed following severe seasonal flu. Responded well to..." />
         <TimelineItem year="2023" title="Ankle Sprain (Grade II)" date="Jun 05 - Jul 20" doc="" status="Recovered" desc="Lateral ligament injury sustained during sports activity." />
      </div>
    </div>
  );
}