import React, { useState } from 'react';

export default function Injections() {
  const [injections, setInjections] = useState([
    {
      id: 1,
      name: 'Influenza Vaccine',
      date: 'Oct 24, 2023 • 09:30 AM',
      status: 'Confirmed',
      doctor: 'Dr. Sarah Chen',
      location: 'VIVA Medical Center, Room 304',
      notes: 'Annual seasonal flu shot. Please arrive 10 minutes prior.'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDetails, setActiveDetails] = useState(null);
  const [activeReschedule, setActiveReschedule] = useState(null);

  // Form states
  const [injName, setInjName] = useState('');
  const [injDate, setInjDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [newDateVal, setNewDateVal] = useState('');

  const handleAddInjection = (e) => {
    e.preventDefault();
    if (!injName || !injDate) return;

    const newInj = {
      id: Date.now(),
      name: injName,
      date: injDate,
      status: 'Confirmed',
      doctor: doctor || 'Dr. Alex River',
      location: location || 'VIVA Medical Center',
      notes: 'Scheduled immunization.'
    };

    setInjections([newInj, ...injections]);
    setIsAddModalOpen(false);
    setInjName('');
    setInjDate('');
    setDoctor('');
    setLocation('');
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!newDateVal) return;

    setInjections(injections.map(inj => {
      if (inj.id === activeReschedule.id) {
        return { ...inj, date: newDateVal, status: 'Rescheduled' };
      }
      return inj;
    }));

    setActiveReschedule(null);
    setNewDateVal('');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this vaccination record?')) {
      setInjections(injections.filter(inj => inj.id !== id));
      if (activeDetails && activeDetails.id === id) setActiveDetails(null);
      if (activeReschedule && activeReschedule.id === id) setActiveReschedule(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      {/* Top Header & Add Action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Injections</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track your immunizations.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition flex items-center gap-2"
        >
          <span>+</span> Add Injection
        </button>
      </div>

      {/* Injections List */}
      <div className="space-y-4">
        {injections.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p className="text-slate-400 text-sm">No injection records found. Click "Add Injection" to create one.</p>
          </div>
        ) : (
          injections.map(inj => (
            <div 
              key={inj.id} 
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 transition hover:border-teal-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center font-bold text-lg">
                    💉
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{inj.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{inj.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
                    {inj.status}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(inj.id, e)}
                    className="text-slate-300 hover:text-rose-500 p-2 font-bold transition"
                    title="Delete record"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setActiveDetails(inj)}
                  className="bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-2xl font-medium text-sm transition shadow-xs"
                >
                  Details
                </button>
                <button 
                  onClick={() => setActiveReschedule(inj)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-2xl font-medium text-sm transition"
                >
                  Reschedule
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Injection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Add New Injection</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleAddInjection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vaccine / Injection Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Tetanus Booster" 
                  value={injName} 
                  onChange={e => setInjName(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Nov 15, 2026 • 10:00 AM" 
                  value={injDate} 
                  onChange={e => setInjDate(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Administering Physician</label>
                <input 
                  type="text" 
                  placeholder="e.g., Dr. Alex River" 
                  value={doctor} 
                  onChange={e => setDoctor(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Clinic</label>
                <input 
                  type="text" 
                  placeholder="e.g., VIVA Medical Center" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 border border-slate-300 py-2.5 rounded-xl text-slate-600 font-medium text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl font-medium text-sm shadow">Save Injection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {activeDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">{activeDetails.name}</h3>
              <button onClick={() => setActiveDetails(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 space-y-2 text-sm text-slate-600">
                <p>Scheduled: <strong className="text-slate-900">{activeDetails.date}</strong></p>
                <p>Physician: <strong className="text-slate-900">{activeDetails.doctor}</strong></p>
                <p>Location: <strong className="text-slate-900">{activeDetails.location}</strong></p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 tracking-wider mb-1">CLINICAL INSTRUCTIONS</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                  {activeDetails.notes}
                </p>
              </div>
            </div>

            <button onClick={() => setActiveDetails(null)} className="w-full bg-teal-800 text-white py-2.5 rounded-xl font-medium transition shadow text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {activeReschedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Reschedule Injection</h3>
              <button onClick={() => setActiveReschedule(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Schedule</label>
                <input 
                  type="text" 
                  disabled 
                  value={activeReschedule.date} 
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Date & Time</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Nov 20, 2026 • 11:00 AM" 
                  value={newDateVal} 
                  onChange={e => setNewDateVal(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setActiveReschedule(null)} className="flex-1 border border-slate-300 py-2.5 rounded-xl text-slate-600 font-medium text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl font-medium text-sm shadow">Confirm New Date</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}