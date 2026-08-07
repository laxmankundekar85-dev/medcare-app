import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Profile({ onLogout }) {
  const [profile, setProfile] = useState({
    name: 'Laxman Babu Kundekar',
    patientId: '#MC-98442',
    bloodGroup: 'O+',
    age: '20',
    weight: '64',
    email: 'laxman.kundekar@healthmail.com',
    phone: '+91 98765 43210',
    address: 'VIVA Institute of Technology, Virar, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState(null);

  const [editField, setEditField] = useState('');
  const [editVal, setEditVal] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const [notifSettings, setNotifSettings] = useState({
    push: true,
    sms: true,
    emailAlerts: false,
    reminders: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    biometric: true,
    shareData: false,
    twoFactor: true
  });

  const userId = "sample_firebase_user_id";

  // ==========================================
  // 1. FETCH PROFILE FROM BACKEND API
  // ==========================================
  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          name: data.fullName || prev.name,
          patientId: data.patientId || prev.patientId,
          bloodGroup: data.bloodGroup || prev.bloodGroup,
          weight: data.weight ? String(data.weight) : prev.weight,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          avatar: data.avatar || prev.avatar // Loads saved photo from MongoDB
        }));
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const openEditModal = (fieldKey, title) => {
    setEditField(fieldKey);
    setEditVal(profile[fieldKey]);
    setModalTitle(title);
    setIsEditModalOpen(true);
  };

  // ==========================================
  // 2. SAVE PROFILE FIELD CHANGES (PUT API)
  // ==========================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const updatedProfile = { ...profile, [editField]: editVal };

    const payload = {
      fullName: updatedProfile.name,
      patientId: updatedProfile.patientId,
      bloodGroup: updatedProfile.bloodGroup,
      weight: Number(updatedProfile.weight) || 64,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      avatar: updatedProfile.avatar
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setProfile(updatedProfile);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // ==========================================
  // 3. PERSIST PHOTO UPLOAD TO BACKEND (BASE64)
  // ==========================================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      // Update UI state immediately
      setProfile(prev => ({ ...prev, avatar: base64Image }));

      // Persist Base64 image to MongoDB backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: profile.name,
            patientId: profile.patientId,
            bloodGroup: profile.bloodGroup,
            weight: Number(profile.weight) || 64,
            email: profile.email,
            phone: profile.phone,
            avatar: base64Image
          })
        });

        if (response.ok) {
          alert('✅ Profile photo updated and saved to server!');
        } else {
          alert('❌ Failed to save photo to server.');
        }
      } catch (error) {
        console.error('Error saving profile photo:', error);
        alert('❌ Error connecting to server while saving photo.');
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32 font-sans">
      <div className="flex justify-between items-center mb-6">
        <button type="button" onClick={() => alert('Navigating back')} className="text-gray-700 font-bold text-lg cursor-pointer">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <button 
          type="button"
          onClick={() => openEditModal('name', 'Edit Name')}
          className="text-gray-700 hover:text-teal-800 transition cursor-pointer"
          title="Edit Profile"
        >
          ✏️
        </button>
      </div>

      <div className="relative mb-16">
        <div className="bg-teal-700 h-32 rounded-3xl relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <label className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
              <img 
                src={profile.avatar} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover group-hover:opacity-90 transition"
              />
            </div>
            
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[11px] font-semibold text-center px-1">
              📷 Change Photo
            </div>

            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </label>
          <span className="absolute bottom-0 right-0 bg-teal-700 text-white p-1 rounded-full text-xs shadow pointer-events-none">
            ✓
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
        <p className="text-xs text-gray-400 mt-0.5">Patient ID: {profile.patientId}</p>
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
                <p className="text-sm font-medium text-gray-800">{profile.email}</p>
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
            onClick={() => setActiveSubView('medical')}
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
            onClick={() => setActiveSubView('medical')}
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
            <span className="font-medium text-gray-900 text-sm">Privacy & Security</span>
          </div>
          <span className="text-gray-400 font-bold">›</span>
        </div>

        <div 
          onClick={() => setActiveSubView('notifications')}
          className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-300 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-lg">🔔</span>
            <span className="font-medium text-gray-900 text-sm">Notification Settings</span>
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

      {activeSubView === 'notifications' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Notification Settings</h3>
              <button type="button" onClick={() => setActiveSubView(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Push Notifications</h4>
                  <p className="text-xs text-gray-500">Receive instant alerts for doses</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setNotifSettings({...notifSettings, push: !notifSettings.push})}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.push ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">SMS Alerts</h4>
                  <p className="text-xs text-gray-500">Get text messages for appointments</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setNotifSettings({...notifSettings, sms: !notifSettings.sms})}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.sms ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Email Summaries</h4>
                  <p className="text-xs text-gray-500">Weekly health report updates</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setNotifSettings({...notifSettings, emailAlerts: !notifSettings.emailAlerts})}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${notifSettings.emailAlerts ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
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

      {activeSubView === 'privacy' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Privacy & Security</h3>
              <button type="button" onClick={() => setActiveSubView(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Biometric Lock</h4>
                  <p className="text-xs text-gray-500">Require fingerprint/face ID</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setPrivacySettings({...privacySettings, biometric: !privacySettings.biometric})}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${privacySettings.biometric ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Two-Factor Auth</h4>
                  <p className="text-xs text-gray-500">Extra layer of account security</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setPrivacySettings({...privacySettings, twoFactor: !privacySettings.twoFactor})}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${privacySettings.twoFactor ? 'bg-teal-800 justify-end' : 'bg-gray-300 justify-start'}`}
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

      {activeSubView === 'medical' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Medical Status Overview</h3>
              <button type="button" onClick={() => setActiveSubView(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>
            <p className="text-gray-700 text-sm mb-6 leading-relaxed bg-teal-50 p-4 rounded-2xl border border-teal-100">
              Your immunization records and last clinical checkup with Dr. Alex River are fully verified and up to date.
            </p>
            <button
              type="button"
              onClick={() => setActiveSubView(null)}
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