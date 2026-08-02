import React, { useState } from 'react';
import axios from 'axios';
import { BriefcaseMedical, Mail, Lock, Eye, EyeOff, LogOut } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form Validation
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
        // Call Backend Register API using relative path (leveraging proxy or same origin)
        await axios.post('/api/auth/register', {
          fullName,
          email,
          password
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        alert('Registration successful! Please sign in.');
        setIsRegistering(false);
        setPassword('');
      } else {
        // Call Backend Login API using relative path
        const response = await axios.post('/api/auth/login', {
          email,
          password
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        // Save token and user details to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Trigger successful login transition in parent component
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred during authentication.');
    }
  };

  const handleGoogleLogin = () => {
    onLogin();
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
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
          {isRegistering ? 'Sign up to start tracking your health records.' : 'Please sign in to access your dashboard.'}
        </p>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="Laxman Babu" 
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
                  onClick={() => alert('Password reset instructions sent to your email.')}
                  className="text-xs text-teal-700 font-semibold hover:underline"
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
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-xl font-medium mt-2 flex justify-center items-center gap-2 transition shadow-sm"
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
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition text-sm text-slate-700"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>

      <div className="mt-8 text-slate-500 text-sm">
        {isRegistering ? (
          <p>
            Already have an account?{' '}
            <button 
              onClick={() => { setIsRegistering(false); setError(''); }} 
              className="text-teal-700 font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button 
              onClick={() => { setIsRegistering(true); setError(''); }} 
              className="text-teal-700 font-medium hover:underline"
            >
              Register
            </button>
          </p>
        )}
      </div>
    </div>
  );
}