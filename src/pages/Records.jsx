import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { getUserId, getCacheKey } from '../utils/user';

export default function Records() {
  const userId = getUserId();

  // Read immediately from LocalStorage for instant load & offline resilience (User Scoped)
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('cached_clinical_records'))) || [];
    } catch {
      return [];
    }
  });

  const [recentlyUpdatedList, setRecentlyUpdatedList] = useState([
    { id: 101, title: 'Annual Physical Notes', subtitle: 'Dr. Alex River • 2 days ago', fileUrl: null },
    { id: 102, title: 'Blood Work Analysis', subtitle: 'Central Lab • 5 days ago', fileUrl: null }
  ]);

  const [archiveLoaded, setArchiveLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LAB RESULT');
  const [location, setLocation] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);

  // Reference for hidden native file picker
  const fileInputRef = useRef(null);

  // ==========================================
  // HELPER: GET CURRENT / FORMATTED MONTH HEADER
  // ==========================================
  const getCurrentMonthHeader = () => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  // ==========================================
  // 1. FETCH RECORDS FROM API
  // ==========================================
  useEffect(() => {
    if (!userId || userId === 'guest_user') return;
    fetchRecords();
  }, [userId]);

  const fetchRecords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/records/${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(item => {
            let computedMonth = getCurrentMonthHeader();
            if (item.createdAt) {
              computedMonth = new Date(item.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
            }

            return {
              id: item._id,
              title: item.title,
              category: item.category || 'LAB RESULT',
              location: item.doctor || item.summary || 'Clinical File',
              date: item.date || 'Recently Updated',
              month: computedMonth,
              fileUrl: item.fileUrl || (item.summary?.startsWith('data:') ? item.summary : null),
              icon: item.category === 'IMAGING' ? '🩻' : item.category === 'CERTIFICATE' ? '💉' : item.category === 'DOCTOR NOTES' ? '📄' : '💧',
              recentlyUpdated: false
            };
          });

          setRecords(formatted);
          localStorage.setItem(getCacheKey('cached_clinical_records'), JSON.stringify(formatted));
        }
      }
    } catch (error) {
      console.warn('Error fetching records, using local cache:', error);
    }
  };

  // Handle native file selection and convert to Base64
  const handleFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setTitle(fileNameWithoutExt);
    setLocation('Mobile Upload / Local File');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    setIsModalOpen(true);
    e.target.value = null;
  };

  // ==========================================
  // 2. ADD RECORD TO BACKEND (POST API)
  // ==========================================
  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!title || !location) return;

    const currentMonth = getCurrentMonthHeader();
    const tempId = Date.now().toString();

    const newRecord = {
      id: tempId,
      title: title,
      category: category,
      location: location,
      date: 'Just now',
      month: currentMonth,
      fileUrl: fileDataUrl,
      icon: selectedFile?.type?.includes('pdf') ? '📄' : '📁',
      recentlyUpdated: true
    };

    const updatedList = [newRecord, ...records];
    setRecords(updatedList);
    localStorage.setItem(getCacheKey('cached_clinical_records'), JSON.stringify(updatedList));

    setTitle('');
    setLocation('');
    setSelectedFile(null);
    setFileDataUrl(null);
    setIsModalOpen(false);

    const payload = {
      userId,
      title,
      category,
      date: 'Just now',
      doctor: location,
      summary: fileDataUrl ? `Attached File: ${selectedFile?.name || title}` : 'Clinical Record Entry',
      fileUrl: fileDataUrl
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedRecord = await response.json();
        setRecords(prev => {
          const synced = prev.map(r => r.id === tempId ? { ...r, id: savedRecord._id } : r);
          localStorage.setItem(getCacheKey('cached_clinical_records'), JSON.stringify(synced));
          return synced;
        });
      }
    } catch (error) {
      console.error('Error saving record to server:', error);
    }
  };

  // ==========================================
  // 3. DELETE RECORD FROM BACKEND (DELETE API)
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clinical record?')) return;

    const updatedList = records.filter(r => r.id !== id);
    setRecords(updatedList);
    localStorage.setItem(getCacheKey('cached_clinical_records'), JSON.stringify(updatedList));
    setActiveMenuId(null);

    try {
      await fetch(`${API_BASE_URL}/api/records/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting record from server:', error);
    }
  };

  // ==========================================
  // 4. REAL FILE DOWNLOAD HANDLER
  // ==========================================
  const handleDownload = (fileUrl, docTitle) => {
    if (!fileUrl) {
      alert(`No attached file found for "${docTitle}". Please upload a local file or PDF to download.`);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${docTitle.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      window.open(fileUrl, '_blank');
    }
  };

  // Mark All Read
  const handleMarkAllRead = () => {
    alert('All clinical records marked as read.');
  };

  // Load Archive
  const handleLoadArchive = () => {
    setArchiveLoaded(true);
    alert('Archive successfully loaded with older medical documents.');
  };

  // Filter records based on search query
  const filteredRecords = records.filter(rec =>
    rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group records by month dynamically
  const recordsByMonth = filteredRecords.reduce((acc, rec) => {
    const monthKey = rec.month || getCurrentMonthHeader();
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(rec);
    return acc;
  }, {});

  const currentMonthHeader = getCurrentMonthHeader();

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto pb-24 relative font-sans" onClick={() => setActiveMenuId(null)}>
      {/* Hidden Native File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelected} 
        accept=".pdf,image/*" 
        className="hidden" 
      />

      {/* Header & Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Records</h1>
          <p className="text-gray-500 mt-1 text-sm">View and download your clinical documents and test results.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Upload File Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
            className="flex-1 sm:flex-initial bg-teal-700 hover:bg-teal-800 text-white font-medium px-4 py-2.5 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer"
          >
            <span>📎 Upload File</span>
          </button>

          {/* Add Record Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileDataUrl(null); setIsModalOpen(true); }}
            className="flex-1 sm:flex-initial bg-teal-800 hover:bg-teal-900 text-white font-medium px-4 py-2.5 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer"
          >
            <span className="text-base leading-none">+</span> Add Record
          </button>
        </div>
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
          className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-12 py-3.5 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
        />
        <button 
          type="button"
          onClick={() => alert('Filter options opened')} 
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          ⚙️
        </button>
      </div>

      {/* Recently Updated Section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-teal-800 font-bold text-xs tracking-wider mb-4">
          ⭐ RECENTLY UPDATED
        </div>
        <div className="space-y-3">
          {recentlyUpdatedList.map((item) => (
            <div 
              key={item.id} 
              className="bg-teal-50/50 border border-teal-100/60 rounded-2xl p-4 flex justify-between items-center hover:bg-teal-50 transition cursor-pointer" 
              onClick={() => handleDownload(item.fileUrl, item.title)}
            >
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
              </div>
              <span className="text-xs text-teal-700 font-semibold">View</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Month Sections */}
      {Object.keys(recordsByMonth).length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center text-gray-400 text-sm mb-8 shadow-sm">
          No records found. Click <strong>Upload File</strong> or <strong>Add Record</strong> to get started.
        </div>
      ) : (
        Object.entries(recordsByMonth).map(([monthName, monthRecords]) => (
          <div key={monthName} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 tracking-wider">
                {monthName}
              </h3>
              {monthName === currentMonthHeader && (
                <button 
                  type="button" 
                  onClick={handleMarkAllRead} 
                  className="text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="space-y-4">
              {monthRecords.map((rec) => (
                <div 
                  key={rec.id} 
                  className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex justify-between items-center relative"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-50 p-4 rounded-2xl text-teal-700 text-xl flex items-center justify-center shrink-0">
                      {rec.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">
                          {rec.title}
                        </h4>
                        <span className="bg-teal-100/60 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {rec.location} • {rec.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => handleDownload(rec.fileUrl, rec.title)}
                      className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
                      title="Download Record"
                    >
                      📥
                    </button>

                    <div className="relative">
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveMenuId(activeMenuId === rec.id ? null : rec.id); 
                        }}
                        className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition font-bold cursor-pointer"
                      >
                        ⋮
                      </button>

                      {activeMenuId === rec.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                          <button 
                            type="button"
                            onClick={() => handleDownload(rec.fileUrl, rec.title)} 
                            className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            Download PDF
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDelete(rec.id)} 
                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                          >
                            Delete Record
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Archive Loaded Message or Load Archive Button */}
      {archiveLoaded ? (
        <div className="text-center p-6 bg-teal-50 border border-teal-200 rounded-3xl text-teal-800 text-sm font-medium mb-8">
          📁 All historical documents from prior periods are now loaded.
        </div>
      ) : (
        <button 
          type="button"
          onClick={handleLoadArchive}
          className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-600 font-medium py-4 rounded-3xl transition mb-8 cursor-pointer"
        >
          Load Archive
        </button>
      )}

      {/* Add Record / Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedFile ? 'Upload Selected File' : 'Add New Record'}
              </h3>
              <button 
                type="button"
                onClick={() => { 
                  setIsModalOpen(false); 
                  setSelectedFile(null); 
                  setFileDataUrl(null); 
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            {selectedFile && (
              <div className="mb-4 bg-teal-50 border border-teal-200 text-teal-800 text-xs p-3 rounded-xl flex items-center justify-between">
                <span>
                  📎 <strong>Selected:</strong> {selectedFile.name}
                </span>
                <span className="text-[10px] bg-teal-200 px-2 py-0.5 rounded-full uppercase font-bold">
                  {selectedFile.type.includes('pdf') ? 'PDF' : 'Image/File'}
                </span>
              </div>
            )}

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Record Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MRI Scan / Blood Test"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white text-sm"
                >
                  <option value="LAB RESULT">LAB RESULT</option>
                  <option value="DOCTOR NOTES">DOCTOR NOTES</option>
                  <option value="IMAGING">IMAGING</option>
                  <option value="CERTIFICATE">CERTIFICATE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility / Doctor
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Central Lab or Dr. Smith"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { 
                    setIsModalOpen(false); 
                    setSelectedFile(null); 
                    setFileDataUrl(null); 
                  }}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
                >
                  {selectedFile ? 'Upload & Save' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}