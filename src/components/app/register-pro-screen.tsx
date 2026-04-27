'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import { ARGENTINA_PROVINCES, getCitiesByProvince, getWorkZonesByProvince, getProvinceName } from '@/lib/argentina-locations';

export function RegisterProfessionalScreen() {
  const { currentUser, setView, setCurrentUser, goBack } = useAppStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    profession: '',
    skills: '',
    experience: '',
    hourlyRate: '',
    bio: '',
    province: '',
    city: '',
    workZone: '',
  });

  const [dniData, setDniData] = useState({
    dniNumber: '',
    dniFrontUploaded: false,
    selfieUploaded: false,
  });

  const [photoData, setPhotoData] = useState({
    profilePhotoUploaded: false,
  });

  const totalSteps = 5;

  const cities = useMemo(() => getCitiesByProvince(formData.province), [formData.province]);
  const workZones = useMemo(() => getWorkZonesByProvince(formData.province), [formData.province]);
  const showWorkZones = formData.province === 'caba' || formData.province === 'buenos_aires';

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          profession: formData.profession,
          skills: formData.skills,
          experience: formData.experience,
          hourlyRate: parseFloat(formData.hourlyRate),
          bio: formData.bio || undefined,
          province: formData.province || undefined,
          city: formData.city || undefined,
          workZone: formData.workZone || undefined,
          avatar: photoData.profilePhotoUploaded ? 'photo_uploaded' : undefined,
          ...(dniData.dniNumber ? { dniNumber: dniData.dniNumber } : {}),
          ...(dniData.dniFrontUploaded && dniData.selfieUploaded ? { dniVerified: true, verified: true } : {}),
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser({ ...currentUser, ...updatedUser });
        setView('profile');
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const canProceedStep1 = formData.province.trim().length > 0 && (formData.city.trim().length > 0 || formData.workZone.trim().length > 0);
  const canProceedStep2 = formData.profession.trim().length > 0 && formData.hourlyRate.trim().length > 0 && parseFloat(formData.hourlyRate) > 0;
  const canProceedStep3 = formData.bio.trim().length > 0 && photoData.profilePhotoUploaded;
  const canProceedStep4 = formData.skills.trim().length > 0 && formData.experience.trim().length > 0;
  const canSubmit = dniData.dniNumber.length >= 7 && dniData.dniFrontUploaded && dniData.selfieUploaded;

  const formatMoney = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num ? new Intl.NumberFormat('es-AR').format(parseInt(num)) : '';
  };

  const formatLocation = () => {
    const parts: string[] = [];
    if (formData.workZone) parts.push(formData.workZone);
    if (formData.city) parts.push(formData.city);
    if (formData.province) parts.push(getProvinceName(formData.province));
    return parts.join(', ');
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Registrarme como profesional</h1>
            <p className="text-[10px] text-muted-foreground">Paso {step} de {totalSteps}</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1 px-4 pb-3">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-orange-500' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Step 1: Ubicación (Province, City, Work Zone) */}
        {step === 1 && (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">&#x1F4CD;</span>
              </div>
              <h2 className="text-lg font-bold">&#xBF;D&#xF3;nde trabaj&#xE1;s?</h2>
              <p className="text-sm text-muted-foreground mt-1">Contanos desde d&#xF3;nde oper&#xE1;s</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">&#x1F30D;</span>
                <div className="text-xs text-orange-800 leading-relaxed">
                  <p className="font-semibold mb-0.5">&#x1F4E1; Trabajamos en toda la Argentina</p>
                  <p>Eleg&#xED; tu provincia y ciudad para que los clientes te encuentren m&#xE1;s f&#xE1;cil.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Province Select */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Provincia <span className="text-red-500">*</span></label>
                <select
                  value={formData.province}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, province: e.target.value, city: '', workZone: '' }));
                  }}
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none cursor-pointer"
                >
                  <option value="">Seleccioná tu provincia</option>
                  {ARGENTINA_PROVINCES.map(prov => (
                    <option key={prov.id} value={prov.id}>{prov.name}</option>
                  ))}
                </select>
              </div>

              {/* Work Zones (only for CABA and Buenos Aires GBA) */}
              {showWorkZones && (
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Zona de trabajo</label>
                  <div className="flex flex-wrap gap-2">
                    {workZones.map(zone => (
                      <button
                        key={zone}
                        onClick={() => setFormData(prev => ({ ...prev, workZone: prev.workZone === zone ? '' : zone }))}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          formData.workZone === zone
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 text-muted-foreground hover:border-orange-300'
                        }`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                  {formData.province === 'buenos_aires' && (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      &#x1F4CD; Si trabaj&#xE1;s en toda la GBA, no necesit&#xE1;s seleccionar zona.
                    </p>
                  )}
                </div>
              )}

              {/* City Select */}
              {formData.province && (
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Ciudad / Localidad <span className="text-red-500">*</span></label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none cursor-pointer"
                  >
                    <option value="">Seleccioná tu ciudad</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom city input */}
              {formData.province && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">&#xBF;No aparece tu ciudad?</label>
                  <input
                    type="text"
                    placeholder="O escrib&#xED; tu ciudad/pueblo..."
                    value={formData.city && cities.includes(formData.city) ? '' : formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 transition-all mt-4"
            >
              Siguiente
            </button>
          </>
        )}

        {/* Step 2: Profesión + Precio por hora */}
        {step === 2 && (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">&#x1F6E0;&#xFE0F;</span>
              </div>
              <h2 className="text-lg font-bold">&#xBF;Cu&#xE1;l es tu profesi&#xF3;n y cu&#xE1;nto cobr&#xE1;s?</h2>
              <p className="text-sm text-muted-foreground mt-1">Los clientes necesitan saber tu tarifa para contactarte</p>
            </div>

            {/* Location badge */}
            {formData.province && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl">
                <span className="text-sm">&#x1F4CD;</span>
                <span className="text-xs font-medium text-orange-700">{formatLocation()}</span>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">&#x1F4B0;</span>
                <div className="text-xs text-amber-800 leading-relaxed">
                  <p className="font-semibold mb-0.5">&#x2728; Similar a TaskRabbit</p>
                  <p>Poner tu precio por hora hace que los clientes te elijan con confianza. Pod&#xE9;s ajustarlo despu&#xE9;s.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Profesi&#xF3;n / Oficio <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ej: Electricista, Plomero, Carpintero..."
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Hourly Rate - MANDATORY */}
              <div>
                <label className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                  <span>Tarifa por hora <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Obligatorio</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 15000"
                    value={formatMoney(formData.hourlyRate)}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value.replace(/\D/g, '') }))}
                    className="w-full pl-9 pr-20 p-3.5 rounded-xl border-2 border-orange-200 bg-orange-50/50 text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">ARS / hora</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  &#x1F4CA; Precio promedio en Buenos Aires: Electricistas $10.000-$15.000, Plomeros $12.000-$18.000, Alba&#xF1;iles $8.000-$12.000
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1.5 block">A&#xF1;os de experiencia</label>
                <div className="flex gap-2">
                  {['1-3 a&#xF1;os', '3-5 a&#xF1;os', '5-10 a&#xF1;os', '10+ a&#xF1;os'].map(exp => (
                    <button
                      key={exp}
                      onClick={() => setFormData(prev => ({ ...prev, experience: exp }))}
                      className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold border transition-all ${
                        formData.experience === exp
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-muted-foreground hover:border-orange-300'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-muted transition-colors">
                Atr&#xE1;s
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all"
              >
                Siguiente
              </button>
            </div>
          </>
        )}

        {/* Step 3: Foto + Descripción */}
        {step === 3 && (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">&#x1F4F7;</span>
              </div>
              <h2 className="text-lg font-bold">Tu foto y descripci&#xF3;n</h2>
              <p className="text-sm text-muted-foreground mt-1">Los profesionales con foto reciben 3x m&#xE1;s contactos</p>
            </div>

            {/* Location + Profession badge */}
            {(formData.province || formData.profession) && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl">
                <span className="text-sm">&#x1F4CD;</span>
                <span className="text-xs font-medium text-orange-700">
                  {[formData.profession, formatLocation()].filter(Boolean).join(' &middot; ')}
                </span>
              </div>
            )}

            {/* Profile Photo Upload */}
            <div className="mb-4">
              <label className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                <span>Foto de perfil <span className="text-red-500">*</span></span>
                <span className="text-[10px] font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Recomendado</span>
              </label>
              <div className="flex items-center gap-4">
                {!photoData.profilePhotoUploaded ? (
                  <button
                    onClick={() => setPhotoData(prev => ({ ...prev, profilePhotoUploaded: true }))}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-orange-400 hover:bg-orange-50/50 transition-all shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="12" x2="12" y1="19" y2="19" />
                    </svg>
                    <span className="text-[9px] text-gray-400 font-medium">Subir foto</span>
                  </button>
                ) : (
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg overflow-hidden">
                      <span className="text-4xl font-bold text-white">{currentUser?.name.charAt(0)}</span>
                    </div>
                    <button
                      onClick={() => setPhotoData(prev => ({ ...prev, profilePhotoUploaded: false }))}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-green-500 rounded-full border-2 border-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Tu cara real genera confianza</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    Us&#xE1; una foto clara donde se vea tu rostro. Sin lentes de sol ni gorras. Los perfiles con foto real reciben hasta 3x m&#xE1;s solicitudes que los que no tienen.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Descripci&#xF3;n profesional <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Ej: Soy electricista matriculado con 10 a&#xF1;os de experiencia. Realizo instalaciones, reparaciones y mantenimiento. Garant&#xED;a escrita en todos mis trabajos. Trabajo en toda Capital y GBA."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={5}
                maxLength={600}
                className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{formData.bio.length}/600 caracteres</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-muted transition-colors">
                Atr&#xE1;s
              </button>
              <button onClick={() => setStep(4)} disabled={!canProceedStep3} className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all">
                Siguiente
              </button>
            </div>
          </>
        )}

        {/* Step 4: Habilidades */}
        {step === 4 && (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">&#x1F527;</span>
              </div>
              <h2 className="text-lg font-bold">Tus habilidades</h2>
              <p className="text-sm text-muted-foreground mt-1">&#xBF;Qu&#xE9; servicios pod&#xE9;s ofrecer?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Habilidades / Servicios <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ej: Instalaciones, reparaciones, tableros, LED"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Separ&#xE1; con comas. Cuantos m&#xE1;s agregues, m&#xE1;s f&#xE1;cil te van a encontrar.</p>
              </div>

              {/* Preview card */}
              {(formData.profession || formData.hourlyRate) && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">As&#xED; te van a ver los clientes:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{currentUser?.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold">{currentUser?.name}</span>
                        {photoData.profilePhotoUploaded && (
                          <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-[8px] font-bold">&#x2713; Foto verificada</span>
                        )}
                      </div>
                      <p className="text-xs text-orange-600 font-medium">{formData.profession}</p>
                      {formatLocation() && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <span>&#x1F4CD;</span> {formatLocation()}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">{formData.experience} de experiencia</p>
                    </div>
                    {formData.hourlyRate && (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-green-600">
                          ${new Intl.NumberFormat('es-AR').format(parseInt(formData.hourlyRate) || 0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">por hora</p>
                      </div>
                    )}
                  </div>
                  {formData.skills && (
                    <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-gray-200">
                      {formData.skills.split(',').map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-orange-50 text-[9px] text-orange-600 font-medium">{skill.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-muted transition-colors">
                Atr&#xE1;s
              </button>
              <button onClick={() => setStep(5)} disabled={!canProceedStep4} className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all">
                Siguiente
              </button>
            </div>
          </>
        )}

        {/* Step 5: Verificación DNI */}
        {step === 5 && (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">&#x1FAAA;</span>
              </div>
              <h2 className="text-lg font-bold">Verific&#xE1; tu identidad</h2>
              <p className="text-sm text-muted-foreground mt-1">Para aparecer como verificado necesitamos verificar tu DNI</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                <div className="text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">&#xBF;Por qu&#xE9; necesitamos esto?</p>
                  <p>La verificaci&#xF3;n de identidad genera confianza. A los profesionales verificados les llega un 3x m&#xE1;s de solicitudes y los clientes se sienten m&#xE1;s seguros contratando.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* DNI Number */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">N&#xFA;mero de DNI <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ej: 35123456"
                  value={dniData.dniNumber}
                  onInput={(e) => setDniData(prev => ({ ...prev, dniNumber: (e.target as HTMLInputElement).value.replace(/\D/g, '') }))}
                  maxLength={8}
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* DNI Front Photo */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Foto del DNI (frente) <span className="text-red-500">*</span></label>
                {!dniData.dniFrontUploaded ? (
                  <button
                    onClick={() => setDniData(prev => ({ ...prev, dniFrontUploaded: true }))}
                    className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-500">Toc&#xE1; para subir foto del DNI</p>
                    <p className="text-[10px] text-gray-400">JPG o PNG, max 5MB</p>
                  </button>
                ) : (
                  <div className="w-full p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-700">DNI subido correctamente</p>
                      <p className="text-[10px] text-green-600">dni_frontal.jpg</p>
                    </div>
                    <button onClick={() => setDniData(prev => ({ ...prev, dniFrontUploaded: false }))} className="p-1 text-green-600 hover:text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Selfie with DNI */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Selfie con el DNI al lado de tu rostro <span className="text-red-500">*</span></label>
                <p className="text-[10px] text-muted-foreground mb-2">Tom&#xE1; una foto tuya sosteniendo tu DNI al lado de tu cara. Ambos deben verse claramente.</p>
                {!dniData.selfieUploaded ? (
                  <button
                    onClick={() => setDniData(prev => ({ ...prev, selfieUploaded: true }))}
                    className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-500">Toc&#xE1; para tomar la selfie</p>
                    <p className="text-[10px] text-gray-400">Tu rostro + DNI visible</p>
                  </button>
                ) : (
                  <div className="w-full p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-700">Selfie subida correctamente</p>
                      <p className="text-[10px] text-green-600">selfie_dni.jpg</p>
                    </div>
                    <button onClick={() => setDniData(prev => ({ ...prev, selfieUploaded: false }))} className="p-1 text-green-600 hover:text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Final preview */}
              {canSubmit && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">&#x2705; As&#xED; te van a ver los clientes:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                      <span className="text-2xl font-bold text-white">{currentUser?.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold">{currentUser?.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[8px] font-bold flex items-center gap-0.5">
                          &#x2713; Verificado
                        </span>
                        {photoData.profilePhotoUploaded && (
                          <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-[8px] font-bold">&#x2713; Foto</span>
                        )}
                      </div>
                      <p className="text-xs text-orange-600 font-medium">{formData.profession}</p>
                      {formatLocation() && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <span>&#x1F4CD;</span> {formatLocation()}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">{formData.experience} de experiencia</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-green-600">
                        ${new Intl.NumberFormat('es-AR').format(parseInt(formData.hourlyRate) || 0)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">por hora</p>
                    </div>
                  </div>
                  {formData.skills && (
                    <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-gray-200">
                      {formData.skills.split(',').map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-orange-50 text-[9px] text-orange-600 font-medium">{skill.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-muted transition-colors">
                Atr&#xE1;s
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={!canSubmit || isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Completar registro
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground mt-2">
              Tu informaci&#xF3;n es privada. Solo mostramos tu nombre, profesi&#xF3;n, foto y barrio. El DNI se usa exclusivamente para verificaci&#xF3;n.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
