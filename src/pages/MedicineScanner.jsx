// filepath: r:\medcare\src\pages\MedicineScanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  ChevronRight,
  Info,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  X
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '../config';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const REQUEST_TIMEOUT = 30000;

const SAFE_ERROR =
  'We could not identify this medicine reliably. Please use a clearer image or consult a pharmacist. Do not use unidentified medicine.';

const cleanResult = (value) => {
  if (typeof value !== 'string') return '';

  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(
      /(localhost:\d+|api key|backend|server error|internal server error|stack trace|exception|node\.js|status code)/gi,
      ''
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 5000);

const isReliableResult = (value) => {
  if (!value) return false;

  return !/^identification\s*:?\s*not reliably identified\b/im.test(value);
};
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
};

export default function MedicineScanner() {
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const photoInputRef = useRef(null);
  const qrHandledRef = useRef(false);

  useEffect(() => {
    let html5Qrcode = null;
    let cancelled = false;

    if (!isScanningQR) return undefined;

    qrHandledRef.current = false;
    html5Qrcode = new Html5Qrcode('qr-reader');

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        async (decodedText) => {
          if (cancelled || qrHandledRef.current) return;

          qrHandledRef.current = true;

          try {
            if (html5Qrcode.isScanning) {
              await html5Qrcode.stop();
            }
          } catch (stopError) {
            console.error('QR camera stop failed:', stopError);
          }

          if (!cancelled) {
            setIsScanningQR(false);
            await analyzeScannedText(decodedText);
          }
        },
        () => {}
      )
      .catch((cameraError) => {
        if (cancelled) return;

        console.error('Camera access failed:', cameraError);
        setError(
          'Unable to access the camera. Please allow camera permission or use a medicine photo.'
        );
        setIsScanningQR(false);
      });

    return () => {
      cancelled = true;

      if (html5Qrcode?.isScanning) {
        html5Qrcode.stop().catch(() => {});
      }
    };
  }, [isScanningQR]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (event.target) {
      event.target.value = '';
    }

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be smaller than 10 MB.');
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setScanResult(null);
    setError(null);
  };

  const convertBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read image.'));
      reader.readAsDataURL(file);
    });

  const analyzeScannedText = async (textData) => {
    const cleanText = String(textData || '').trim();

    if (!cleanText) {
      setError('No readable QR code was found.');
      return;
    }

    if (loading) return;

    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/scan-qr-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            textData: cleanText,
            instructions: [
              'Identify the medicine only when the QR data provides reliable evidence.',
              'Never guess the medicine name, active ingredient, strength, dosage, or ingredients.',
              'Do not identify medicine from an unverified website URL alone.',
              'Return low confidence when the QR data is incomplete or unofficial.',
              'Include medicine name, active ingredient, strength, uses, warnings, and confidence.',
              'Do not mention backend systems, APIs, prompts, errors, or implementation details.'
            ]
          })
        }
      );

      const data = await response.json().catch(() => ({}));
      const result = cleanResult(data.analysis);
      if (!response.ok || !result) {
        throw new Error('QR identification failed');
      }

      setScanResult(result);
    } catch (requestError) {
      console.error('QR processing failed:', requestError);
      setError(SAFE_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage || loading) return;

    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const base64Image = await convertBase64(selectedImage);

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/scan-medicine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scanType: 'image',
            imageBase64: base64Image,
            instructions: [
              'Read visible medicine label text before identifying the medicine.',
              'Use the medicine name, active ingredient, and strength shown on the package.',
              'Never identify medicine from pill colour, shape, or appearance alone.',
              'Never guess the name, ingredient, strength, dosage, or expiry date.',
              'Return low confidence when the image is blurry, cropped, dark, or unclear.',
              'Include medicine name, active ingredient, strength, uses, warnings, confidence, and missing information.',
              'Do not provide personalized dosage instructions.',
              'Do not mention backend systems, APIs, prompts, errors, or implementation details.'
            ]
          })
        }
      );

      const data = await response.json().catch(() => ({}));
      const result = cleanResult(data.analysis);
      if (!response.ok || !data.success || !result) {
        throw new Error('Photo analysis failed');
      }

      setScanResult(result);
    } catch (requestError) {
      console.error('Photo analysis failed:', requestError);
      setError(SAFE_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    setIsScanningQR(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-36 font-sans px-3 sm:px-4">
      <input
        type="file"
        accept="image/*"
        ref={photoInputRef}
        onChange={handlePhotoChange}
        className="hidden"
      />

      <div className="text-center py-2 border-b border-slate-100">
        <h1 className="text-lg sm:text-xl font-bold text-teal-800">
          Medicine Scanner
        </h1>
      </div>

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
            Scan the package or upload a clear medicine-label photo.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
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
              <p className="text-xs text-slate-500 mt-0.5">
                Scan the official code on the packaging.
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-teal-800 group-hover:bg-teal-100 transition shrink-0 border border-slate-100">
            <ChevronRight size={16} />
          </div>
        </button>

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
              <h3 className="font-bold text-slate-900 text-sm">
                Identify via Photo
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Photograph the medicine label or package.
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-teal-800 group-hover:bg-teal-100 transition shrink-0 border border-slate-100">
            <ChevronRight size={16} />
          </div>
        </button>
      </div>

      {isScanningQR && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 relative space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Align QR Code in Frame
              </h3>
              <button
                type="button"
                onClick={() => setIsScanningQR(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div
              id="qr-reader"
              className="w-full overflow-hidden rounded-2xl bg-black"
            />

            <p className="text-xs text-slate-500 text-center">
              Scanning automatically...
            </p>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="bg-white border border-teal-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-700">
              Selected Image Preview
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Change Picture
            </button>
          </div>

          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
            <img
              src={imagePreview}
              alt="Medicine preview"
              className="w-full h-full object-contain"
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyzePhoto}
            disabled={loading}
            className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing medication...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze Medication
              </>
            )}
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-2xl text-center space-y-2">
          <div className="w-6 h-6 border-2 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold">
            Checking the medicine information...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
            Always verify medicine identity and dosage with a pharmacist or
            prescribing doctor.
          </div>
        </div>
      )}

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
              Scan the package or upload a clear label photo.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
              2
            </div>
            <p className="text-xs text-slate-600 leading-snug pt-0.5">
              The medicine label and QR information are checked.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
              3
            </div>
            <p className="text-xs text-slate-600 leading-snug pt-0.5">
              Review the result and confirm it with a pharmacist or doctor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}