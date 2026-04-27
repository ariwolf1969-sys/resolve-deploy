'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import {
  ArrowLeft,
  MapPin,
  Camera,
  CheckCircle,
  AlertTriangle,
  Lock,
  Shield,
  Clock,
  User,
  FileText,
  Send,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';

type StepStatus = 'pending' | 'active' | 'completed';

interface Step {
  id: number;
  title: string;
  subtitle: string;
  status: StepStatus;
}

const initialSteps: Step[] = [
  { id: 1, title: 'Verificación GPS', subtitle: 'Confirmá tu ubicación', status: 'active' },
  { id: 2, title: 'Evidencia fotográfica', subtitle: 'Foto del lugar', status: 'pending' },
  { id: 3, title: 'Confirmación del cliente', subtitle: 'Llegada confirmada', status: 'pending' },
  { id: 4, title: 'Progreso del trabajo', subtitle: 'Actualizaciones', status: 'pending' },
  { id: 5, title: 'Finalización', subtitle: 'Completar trabajo', status: 'pending' },
];

export function CheckInScreen() {
  const { goBack, setView } = useAppStore();

  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: GPS
  const [gpsVerified, setGpsVerified] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsData, setGpsData] = useState<{
    lat: number;
    lng: number;
    address: string;
    distance: number;
  } | null>(null);

  // Step 2: Photos
  const [locationPhotos, setLocationPhotos] = useState<string[]>([]);
  const [workStartPhotos, setWorkStartPhotos] = useState<string[]>([]);

  // Step 3: Client confirmation
  const [clientConfirmed, setClientConfirmed] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [escrowActivated, setEscrowActivated] = useState(false);

  // Step 4: Progress
  const [progressPhotos, setProgressPhotos] = useState<string[]>([]);
  const [progressNotes, setProgressNotes] = useState('');
  const [progressSent, setProgressSent] = useState(false);

  // Step 5: Completion
  const [checklist, setChecklist] = useState({
    completed: false,
    cleaned: false,
    materials: false,
  });
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [workFinished, setWorkFinished] = useState(false);

  const updateStepStatus = (stepId: number, status: StepStatus) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          if (status === 'completed') {
            const nextStep = prev.find((ss) => ss.id === stepId + 1);
            if (nextStep && nextStep.status === 'pending') {
              return { ...s, status: 'completed' };
            }
          }
          return { ...s, status };
        }
        return s;
      })
    );
  };

  const activateNextStep = () => {
    const nextId = currentStep + 1;
    if (nextId <= 5) {
      setCurrentStep(nextId);
      setSteps((prev) =>
        prev.map((s) => (s.id === nextId ? { ...s, status: 'active' } : s))
      );
    }
  };

  const simulateGPS = () => {
    setGpsLoading(true);
    setTimeout(() => {
      const data = {
        lat: -34.6037 + (Math.random() - 0.5) * 0.001,
        lng: -58.3816 + (Math.random() - 0.5) * 0.001,
        address: 'Av. Corrientes 4521, Almagro, CABA',
        distance: Math.floor(Math.random() * 20 + 5),
      };
      setGpsData(data);
      setGpsVerified(true);
      setGpsLoading(false);
      updateStepStatus(1, 'completed');
      setTimeout(() => activateNextStep(), 600);
    }, 2000);
  };

  const addPhoto = (setter: (prev: string[]) => string[], maxPhotos: number, current: string[]) => {
    if (current.length >= maxPhotos) return;
    const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setter([...current, id]);
  };

  const handleConfirmArrival = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setClientConfirmed(true);
      setEscrowActivated(true);
      setConfirmLoading(false);
      updateStepStatus(3, 'completed');
      setTimeout(() => activateNextStep(), 600);
    }, 1500);
  };

  const sendProgress = () => {
    if (!progressNotes.trim() && progressPhotos.length === 0) return;
    setProgressSent(true);
    setTimeout(() => {
      updateStepStatus(4, 'completed');
      setProgressSent(false);
      activateNextStep();
    }, 1200);
  };

  const handleFinish = () => {
    setWorkFinished(true);
    updateStepStatus(5, 'completed');
    setTimeout(() => {
      setView('quote-detail');
    }, 1500);
  };

  const allChecked = checklist.completed && checklist.cleaned && checklist.materials;

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
            <h1 className="text-lg font-bold text-gray-900">Check-in del Servicio</h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">Anti-fraud · Verificación paso a paso</p>
          </div>
          <div className="p-2 rounded-xl bg-orange-50">
            <Shield className="h-5 w-5 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stepper */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.status === 'completed'
                        ? 'bg-green-500 text-white shadow-md shadow-green-500/25'
                        : step.status === 'active'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-4 ring-orange-100'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <p
                    className={`text-[9px] mt-1.5 text-center leading-tight max-w-[56px] ${
                      step.status === 'completed'
                        ? 'text-green-600 font-semibold'
                        : step.status === 'active'
                        ? 'text-orange-600 font-semibold'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1.5 mt-[-14px] rounded-full transition-all ${
                      step.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: GPS Verification */}
        {currentStep >= 1 && (
          <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              steps[0].status === 'completed' ? 'border-green-200' : 'border-gray-100'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    gpsVerified ? 'bg-green-50' : 'bg-orange-50'
                  }`}
                >
                  <MapPin className={`h-4 w-4 ${gpsVerified ? 'text-green-600' : 'text-orange-500'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Verificación GPS</h3>
                  <p className="text-[11px] text-gray-400">Paso 1 · Ubicación en tiempo real</p>
                </div>
                {gpsVerified && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </div>

              {/* Map placeholder */}
              <div className="relative rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-200 h-40 flex items-center justify-center">
                {gpsVerified ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs font-semibold text-green-700">Ubicación verificada</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">Mapa no disponible</p>
                  </div>
                )}
              </div>

              {gpsVerified && gpsData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    <p className="text-xs font-semibold text-green-700">
                      Ubicación verificada a {gpsData.distance} metros del domicilio del cliente
                    </p>
                  </div>
                  <p className="text-[11px] text-green-600 ml-5">{gpsData.address}</p>
                  <p className="text-[10px] text-green-500/70 font-mono ml-5">
                    {gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {!gpsVerified && (
                <button
                  onClick={simulateGPS}
                  disabled={gpsLoading}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/25"
                >
                  {gpsLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Obtener ubicación
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Photo Evidence */}
        {currentStep >= 2 && (
          <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              steps[1].status === 'completed' ? 'border-green-200' : 'border-gray-100'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Evidencia fotográfica</h3>
                  <p className="text-[11px] text-gray-400">Paso 2 · Registro visual</p>
                </div>
                {steps[1].status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </div>

              {/* Camera placeholder */}
              <div className="relative rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-200 h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                    <Camera className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400">Vista previa de cámara</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 mb-3">
                <p className="text-[11px] text-blue-600 flex items-start gap-1.5">
                  <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  Las fotos incluyen marca de tiempo y ubicación GPS para mayor seguridad
                </p>
              </div>

              {/* Location photos */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Foto del lugar</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {locationPhotos.map((photo) => (
                    <div
                      key={photo}
                      className="aspect-square rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                  {locationPhotos.length < 2 && (
                    <button
                      onClick={() =>
                        addPhoto(setLocationPhotos, 2, locationPhotos)
                      }
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                    >
                      <Camera className="h-5 w-5 text-gray-300 mb-0.5" />
                      <span className="text-[9px] text-gray-400">Agregar</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => addPhoto(setLocationPhotos, 2, locationPhotos)}
                  disabled={locationPhotos.length >= 2}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Tomar foto del lugar
                </button>
              </div>

              {/* Work start photos */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Foto del trabajo iniciado</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {workStartPhotos.map((photo) => (
                    <div
                      key={photo}
                      className="aspect-square rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                  {workStartPhotos.length < 2 && (
                    <button
                      onClick={() =>
                        addPhoto(setWorkStartPhotos, 2, workStartPhotos)
                      }
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                    >
                      <Camera className="h-5 w-5 text-gray-300 mb-0.5" />
                      <span className="text-[9px] text-gray-400">Agregar</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => addPhoto(setWorkStartPhotos, 2, workStartPhotos)}
                  disabled={workStartPhotos.length >= 2}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Tomar foto del trabajo iniciado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Client Confirmation */}
        {currentStep >= 3 && (
          <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              steps[2].status === 'completed' ? 'border-green-200' : 'border-gray-100'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Confirmación del cliente</h3>
                  <p className="text-[11px] text-gray-400">Paso 3 · Verificación de llegada</p>
                </div>
                {steps[2].status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </div>

              {escrowActivated ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-800">Llegada confirmada</p>
                      <p className="text-[11px] text-green-600">
                        El profesional ha llegado al domicilio
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-orange-500" />
                      <p className="text-xs font-semibold text-gray-700">
                        Pago retenido en Escrow
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      El pago quedó retenido de forma segura hasta que liberes los fondos al finalizar el trabajo.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-orange-700 leading-relaxed">
                        Una vez confirmada la llegada, el pago quedará retenido hasta que liberes el pago al finalizar el trabajo.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-2">
                      <User className="h-7 w-7 text-orange-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">El profesional ha llegado</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Confirmá que el profesional se encuentra en tu domicilio
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmArrival}
                    disabled={confirmLoading}
                    className="w-full py-3.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-green-500/25"
                  >
                    {confirmLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Confirmar llegada
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Work Progress */}
        {currentStep >= 4 && (
          <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              steps[3].status === 'completed' ? 'border-green-200' : 'border-gray-100'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Registrar progreso</h3>
                  <p className="text-[11px] text-gray-400">Paso 4 · Actualizaciones del trabajo</p>
                </div>
                {steps[3].status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </div>

              {steps[3].status !== 'completed' && (
                <>
                  {/* Progress photos */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Foto del avance</p>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {progressPhotos.map((photo) => (
                        <div
                          key={photo}
                          className="aspect-square rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 flex items-center justify-center"
                        >
                          <ImageIcon className="h-5 w-5 text-cyan-500" />
                        </div>
                      ))}
                      {progressPhotos.length < 3 && (
                        <button
                          onClick={() =>
                            addPhoto(setProgressPhotos, 3, progressPhotos)
                          }
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                        >
                          <Camera className="h-5 w-5 text-gray-300 mb-0.5" />
                          <span className="text-[9px] text-gray-400">Agregar</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        addPhoto(setProgressPhotos, 3, progressPhotos)
                      }
                      disabled={progressPhotos.length >= 3}
                      className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Tomar foto del avance
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Descripción del trabajo realizado hasta ahora
                    </p>
                    <textarea
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      placeholder="Describí el trabajo realizado hasta ahora..."
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={sendProgress}
                    disabled={progressSent || (!progressNotes.trim() && progressPhotos.length === 0)}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/25"
                  >
                    {progressSent ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar actualización
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Work Completion */}
        {currentStep >= 5 && (
          <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              steps[4].status === 'completed' ? 'border-green-200' : 'border-gray-100'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Finalizar trabajo</h3>
                  <p className="text-[11px] text-gray-400">Paso 5 · Completar servicio</p>
                </div>
                {steps[4].status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </div>

              {workFinished ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="text-sm font-bold text-green-800">¡Trabajo finalizado!</p>
                  <p className="text-[11px] text-green-600 mt-1">
                    Redirigiendo al detalle del presupuesto...
                  </p>
                </div>
              ) : (
                <>
                  {/* Checklist */}
                  <div className="space-y-2.5 mb-4">
                    <label
                      onClick={() =>
                        setChecklist((prev) => ({ ...prev, completed: !prev.completed }))
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checklist.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          checklist.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {checklist.completed && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          checklist.completed ? 'text-green-700' : 'text-gray-700'
                        }`}
                      >
                        Trabajo completado según lo acordado
                      </span>
                    </label>

                    <label
                      onClick={() =>
                        setChecklist((prev) => ({ ...prev, cleaned: !prev.cleaned }))
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checklist.cleaned
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          checklist.cleaned
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {checklist.cleaned && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          checklist.cleaned ? 'text-green-700' : 'text-gray-700'
                        }`}
                      >
                        Limpieza finalizada
                      </span>
                    </label>

                    <label
                      onClick={() =>
                        setChecklist((prev) => ({ ...prev, materials: !prev.materials }))
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checklist.materials
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          checklist.materials
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {checklist.materials && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          checklist.materials ? 'text-green-700' : 'text-gray-700'
                        }`}
                      >
                        Materiales utilizados según presupuesto
                      </span>
                    </label>
                  </div>

                  {/* Completion photos */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Foto del trabajo finalizado
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {completionPhotos.map((photo) => (
                        <div
                          key={photo}
                          className="aspect-square rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center"
                        >
                          <ImageIcon className="h-5 w-5 text-emerald-500" />
                        </div>
                      ))}
                      {completionPhotos.length < 3 && (
                        <button
                          onClick={() =>
                            addPhoto(setCompletionPhotos, 3, completionPhotos)
                          }
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                        >
                          <Camera className="h-5 w-5 text-gray-300 mb-0.5" />
                          <span className="text-[9px] text-gray-400">Agregar</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        addPhoto(setCompletionPhotos, 3, completionPhotos)
                      }
                      disabled={completionPhotos.length >= 3}
                      className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Tomar foto del trabajo finalizado
                    </button>
                  </div>

                  {/* Finish button */}
                  <button
                    onClick={handleFinish}
                    disabled={!allChecked}
                    className="w-full py-3.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-md shadow-green-500/25"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Finalizar
                  </button>
                  {!allChecked && (
                    <p className="text-[11px] text-gray-400 text-center mt-2">
                      Completá todos los checkboxes para finalizar
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
