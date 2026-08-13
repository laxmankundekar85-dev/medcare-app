import React, { useState, useRef } from 'react';
import { QrCode, Camera, Upload, AlertCircle, Sparkles, CheckCircle2, Pill } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function MedicineScanner() {
  const [activeMode, setActiveMode] = useState('qr'); // 'qr' | 'image'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setScanResult(null);
      setError(null);
    }
  };

  // Convert File to Base64 for Server Inspection
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please upload or snap a photo of the medicine first.');
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const base64Image = await convertBase64(selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/scan-medicine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanType: activeMode, // 'qr' or 'image'
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 font-sans">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Medicine Scanner <Sparkles size={20} className="text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">Scan QR codes or upload photos to identify medicines & dosages instantly.</p>
        </div>
        <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center font-bold">
          <Pill size={24} />
        </div>
      </div>

      {/* Option Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 bg-slate-200/60 p-1.5 rounded-2xl">
        <button
          onClick={() => {
            setActiveMode('qr');
            setSelectedImage(null);
            setImagePreview(null);
            setScanResult(null);
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${
            activeMode === 'qr'
              ? 'bg-white text-teal-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode size={18} /> Option 1: Scan Medicine QR
        </button>

        <button
          onClick={() => {
            setActiveMode('image');
            setSelectedImage(null);
            setImagePreview(null);
            setScanResult(null);
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${
            activeMode === 'image'
              ? 'bg-white text-teal-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera size={18} /> Option 2: Upload Photo
        </button>
      </div>

      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center space-y-4 hover:border-teal-600 transition">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative max-w-xs mx-auto h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={imagePreview} alt="Medicine preview" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
            >
              Choose a different image
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer space-y-3 py-6"
          >
            <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto">
              {activeMode === 'qr' ? <QrCode size={32} /> : <Upload size={32} />}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {activeMode === 'qr' ? 'Upload QR Code Image' : 'Snap or Upload Medicine Photo'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Tap to open camera or browse files</p>
            </div>
          </div>
        )}

        {selectedImage && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-2xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Analyzing Medicine Details...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze Medicine Now
              </>
            )}
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Box */}
      {scanResult && (
        <div className="bg-white border border-teal-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-base border-b border-slate-100 pb-3">
            <CheckCircle2 size={22} className="text-teal-600" />
            Medicine Identified
          </div>

          <div className="space-y-3 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {scanResult}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            * Disclaimer: Always double-check medication instructions with your prescribing doctor or official pharmacy label before consumption.
          </div>
        </div>
      )}
    </div>
  );
}