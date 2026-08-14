import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { getUserId, getCacheKey } from '../utils/user';

export default function Medications() {
  const userId = getUserId();

  const [medications, setMedications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('cached_medications'))) || [];
    } catch {
      return [];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId || userId === 'guest_user') return;
    fetchMedications();
  }, [userId]);

  const fetchMedications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const formattedData = data.map((item) => {
            const isTaken = item.status === 'Taken' || item.status === 'Completed';
            return {
              id: item._id,
              name: item.name,
              dosage: item.dosage,
              rawTiming: item.timing,
              nextTiming: item.timing ? `Next: ${item.timing}` : 'Next: Scheduled daily',
              takenTiming: isTaken
                ? `Taken: ${new Date(item.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓`
                : null,
              isTaken: isTaken,
              status: isTaken ? 'Taken' : 'Active',
              statusColor: isTaken
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            };
          });

          setMedications(formattedData);
          localStorage.setItem(getCacheKey('cached_medications'), JSON.stringify(formattedData));
        }
      }
    } catch (error) {
      console.warn('Error fetching medications, using local cache:', error);
    }
  };

  const toggleTakenStatus = async (id, e) => {
    e.stopPropagation();

    const targetMed = medications.find((m) => m.id === id);
    if (!targetMed) return;

    const nextIsTaken = !targetMed.isTaken;
    const nextStatus = nextIsTaken ? 'Taken' : 'Active';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedMeds = medications.map((med) => {
      if (med.id === id) {
        return {
          ...med,
          isTaken: nextIsTaken,
          status: nextStatus,
          statusColor: nextIsTaken
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200',
          takenTiming: nextIsTaken ? `Taken: ${currentTime} ✓` : null,
          nextTiming: !nextIsTaken ? (med.rawTiming ? `Next: ${med.rawTiming}` : 'Next: Scheduled daily') : null
        };
      }
      return med;
    });

    setMedications(updatedMeds);
    localStorage.setItem(getCacheKey('cached_medications'), JSON.stringify(updatedMeds));

    try {
      await fetch(`${API_BASE_URL}/api/medications/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (error) {
      console.error('Error toggling medication status on server:', error);
    }
  };

  const handleDeleteMedication = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this medication from your schedule?')) return;

    const updatedMeds = medications.filter((med) => med.id !== id);
    setMedications(updatedMeds);
    localStorage.setItem(getCacheKey('cached_medications'), JSON.stringify(updatedMeds));

    try {
      await fetch(`${API_BASE_URL}/api/medications/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting medication on server:', error);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tempId = Date.now().toString();
    const newMed = {
      id: tempId,
      name: medName.trim(),
      dosage: dosage.trim(),
      rawTiming: timing.trim() || 'Scheduled daily',
      nextTiming: timing.trim() ? `Next: ${timing.trim()}` : 'Next: Scheduled daily',
      takenTiming: null,
      isTaken: false,
      status: 'Active',
      statusColor: 'bg-slate-100 text-slate-600 border border-slate-200'
    };

    const updatedMeds = [...medications, newMed];
    setMedications(updatedMeds);
    localStorage.setItem(getCacheKey('cached_medications'), JSON.stringify(updatedMeds));

    const payload = {
      userId,
      name: medName.trim(),
      dosage: dosage.trim(),
      timing: timing.trim() || 'Scheduled daily',
      status: 'Active'
    };

    setIsAddModalOpen(false);
    setMedName('');
    setDosage('');
    setTiming('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedItem = await response.json();
        setMedications((prevMeds) => {
          const synced = prevMeds.map((m) => (m.id === tempId ? { ...m, id: savedItem._id } : m));
          localStorage.setItem(getCacheKey('cached_medications'), JSON.stringify(synced));
          return synced;
        });
      }
    } catch (error) {
      console.error('Error adding medication to server:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = medications.filter((m) => m.isTaken).length;
  const completionPercentage =
    medications.length > 0 ? Math.round((completedCount / medications.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 font-sans px-2 sm:px-0">
      {/* Progress Header Banner */}
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
          <p className="text-teal-100 text-xs mt-2">
            Keep up with your scheduled doses for optimal health tracking.
          </p>
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-4">
        {medications.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p className="text-slate-400 text-sm">No active medications scheduled. Add one below!</p>
          </div>
        ) : (
          medications.map((med) => (
            <div
              key={med.id}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-200 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                  💊
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{med.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{med.dosage}</p>
                  <p
                    className={`text-xs font-semibold mt-1 ${
                      med.isTaken ? 'text-emerald-600' : 'text-teal-700'
                    }`}
                  >
                    {med.isTaken ? med.takenTiming : med.nextTiming}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={(e) => toggleTakenStatus(med.id, e)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition active:scale-95 ${
                    med.isTaken
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                  }`}
                >
                  {med.isTaken ? '✓ Taken' : '⏳ Pending'}
                </button>

                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${med.statusColor}`}>
                  {med.status}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDeleteMedication(med.id, e)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 transition cursor-pointer"
                  title="Remove medication"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Medication Card Trigger */}
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsAddModalOpen(true);
          }}
          className="bg-teal-800 hover:bg-teal-900 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow transition cursor-pointer"
        >
          Add
        </button>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Add New Medication</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Medication Name
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dosage & Frequency
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Next Timing / Schedule (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 9:00 PM"
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 border border-slate-300 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium shadow transition text-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}