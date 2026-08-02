import React, { useState } from 'react';

export default function Settings() {
  const [account, setAccount] = useState({
    name: 'Laxman Babu Kundekar',
    role: 'Engineering Student & Patient'
  });

  const [activeModal, setActiveModal] = useState(null); // 'notifications', 'privacy', 'security', 'language', 'support', 'editAccount'
  const [darkMode, setDarkMode] = useState(false);

  // Modal Settings States
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    reminders: true
  });

  const [privacy, setPrivacy] = useState({
    shareData: false,
    profileVisible: true
  });

  const [security, setSecurity] = useState({
    biometric: true,
    twoFactor: false
  });

  const [language, setLanguage] = useState('English (US)');
  const [supportMsg, setSupportMsg] = useState('');

  // Edit Account Form State
  const [newName, setNewName] = useState(account.name);
  const [newRole, setNewRole] = useState(account.role);

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setAccount({ name: newName, role: newRole });
    setActiveModal(null);
  };

  const handleSendSupport = (e) => {
    e.preventDefault();
    alert(`Support ticket submitted successfully! Message: "${supportMsg}"`);
    setSupportMsg('');
    setActiveModal(null);
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto pb-32 ${darkMode ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => alert('Going back...')} className="font-bold text-lg">
          ←
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
          alt="Avatar" 
          className="w-9 h-9 rounded-full object-cover border border-gray-200"
        />
      </div>

      {/* User Info Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-6 flex justify-between items-center text-gray-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center text-2xl font-bold">
            👤
          </div>
          <div>
            <h2 className="font-bold text-lg">{account.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{account.role}</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveModal('editAccount')}
          className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-2xl transition"
          title="Edit Profile"
        >
          ✏️
        </button>
      </div>

      {/* Account & App Section Header */}
      <p className="text-xs font-bold text-gray-400 tracking-wider mb-3">ACCOUNT & APP</p>

      {/* Options List */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm divide-y divide-gray-100 mb-4 text-gray-900">
        {/* Notifications */}
        <div 
          onClick={() => setActiveModal('notifications')}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition rounded-t-3xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">🔔</div>
            <div>
              <h3 className="font-bold text-sm">Notifications</h3>
              <p className="text-xs text-gray-400">Alerts, sounds, reminders</p>
            </div>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>

        {/* Privacy */}
        <div 
          onClick={() => setActiveModal('privacy')}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">🔒</div>
            <div>
              <h3 className="font-bold text-sm">Privacy</h3>
              <p className="text-xs text-gray-400">Data sharing, visibility</p>
            </div>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>

        {/* Security */}
        <div 
          onClick={() => setActiveModal('security')}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">🛡️</div>
            <div>
              <h3 className="font-bold text-sm">Security</h3>
              <p className="text-xs text-gray-400">Password, 2FA, biometric</p>
            </div>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>

        {/* Language */}
        <div 
          onClick={() => setActiveModal('language')}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">🌐</div>
            <div>
              <h3 className="font-bold text-sm">Language</h3>
              <p className="text-xs text-gray-400">{language}</p>
            </div>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>

        {/* Support */}
        <div 
          onClick={() => setActiveModal('support')}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition rounded-b-3xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">❓</div>
            <div>
              <h3 className="font-bold text-sm">Support</h3>
              <p className="text-xs text-gray-400">Help center, contact us</p>
            </div>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>
      </div>

      {/* Dark Mode Toggle Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm mb-6 flex justify-between items-center text-gray-900">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">🌙</div>
          <h3 className="font-bold text-sm">Dark Mode</h3>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 ${
            darkMode ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'
          }`}
        >
          <div className="bg-white w-6 h-6 rounded-full shadow-md"></div>
        </button>
      </div>

      {/* Sign Out Button */}
      <button 
        onClick={() => alert('Signed out successfully. Redirecting to login...')}
        className="w-full bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-semibold py-4 rounded-3xl transition flex items-center justify-center gap-2 text-sm shadow-sm mb-8"
      >
        <span>🚪</span> Sign Out
      </button>

      {/* Version Footer */}
      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>Version 2.4.1 (Build 1082)</p>
        <p>© 2026 Medcare Health Systems</p>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Edit Account Modal */}
      {activeModal === 'editAccount' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Account Info</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Specialization</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 border border-gray-300 py-2.5 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl font-medium shadow">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Notification Settings</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 font-bold text-xl">&times;</button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div><h4 className="font-bold text-sm">Push Alerts</h4><p className="text-xs text-gray-500">Instant reminders</p></div>
                <button onClick={() => setNotifications({...notifications, push: !notifications.push})} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${notifications.push ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div><h4 className="font-bold text-sm">Email Reports</h4><p className="text-xs text-gray-500">Weekly summaries</p></div>
                <button onClick={() => setNotifications({...notifications, email: !notifications.email})} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${notifications.email ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-teal-800 text-white py-2.5 rounded-xl font-medium shadow">Done</button>
          </div>
        </div>
      )}

      {/* 3. Privacy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Privacy Settings</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 font-bold text-xl">&times;</button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div><h4 className="font-bold text-sm">Data Sharing</h4><p className="text-xs text-gray-500">Share analytics with doctors</p></div>
                <button onClick={() => setPrivacy({...privacy, shareData: !privacy.shareData})} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${privacy.shareData ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-teal-800 text-white py-2.5 rounded-xl font-medium shadow">Done</button>
          </div>
        </div>
      )}

      {/* 4. Security Modal */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Security Settings</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 font-bold text-xl">&times;</button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div><h4 className="font-bold text-sm">Biometric Lock</h4><p className="text-xs text-gray-500">Fingerprint / Face ID</p></div>
                <button onClick={() => setSecurity({...security, biometric: !security.biometric})} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${security.biometric ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div><h4 className="font-bold text-sm">Two-Factor Authentication</h4><p className="text-xs text-gray-500">Extra security token</p></div>
                <button onClick={() => setSecurity({...security, twoFactor: !security.twoFactor})} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${security.twoFactor ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-teal-800 text-white py-2.5 rounded-xl font-medium shadow">Done</button>
          </div>
        </div>
      )}

      {/* 5. Language Modal */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Language</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 font-bold text-xl">&times;</button>
            </div>
            <div className="space-y-2 mb-6">
              {['English (US)', 'English (UK)', 'Hindi (हिंदी)', 'Spanish (Español)'].map((lang) => (
                <button 
                  key={lang} 
                  onClick={() => { setLanguage(lang); setActiveModal(null); }}
                  className={`w-full text-left p-3.5 rounded-2xl font-medium transition ${language === lang ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Help & Support</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSendSupport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Describe your issue or question</label>
                <textarea 
                  rows="4" 
                  required
                  placeholder="Type here..."
                  value={supportMsg}
                  onChange={(e) => setSupportMsg(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 border border-gray-300 py-2.5 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-xl font-medium shadow">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}