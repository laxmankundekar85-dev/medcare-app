import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState('Mon 12');

  // Read immediately from LocalStorage for instant load & offline resilience
  const [upcoming, setUpcoming] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cached_appointments')) || [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState([
    {
      id: 101,
      title: 'Dental Checkup',
      provider: 'Dr. Michael Roe',
      date: 'July 28, 2024',
      status: 'COMPLETED',
      summary: 'Patient underwent routine cleaning and dental checkup. No cavities found.'
    },
    {
      id: 102,
      title: 'Full Blood Test',
      provider: 'Central Lab',
      date: 'July 15, 2024',
      status: 'COMPLETED',
      summary: 'Lipid profile and complete blood count within normal ranges.'
    },
    {
      id: 103,
      title: 'Annual Physical',
      provider: 'Dr. Alexander River',
      date: 'June 10, 2024',
      status: 'COMPLETED',
      summary: 'General health evaluation satisfactory. Vital signs stable.'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appTime, setAppTime] = useState('');

  const [activeSummary, setActiveSummary] = useState(null);

  const userId = "sample_firebase_user_id";

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(item => ({
            id: item._id,
            doctor: item.doctorName || item.doctor,
            specialty: item.specialty || 'General Practitioner',
            date: item.date,
            time: item.time,
            status: item.status || 'Confirmed'
          }));
          setUpcoming(formatted);
          localStorage.setItem('cached_appointments', JSON.stringify(formatted));
        }
      }
    } catch (error) {
      console.warn('Error fetching appointments, using local cache:', error);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    const updated = upcoming.filter(app => app.id !== id);
    setUpcoming(updated);
    localStorage.setItem('cached_appointments', JSON.stringify(updated));

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Appointment successfully cancelled.');
      }
    } catch (error) {
      console.error('Error cancelling appointment on server:', error);
    }
  };

  const handleReschedule = async (id) => {
    const newDate = prompt('Enter new date (e.g., Aug 20, 2026):');
    const newTime = prompt('Enter new time (e.g., 11:00 AM):');
    if (newDate && newTime) {
      const updated = upcoming.map(app => 
        app.id === id ? { ...app, date: newDate, time: newTime } : app
      );
      setUpcoming(updated);
      localStorage.setItem('cached_appointments', JSON.stringify(updated));
      alert('Appointment rescheduled successfully!');
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    if (!docName || !appDate) return;

    const tempId = Date.now().toString();
    const newApp = {
      id: tempId,
      doctor: docName,
      specialty: specialty || 'Specialist',
      date: appDate,
      time: appTime || '10:00 AM',
      status: 'Confirmed'
    };

    const updatedList = [newApp, ...upcoming];
    setUpcoming(updatedList);
    localStorage.setItem('cached_appointments', JSON.stringify(updatedList));

    setDocName('');
    setSpecialty('');
    setAppDate('');
    setAppTime('');
    setIsModalOpen(false);

    const payload = {
      userId,
      doctorName: docName,
      specialty: specialty || 'Specialist',
      date: appDate,
      time: appTime || '10:00 AM',
      status: 'Confirmed'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedAppt = await response.json();
        setUpcoming(prev => {
          const synced = prev.map(a => a.id === tempId ? { ...a, id: savedAppt._id } : a);
          localStorage.setItem('cached_appointments', JSON.stringify(synced));
          return synced;
        });
      }
    } catch (error) {
      console.error('Error saving appointment to server:', error);
    }
  };

  const datePickerList = [
    { day: 'Mon', date: '12' },
    { day: 'Tue', date: '13' },
    { day: 'Wed', date: '14' },
    { day: 'Thu', date: '15' },
    { day: 'Fri', date: '16' },
    { day: 'Sat', date: '17' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32 relative font-sans">
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {datePickerList.map((item, idx) => {
          const identifier = `${item.day} ${item.date}`;
          const isSelected = selectedDate === identifier;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDate(identifier)}
              className={`flex flex-col items-center justify-center min-w-[70px] py-3.5 rounded-2xl transition shadow-sm cursor-pointer ${
                isSelected
                  ? 'bg-teal-800 text-white shadow-teal-900/20'
                  : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                {item.day}
              </span>
              <span className="text-xl font-bold mt-1">{item.date}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
        <button 
          type="button"
          onClick={() => alert('Viewing all upcoming appointments')} 
          className="text-sm font-semibold text-teal-800 hover:underline cursor-pointer"
        >
          See all
        </button>
      </div>

      <div className="space-y-4 mb-10">
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm italic bg-white p-6 rounded-3xl border border-gray-100 text-center">
            No upcoming appointments scheduled. Click the + button below to add one!
          </p>
        ) : (
          upcoming.map((app) => (
            <div key={app.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 font-bold text-xl">
                    🩺
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{app.doctor}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{app.specialty}</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  ✓ {app.status}
                </span>
              </div>

              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 flex justify-between items-center mb-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span>📅</span> <span className="font-medium">{app.date}</span>
                </div>
                <div className="h-4 w-[1px] bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <span>⏰</span> <span className="font-medium">{app.time}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleCancel(app.id)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-2xl font-medium transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReschedule(app.id)}
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-2xl font-medium transition text-sm shadow-sm cursor-pointer"
                >
                  Reschedule
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment History</h2>

      <div className="space-y-4">
        {history.map((hist) => (
          <div key={hist.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{hist.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{hist.provider} • {hist.date}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider">
                {hist.status}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={() => setActiveSummary(hist)}
                className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Summary →
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 bg-teal-800 hover:bg-teal-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl transition duration-200 z-30 cursor-pointer"
        title="Schedule Appointment"
      >
        +
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Schedule Appointment</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor / Specialist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Robert Smith"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input
                  type="text"
                  placeholder="e.g., Dermatologist"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Aug 20, 2026"
                  value={appDate}
                  onChange={(e) => setAppDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 10:30 AM"
                  value={appTime}
                  onChange={(e) => setAppTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSummary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{activeSummary.title}</h3>
              <button 
                type="button"
                onClick={() => setActiveSummary(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">{activeSummary.provider} • {activeSummary.date}</p>
            <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-4 text-gray-700 text-sm mb-6 leading-relaxed">
              {activeSummary.summary}
            </div>
            <button
              type="button"
              onClick={() => setActiveSummary(null)}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}