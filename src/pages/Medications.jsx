import React, { useState } from 'react';

export default function Medications() {
  const [medications, setMedications] = useState([
    { 
      id: 1, 
      name: 'Metformin', 
      dosage: '500mg • Twice daily', 
      timing: 'Next: 8:00 PM', 
      status: 'Active',
      statusColor: 'bg-teal-50 text-teal-700 border border-teal-200'
    },
    { 
      id: 2, 
      name: 'Lisinopril', 
      dosage: '10.0mg • Once daily', 
      timing: 'Taken: 09:15 AM ✓', 
      status: 'Active',
      statusColor: 'bg-teal-50 text-teal-700 border border-teal-200'
    },
    { 
      id: 3, 
      name: 'Atorvastatin', 
      dosage: '20mg • At bedtime', 
      timing: 'Next: 10:30 PM', 
      status: 'Upcoming',
      statusColor: 'bg-slate-100 text-slate-600 border border-slate-200'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('');

  // Handle removing a medication
  const handleDeleteMedication = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this medication from your schedule?')) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  // Handle adding a new medication
  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!medName || !dosage) return;

    const newMed = {
      id: Date.now(),
      name: medName,
      dosage: dosage,
      timing: timing || 'Scheduled daily',
      status: 'Active',
      statusColor: 'bg-teal-50 text-teal-700 border border-teal-200'
    };

    setMedications([...medications, newMed]);
    setIsAddModalOpen(false);
    
    // Reset form inputs
    setMedName('');
    setDosage('');
    setTiming('');
  };

  // Calculate dynamic completion percentage based on remaining active meds
  const completedCount = medications.filter(m => m.timing.includes('Taken')).length;
  const completionPercentage = medications.length > 0 ? Math.round((completedCount / medications.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      {/* Progress Card Banner */}
      <div className="bg-teal-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-3">{completionPercentage}% Complete</h2>
          <div className="w-full bg-teal-900/60 h-3 rounded-full overflow-hidden p-0.5 mb-2 border border-teal-700/50">
            <div 
              className="bg-teal-300 h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-teal-100 text-xs mt-2">Keep up with your scheduled doses for optimal health tracking.</p>
        </div>
      </div>

      {/* Medication Cards List */}
      <div className="space-y-4">
        {medications.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p className="text-slate-400 text-sm">No active medications scheduled. Add one below!</p>
          </div>
        ) : (
          medications.map((med) => (
            <div 
              key={med.id} 
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center hover:border-teal-200 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center font-bold text-lg shadow-2xs">
                  💊
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{med.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{med.dosage}</p>
                  <p className="text-xs text-teal-700 font-medium mt-1">{med.timing}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${med.statusColor}`}>
                  {med.status}
                </span>
                
                {/* Delete / Remove Button */}
                <button 
                  onClick={(e) => handleDeleteMedication(med.id, e)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 transition"
                  title="Remove medication"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Medication Trigger Bar */}
      <div 
        onClick={() => setIsAddModalOpen(true)}
        className="bg-white border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-3xl p-5 shadow-sm flex justify-between items-center cursor-pointer transition group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 group-hover:bg-teal-50 text-slate-500 group-hover:text-teal-700 rounded-2xl flex items-center justify-center font-bold text-lg transition">
            +
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Add new medication</h3>
            <p className="text-xs text-slate-400 mt-0.5">Setup reminders and dosage tracking</p>
          </div>
        </div>
        <button className="bg-teal-800 hover:bg-teal-900 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow transition">
          Add
        </button>
      </div>

      {/* Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Add New Medication</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medication Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Paracetamol / Aspirin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosage & Frequency</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 500mg • Once daily"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Next Timing / Schedule (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Next: 9:00 PM"
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 border border-slate-300 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium shadow transition text-sm"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}