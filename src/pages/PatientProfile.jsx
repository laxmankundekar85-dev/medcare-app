import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function PatientProfile() {
  const [patientName, setPatientName] = useState('Laxman Babu Kundekar');
  const [patientId, setPatientId] = useState('#MC8829');
  const [isEditing, setIsEditing] = useState(false);

  const [tempName, setTempName] = useState(patientName);
  const [tempId, setTempId] = useState(patientId);

  const userId = "sample_firebase_user_id";

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.fullName) setPatientName(data.fullName);
        if (data.patientId) setPatientId(data.patientId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tempName || !tempId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: tempName, patientId: tempId })
      });

      if (response.ok) {
        setPatientName(tempName);
        setPatientId(tempId);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile changes:', error);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center justify-between max-w-xl mx-auto my-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-2xl border border-teal-100">
          🧑‍🦰
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{patientName}</h2>
          <p className="text-xs text-gray-500 font-medium">Patient ID: {patientId}</p>
        </div>
      </div>

      <button 
        type="button"
        onClick={() => { setTempName(patientName); setTempId(patientId); setIsEditing(true); }}
        className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
      >
        Edit Profile
      </button>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Patient Info</h3>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  required
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}