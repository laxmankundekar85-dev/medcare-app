// src/utils/user.js

// 1. Gets the unique Firebase UID or Email of whoever is currently logged in
export const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.uid || user?.email || 'guest_user';
  } catch {
    return 'guest_user';
  }
};

// 2. Creates a unique LocalStorage cache key per user (e.g. "cached_medications_UserA_UID")
export const getCacheKey = (baseKey) => {
  const uid = getUserId();
  return `${baseKey}_${uid}`;
};