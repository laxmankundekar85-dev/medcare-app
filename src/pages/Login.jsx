import React, { useState, useEffect } from 'react';
import { BriefcaseMedical, Mail, Lock, Eye, EyeOff, LogOut, ArrowLeft, KeyRound } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from '../firebase';
import { API_BASE_URL } from '../config';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Automatically ping the backend when the Forgot Password view is toggled to wake up Render
  useEffect(() => {
    if (isForgotPassword) {
      fetch(`${API_BASE_URL}/api/ping`, { method: 'GET' }).catch(() => {
        // Silent catch for pre-flight keep-alive ping
      });
    }
  }, [isForgotPassword]);

  const clearFormState = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setOtp('');
    setNewPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password || (isRegistering && !fullName)) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: fullName
        }));

        alert('Registration successful! Signing you in...');
        onLogin();
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0]
        }));

        onLogin();
      }
    } catch (err) {
      let errorMessage = 'An error occurred during authentication.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // 45-second timeout window to accommodate Render free tier cold starts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error('Invalid response from server.');
      }

      if (response.ok && data.success) {
        setOtpSent(true);
        setSuccessMessage('A 6-digit verification code has been sent to your email.');
      } else {
        if (data.error && data.error.includes('Firebase error')) {
          setError('Backend setup error. Please contact administrator or check server environment variables.');
        } else {
          setError(data.error || 'Failed to send OTP code.');
        }
      }
    } catch (err) {
      console.error("Backend connection error:", err);
      if (err.name === 'AbortError') {
        setError('Server cold start took too long. Please tap "Send Verification OTP" again.');
      } else {
        setError(`Unable to connect to backend server at ${API_BASE_URL}. Ensure the backend is running.`);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otp || !newPassword) {
      setError('Please enter both the OTP code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp-reset`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp, newPassword }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error('Invalid server response.');
      }

      if (response.ok && data.success) {
        alert('Password reset successful! You can now log in with your new password.');
        setIsForgotPassword(false);
        setOtpSent(false);
        clearFormState();
      } else {
        setError(data.error || 'Invalid OTP code or password reset failed.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Server connection error. Please try again later.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0]
      }));

      onLogin();
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
        <BriefcaseMedical className="text-teal-800" size={32} />
      </div>
      <h1 className="text-3xl font-bold text-teal-800 mb-1">Medcare</h1>
      <p className="text-xs tracking-widest text-slate-500 mb-10">CLINICAL EXCELLENCE • PERSONAL CARE</p>

      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">
          {isForgotPassword 
            ? 'Reset Password' 
            : isRegistering 
              ? 'Create Account' 
              : 'Welcome Back'}
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
          {isForgotPassword 
            ? (otpSent ? 'Enter the 6-digit code and your new password.' : 'Enter your email to receive a verification OTP code.') 
            : isRegistering 
              ? 'Sign up to start tracking your health records.' 
              : 'Please sign in to access your dashboard.'}
        </p>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl font-medium">
            {successMessage}
          </div>
        )}

        {isForgotPassword ? (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input 
                      type="email" 
                      required
                      autoComplete="new-password"
                      placeholder="alex@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-xl font-medium mt-2 flex justify-center items-center gap-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium mb-1">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      maxLength="6"
                      required
                      autoComplete="off"
                      placeholder="123456" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm tracking-widest font-mono text-center text-lg" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      autoComplete="new-password"
                      placeholder="••••••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-xl font-medium mt-2 flex justify-center items-center gap-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Updating Password...' : 'Verify OTP & Set Password'}</span>
                </button>
              </form>
            )}

            <button 
              type="button" 
              onClick={() => { setIsForgotPassword(false); setOtpSent(false); clearFormState(); }}
              className="mt-6 text-sm text-teal-700 font-medium hover:underline flex items-center justify-center gap-2 w-full cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    autoComplete="none"
                    placeholder="Enter Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm" 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    required
                    autoComplete="new-password"
                    placeholder="alex@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">Password</label>
                  {!isRegistering && (
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPassword(true); clearFormState(); }}
                      className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    autoComplete="new-password"
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-xl font-medium mt-2 flex justify-center items-center gap-2 transition shadow-sm cursor-pointer"
              >
                <span>{isRegistering ? 'Register Account' : 'Sign In'}</span> 
                <LogOut size={18} className="rotate-180" />
              </button>
            </form>

            <div className="flex items-center gap-4 my-6 text-slate-400 text-sm">
              <div className="flex-1 h-px bg-slate-200"></div>
              OR
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition text-sm text-slate-700 cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </>
        )}
      </div>

      <div className="mt-8 text-slate-500 text-sm">
        {!isForgotPassword && (
          isRegistering ? (
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { setIsRegistering(false); clearFormState(); }} 
                className="text-teal-700 font-medium hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setIsRegistering(true); clearFormState(); }} 
                className="text-teal-700 font-medium hover:underline cursor-pointer"
              >
                Register
              </button>
            </p>
          )
        )}
      </div>
    </div>
  );
}