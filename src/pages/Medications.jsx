import React, { useState } from 'react';

export default function Medications() {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Metformin',
      dosage: '500mg • Twice daily',
      timeInfo: 'Next: 8:00 PM',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    {
      id: 2,
      name: 'Lisinopril',
      dosage: '10mg • Once daily',
      timeInfo: 'Taken: 09:15 AM ✓',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    {
      id: 3,
      name: 'Atorvastatin',
      dosage: '20mg • At bedtime',
      timeInfo: 'Next: 10:30 PM',
      status: 'Upcoming',
      statusColor: 'bg-gray-100 text-gray-500 border border-gray-200'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('');

  // Calculate adherence percentage dynamically based on active vs total
  const activeCount = medications.filter(m => m.status === 'Active').length;
  const adherencePercentage = Math.round((activeCount / medications.length) * 100) || 85;

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!medName || !medDosage) return;

    const newMed = {
      id: Date.now(),
      name: medName,
      dosage: medDosage,
      timeInfo: medTime ? `Next: ${medTime}` : 'As prescribed',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    };

    setMedications([...medications, newMed]);
    setMedName('');
    setMedDosage('');
    setMedTime('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32">
      {/* Daily Adherence Banner */}
      <div className="bg-teal-800 text-white rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold text-teal-200 tracking-wider mb-1">DAILY ADHERENCE</p>
          <h2 className="text-3xl font-bold mb-4">{adherencePercentage}% Complete</h2>
          <div className="w-full bg-teal-900/60 h-3 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-teal-300 h-full rounded-full transition-all duration-500" 
              style={{ width: `${adherencePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-teal-100">Keep up with your scheduled doses for optimal health tracking.</p>
        </div>
      </div>

      {/* Medications List */}
      <div className="space-y-4 mb-6">
        {medications.map((med) => (
          <div key={med.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-teal-50 text-teal-700 rounded-2xl text-xl">
                💊
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{med.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{med.dosage}</p>
                <p className="text-xs text-teal-700 font-medium mt-1">{med.timeInfo}</p>
              </div>
            </div>
            <span className={`px-3.5 py-1 rounded-full text-xs font-semibold ${med.statusColor}`}>
              {med.status}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Add Medication Row Button */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white border border-gray-200 hover:border-teal-400 rounded-3xl p-4 px-6 shadow-sm flex justify-between items-center cursor-pointer transition duration-200 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-gray-100 group-hover:bg-teal-800 group-hover:text-white rounded-full flex items-center justify-center font-bold text-gray-600 transition">
            +
          </div>
          <span className="text-gray-600 font-medium text-sm">Add new medication</span>
        </div>
        <button className="bg-teal-800 hover:bg-teal-900 text-white px-5 py-2 rounded-2xl font-semibold text-xs transition shadow-sm">
          Add
        </button>
      </div>

      {/* Add Medication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Medication</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Amoxicillin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 250mg • Once daily"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Scheduled Time (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 09:00 PM"
                  value={medTime}
                  onChange={(e) => setMedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow"
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