import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const userId = "sample_firebase_user_id";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications from active backend APIs
  useEffect(() => {
    fetchAllNotifications();
  }, [userId]);

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      const [medRes, apptRes, alarmRes, injRes, recRes] = await Promise.all([
        fetch(`http://localhost:5000/api/medications/${userId}`),
        fetch(`http://localhost:5000/api/appointments/${userId}`),
        fetch(`http://localhost:5000/api/alarms/${userId}`),
        fetch(`http://localhost:5000/api/injections/${userId}`),
        fetch(`http://localhost:5000/api/records/${userId}`)
      ]);

      const items = [];

      // 1. Process Medication Notifications
      if (medRes.ok) {
        const meds = await medRes.json();
        meds.forEach((m) => {
          if (m.status !== 'Taken' && m.status !== 'Completed') {
            items.push({
              id: `med-${m._id}`,
              type: 'medication',
              title: `Dose Due: ${m.name || m.title}`,
              time: m.time || 'Today',
              icon: '💊',
              read: false,
              category: 'Medication'
            });
          }
        });
      }

      // 2. Process Appointment Notifications
      if (apptRes.ok) {
        const appts = await apptRes.json();
        appts.forEach((a) => {
          items.push({
            id: `appt-${a._id}`,
            type: 'appointment',
            title: `Doctor Appt: ${a.doctorName || a.title || 'Scheduled Visit'}`,
            time: `${a.date || 'Upcoming'} ${a.time ? '• ' + a.time : ''}`,
            icon: '🩺',
            read: false,
            category: 'Appointment'
          });
        });
      }

      // 3. Process Alarm / Reminder Notifications
      if (alarmRes.ok) {
        const alarms = await alarmRes.json();
        alarms.forEach((al) => {
          if (al.isEnabled !== false && al.active !== false) {
            items.push({
              id: `alarm-${al._id}`,
              type: 'alarm',
              title: `Active Reminder: ${al.label || al.title}`,
              time: al.time || 'Daily Alert',
              icon: '⏰',
              read: false,
              category: 'Alarm'
            });
          }
        });
      }

      // 4. Process Injection Notifications
      if (injRes.ok) {
        const injs = await injRes.json();
        injs.forEach((inj) => {
          items.push({
            id: `inj-${inj._id}`,
            type: 'injection',
            title: `Shot Scheduled: ${inj.name || inj.title || 'Vaccine/Dose'}`,
            time: inj.date || 'Scheduled',
            icon: '💉',
            read: false,
            category: 'Injection'
          });
        });
      }

      // 5. Process Clinical Record Notifications
      if (recRes.ok) {
        const recs = await recRes.json();
        recs.slice(0, 2).forEach((r) => {
          items.push({
            id: `rec-${r._id}`,
            type: 'record',
            title: `New File Available: ${r.title}`,
            time: r.date || 'Recently Uploaded',
            icon: '📄',
            read: false,
            category: 'Record'
          });
        });
      }

      setNotifications(items);
    } catch (error) {
      console.error('Error loading aggregated notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Button with Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white border border-slate-100 hover:border-teal-300 text-teal-800 shadow-sm transition cursor-pointer"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden font-sans animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition cursor-pointer flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <span className="text-2xl block mb-1">🔔</span>
                No new notifications
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-start justify-between gap-3 transition ${
                    item.read ? 'bg-white opacity-60' : 'bg-teal-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                      {item.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {item.time}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNotification(item.id)}
                    className="text-slate-300 hover:text-rose-500 transition p-1 cursor-pointer shrink-0"
                    title="Dismiss"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={fetchAllNotifications}
              className="text-xs font-bold text-teal-800 hover:underline cursor-pointer"
            >
              🔄 Refresh Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}