import React, { useState } from 'react';

export default function PreviousDiseases() {
  const [diseases, setDiseases] = useState([
    { id: 1, name: 'Seasonal Allergic Rhinitis', diagnosed: 'March 2024', status: 'Managed', doctor: 'Dr. Alex River' },
    { id: 2, name: 'Mild Hypertension', diagnosed: 'January 2023', status: 'Monitored', doctor: 'Dr. Sarah Chen' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diseaseName, setDiseaseName] = useState('');
  const [diagDate, setDiagDate] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!diseaseName || !diagDate) return;
    setDiseases([{ id: Date.now(), name: diseaseName, diagnosed: diagDate, status: 'Active', doctor: 'Self / Specialist' }, ...diseases]);
    setIsModalOpen(false);
    setDiseaseName('');
    setDiagDate('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Previous Diseases & Conditions</h1>
          <p className="text-slate-500 text-sm">Track your past medical history and diagnoses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition"
        >
          + Add Condition
        </button>
      </div>

      <div className="space-y-4">
        {diseases.map(d => (
          <div key={d.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">{d.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Diagnosed: {d.diagnosed} • {d.doctor}</p>
            </div>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
              {d.status}
            </span>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add Past Condition</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Asthma" 
                  value={diseaseName} 
                  onChange={e => setDiseaseName(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis Date / Period</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., June 2025" 
                  value={diagDate} 
                  onChange={e => setDiagDate(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2.5 rounded-xl text-slate-600 font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl font-medium shadow">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}