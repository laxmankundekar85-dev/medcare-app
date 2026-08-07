import React, { useState, useEffect, useRef } from 'react';

export default function Alarms() {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderType, setReminderType] = useState('Daily Dose');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderPeriod, setReminderPeriod] = useState('AM');
  const [reminderLabel, setReminderLabel] = useState('');
  const [triggeredIds, setTriggeredIds] = useState(new Set());

  // Active Alarm State (For 30-Sec Alarm & Stop Function)
  const [activeAlarmingRem, setActiveAlarmingRem] = useState(null);
  
  // Audio Context and Interval References
  const audioCtxRef = useRef(null);
  const alarmSoundIntervalRef = useRef(null);
  const autoStopTimeoutRef = useRef(null);

  // Replace with your dynamic Firebase Auth user UID or context variable
  const userId = "sample_firebase_user_id";

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  // ==========================================
  // 1. FETCH REMINDERS / ALARMS FROM API
  // ==========================================
  useEffect(() => {
    fetchAlarms();
  }, [userId]);

  const fetchAlarms = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/alarms/${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Format MongoDB data to align with UI state
        const formatted = data.map(item => {
          const timeParts = item.time ? item.time.split(' ') : ['08:00', 'AM'];
          const parsedTime = timeParts[0] || item.time;
          const parsedPeriod = timeParts[1] || 'AM';

          return {
            id: item._id,
            type: item.type || 'Daily Dose',
            time: parsedTime,
            period: parsedPeriod,
            label: item.label,
            active: item.isEnabled !== undefined ? item.isEnabled : true,
            icon: (item.type || 'Daily Dose') === 'Appointment' ? '🩺' : '💊'
          };
        });

        setReminders(formatted);
      }
    } catch (error) {
      console.error('Error fetching alarms:', error);
    }
  };

  // ==========================================
  // 2. REAL-TIME ALARM SCHEDULER & LISTENER
  // ==========================================
  useEffect(() => {
    const alarmInterval = setInterval(() => {
      const now = new Date();
      
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = hours.toString().padStart(2, '0');
      
      const currentTimeStr = `${formattedHours}:${minutes}`;
      const currentPeriodStr = period;

      reminders.forEach(rem => {
        const remTimeNorm = rem.time.padStart(5, '0');
        
        if (
          rem.active &&
          remTimeNorm === currentTimeStr &&
          rem.period.toUpperCase() === currentPeriodStr &&
          !triggeredIds.has(rem.id)
        ) {
          triggerAlarmAlert(rem);
          setTriggeredIds(prev => new Set(prev).add(rem.id));
        }
      });
    }, 1000);

    return () => clearInterval(alarmInterval);
  }, [reminders, triggeredIds]);

  // ==========================================
  // 3. CONTINUOUS 30-SEC SOUND TONE CONTROLLER
  // ==========================================
  const startContinuousAlarmSound = () => {
    stopAlarmSound(); // Stop any existing audio first

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      audioCtxRef.current = new AudioContext();

      const playBeep = () => {
        if (!audioCtxRef.current) return;
        
        try {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime); // A5 tone
          gain.gain.setValueAtTime(0.4, audioCtxRef.current.currentTime);
          
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.4); // 0.4 second beep
        } catch (e) {
          console.error("Beep error:", e);
        }
      };

      // Play immediate beep, then loop every 800ms
      playBeep();
      alarmSoundIntervalRef.current = setInterval(playBeep, 800);

      // Auto-stop audio sound automatically after 30 seconds
      autoStopTimeoutRef.current = setTimeout(() => {
        stopAlarmSound();
      }, 30000);

    } catch (err) {
      console.log('Audio Context playback blocked or error:', err);
    }
  };

  const stopAlarmSound = () => {
    if (alarmSoundIntervalRef.current) {
      clearInterval(alarmSoundIntervalRef.current);
      alarmSoundIntervalRef.current = null;
    }

    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        console.error("Audio closure error:", e);
      }
      audioCtxRef.current = null;
    }
  };

  // Trigger procedure when time hits
  const triggerAlarmAlert = (rem) => {
    // 1. Show ringing UI Modal
    setActiveAlarmingRem(rem);

    // 2. Play 30-second continuous audio
    startContinuousAlarmSound();

    // 3. Trigger Browser Native Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`⏰ Medication Reminder: ${rem.label}`, {
        body: `Time for your ${rem.type} dose scheduled at ${rem.time} ${rem.period}.`,
        icon: 'https://cdn-icons-png.flaticon.com/512/883/883407.png'
      });
    }
  };

  // Manual User Stop Action Button
  const handleUserStopAlarm = () => {
    stopAlarmSound();
    setActiveAlarmingRem(null);
  };

  // ==========================================
  // 4. TOGGLE ACTIVE STATUS (PATCH API)
  // ==========================================
  const handleToggle = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/alarms/${id}/toggle`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setReminders(prev =>
          prev.map(rem => rem.id === id ? { ...rem, active: !rem.active } : rem)
        );
        setTriggeredIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (error) {
      console.error('Error toggling alarm:', error);
    }
  };

  // ==========================================
  // 5. DELETE REMINDER (DELETE API)
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/alarms/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReminders(prev => prev.filter(rem => rem.id !== id));
      }
    } catch (error) {
      console.error('Error deleting alarm:', error);
    }
  };

  // ==========================================
  // 6. ADD NEW REMINDER (POST API)
  // ==========================================
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!reminderTime || !reminderLabel) return;

    const timeParts = reminderTime.split(':');
    const paddedHours = timeParts[0].padStart(2, '0');
    const paddedMinutes = (timeParts[1] || '00').padStart(2, '0');
    const formattedInputTime = `${paddedHours}:${paddedMinutes}`;

    const fullTimeString = `${formattedInputTime} ${reminderPeriod}`;

    const payload = {
      userId,
      label: reminderLabel,
      time: fullTimeString,
      type: reminderType,
      isEnabled: true,
      days: ['Daily']
    };

    try {
      const response = await fetch('http://localhost:5000/api/alarms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedAlarm = await response.json();

        const newReminder = {
          id: savedAlarm._id,
          type: savedAlarm.type || reminderType,
          time: formattedInputTime,
          period: reminderPeriod,
          label: savedAlarm.label,
          active: savedAlarm.isEnabled !== undefined ? savedAlarm.isEnabled : true,
          icon: reminderType === 'Appointment' ? '🩺' : '💊'
        };

        setReminders(prev => [...prev, newReminder]);
        setReminderLabel('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding alarm:', error);
    }
  };

  const activeCount = reminders.filter(r => r.active).length;
  const completedCount = reminders.filter(r => !r.active).length;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32 relative font-sans">
      {/* Date Header */}
      <p className="text-gray-400 text-sm font-medium mb-1">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </p>
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
        {reminders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <p className="text-gray-400 text-sm italic">No reminders scheduled. Set one below!</p>
          </div>
        ) : (
          reminders.map((rem) => (
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
                  type="button"
                  onClick={() => handleDelete(rem.id)} 
                  className="text-gray-300 hover:text-red-500 text-xs font-bold transition cursor-pointer"
                  title="Delete Reminder"
                >
                  ✕
                </button>
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(rem.id)}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    rem.active ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition"></div>
                </button>
              </div>
            </div>
          ))
        )}
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
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 bg-teal-800 hover:bg-teal-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl transition duration-200 z-30 cursor-pointer"
        title="Add Reminder"
      >
        +
      </button>

      {/* ==========================================
          RINGING ALARM POPUP MODAL (30 SECONDS)
      ========================================== */}
      {activeAlarmingRem && (
        <div className="fixed inset-0 bg-teal-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-6 border-4 border-teal-500 animate-bounce-short">
            <div className="w-20 h-20 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner animate-pulse">
              ⏰
            </div>
            
            <div>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {activeAlarmingRem.type}
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">
                {activeAlarmingRem.time} <span className="text-lg text-gray-500">{activeAlarmingRem.period}</span>
              </h2>
              <p className="text-base font-semibold text-gray-700 mt-1">
                {activeAlarmingRem.label}
              </p>
              <p className="text-xs text-rose-500 mt-2 font-medium">
                🔔 Alarm ringing continuously for 30s...
              </p>
            </div>

            <button
              type="button"
              onClick={handleUserStopAlarm}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-bold text-base transition shadow-lg cursor-pointer transform active:scale-95"
            >
              🛑 STOP ALARM
            </button>
          </div>
        </div>
      )}

      {/* Set New Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Set New Reminder</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
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
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white text-sm"
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
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AM / PM</label>
                  <select
                    value={reminderPeriod}
                    onChange={(e) => setReminderPeriod(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white text-sm"
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
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium shadow text-sm cursor-pointer"
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