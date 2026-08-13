import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, QrCode, Camera, ChevronRight, Info, 
  Sparkles, AlertCircle, CheckCircle2, RotateCcw 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function MedicineScanner({ onBack }) {
  const [activeMode, setActiveMode] = useState(null); // 'qr' | 'photo' | null
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // Trigger file selection for selected option
  const handleSelectOption = (mode) => {
    setActiveMode(mode);
    setScanResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image capture/file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setScanResult(null);
      setError(null);
    }
  };

  // Helper: Convert File to Base64
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (err) => reject(err);
    });
  };

  // Send Image to Server AI API
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const base64Image = await convertBase64(selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/scan-medicine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanType: activeMode === 'qr' ? 'qr' : 'image',
          imageBase64: base64Image
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setScanResult(data.analysis);
      } else {
        setError(data.error || 'Failed to identify medication. Please ensure the image/QR is clear.');
      }
    } catch (err) {
      console.error('Scan Error:', err);
      setError('Network error while analyzing medicine. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    setActiveMode(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 font-sans px-4 sm:px-6">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Top Navigation Header */}
      <div className="flex items-center justify-between py-3 border-b border-slate-200/60 mb-2">
        <button 
          onClick={onBack || (() => window.history.back())} 
          className="p-2 -ml-2 text-slate-700 hover:text-teal-800 transition cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-teal-800 text-center">
          Medicine Scanner
        </h1>
        <div className="w-12"></div> {/* Spacer for symmetry */}
      </div>

      {/* Main Grid: Adapts to 2 columns on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Hero & Action Options */}
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Hero Circular Graphic */}
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-teal-50/80 border border-teal-200/60 shadow-inner">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-teal-100/60 flex items-center justify-center border border-dashed border-teal-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-md">
                  <svg 
                    className="w-8 h-8 sm:w-10 sm:h-10" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" />
                    <line x1="10" y1="10" x2="14" y2="10" />
                    <line x1="10" y1="14" x2="14" y2="14" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Identify Medication
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
                Use our AI tool to quickly get details on usage, disease mapping, and dosage.
              </p>
            </div>
          </div>

          {/* Action Option Cards */}
          <div className="space-y-3 pt-2">
            {/* Option 1: Scan QR Code */}
            <button
              type="button"
              onClick={() => handleSelectOption('qr')}
              className="w-full bg-slate-50 hover:bg-teal-50/60 border border-slate-200 rounded-2xl p-4 flex items-center justify-between transition group shadow-xs text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-teal-800 flex items-center justify-center shrink-0">
                  <QrCode size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Scan QR Code</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Scan the official code on the packaging.</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-teal-800 group-hover:bg-teal-100 transition shrink-0 shadow-xs border border-slate-100">
                <ChevronRight size={18} />
              </div>
            </button>

            {/* Option 2: Identify via Photo */}
            <button
              type="button"
              onClick={() => handleSelectOption('photo')}
              className="w-full bg-slate-50 hover:bg-teal-50/60 border border-slate-200 rounded-2xl p-4 flex items-center justify-between transition group shadow-xs text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
                  <Camera size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Identify via Photo</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Take a picture of the pill or label.</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-teal-800 group-hover:bg-teal-100 transition shrink-0 shadow-xs border border-slate-100">
                <ChevronRight size={18} />
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Preview, Results & Instructions */}
        <div className="space-y-6">
          
          {/* How It Works Card (Always visible) */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Info size={18} className="text-teal-800" />
              <span>How it works</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <p className="text-xs text-slate-600 leading-snug pt-0.5">
                  Scan or snap a clear photo of the medication or QR code.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <p className="text-xs text-slate-600 leading-snug pt-0.5">
                  Medcare AI analyzes the visual details instantly.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <p className="text-xs text-slate-600 leading-snug pt-0.5">
                  Review detailed dosage, usage, and safety info.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Image & Analysis Actions */}
          {imagePreview && (
            <div className="bg-white border border-teal-200 rounded-3xl p-5 space-y-4 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700">Selected Image Preview</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Change Picture
                </button>
              </div>

              <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
                <img src={imagePreview} alt="Medicine preview" className="w-full h-full object-contain" />
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-2xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Analyzing with Medcare AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Analyze Medication Now
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Analysis Result Display */}
          {scanResult && (
            <div className="bg-white border border-teal-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-base border-b border-slate-100 pb-3">
                <CheckCircle2 size={20} className="text-teal-600" />
                Analysis Complete
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {scanResult}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                * Disclaimer: Always verify dosage with your prescribing doctor or official pharmacy instructions.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}