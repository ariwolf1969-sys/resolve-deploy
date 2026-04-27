'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Upload,
  Clock,
  User,
  FileText,
  Send,
  CheckCircle,
  Scale,
  XCircle,
  MessageSquare,
  Camera,
  ImagePlus,
  Lock,
  Eye,
} from 'lucide-react';

type ReporterType = 'client' | 'professional';

const disputeReasons = [
  'El trabajo no se realizó',
  'El trabajo está incompleto',
  'Daños causados',
  'No coincidió con el presupuesto',
  'El profesional no se presentó',
  'El cliente se negó a pagar',
  'Otro',
];

type Severity = 'leve' | 'moderado' | 'grave';

const severityOptions: { value: Severity; label: string; color: string; bg: string; border: string }[] = [
  { value: 'leve', label: 'Leve', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  { value: 'moderado', label: 'Moderado', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
  { value: 'grave', label: 'Grave', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
];

interface TimelineStep {
  label: string;
  status: 'done' | 'current' | 'pending';
}

export function DisputeScreen() {
  const { goBack, setView } = useAppStore();

  // Form state
  const [reporterType, setReporterType] = useState<ReporterType>('client');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('moderado');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submission view
  const [submitted, setSubmitted] = useState(false);
  const [disputeId, setDisputeId] = useState('');

  const addEvidencePhoto = () => {
    if (evidencePhotos.length >= 5) return;
    const id = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setEvidencePhotos((prev) => [...prev, id]);
  };

  const removeEvidencePhoto = (id: string) => {
    setEvidencePhotos((prev) => prev.filter((p) => p !== id));
  };

  const canSubmit =
    reason &&
    description.trim().length >= 20 &&
    severity &&
    reporterType;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const id = `DSP-${Date.now().toString(36).toUpperCase()}`;
      setDisputeId(id);
      setSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  // Timeline data for after submission
  const timeline: TimelineStep[] = submitted
    ? [
        { label: 'Reportado', status: 'done' },
        { label: 'En investigación', status: 'current' },
        { label: 'Resolución', status: 'pending' },
        { label: 'Cerrado', status: 'pending' },
      ]
    : [];

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
            <h1 className="text-lg font-bold text-gray-900">Reportar Problema</h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">Centro de resolución de disputas</p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50">
            <Scale className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      {!submitted ? (
        <div className="p-4 space-y-4">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-800">
                  Los reportes falsos pueden resultar en suspensión de cuenta
                </p>
                <p className="text-[11px] text-red-600/80 mt-0.5 leading-relaxed">
                  Nuestro equipo revisará el caso en un plazo de 48 horas.
                </p>
              </div>
            </div>
          </div>

          {/* Dispute Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 space-y-5">
              {/* Reporter type */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2.5 block">
                  ¿Quién reporta?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReporterType('client')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      reporterType === 'client'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User
                      className={`h-5 w-5 mx-auto mb-1 ${
                        reporterType === 'client' ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`text-xs font-semibold ${
                        reporterType === 'client' ? 'text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      Soy el cliente
                    </p>
                  </button>
                  <button
                    onClick={() => setReporterType('professional')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      reporterType === 'professional'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Shield
                      className={`h-5 w-5 mx-auto mb-1 ${
                        reporterType === 'professional' ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`text-xs font-semibold ${
                        reporterType === 'professional' ? 'text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      Soy el profesional
                    </p>
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Motivo del reporte
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                >
                  <option value="">Seleccioná un motivo</option>
                  {disputeReasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Descripción del problema <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contá en detalle qué sucedió. Cuanta más información proporciones, más rápido podremos resolver tu caso..."
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  rows={4}
                />
                <div className="flex justify-between mt-1.5">
                  <p className="text-[10px] text-gray-400">
                    Mínimo 20 caracteres requeridos
                  </p>
                  <p
                    className={`text-[10px] ${
                      description.length >= 20 ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    {description.length}/20
                  </p>
                </div>
              </div>

              {/* Evidence photos */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2.5 block">
                  Subir evidencia
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  Agregá fotos que respalden tu reporte (máximo 5)
                </p>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {evidencePhotos.map((photo) => (
                    <div
                      key={photo}
                      className="relative aspect-square rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center"
                    >
                      <ImagePlus className="h-4 w-4 text-blue-400" />
                      <button
                        onClick={() => removeEvidencePhoto(photo)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {evidencePhotos.length < 5 && (
                    <button
                      onClick={addEvidencePhoto}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                    >
                      <Camera className="h-4 w-4 text-gray-300" />
                      <span className="text-[8px] text-gray-400 mt-0.5">
                        {evidencePhotos.length}/5
                      </span>
                    </button>
                  )}
                </div>
                {evidencePhotos.length < 5 && (
                  <button
                    onClick={addEvidencePhoto}
                    className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Subir foto
                  </button>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2.5 block">
                  Severidad del problema
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {severityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSeverity(opt.value)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                        severity === opt.value
                          ? `${opt.border} ${opt.bg}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p
                        className={`text-xs font-bold ${
                          severity === opt.value ? opt.color : 'text-gray-600'
                        }`}
                      >
                        {opt.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full py-3.5 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando reporte...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar reporte
              </>
            )}
          </button>

          {!canSubmit && (
            <p className="text-[11px] text-gray-400 text-center">
              Completá todos los campos requeridos para enviar el reporte
            </p>
          )}
        </div>
      ) : (
        /* === AFTER SUBMISSION VIEW === */
        <div className="p-4 space-y-4">
          {/* Success banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-green-800">Reporte enviado</h2>
            <p className="text-xs text-green-600 mt-1">
              Tu caso ha sido registrado y será revisado por nuestro equipo
            </p>
          </div>

          {/* Dispute info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">ID del caso</span>
                <span className="text-sm font-bold font-mono text-gray-900">{disputeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Estado</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700">
                  <Clock className="h-3 w-3" />
                  En investigación
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Reportado por</span>
                <span className="text-xs font-semibold text-gray-700">
                  {reporterType === 'client' ? 'Cliente' : 'Profesional'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Motivo</span>
                <span className="text-xs font-semibold text-gray-700">{reason}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Severidad</span>
                <span
                  className={`text-xs font-bold ${
                    severityOptions.find((s) => s.value === severity)?.color
                  }`}
                >
                  {severityOptions.find((s) => s.value === severity)?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Estado del caso
              </h3>
              <div className="space-y-0">
                {timeline.map((step, idx) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          step.status === 'done'
                            ? 'bg-green-500 text-white'
                            : step.status === 'current'
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-100'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step.status === 'done' ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : step.status === 'current' ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      {idx < timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-10 my-1 rounded-full ${
                            step.status === 'done' ? 'bg-green-400' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-1 pb-3">
                      <p
                        className={`text-xs font-semibold ${
                          step.status === 'done'
                            ? 'text-green-700'
                            : step.status === 'current'
                            ? 'text-blue-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.status === 'current' && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Tu caso está siendo revisado por nuestro equipo de soporte
                        </p>
                      )}
                      {step.status === 'pending' && (
                        <p className="text-[10px] text-gray-300 mt-0.5">Pendiente</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Estimated time */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800">
                  Tiempo estimado de resolución
                </p>
                <p className="text-[11px] text-blue-600/80 mt-0.5 leading-relaxed">
                  Estimamos que tu caso será resuelto en un plazo de <strong>48 horas</strong>. 
                  Recibirás notificaciones sobre cualquier actualización.
                </p>
              </div>
            </div>
          </div>

          {/* Info about escrow */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800">Tu dinero está protegido</p>
                <p className="text-[11px] text-blue-600/80 mt-0.5 leading-relaxed">
                  Durante la investigación, los fondos permanecerán retenidos en escrow. 
                  Una vez resuelto el caso, el dinero será liberado a la parte correspondiente.
                </p>
              </div>
            </div>
          </div>

          {/* Back to quotes button */}
          <button
            onClick={() => setView('home')}
            className="w-full py-3.5 bg-blue-500 text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <MessageSquare className="h-4 w-4" />
            Volver a mis presupuestos
          </button>
        </div>
      )}
    </div>
  );
}
