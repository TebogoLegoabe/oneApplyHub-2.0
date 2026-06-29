import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, GraduationCap, Home, MapPin, ShieldCheck, Upload, User, Users } from 'lucide-react';
import { applicationsAPI, propertiesAPI } from '../services/api';
import { validateSAID } from '../utils/validateSAID';

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Studies', icon: GraduationCap },
  { id: 3, title: 'Accommodation', icon: MapPin },
  { id: 4, title: 'Guardian', icon: Users },
  { id: 5, title: 'Documents', icon: Upload },
  { id: 6, title: 'Review', icon: CheckCircle },
];

const INITIAL_FORM_DATA = {
  firstName: '', lastName: '', idNumber: '', email: '', phoneNumber: '', nationality: 'South African',
  university: '', studentNumber: '', faculty: '', yearOfStudy: '', degreeProgram: '', financialAid: '', nsfasApplicant: false,
  selectedResidences: [], roomType: '', specialRequirements: '',
  parentGuardianName: '', parentGuardianIdNumber: '', parentGuardianPhone: '', parentGuardianEmail: '',
  documents: { studentCard: null, studentId: null, proofOfRegistration: null, parentGuardianId: null, bankStatement: null, nsfasLetter: null },
};

const STATUS_META = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300',
  under_review: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-300',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300',
  rejected: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300',
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const Field = ({ label, error, optional, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
      {label}{optional && <span className="ml-1 font-medium text-slate-400">Optional</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
  </div>
);

const TextInput = ({ label, value, onChange, error, optional, type = 'text' }) => (
  <Field label={label} error={error} optional={optional}>
    <input type={type} value={value || ''} onChange={onChange} className={`${inputClass} ${error ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30' : ''}`} />
  </Field>
);

const SelectInput = ({ label, value, onChange, error, optional, children }) => (
  <Field label={label} error={error} optional={optional}>
    <select value={value || ''} onChange={onChange} className={`${inputClass} ${error ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30' : ''}`}>{children}</select>
  </Field>
);

const FileInput = ({ label, file, onUpload }) => (
  <Field label={label} optional>
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900">
      <input id={label} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onUpload(e.target.files?.[0] || null)} />
      <label htmlFor={label} className="cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-300">
        {file ? <span className="text-emerald-600">{file.name}</span> : 'Upload now or later'}
      </label>
    </div>
  </Field>
);

const StudentApplicationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM_DATA);
  const [properties, setProperties] = useState([]);
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [existingApplication, setExistingApplication] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      try {
        const [propRes, appRes] = await Promise.all([propertiesAPI.getProperties({ per_page: 50 }), applicationsAPI.getMyApplication()]);
        setProperties(propRes.data.properties || []);
        setExistingApplication(appRes.data.application);
      } catch {
        setExistingApplication(null);
      }
    };
    init();
  }, []);

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const setDoc = (key, file) => setForm((prev) => ({ ...prev, documents: { ...prev.documents, [key]: file } }));

  const selectResidence = (id) => setForm((prev) => {
    const selected = prev.selectedResidences;
    if (selected.includes(id)) return { ...prev, selectedResidences: selected.filter((x) => x !== id) };
    if (selected.length >= 3) return prev;
    return { ...prev, selectedResidences: [...selected, id] };
  });

  const validateAll = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.email.trim()) next.email = 'Required';
    if (!form.phoneNumber.trim()) next.phoneNumber = 'Required';
    if (!form.idNumber.trim()) next.idNumber = 'Required';
    else if (!validateSAID(form.idNumber).isValid) next.idNumber = validateSAID(form.idNumber).error;
    if (!form.university) next.university = 'Required';
    if (!form.studentNumber.trim()) next.studentNumber = 'Required';
    if (!form.faculty) next.faculty = 'Required';
    if (!form.yearOfStudy) next.yearOfStudy = 'Required';
    if (!form.financialAid) next.financialAid = 'Required';
    if (!form.selectedResidences.length) next.selectedResidences = 'Select at least one residence';
    if (!form.roomType) next.roomType = 'Required';
    if (!form.parentGuardianName.trim()) next.parentGuardianName = 'Required';
    if (!form.parentGuardianIdNumber.trim()) next.parentGuardianIdNumber = 'Required';
    if (!form.parentGuardianPhone.trim()) next.parentGuardianPhone = 'Required';
    if (!termsAccepted) next.terms = 'Accept the terms before submitting';
    return next;
  };

  const stepWithError = (next) => {
    if (next.firstName || next.lastName || next.email || next.phoneNumber || next.idNumber) return 1;
    if (next.university || next.studentNumber || next.faculty || next.yearOfStudy || next.financialAid) return 2;
    if (next.selectedResidences || next.roomType) return 3;
    if (next.parentGuardianName || next.parentGuardianIdNumber || next.parentGuardianPhone) return 4;
    return 6;
  };

  const submit = async () => {
    const next = validateAll();
    if (Object.keys(next).length) {
      setErrors(next);
      setStep(stepWithError(next));
      return;
    }
    setLoading(true);
    setSubmitError(false);
    try {
      const res = await applicationsAPI.submit(form);
      setExistingApplication(res.data.application);
    } catch (err) {
      if (err.response?.status === 409) setExistingApplication(err.response.data.application);
      else setSubmitError(true);
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (id) => {
    setStep(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepHeader = (title, text, Icon) => <div className="mb-5 flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><Icon className="h-5 w-5" /></div><div><h3 className="text-base font-black text-slate-950 dark:text-white">{title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p></div></div>;

  const renderStep = () => {
    if (step === 1) return <>{stepHeader('Personal information', 'You can browse all sections freely. Required fields are checked on final submit.', User)}<div className="grid grid-cols-1 gap-4 md:grid-cols-2"><TextInput label="First name" value={form.firstName} onChange={(e) => setValue('firstName', e.target.value)} error={errors.firstName} /><TextInput label="Last name" value={form.lastName} onChange={(e) => setValue('lastName', e.target.value)} error={errors.lastName} /><TextInput label="SA ID number" value={form.idNumber} onChange={(e) => setValue('idNumber', e.target.value.replace(/\D/g, ''))} error={errors.idNumber} /><TextInput label="Email" type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} error={errors.email} /><TextInput label="Phone number" value={form.phoneNumber} onChange={(e) => setValue('phoneNumber', e.target.value)} error={errors.phoneNumber} /><TextInput label="Nationality" value={form.nationality} onChange={(e) => setValue('nationality', e.target.value)} optional /></div></>;
    if (step === 2) return <>{stepHeader('Studies and funding', 'University applications are coming soon. For now, complete your accommodation application.', GraduationCap)}<div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-500/10"><p className="text-sm font-black text-slate-950 dark:text-white">University applications coming soon</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Soon students will be able to apply for university admission and accommodation from one hub.</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><SelectInput label="University" value={form.university} onChange={(e) => setValue('university', e.target.value)} error={errors.university}><option value="">Select university</option><option value="wits">Wits</option><option value="uj">UJ</option></SelectInput><TextInput label="Student number" value={form.studentNumber} onChange={(e) => setValue('studentNumber', e.target.value)} error={errors.studentNumber} /><SelectInput label="Faculty" value={form.faculty} onChange={(e) => setValue('faculty', e.target.value)} error={errors.faculty}><option value="">Select faculty</option><option value="engineering">Engineering</option><option value="commerce">Commerce</option><option value="science">Science</option><option value="humanities">Humanities</option><option value="law">Law</option></SelectInput><SelectInput label="Year of study" value={form.yearOfStudy} onChange={(e) => setValue('yearOfStudy', e.target.value)} error={errors.yearOfStudy}><option value="">Select year</option><option value="1st-year">1st Year</option><option value="2nd-year">2nd Year</option><option value="3rd-year">3rd Year</option><option value="4th-year">4th Year</option><option value="honours">Honours</option><option value="masters">Masters</option></SelectInput><TextInput label="Degree programme" value={form.degreeProgram} onChange={(e) => setValue('degreeProgram', e.target.value)} optional /><SelectInput label="Financial aid" value={form.financialAid} onChange={(e) => setValue('financialAid', e.target.value)} error={errors.financialAid}><option value="">Select source</option><option value="nsfas">NSFAS</option><option value="bursary">Bursary</option><option value="loan">Student loan</option><option value="self-funded">Self funded</option><option value="parent-funded">Parent funded</option></SelectInput></div><label className="mt-4 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-500/10"><input type="checkbox" checked={form.nsfasApplicant} onChange={(e) => setValue('nsfasApplicant', e.target.checked)} /><span className="text-sm text-slate-700 dark:text-slate-300"><b>NSFAS recipient or applicant</b><br />Tick this if you receive or applied for NSFAS funding.</span></label></>;
    if (step === 3) return <>{stepHeader('Accommodation preferences', 'Select up to three preferred residences.', MapPin)}{errors.selectedResidences && <p className="mb-3 text-xs font-bold text-red-600">{errors.selectedResidences}</p>}<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{properties.map((p) => { const active = form.selectedResidences.includes(p.id); return <button type="button" key={p.id} onClick={() => selectResidence(p.id)} className={`rounded-2xl border p-4 text-left ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'}`}><div className="flex justify-between gap-3"><div><p className="text-sm font-black text-slate-950 dark:text-white">{p.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.address}</p></div>{active && <CheckCircle className="h-5 w-5 text-blue-600" />}</div><p className="mt-3 text-xs font-bold text-blue-600">R{p.price_min?.toLocaleString()} to R{p.price_max?.toLocaleString()}</p></button>; })}</div><div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"><SelectInput label="Room type" value={form.roomType} onChange={(e) => setValue('roomType', e.target.value)} error={errors.roomType}><option value="">Select type</option><option value="single">Single room</option><option value="shared">Shared room</option><option value="studio">Studio</option></SelectInput><TextInput label="Special requirements" value={form.specialRequirements} onChange={(e) => setValue('specialRequirements', e.target.value)} optional /></div></>;
    if (step === 4) return <>{stepHeader('Parent or guardian', 'Provide guardian details for verification.', Users)}<div className="grid grid-cols-1 gap-4 md:grid-cols-2"><TextInput label="Guardian name" value={form.parentGuardianName} onChange={(e) => setValue('parentGuardianName', e.target.value)} error={errors.parentGuardianName} /><TextInput label="Guardian ID number" value={form.parentGuardianIdNumber} onChange={(e) => setValue('parentGuardianIdNumber', e.target.value.replace(/\D/g, ''))} error={errors.parentGuardianIdNumber} /><TextInput label="Guardian phone" value={form.parentGuardianPhone} onChange={(e) => setValue('parentGuardianPhone', e.target.value)} error={errors.parentGuardianPhone} /><TextInput label="Guardian email" type="email" value={form.parentGuardianEmail} onChange={(e) => setValue('parentGuardianEmail', e.target.value)} optional /></div></>;
    if (step === 5) return <>{stepHeader('Documents', 'Documents are optional at submission. You can upload them later while the application stays pending.', Upload)}<div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300"><b>Upload later:</b> missing documents will not block submission.</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><FileInput label="Student card" file={form.documents.studentCard} onUpload={(f) => setDoc('studentCard', f)} /><FileInput label="Student ID document" file={form.documents.studentId} onUpload={(f) => setDoc('studentId', f)} /><FileInput label="Proof of registration" file={form.documents.proofOfRegistration} onUpload={(f) => setDoc('proofOfRegistration', f)} /><FileInput label="Parent or guardian ID" file={form.documents.parentGuardianId} onUpload={(f) => setDoc('parentGuardianId', f)} /><FileInput label="Bank statement" file={form.documents.bankStatement} onUpload={(f) => setDoc('bankStatement', f)} /><FileInput label="NSFAS letter" file={form.documents.nsfasLetter} onUpload={(f) => setDoc('nsfasLetter', f)} /></div></>;
    return <>{stepHeader('Review and submit', 'Final submit checks required fields only. Documents can be completed later.', CheckCircle)}<div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs text-slate-500">Applicant</p><p className="font-black text-slate-950 dark:text-white">{form.firstName || '—'} {form.lastName}</p><p className="text-xs text-slate-500">{form.email || 'Email missing'}</p></div><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs text-slate-500">University</p><p className="font-black text-slate-950 dark:text-white">{form.university?.toUpperCase() || 'Not selected'}</p><p className="text-xs text-slate-500">{form.studentNumber || 'Student number missing'}</p></div><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs text-slate-500">Residences selected</p><p className="font-black text-slate-950 dark:text-white">{form.selectedResidences.length}</p></div><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs text-slate-500">Documents uploaded</p><p className="font-black text-slate-950 dark:text-white">{Object.values(form.documents).filter(Boolean).length}</p><p className="text-xs text-slate-500">Can be completed later</p></div></div><label className={`mt-4 flex gap-3 rounded-2xl border p-4 ${termsAccepted ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'}`}><input type="checkbox" checked={termsAccepted} onChange={(e) => { setTermsAccepted(e.target.checked); if (errors.terms) setErrors((prev) => { const n = { ...prev }; delete n.terms; return n; }); }} /><span className="text-sm text-slate-700 dark:text-slate-300">I confirm that all information is accurate and agree to the terms and conditions.</span></label>{errors.terms && <p className="mt-1 text-xs font-bold text-red-600">{errors.terms}</p>}</>;
  };

  if (existingApplication === undefined) return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;
  if (existingApplication) {
    const app = existingApplication;
    const status = app.status || 'pending';
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6"><div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4"><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><FileText className="h-3.5 w-3.5" />My application</div><h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Application status</h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Track your accommodation application.</p></div><div className={`mb-4 rounded-2xl border p-4 shadow-sm ${STATUS_META[status] || STATUS_META.pending}`}><p className="text-xs font-bold uppercase tracking-wide opacity-75">Application reference</p><p className="mt-1 font-mono text-lg font-black text-slate-950 dark:text-white">{app.reference}</p><div className="mt-3 inline-flex rounded-xl border bg-white/60 px-3 py-2 text-sm font-black dark:bg-slate-950/30">{status.replace('_', ' ')}</div></div><div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300">Documents can be uploaded or verified later while the application is pending.</div><button onClick={() => navigate('/dashboard')} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Go to dashboard</button></div></div>;
  }

  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);
  const ActiveIcon = STEPS[step - 1].icon;
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6"><div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><FileText className="h-3.5 w-3.5" />My application</div><h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Accommodation application</h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Browse sections freely. Required fields are checked only on final submit.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300"><ActiveIcon className="h-4 w-4" />Step {step} of {STEPS.length}</div></div></div><div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-black text-slate-950 dark:text-white">{STEPS[step - 1].title}</p><p className="text-xs font-bold text-slate-500">{progress}% viewed</p></div><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} /></div><div className="mt-4 hidden grid-cols-6 gap-2 md:grid">{STEPS.map((s) => { const Icon = s.icon; return <button key={s.id} type="button" onClick={() => goToStep(s.id)} className={`rounded-xl border p-2 text-center ${step === s.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 bg-slate-50 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950'}`}><Icon className={`mx-auto h-4 w-4 ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`} /><p className="mt-1 truncate text-[10px] font-bold text-slate-500">{s.title}</p></button>; })}</div><div className="mt-4 flex gap-2 overflow-x-auto md:hidden">{STEPS.map((s) => <button key={s.id} type="button" onClick={() => goToStep(s.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${step === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{s.title}</button>)}</div></div>{submitError && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Something went wrong. Please try again.</div>}<div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">{renderStep()}</div><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button onClick={() => goToStep(Math.max(1, step - 1))} disabled={step === 1} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><ArrowLeft className="mr-2 h-4 w-4" />Previous</button>{step === STEPS.length ? <button onClick={submit} disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{loading ? 'Submitting...' : 'Submit application'}</button> : <button onClick={() => goToStep(Math.min(STEPS.length, step + 1))} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Next step<ArrowRight className="ml-2 h-4 w-4" /></button>}</div><div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><p className="text-sm font-black text-slate-950 dark:text-white">Flexible application</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Students can jump between sections. Final submit requires core details only. Documents may be uploaded later and the application can remain pending.</p></div></div></div></div></div>;
};

export default StudentApplicationPage;
