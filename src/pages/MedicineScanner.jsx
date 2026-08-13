import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Camera, ChevronRight, Info, 
  Sparkles, AlertCircle, CheckCircle2, RotateCcw, X 
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '../config';

export default function MedicineScanner() {
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const photoInputRef = useRef(null);

  // Streamlined Live QR Scanner using core Html5Qrcode
  useEffect(() => {
    let html5Qrcode = null;

    if (isScanningQR) {
      html5Qrcode = new Html5Qrcode('qr-reader');

      html5Qrcode
        .start(
          { facingMode: 'environment' }, // Default directly to back camera
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          async (decodedText) => {
            // QR Code Detected: Stop scanner automatically & process data
            if (html5Qrcode.isScanning) {
              await html5Qrcode.stop();
            }
            setIsScanningQR(false);
            await analyzeScannedText(decodedText);
          },
          () => {
            // Scanning frame active...
          }
        )
        .catch((err) => {
          console.error('Camera Access Error:', err);
          setError('Unable to access rear camera. Please check camera permissions.');
          setIsScanningQR(false);
        });
    }

    return () => {
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(() => {});
      }
    };
  }, [isScanningQR]);

  // Handle Photo Selection for Option 2
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setScanResult(null);
      setError(null);
    }
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  // Analyze Decoded Text from QR Camera
  const analyzeScannedText = async (textData) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const promptText = `Analyze this scanned pharmaceutical QR string or drug details: "${textData}". 

Please provide a structured clinical breakdown:
💊 **Identified Medicine & Strength**
🏥 **Primary Usage & Targeted Diseases/Symptoms**
⚖️ **Typical Dosage Guidelines**
⚠️ **Essential Precautions & Safety Warnings**

Important Note: Do not summarize logged patient profile records. Focus strictly on explaining the drug from the scanned input string above.`;

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest_user',
          message: promptText
        })
      });

      const data = await response.json();
      
      // Filter out generic profile fallbacks if Gemini API fallback triggers
      if (
        response.ok && 
        data.reply && 
        !data.reply.includes('Your current active Medcare medications')
      ) {
        setScanResult(data.reply);
      } else {
        setScanResult(
          `💊 **Scanned Code Data:**\n"${textData}"\n\n*(Note: Ensure your GEMINI_API_KEY is active in your backend environment variables for full AI analysis.)*`
        );
      }
    } catch (err) {
      console.error('QR Processing Error:', err);
      setError('Network error while analyzing QR code details.');
    } finally {
      setLoading(false);
    }
  };

  // Analyze Uploaded Photo Image
  const handleAnalyzePhoto = async () => {
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
          scanType: 'image',
          imageBase64: base64Image
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setScanResult(data.analysis);
      } else {
        setError(data.error || 'Failed to identify medication photo.');
      }
    } catch (err) {
      console.error('Photo Analysis Error:', err);
      setError('Network error while analyzing photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    setIsScanningQR(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-36 font-sans px-3 sm:px-4">
      {/* Hidden File Input for Option 2 (Photo Upload) */}
      <input
        type="file"
        accept="image/*"
        ref={photoInputRef}
        onChange={handlePhotoChange}
        className="hidden"
      />

      {/* Page Title */}
      <div className="text-center py-2 border-b border-slate-100">
        <h1 className="text-lg sm:text-xl font-bold text-teal-800">
          Medicine Scanner
        </h1>
      </div>

      {/* Hero Graphic */}
      <div className="flex flex-col items-center text-center space-y-3 pt-1">
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-teal-50/80 border border-teal-200/60 shadow-inner">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-teal-100/60 flex items-center justify-center border border-dashed border-teal-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-md">
              <QrCode size={30} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Identify Medication
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
            Use our AI tool to quickly get details on usage, disease mapping, and dosage.
          </p>
        </div>
      </div>

      {/* Option Cards */}
      <div className="space-y-3 pt-1">
        {/* Option 1: Live QR Scanner */}
        <button
          type="button"
          onClick={() => {
            setScanResult(null);
            setError(null);
            setIsScanningQR(true);
          }}
          className="w-full bg-white hover:bg-teal-50/60 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between transition group shadow-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-teal-800 flex items-center justify-center shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scan QR Code</h3>
              <p className="text-xs text-slate-500 mt-0.5">Scan the official code on the packaging.</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-teal-800 group-hover:bg-teal-100 transition shrink-0 border border-slate-100">
            <ChevronRight size={16} />
          </div>
        </button>

        {/* Option 2: Identify via Photo */}
        <button
          type="button"
          onClick={() => {
            setScanResult(null);
            setError(null);
            photoInputRef.current?.click();
          }}
          className="w-full bg-white hover:bg-teal-50/60 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between transition group shadow-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
              <Camera size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Identify via Photo</h3>
              <p className="text-xs text-slate-500 mt-0.5">Take a picture of the pill or label.</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-teal-800 group-hover:bg-teal-100 transition shrink-0 border border-slate-100">
            <ChevronRight size={16} />
          </div>
        </button>
      </div>

      {/* Clean Scanner Modal Window */}
      {isScanningQR && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 relative space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Align QR Code in Frame</h3>
              <button
                type="button"
                onClick={() => setIsScanningQR(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pure Camera Feed Target */}
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl bg-black"></div>

            <p className="text-xs text-slate-500 text-center">
              Scanning automatically...
            </p>
          </div>
        </div>
      )}

      {/* Image Preview & Analyze Box (For Option 2) */}
      {imagePreview && (
        <div className="bg-white border border-teal-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
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

          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
            <img src={imagePreview} alt="Medicine preview" className="w-full h-full object-contain" />
          </div>

          <button
            type="button"
            onClick={handleAnalyzePhoto}
            disabled={loading}
            className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Analyzing with Medcare AI...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze Medication
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-2xl text-center space-y-2">
          <div className="w-6 h-6 border-2 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold">Medcare AI is analyzing your medicine details...</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Result Box */}
      {scanResult && (
        <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm border-b border-slate-100 pb-2">
            <CheckCircle2 size={18} className="text-teal-600" />
            Analysis Complete
          </div>

          <div className="space-y-2 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
            {scanResult}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            * Disclaimer: Always verify dosage with your prescribing doctor or official pharmacy instructions.
          </div>
        </div>
      )}

      {/* How It Works Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
          <Info size={16} className="text-teal-800" />
          <span>How it works</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
              1
            </div>
            <p className="text-xs text-slate-600 leading-snug pt-0.5">
              Scan or snap a clear photo of the medication or QR code.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
              2
            </div>
            <p className="text-xs text-slate-600 leading-snug pt-0.5">
              Medcare AI analyzes the visual details instantly.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
              3
            </div>
            <p className="text-xs text-slate-600 leading-snug pt-0.5">
              Review detailed dosage, usage, and safety info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}