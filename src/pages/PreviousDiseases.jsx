import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function PreviousDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDetails, setActiveDetails] = useState(null);

  const [conditionName, setConditionName] = useState('');
  const [category, setCategory] = useState('RESPIRATORY');
  const [diagDate, setDiagDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');

  const userId = "sample_firebase_user_id";

  useEffect(() => {
    fetchDiseases();
  }, [userId]);

  const fetchDiseases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/previous-diseases/${userId}`);
      if (response.ok) {
        const data = await response.json();

        const formatted = data.map(item => ({
          id: item._id,
          name: item.diseaseName || 'Unnamed Condition',
          category: item.category || 'GENERAL',
          diagnosed: item.diagnosedDate || 'N/A',
          status: item.status || 'Ongoing',
          doctor: item.treatingDoctor || 'Attending Physician',
          notes: item.notes || 'No additional notes provided.'
        }));

        setDiseases(formatted);
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  };

  const handleAddCondition = async (e) => {
    e.preventDefault();

    if (!conditionName.trim() || !diagDate.trim()) {
      alert('Please enter both Condition Name and Diagnosis Date.');
      return;
    }

    const payload = {
      userId,
      diseaseName: conditionName.trim(),
      category: category || 'RESPIRATORY',
      diagnosedDate: diagDate.trim(),
      status: 'Ongoing',
      treatingDoctor: doctorName.trim() || 'Attending Physician',
      notes: notes.trim() || 'No additional notes provided.'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/previous-diseases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const saved = await response.json();

        const newDisease = {
          id: saved._id,
          name: saved.diseaseName,
          category: saved.category,
          diagnosed: saved.diagnosedDate,
          status: saved.status || 'Ongoing',
          doctor: saved.treatingDoctor,
          notes: saved.notes
        };

        setDiseases([newDisease, ...diseases]);
        setIsModalOpen(false);

        setConditionName('');
        setCategory('RESPIRATORY');
        setDiagDate('');
        setDoctorName('');
        setNotes('');
      } else {
        const errData = await response.json();
        alert(`Failed to save condition: ${errData.error || 'Server validation error'}`);
      }
    } catch (error) {
      console.error('Error saving condition:', error);
      alert('Network error connecting to backend API');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this medical history record?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/previous-diseases/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDiseases(diseases.filter(d => d.id !== id));
        if (activeDetails && activeDetails.id === id) {
          setActiveDetails(null);
        }
      }
    } catch (error) {
      console.error('Error removing record:', error);
    }
  };

  const filteredDiseases = diseases.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Previous Diseases & Conditions</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your past medical history, diagnoses, and clinical notes.</p>
        </div>
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <span>+</span> Add Condition
        </button>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Search past conditions or categories..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white text-slate-800 shadow-sm text-sm"
        />
        <span className="absolute left-4 top-3.5 text-slate-400 text-lg">🔍</span>
      </div>

      <div className="space-y-4">
        {filteredDiseases.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p className="text-slate-400 text-sm">No medical history records found matching your search.</p>
          </div>
        ) : (
          filteredDiseases.map(d => (
            <div 
              key={d.id} 
              onClick={() => setActiveDetails(d)}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
                  🩺
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{d.name}</h3>
                    <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {d.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Diagnosed: {d.diagnosed} • {d.doctor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
                  {d.status}
                </span>
                <button 
                  type="button"
                  onClick={(e) => handleDelete(d.id, e)} 
                  className="text-slate-300 hover:text-rose-500 p-2 font-bold transition cursor-pointer"
                  title="Delete record"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Add Past Condition</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleAddCondition} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Asthma / Migraine" 
                  value={conditionName} 
                  onChange={e => setConditionName(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white text-sm"
                >
                  <option value="RESPIRATORY">RESPIRATORY</option>
                  <option value="CARDIOVASCULAR">CARDIOVASCULAR</option>
                  <option value="GENERAL">GENERAL</option>
                  <option value="NEUROLOGICAL">NEUROLOGICAL</option>
                  <option value="ORTHOPEDIC">ORTHOPEDIC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis Date / Period</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., March 2024" 
                  value={diagDate} 
                  onChange={e => setDiagDate(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attending Physician (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Dr. Alex River" 
                  value={doctorName} 
                  onChange={e => setDoctorName(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Notes / Treatment</label>
                <textarea 
                  rows="3"
                  placeholder="Enter any prescription or management notes..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 border border-slate-300 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium shadow transition text-sm cursor-pointer"
                >
                  Save Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">{activeDetails.name}</h3>
              <button type="button" onClick={() => setActiveDetails(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Category: <strong className="text-slate-800">{activeDetails.category}</strong></span>
                  <span>Status: <strong className="text-amber-700">{activeDetails.status}</strong></span>
                </div>
                <p className="text-xs text-slate-500">Diagnosed On: <strong className="text-slate-800">{activeDetails.diagnosed}</strong></p>
                <p className="text-xs text-slate-500">Physician: <strong className="text-slate-800">{activeDetails.doctor}</strong></p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 tracking-wider mb-1">CLINICAL NOTES</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                  {activeDetails.notes}
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setActiveDetails(null)} 
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}