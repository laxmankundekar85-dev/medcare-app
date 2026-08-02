import React, { useState } from 'react';

export default function Injections() {
  const [injections, setInjections] = useState([
    {
      id: 1,
      name: 'Influenza Vaccine',
      date: 'Oct 24, 2023 • 09:30 AM',
      status: 'Confirmed'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [injectionName, setInjectionName] = useState('');
  const [injectionDate, setInjectionDate] = useState('');
  const [injectionTime, setInjectionTime] = useState('');

  const handleAddInjection = (e) => {
    e.preventDefault();
    if (!injectionName || !injectionDate) return;

    // Format the date/time nicely
    const formattedDateTime = `${new Date(injectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${injectionTime || '10:00 AM'}`;

    const newEntry = {
      id: Date.now(),
      name: injectionName,
      date: formattedDateTime,
      status: 'Completed'
    };

    setInjections([newEntry, ...injections]);
    setInjectionName('');
    setInjectionDate('');
    setInjectionTime('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header section with Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Injections</h1>
          <p className="text-gray-500 mt-1">Manage and track your immunizations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white font-medium px-5 py-2.5 rounded-lg shadow transition duration-200 flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Add Injection
        </button>
      </div>

      {/* Injections List */}
      <div className="space-y-4">
        {injections.map((inj) => (
          <div key={inj.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-teal-50 p-3 rounded-lg text-teal-700">
                  💉
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{inj.name}</h3>
                  <p className="text-sm text-gray-500">{inj.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${inj.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
                {inj.status}
              </span>
            </div>
            <div className="flex gap-4 pt-2 border-t border-gray-100">
              <button className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2 rounded-lg font-medium transition">
                Details
              </button>
              <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium transition">
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Injection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Injection</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddInjection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Injection / Vaccine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Tetanus Booster"
                  value={injectionName}
                  onChange={(e) => setInjectionName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                <input
                  type="date"
                  required
                  value={injectionDate}
                  onChange={(e) => setInjectionDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 02:30 PM"
                  value={injectionTime}
                  onChange={(e) => setInjectionTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2 rounded-lg font-medium transition shadow"
                >
                  Save Injection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}