import React, { useState } from 'react';

export default function Records() {
  const [records, setRecords] = useState([
    {
      id: 1,
      title: 'Full Blood Count',
      category: 'LAB RESULT',
      location: 'Central Diagnostic Center',
      date: 'Oct 24, 2023',
      month: 'OCTOBER 2023',
      icon: '💧',
      recentlyUpdated: false
    },
    {
      id: 2,
      title: 'Consultation Summary',
      category: 'DOCTOR NOTES',
      location: 'Dr. Alex River',
      date: 'Oct 22, 2023',
      month: 'OCTOBER 2023',
      icon: '📄',
      recentlyUpdated: false
    },
    {
      id: 3,
      title: 'Chest X-Ray Digital',
      category: 'IMAGING',
      location: 'Radiology Department',
      date: 'Sept 15, 2023',
      month: 'SEPTEMBER 2023',
      icon: '🩻',
      recentlyUpdated: false
    },
    {
      id: 4,
      title: 'Vaccination Record',
      category: 'CERTIFICATE',
      location: 'Medcare General Clinic',
      date: 'Sept 02, 2023',
      month: 'SEPTEMBER 2023',
      icon: '💉',
      recentlyUpdated: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LAB RESULT');
  const [location, setLocation] = useState('');

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!title || !location) return;

    const newRecord = {
      id: Date.now(),
      title,
      category,
      location,
      date: 'Just now',
      month: 'OCTOBER 2023',
      icon: '📄',
      recentlyUpdated: true
    };

    setRecords([newRecord, ...records]);
    setTitle('');
    setLocation('');
    setIsModalOpen(false);
  };

  // Filter records based on search query
  const filteredRecords = records.filter(rec =>
    rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      {/* Header & Add Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Records</h1>
          <p className="text-gray-500 mt-1">View and download your clinical documents and test results.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white font-medium px-4 py-2.5 rounded-lg shadow transition duration-200 flex items-center gap-2 text-sm"
        >
          <span className="text-lg leading-none">+</span> Add Record
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          🔍
        </span>
        <input
          type="text"
          placeholder="Search reports, doctors, or labs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-12 py-3.5 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
        />
        <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
          ⚙️
        </button>
      </div>

      {/* Recently Updated Section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-teal-800 font-bold text-xs tracking-wider mb-4">
          ⭐ RECENTLY UPDATED
        </div>
        <div className="space-y-3">
          <div className="bg-teal-50/50 border border-teal-100/60 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Annual Physical Notes</h4>
              <p className="text-xs text-gray-500 mt-0.5">Dr. Alex River • 2 days ago</p>
            </div>
          </div>
          <div className="bg-teal-50/50 border border-teal-100/60 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Blood Work Analysis</h4>
              <p className="text-xs text-gray-500 mt-0.5">Central Lab • 5 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* October 2023 Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-800 tracking-wider">OCTOBER 2023</h3>
          <button className="text-xs font-semibold text-teal-800 hover:underline">Mark all read</button>
        </div>

        <div className="space-y-4">
          {filteredRecords.filter(r => r.month === 'OCTOBER 2023' || r.recentlyUpdated).map((rec) => (
            <div key={rec.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-teal-50 p-4 rounded-2xl text-teal-700 text-xl">
                  {rec.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{rec.title}</h4>
                    <span className="bg-teal-100/60 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{rec.location} • {rec.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition">
                  📥
                </button>
                <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition font-bold">
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* September 2023 Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-800 tracking-wider mb-4">SEPTEMBER 2023</h3>
        <div className="space-y-4">
          {filteredRecords.filter(r => r.month === 'SEPTEMBER 2023').map((rec) => (
            <div key={rec.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-teal-50 p-4 rounded-2xl text-teal-700 text-xl">
                  {rec.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{rec.title}</h4>
                    <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{rec.location} • {rec.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition">
                  📥
                </button>
                <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition font-bold">
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load Archive Button */}
      <button className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-600 font-medium py-4 rounded-3xl transition">
        Load Archive
      </button>

      {/* Add Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Record</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Record Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MRI Scan / Blood Test"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Type</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                >
                  <option value="LAB RESULT">LAB RESULT</option>
                  <option value="DOCTOR NOTES">DOCTOR NOTES</option>
                  <option value="IMAGING">IMAGING</option>
                  <option value="CERTIFICATE">CERTIFICATE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facility / Doctor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Central Lab or Dr. Smith"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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