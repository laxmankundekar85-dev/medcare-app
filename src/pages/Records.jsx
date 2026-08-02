import React, { useState } from 'react';

export default function Records() {
  const [records, setRecords] = useState([
    {
      id: 1,
      title: 'Annual Blood Work & Lipid Profile',
      date: 'May 12, 2026',
      category: 'Laboratory',
      doctor: 'Dr. Sharma'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCategory, setRecordCategory] = useState('Laboratory');
  const [recordDate, setRecordDate] = useState('');
  const [doctorName, setDoctorName] = useState('');

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!recordTitle || !recordDate) return;

    const formattedDate = new Date(recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newRecord = {
      id: Date.now(),
      title: recordTitle,
      date: formattedDate,
      category: recordCategory,
      doctor: doctorName || 'General Practitioner'
    };

    setRecords([newRecord, ...records]);
    setRecordTitle('');
    setRecordCategory('Laboratory');
    setRecordDate('');
    setDoctorName('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-500 mt-1">Access and manage your medical history, test reports, and documents.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white font-medium px-5 py-2.5 rounded-lg shadow transition duration-200 flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Add Record
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.map((rec) => (
          <div key={rec.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 p-3 rounded-lg text-teal-700 text-xl">
                📄
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                <p className="text-sm text-gray-500">{rec.date} • {rec.category} • {rec.doctor}</p>
              </div>
            </div>
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition">
              View File
            </button>
          </div>
        ))}
      </div>

      {/* Add Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Medical Record</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Record Title / Report Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MRI Scan / Chest X-Ray"
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={recordCategory}
                  onChange={(e) => setRecordCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                >
                  <option value="Laboratory">Laboratory</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Clinical Note">Clinical Note</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor / Facility</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Smith"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}