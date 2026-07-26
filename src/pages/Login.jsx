import React from 'react';
import { BriefcaseMedical, Mail, Lock, Eye, LogOut } from 'lucide-react';

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
        <BriefcaseMedical className="text-teal-800" size={32} />
      </div>
      <h1 className="text-3xl font-bold text-teal-800 mb-1">Medcare</h1>
      <p className="text-xs tracking-widest text-slate-500 mb-10">CLINICAL EXCELLENCE • PERSONAL CARE</p>

      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-slate-500 mb-6">Please sign in to access your dashboard.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="email" placeholder="alex@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Password</label>
              <a href="#" className="text-xs text-teal-700">Forgot Password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="password" value="........" readOnly className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600" />
              <Eye className="absolute right-3 top-3 text-slate-400" size={20} />
            </div>
          </div>

          <button onClick={onLogin} className="w-full bg-teal-800 text-white py-3 rounded-xl font-medium mt-2 flex justify-center items-center gap-2">
            Sign In <LogOut size={18} className="rotate-180" />
          </button>

          <div className="flex items-center gap-4 my-6 text-slate-400 text-sm">
            <div className="flex-1 h-px bg-slate-200"></div>
            OR
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <button className="w-full bg-white border border-slate-200 py-3 rounded-xl font-medium flex justify-center items-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
      </div>
      <p className="mt-8 text-slate-500">Don't have an account? <a href="#" className="text-teal-700 font-medium">Register</a></p>
    </div>
  );
}