import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { getUserId, getCacheKey } from '../utils/user';

export default function Profile({ onLogout }) {
  const fileInputRef = useRef(null);
  const userId = getUserId();

  const getStoredAvatar = () => {
    return localStorage.getItem(getCacheKey('userAvatar')) || localStorage.getItem(`userAvatar_${userId}`);
  };

  // Dynamically resolve logged-in user credentials
  const getInitialUserData = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u) {
        const resolvedName = u.displayName || (u.email ? u.email.split('@')[0] : 'Patient');
        const resolvedId = u.uid ? `#MC${u.uid.slice(-4).toUpperCase()}` : '#MC1001';
        return {
          name: resolvedName,
          patientId: resolvedId,
          email: u.email || '',
          avatar: u.photoURL || null
        };
      }
    } catch (e) {
      console.warn('Error reading stored user for profile:', e);
    }
    return {
      name: 'Patient',
      patientId: '#MC1001',
      email: '',
      avatar: null
    };
  };

  const initialUser = getInitialUserData();

  const [profile, setProfile] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(getCacheKey('user_profile_cache')));
      if (cached && cached.email === initialUser.email && cached.name !== 'Laxman') {
        return cached;
      }
    } catch {
      // Fallback
    }
    return {
      name: initialUser.name,
      patientId: initialUser.patientId,
      bloodGroup: 'O+',
      age: '20',
      weight: '64',
      email: initialUser.email,
      phone: '+91 98765 43210',
      address: 'Mumbai, India',
      avatar: getStoredAvatar() || initialUser.avatar || ''
    };
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState(null); // 'checkup', 'vaccination', 'privacy', 'notifications'

  const [editField, setEditField] = useState('');
  const [editVal, setEditVal] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Notification Settings
  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('notif_settings'))) || {
        medication: true,
        appointments: true,
        vaccinations: true,
        emergencyAlerts: true,
        emailSummaries: false,
        push: true,
        sms: true
      };
    } catch {
      return {
        medication: true,
        appointments: true,
        vaccinations: true,
        emergencyAlerts: true,
        emailSummaries: false,
        push: true,
        sms: true
      };
    }
  });

  // Privacy & Security Settings
  const [privacySettings, setPrivacySettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCacheKey('privacy_settings'))) || {
        biometric: true,
        twoFactor: true,
        hipaaSharing: false,
        hideVitalsOnLock: true,
        autoLogoutMinutes: '15'
      };
    } catch {
      return {
        biometric: true,
        twoFactor: true,
        hipaaSharing: false,
        hideVitalsOnLock: true,
        autoLogoutMinutes: '15'
      };
    }
  });

  useEffect(() => {
    if (!userId || userId === 'guest_user') return;

    const currentUser = getInitialUserData();
    setProfile(prev => ({
      ...prev,
      name: prev.name === 'Laxman' ? currentUser.name : (prev.name || currentUser.name),
      patientId: currentUser.patientId,
      email: currentUser.email || prev.email,
      avatar: getStoredAvatar() || currentUser.avatar || prev.avatar
    }));

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const currentUser = getInitialUserData();

        setProfile(prev => {
          const freshAvatar = data.avatar || getStoredAvatar() || currentUser.avatar || prev.avatar;
          
          if (data.avatar) {
            localStorage.setItem(getCacheKey('userAvatar'), data.avatar);
            localStorage.setItem(`userAvatar_${userId}`, data.avatar);
          }

          const updated = {
            ...prev,
            name: data.fullName || currentUser.name || prev.name,
            patientId: data.patientId || currentUser.patientId,
            bloodGroup: data.bloodGroup || prev.bloodGroup,
            weight: data.weight ? String(data.weight) : prev.weight,
            age: data.age ? String(data.age) : prev.age,
            email: data.email || currentUser.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            avatar: freshAvatar
          };

          localStorage.setItem(getCacheKey('user_profile_cache'), JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.warn('Error fetching profile data, retaining dynamic session values:', error);
    }
  };

  const saveNotifSettings = (newSettings) => {
    setNotifSettings(newSettings);
    localStorage.setItem(getCacheKey('notif_settings'), JSON.stringify(newSettings));
  };

  const savePrivacySettings = (newSettings) => {
    setPrivacySettings(newSettings);
    localStorage.setItem(getCacheKey('privacy_settings'), JSON.stringify(newSettings));
  };

  const openEditModal = (fieldKey, title) => {
    setEditField(fieldKey);
    setEditVal(profile[fieldKey] || '');
    setModalTitle(title);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const updatedProfile = { ...profile, [editField]: editVal };

    setProfile(updatedProfile);
    localStorage.setItem(getCacheKey('user_profile_cache'), JSON.stringify(updatedProfile));
    setIsEditModalOpen(false);

    const payload = {
      fullName: updatedProfile.name,
      patientId: updatedProfile.patientId,
      bloodGroup: updatedProfile.bloodGroup,
      age: Number(updatedProfile.age) || updatedProfile.age,
      weight: Number(updatedProfile.weight) || 64,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      address: updatedProfile.address,
      avatar: updatedProfile.avatar
    };

    try {
      await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Error updating profile on server:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        try {
          localStorage.setItem(getCacheKey('userAvatar'), compressedBase64);
          localStorage.setItem(`userAvatar_${userId}`, compressedBase64);
        } catch (err) {
          console.warn('LocalStorage quota exceeded', err);
        }

        setProfile(prev => {
          const updated = { ...prev, avatar: compressedBase64 };
          localStorage.setItem(getCacheKey('user_profile_cache'), JSON.stringify(updated));
          return updated;
        });

        try {
          const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: profile.name,
              patientId: profile.patientId,
              bloodGroup: profile.bloodGroup,
              age: Number(profile.age) || profile.age,
              weight: Number(profile.weight) || 64,
              email: profile.email,
              phone: profile.phone,
              address: profile.address,
              avatar: compressedBase64
            })
          });

          if (response.ok) {
            alert('✅ Profile photo updated!');
          }
        } catch (error) {
          console.error('Error saving profile photo to server:', error);
        }
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const userInitial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32 font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="hidden" 
      />

      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="relative mb-16">
        <div className="bg-teal-700 h-32 rounded-3xl relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div 
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="relative group cursor-pointer"
          >
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-teal-800 flex items-center justify-center text-white text-3xl font-bold">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 text-white text-[10px] font-semibold text-center px-1">
              📷 Change Photo
            </div>
          </div>
          <span className="absolute bottom-0 right-0 bg-teal-700 text-white p-1 rounded-full text-xs shadow pointer-events-none">
            ✓
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
        <p className="text-xs text-gray-400 mt-0.5 font-mono">Patient ID: {profile.patientId}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div 
          onClick={() => openEditModal('bloodGroup', 'Blood Group')}
          className="bg-white border border-gray-100 rounded-3xl p-4 text-center shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <p className="text-xs text-gray-400 font-medium mb-1">Blood Group</p>
          <h3 className="text-xl font-bold text-teal-800">{profile.bloodGroup}</h3>
        </div>
        <div 
          onClick={() => openEditModal('age', 'Age')}
          className="bg-white border border-gray-100 rounded-3xl p-4 text-center shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <p className="text-xs text-gray-400 font-medium mb-1">Age</p>
          <h3 className="text-xl font-bold text-teal-800">{profile.age}</h3>
        </div>
        <div 
          onClick={() => openEditModal('weight', 'Weight')}
          className="bg-white border border-gray-100 rounded-3xl p-4 text-center shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <p className="text-xs text-gray-400 font-medium mb-1">Weight</p>
          <h3 className="text-xl font-bold text-teal-800">{profile.weight}<span className="text-xs font-normal text-gray-400">kg</span></h3>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-3">PERSONAL INFORMATION</h3>
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm divide-y divide-gray-100">
          <div 
            onClick={() => openEditModal('email', 'Email Address')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition rounded-t-3xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-teal-700 text-lg">✉️</span>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{profile.email || 'Not provided'}</p>
              </div>
            </div>
            <span className="text-xs text-teal-800 font-semibold">Edit</span>
          </div>

          <div 
            onClick={() => openEditModal('phone', 'Phone Number')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-teal-700 text-lg">📞</span>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-800">{profile.phone}</p>
              </div>
            </div>
            <span className="text-xs text-teal-800 font-semibold">Edit</span>
          </div>

          <div 
            onClick={() => openEditModal('address', 'Residential Address')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition rounded-b-3xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-teal-700 text-lg">📍</span>
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-800">{profile.address}</p>
              </div>
            </div>
            <span className="text-xs text-teal-800 font-semibold">Edit</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-3">MEDICAL SUMMARY</h3>
        <div className="space-y-3">
          <div 
            onClick={() => setActiveSubView('checkup')}
            className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-300 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">📋</div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Last Health Checkup</h4>
                <p className="text-xs text-gray-400">15 October 2023 • Dr. Alex River</p>
              </div>
            </div>
            <span className="text-gray-400 font-bold">›</span>
          </div>

          <div 
            onClick={() => setActiveSubView('vaccination')}
            className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-300 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-700 text-white rounded-2xl">💉</div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Vaccination Status</h4>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">● Fully Vaccinated</p>
              </div>
            </div>
            <span className="text-gray-400 font-bold">›</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div 
          onClick={() => setActiveSubView('privacy')}
          className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-300 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-lg">🛡️</span>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Privacy & Security</h4>
              <p className="text-xs text-gray-400">Biometrics, 2FA, auto-lock & HIPAA sharing</p>
            </div>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>

        <div 
          onClick={() => setActiveSubView('notifications')}
          className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-300 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-lg">🔔</span>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Notification Settings</h4>
              <p className="text-xs text-gray-400">Medication, doses, doctor alerts & sound</p>
            </div>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>

        <button 
          type="button" 
          onClick={onLogout}
          className="w-full bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-medium py-4 rounded-3xl transition flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
        >
          <span>🚪</span> Logout Account
        </button>
      </div>

      {/* Field Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Value</label>
                <input
                  type="text"
                  required
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {activeSubView === 'privacy' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Privacy & Security</h3>
              <button 
                type="button" 
                onClick={() => setActiveSubView(null)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Biometric Lock</h4>
                  <p className="text-xs text-gray-500">Require Fingerprint / Face ID to open app</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => savePrivacySettings({ ...privacySettings, biometric: !privacySettings.biometric })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${privacySettings.biometric ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-500">Require OTP code during new device logins</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => savePrivacySettings({ ...privacySettings, twoFactor: !privacySettings.twoFactor })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${privacySettings.twoFactor ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">HIPAA Health Data Sharing</h4>
                  <p className="text-xs text-gray-500">Allow certified clinics to view test history</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => savePrivacySettings({ ...privacySettings, hipaaSharing: !privacySettings.hipaaSharing })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${privacySettings.hipaaSharing ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Hide Vitals on Screen Lock</h4>
                  <p className="text-xs text-gray-500">Mask sensitive health stats in notifications</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => savePrivacySettings({ ...privacySettings, hideVitalsOnLock: !privacySettings.hideVitalsOnLock })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${privacySettings.hideVitalsOnLock ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl space-y-1">
                <label className="block text-sm font-bold text-gray-900">Inactivity Auto-Lock Timeout</label>
                <select 
                  value={privacySettings.autoLogoutMinutes}
                  onChange={(e) => savePrivacySettings({ ...privacySettings, autoLogoutMinutes: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="5">Lock after 5 minutes</option>
                  <option value="15">Lock after 15 minutes</option>
                  <option value="30">Lock after 30 minutes</option>
                  <option value="60">Lock after 1 hour</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={() => alert('Password Reset email has been dispatched to your email.')}
                  className="w-full border border-teal-700 text-teal-800 hover:bg-teal-50 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  🔑 Change Account Password
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubView(null)}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {activeSubView === 'notifications' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Notification Preferences</h3>
              <button 
                type="button" 
                onClick={() => setActiveSubView(null)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Medication Dosage Alerts</h4>
                  <p className="text-xs text-gray-500">Push alarms at exact prescription times</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => saveNotifSettings({ ...notifSettings, medication: !notifSettings.medication })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.medication ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Appointment Reminders</h4>
                  <p className="text-xs text-gray-500">Get notified 24h & 1h prior to visits</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => saveNotifSettings({ ...notifSettings, appointments: !notifSettings.appointments })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.appointments ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Vaccination Schedule</h4>
                  <p className="text-xs text-gray-500">Booster shot and injection reminders</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => saveNotifSettings({ ...notifSettings, vaccinations: !notifSettings.vaccinations })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.vaccinations ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Emergency Care Alerts</h4>
                  <p className="text-xs text-gray-500">Critical vital threshold popups</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => saveNotifSettings({ ...notifSettings, emergencyAlerts: !notifSettings.emergencyAlerts })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.emergencyAlerts ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Weekly Health Email Reports</h4>
                  <p className="text-xs text-gray-500">Send weekly summary to registered email</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => saveNotifSettings({ ...notifSettings, emailSummaries: !notifSettings.emailSummaries })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.emailSummaries ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubView(null)}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Clinical Checkup Modal */}
      {activeSubView === 'checkup' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-xl font-bold text-gray-900">Clinical Checkup Summary</h3>
              <button 
                type="button" 
                onClick={() => setActiveSubView(null)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-4 text-xs text-gray-700 space-y-2">
              <p>🩺 <strong>Attending Physician:</strong> Dr. Alex River</p>
              <p>📅 <strong>Date:</strong> 15 October 2023</p>
              <p>🏥 <strong>Location:</strong> VIVA Medical Center</p>
              <p>📊 <strong>Vitals Captured:</strong> BP 120/80 mmHg • Pulse 72 bpm • SpO2 98%</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              <strong>Assessment:</strong> General physical examination complete. Patient in good health. Blood sugar and lipid profile within optimal ranges. Next checkup scheduled for annual evaluation.
            </p>

            <button
              type="button"
              onClick={() => setActiveSubView(null)}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition text-sm cursor-pointer shadow"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* Vaccination Status Modal */}
      {activeSubView === 'vaccination' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-xl font-bold text-gray-900">Immunization Badge</h3>
              <button 
                type="button" 
                onClick={() => setActiveSubView(null)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
              <span className="text-2xl">🛡️</span>
              <h4 className="text-sm font-bold text-emerald-800">Verified Vaccine Record</h4>
              <p className="text-xs text-emerald-700">All standard immunizations & boosters up to date</p>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>COVID-19 Booster</span>
                <span className="font-bold text-emerald-700">Completed (Aug 2024)</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>Tetanus Toxoid</span>
                <span className="font-bold text-emerald-700">Completed (Mar 2023)</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>Hepatitis B Series</span>
                <span className="font-bold text-emerald-700">Completed</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubView(null)}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition text-sm cursor-pointer shadow"
            >
              Close Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}