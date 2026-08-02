import React, { useState } from 'react';

export default function Alarms() {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      type: 'Daily Dose',
      time: '08:00',
      period: 'AM',
      label: 'Metformin 500mg',
      active: true,
      icon: '💊'
    },
    {
      id: 2,
      type: 'Appointment',
      time: '12:30',
      period: 'PM',
      label: 'Cardiology Check-up',
      active: true,
      icon: '🩺'
    },
    {
      id: 3,
      type: 'Daily Dose',
      time: '09:00',
      period: 'PM',
      label: 'Atorvastatin 20mg',
      active: false,
      icon: '💊'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderType, setReminderType] = useState('Daily Dose');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderPeriod, setReminderPeriod] = useState('AM');
  const [reminderLabel, setReminderLabel] = useState('');

  // Toggle active status
  const handleToggle = (id) => {
    setReminders(reminders.map(rem => rem.id === id ? { ...rem, active: !rem.active } : rem));
  };

  // Delete reminder
  const handleDelete = (id) => {
    setReminders(reminders.filter(rem => rem.id !== id));
  };

  // Add new reminder
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!reminderTime || !reminderLabel) return;

    const newReminder = {
      id: Date.now(),
      type: reminderType,
      time: reminderTime,
      period: reminderPeriod,
      label: reminderLabel,
      active: true,
      icon: reminderType === 'Appointment' ? '🩺' : '💊'
    };

    setReminders([...reminders, newReminder]);
    setReminderLabel('');
    setIsModalOpen(false);
  };

  const activeCount = reminders.filter(r => r.active).length;
  const completedCount = reminders.filter(r => !r.active).length;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32 relative">
      {/* Date Header */}
      <p className="text-gray-400 text-sm font-medium mb-1">Thursday, Oct 24</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Medication Reminders</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-teal-800 text-white rounded-3xl p-6 shadow-sm">
          <div className="text-teal-200 text-xl mb-2">⏰</div>
          <h2 className="text-3xl font-bold">{activeCount}</h2>
          <p className="text-xs text-teal-100 font-medium mt-0.5">Active Today</p>
        </div>
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-6 shadow-sm text-gray-800">
          <div className="text-gray-500 text-xl mb-2">✓</div>
          <h2 className="text-3xl font-bold">{completedCount}</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Completed</p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-4 mb-6">
        {reminders.map((rem) => (
          <div key={rem.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
                <span>{rem.icon}</span> {rem.type}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-gray-900">{rem.time}</span>
                <span className="text-sm font-semibold text-gray-500">{rem.period}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium mt-1">{rem.label}</p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleDelete(rem.id)} 
                className="text-gray-300 hover:text-red-500 text-xs font-bold transition"
                title="Delete Reminder"
              >
                ✕
              </button>
              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(rem.id)}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 ${
                  rem.active ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition"></div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Set New Reminder Dashed Button */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border-2 border-dashed border-gray-300 hover:border-teal-700 bg-white/50 rounded-3xl p-5 text-center cursor-pointer transition flex items-center justify-center gap-2 text-teal-800 font-semibold shadow-sm"
      >
        <span className="text-xl">⏰</span> Set New Reminder
      </div>

      {/* Floating Add Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 bg-teal-800 hover:bg-teal-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl transition duration-200 z-30"
        title="Add Reminder"
      >
        +
      </button>

      {/* Set New Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Set New Reminder</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Type</label>
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                >
                  <option value="Daily Dose">Daily Dose</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Injection">Injection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="08:00"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AM / PM</label>
                  <select
                    value={reminderPeriod}
                    onChange={(e) => setReminderPeriod(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Aspirin 100mg"
                  value={reminderLabel}
                  onChange={(e) => setReminderLabel(e.target.value)}
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
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}