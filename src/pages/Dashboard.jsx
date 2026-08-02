import React, { useState } from 'react';
import { User, Activity, FileText, ChevronRight, Plus } from 'lucide-react';
import { StatCard } from '../components/ui/Cards';

export default function Dashboard() {
  // Vitals state to make weight, height, and BMI fully interactive and update dynamically
  const [weight, setWeight] = useState(64);
  const [height, setHeight] = useState(175);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  // Calculate dynamic BMI: weight (kg) / [height (m)]^2
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

  // Quick action states for the floating action button
  const handleQuickAction = (action) => {
    setIsFabMenuOpen(false);
    if (action === 'vitals') {
      setIsVitalsModalOpen(true);
    } else if (action === 'appointment') {
      alert('Opening new appointment scheduler...');
    } else if (action === 'record') {
      alert('Redirecting to upload/add record...');
    }
  };

  return (
    <div className="space-y-6 pb-24 relative" onClick={() => setIsFabMenuOpen(false)}>
      <div>
        <h2 className="text-3xl font-bold">Good morning, Laxman.</h2>
        <p className="text-slate-500">Your vitals look great today.</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-500 tracking-wider">HEALTH OVERVIEW</h3>
          <a href="#" className="text-sm text-teal-700 flex items-center gap-1">View Trends <ChevronRight size={16}/></a>
        </div>
        
        {/* Clickable StatCards to trigger Vitals update */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div onClick={() => setIsVitalsModalOpen(true)} className="cursor-pointer flex-1">
            <StatCard icon={<User size={16}/>} label="WEIGHT" value={weight} unit="kg" />
          </div>
          <div onClick={() => setIsVitalsModalOpen(true)} className="cursor-pointer flex-1">
            <StatCard icon={<Activity size={16}/>} label="HEIGHT" value={height} unit="cm" />
          </div>
          <div onClick={() => setIsVitalsModalOpen(true)} className="cursor-pointer flex-1">
            <StatCard icon={<FileText size={16}/>} label="BMI" value={bmi} unit="" />
          </div>
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

      {/* Floating Action Button & Popup Menu */}
      <div className="fixed bottom-24 right-6 z-50">
        {isFabMenuOpen && (
          <div className="absolute bottom-16 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-48 space-y-1 mb-2">
            <button 
              onClick={() => handleQuickAction('vitals')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl transition flex items-center gap-2"
            >
              <span>⚖️ Update Weight/BMI</span>
            </button>
            <button 
              onClick={() => handleQuickAction('record')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl transition flex items-center gap-2"
            >
              <span>📄 Add Medical Record</span>
            </button>
            <button 
              onClick={() => handleQuickAction('appointment')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl transition flex items-center gap-2"
            >
              <span>📅 Book Appointment</span>
            </button>
          </div>
        )}

        <button 
          onClick={(e) => { e.stopPropagation(); setIsFabMenuOpen(!isFabMenuOpen); }}
          className="w-14 h-14 bg-teal-800 hover:bg-teal-900 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105 active:scale-95"
        >
          <Plus size={24} className={`transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Edit Vitals Modal */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Update Vitals</h3>
              <button 
                onClick={() => setIsVitalsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl text-center">
                <span className="text-xs text-teal-800 font-semibold">Calculated BMI: <strong>{bmi}</strong></span>
              </div>

              <button
                onClick={() => setIsVitalsModalOpen(false)}
                className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}