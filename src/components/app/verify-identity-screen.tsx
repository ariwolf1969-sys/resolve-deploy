'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import {
  ArrowLeft,
  CheckCircle,
  Camera,
  Upload,
  Shield,
  FileText,
  UserCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Helper: compress image before upload
async function compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress image'));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

type VerificationStep = 1 | 2 | 3 | 4 | 5;

function StepIndicator({ currentStep }: { currentStep: VerificationStep }) {
  const steps = [
    { num: 1, label: 'DNI' },
    { num: 2, label: 'Foto DNI' },
    { num: 3, label: 'Selfie' },
    { num: 4, label: 'Confirmar' },
  ];

  return (
    <div className="flex items-center justify-between px-4 mb-6">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= step.num
                  ? currentStep > step.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                step.num
              )}
            </div>
            <span className={`text-[9px] mt-1 font-medium ${
              currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 mb-4 ${
              currentStep > step.num ? 'bg-emerald-400' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function VerifyIdentityScreen() {
  const { goBack, currentUser, setCurrentUser } = useAppStore();
  const [step, setStep] = useState<VerificationStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dniNumber, setDniNumber] = useState('');
  const [dniPhotoPreview, setDniPhotoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Load existing verification status
  useState(() => {
    if (currentUser) {
      if (currentUser.dniNumber) {
        setDniNumber(currentUser.dniNumber);
        setStep(2);
      }
      if (currentUser.dniPhotoUrl) {
        setDniPhotoPreview(currentUser.dniPhotoUrl);
        setStep(3);
      }
      if (currentUser.selfieDniUrl) {
        setSelfiePreview(currentUser.selfieDniUrl);
        setStep(4);
      }
      if (currentUser.dniVerified) {
        setStep(5);
      }
    }
  });

  const handleDniSubmit = async () => {
    if (dniNumber.length < 7) {
      setError('Ingresá un número de DNI válido (mínimo 7 dígitos)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${currentUser?.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_dni_number', dniNumber: dniNumber.trim() }),
      });
      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al enviar DNI');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const handleDniPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }

    setUploadProgress('Comprimiendo imagen...');
    setError('');

    try {
      const compressed = await compressImage(file, 800, 600, 0.8);
      const base64 = await fileToBase64(compressed);

      setDniPhotoPreview(base64);
      setUploadProgress('Subiendo foto...');
      setLoading(true);

      const res = await fetch(`/api/users/${currentUser?.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_dni_photo', dniPhotoUrl: base64 }),
      });

      if (res.ok) {
        setStep(3);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al subir foto');
      }
    } catch {
      setError('Error al procesar la imagen');
    }
    setLoading(false);
    setUploadProgress('');
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }

    setUploadProgress('Comprimiendo imagen...');
    setError('');

    try {
      const compressed = await compressImage(file, 800, 600, 0.8);
      const base64 = await fileToBase64(compressed);

      setSelfiePreview(base64);
      setUploadProgress('Subiendo selfie...');
      setLoading(true);

      const res = await fetch(`/api/users/${currentUser?.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_selfie', selfieDniUrl: base64 }),
      });

      if (res.ok) {
        setStep(4);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al subir selfie');
      }
    } catch {
      setError('Error al procesar la imagen');
    }
    setLoading(false);
    setUploadProgress('');
  };

  const handleConfirmVerification = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${currentUser?.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_verification' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          setCurrentUser({ ...currentUser!, dniVerified: true, verified: true });
        }
        setStep(5);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al enviar verificación');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={goBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Verificar identidad</h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">Verificación DNI</p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <StepIndicator currentStep={step} />

        {/* Step 1: DNI Number */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Paso 1: Número de DNI</h2>
                <p className="text-xs text-gray-500 mt-0.5">Ingresá tu Documento Nacional de Identidad</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Número de DNI</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={dniNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    if (digits.length <= 10) setDniNumber(digits);
                  }}
                  placeholder="Ej: 35123456"
                  className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-center text-xl font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  Solo números, sin puntos ni guiones
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleDniSubmit}
                disabled={loading || dniNumber.length < 7}
                className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Continuar'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: DNI Photo */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Paso 2: Foto del DNI</h2>
                <p className="text-xs text-gray-500 mt-0.5">Sacale una foto al frente de tu DNI</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-xs font-semibold text-blue-700 mb-2">Consejos para una buena foto:</h3>
                <ul className="text-xs text-blue-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Buena iluminación, sin sombras
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Todos los datos deben ser legibles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Foto completa del anverso del DNI
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Sin reflejos ni bordes cortados
                  </li>
                </ul>
              </div>

              {dniPhotoPreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-blue-200">
                  <img src={dniPhotoPreview} alt="Foto DNI" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600"
                  >
                    Cambiar foto
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Tocá para subir foto</p>
                    <p className="text-[10px] text-gray-400 mt-1">JPG o PNG, máximo 5MB</p>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleDniPhotoUpload}
                className="hidden"
              />

              {uploadProgress && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <p className="text-xs text-blue-600">{uploadProgress}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Selfie with DNI */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Paso 3: Selfie con DNI</h2>
                <p className="text-xs text-gray-500 mt-0.5">Sacate una foto sosteniendo tu DNI junto a tu cara</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-xs font-semibold text-blue-700 mb-2">Instrucciones:</h3>
                <ul className="text-xs text-blue-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Sostené el DNI al lado de tu cara
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Tu cara y el DNI deben ser visibles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Buena iluminación, sin taparse el rostro
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Gafas de sol y gorras deben ser retiradas
                  </li>
                </ul>
              </div>

              {selfiePreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-blue-200">
                  <img src={selfiePreview} alt="Selfie con DNI" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => selfieInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600"
                  >
                    Cambiar selfie
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => selfieInputRef.current?.click()}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                >
                  <Camera className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Sacar selfie</p>
                    <p className="text-[10px] text-gray-400 mt-1">Sostené tu DNI junto a tu cara</p>
                  </div>
                </button>
              )}

              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleSelfieUpload}
                className="hidden"
              />

              {uploadProgress && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <p className="text-xs text-blue-600">{uploadProgress}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirm & Submit */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Paso 4: Confirmar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Revisá tus datos antes de enviar</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* DNI number summary */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">DNI</p>
                  <p className="text-lg font-bold text-gray-900">{dniNumber}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>

              {/* DNI photo summary */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200">
                  {dniPhotoPreview && (
                    <img src={dniPhotoPreview} alt="DNI" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Foto del DNI</p>
                  <p className="text-xs text-gray-500">Anverso del documento</p>
                </div>
                <CheckCircle className="h-5 w-5 text-emerald-500 ml-auto" />
              </div>

              {/* Selfie summary */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200">
                  {selfiePreview && (
                    <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Selfie con DNI</p>
                  <p className="text-xs text-gray-500">Verificación facial</p>
                </div>
                <CheckCircle className="h-5 w-5 text-emerald-500 ml-auto" />
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700">Tus datos están seguros</p>
                  <p className="text-[11px] text-blue-600 mt-0.5 leading-relaxed">
                    Tu información personal se almacena de forma encriptada y solo se usa para verificación.
                    No será compartida con terceros.
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleConfirmVerification}
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Enviar verificación
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Verified / Pending */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ¡Identidad verificada! ✅
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Tu identidad fue verificada exitosamente. Ahora los clientes verán la insignia de verificación en tu perfil.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              DNI: {dniNumber} · {new Date().toLocaleDateString('es-AR')}
            </p>

            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100 mb-6">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Perfil profesional verificado
              </span>
            </div>

            <button
              onClick={goBack}
              className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors"
            >
              Volver a mi perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
