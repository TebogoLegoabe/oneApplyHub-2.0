import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Upload,
  User,
  Users,
} from 'lucide-react';
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
  firstName: '',
  lastName: '',
  idNumber: '',
  email: '',
  phoneNumber: '',
  nationality: 'South African',
  university: '',
  studentNumber: '',
  faculty: '',
  yearOfStudy: '',
  degreeProgram: '',
  financialAid: '',
  nsfasApplicant: false,
  selectedResidences: [],
  roomType: '',
  specialRequirements: '',
  parentGuardianName: '',
  parentGuardianIdNumber: '',
  parentGuardianPhone: '',
  parentGuardianEmail: '',
  documents: {
    studentCard: null,
    studentId: null,
    proofOfRegistration: null,
    parentGuardianId: null,
    bankStatement: null,
    nsfasLetter: null,
  },
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

const TextInput = ({ label, value, onChange, error, optional, type = 'text', placeholder = '' }) => (
  <Field label={label} error={error} optional={optional}>
    <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} className={`${inputClass} ${error ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30' : ''}`} />
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

const ApplicationTypeCards = ({ onAccommodation }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
        <p className="mb-2 inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-black text-blue-200 ring-1 ring-blue-400/20">My Application</p>
        <h1 className="text-2xl font-black sm:text-3xl">Choose application type</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Start your accommodation application now. University applications will be added soon.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <button onClick={onAccommodation} className="group overflow-hidden rounded-3xl border border-blue-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl dark:border-blue-900/60 dark:bg-slate-900">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <Home className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Accommodation Application</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Apply once and select up to three preferred residences from verified accommodation listings.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white group-hover:bg-blue-700">
            Start application <ArrowRight className="h-4 w-4" />
          </div>
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5" /> Coming soon
          </div>
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">University Application</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Soon students will be able to apply for university admission and accommodation from one hub.</p>
          <button disabled className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            Coming soon
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StudentApplicationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const applicationType = params.get('type');

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM_DATA);
  const [properties, setProperties] = useState([]);
  const [propertySearch, setPropertySearch] = useState('');
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [existingApplication, setExistingApplication] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      try {
        const [propRes, appRes] = await Promise.all([
          propertiesAPI.getProperties({ per_page: 100 }),
          applicationsAPI.getMyApplication(),
        ]);
        setProperties(propRes.data.properties || []);
        setExistingApplication(appRes.data.application);
      } catch {
        setExistingApplication(null);
      }
    };
    init();
  }, []);

  const filteredProperties = useMemo(() => {
    const term = propertySearch.trim().toLowerCase();
    if (!term) return properties;
    return properties.filter((property) => [property.name, property.address, property.university]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)));
  }, [properties, propertySearch]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const stepHeader = (title, text, Icon) => (
    <div className="mb-5 flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><Icon className="h-5 w-5" /></div>
      <div><h3 className="text-base font-black text-slate-950 dark:text-white">{title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p></div>
    </div>
  );

  const selectedPropertyNames = properties.filter((p) => form.selectedResidences.includes(p.id)).map((p) => p.name);

  const renderStep = () => {
    if (step === 1) return <>{stepHeader('Personal information', 'Required fields are checked only on final submit.', User)}<div className="grid grid-cols-1 gap-4 md:grid-cols-2"><TextInput label="First name" value={form.firstName} onChange={(e) => setValue('firstName', e.target.value)} error={errors.firstName} /><TextInput label="Last name" value={form.lastName} onChange={(e) => setValue('lastName', e.target.value)} error={errors.lastName} /><TextInput label="SA ID number" value={form.idNumber} onChange={(e) => setValue('idNumber', e.target.value.replace(/\D/g, ''))} error={errors.idNumber} /><TextInput label="Email" type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} error={errors.email} /><TextInput label="Phone number" value={form.phoneNumber} onChange={(e) => setValue('phoneNumber', e.target.value)} error={errors.phoneNumber} /><TextInput label="Nationality" value={form.nationality} onChange={(e) => setValue('nationality', e.target.value)} optional /></div></>;

    if (step === 2) return <>{stepHeader('Studies and funding', 'Tell us about your studies and funding source.', GraduationCap)}<div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-500/10"><p className="text-sm font-black text-slate-950 dark:text-white">University applications coming soon</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Soon students will be able to apply for university admission and accommodation from one hub.</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><SelectInput label="University" value={form.university} onChange={(e) => setValue('university', e.target.value)} error={errors.university}><option value="">Select university</option><option value="wits">Wits</option><option value="uj">UJ</option></SelectInput><TextInput label="Student number" value={form.studentNumber} onChange={(e) => setValue('studentNumber', e.target.value)} error={errors.studentNumber} /><SelectInput label="Faculty" value={form.faculty} onChange={(e) => setValue('faculty', e.target.value)} error={errors.faculty}><option value="">Select faculty</option><option value="engineering">Engineering</option><option value="commerce">Commerce</option><option value="science">Science</option><option value="humanities">Humanities</option><option value="law">Law</option></SelectInput><SelectInput label="Year of study" value={form.yearOfStudy} onChange={(e) => setValue('yearOfStudy', e.target.value)} error={errors.yearOfStudy}><option value="">Select year</option><option value="1st-year">1st Year</option><option value="2nd-year">2nd Year</option><option value="3rd-year">3rd Year</option><option value="4th-year">4th Year</option><option value="honours">Honours</option><option value="masters">Masters</option></SelectInput><TextInput label="Degree programme" value={form.degreeProgram} onChange={(e) => setValue('degreeProgram', e.target.value)} optional /><SelectInput label="Financial aid" value={form.financialAid} onChange={(e) => setValue('financialAid', e.target.value)} error={errors.financialAid}><option value="">Select source</option><option value="nsfas">NSFAS</option><option value="bursary">Bursary</option><option value="loan">Student loan</option><option value="self-funded">Self funded</option><option value="parent-funded">Parent funded</option></SelectInput></div><label className="mt-4 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-500/10"><input type="checkbox" checked={form.nsfasApplicant} onChange={(e) => setValue('nsfasApplicant', e.target.checked)} /><span className="text-sm text-slate-700 dark:text-slate-300"><b>NSFAS recipient or applicant</b><br />Tick this if you receive or applied for NSFAS funding.</span></label></>;

    if (step === 3) return <>{stepHeader('Accommodation preferences', 'Search and select up to three preferred residences.', MapPin)}<div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><Search className="h-4 w-4 text-slate-400" /><input value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} placeholder="Search property by name, address, or university..." className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />{propertySearch && <button type="button" onClick={() => setPropertySearch('')} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Clear</button>}</div></div>{errors.selectedResidences && <p className="mb-3 text-xs font-bold text-red-600">{errors.selectedResidences}</p>}<div className="mb-3 flex items-center justify-between text-xs text-slate-400"><span>{filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} found</span><span>{form.selectedResidences.length}/3 selected</span></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredProperties.map((p) => { const active = form.selectedResidences.includes(p.id); return <button type="button" key={p.id} onClick={() => selectResidence(p.id)} className={`rounded-2xl border p-4 text-left transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'}`}><div className="flex justify-between gap-3"><div><p className="text-sm font-black text-slate-950 dark:text-white">{p.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.address}</p></div>{active && <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" />}</div><p className="mt-3 text-xs font-bold text-blue-600">R{p.price_min?.toLocaleString()} to R{p.price_max?.toLocaleString()}</p></button>; })}</div>{!filteredProperties.length && <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">No properties match your search.</div>}<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"><SelectInput label="Room type" value={form.roomType} onChange={(e) => setValue('roomType', e.target.value)} error={errors.roomType}><option value="">Select type</option><option value="single">Single room</option><option value="shared">Shared room</option><option value="studio">Studio</option></SelectInput><TextInput label="Special requirements" value={form.specialRequirements} onChange={(e) => setValue('specialRequirements', e.target.value)} optional placeholder="Accessibility, quiet room, etc." /></div></>;

    if (step === 4) return <>{stepHeader('Parent or guardian', 'Provide guardian contact details for your application.', Users)}<div className="grid grid-cols-1 gap-4 md:grid-cols-2"><TextInput label="Parent/guardian name" value={form.parentGuardianName} onChange={(e) => setValue('parentGuardianName', e.target.value)} error={errors.parentGuardianName} /><TextInput label="Parent/guardian ID number" value={form.parentGuardianIdNumber} onChange={(e) => setValue('parentGuardianIdNumber', e.target.value.replace(/\D/g, ''))} error={errors.parentGuardianIdNumber} /><TextInput label="Parent/guardian phone" value={form.parentGuardianPhone} onChange={(e) => setValue('parentGuardianPhone', e.target.value)} error={errors.parentGuardianPhone} /><TextInput label="Parent/guardian email" type="email" value={form.parentGuardianEmail} onChange={(e) => setValue('parentGuardianEmail', e.target.value)} optional /></div></>;

    if (step === 5) return <>{stepHeader('Supporting documents', 'Documents can be uploaded now or later after submitting.', Upload)}<div className="grid grid-cols-1 gap-4 md:grid-cols-2"><FileInput label="Student card" file={form.documents.studentCard} onUpload={(file) => setDoc('studentCard', file)} /><FileInput label="Student ID" file={form.documents.studentId} onUpload={(file) => setDoc('studentId', file)} /><FileInput label="Proof of registration" file={form.documents.proofOfRegistration} onUpload={(file) => setDoc('proofOfRegistration', file)} /><FileInput label="Parent/guardian ID" file={form.documents.parentGuardianId} onUpload={(file) => setDoc('parentGuardianId', file)} /><FileInput label="Bank statement" file={form.documents.bankStatement} onUpload={(file) => setDoc('bankStatement', file)} /><FileInput label="NSFAS letter" file={form.documents.nsfasLetter} onUpload={(file) => setDoc('nsfasLetter', file)} /></div></>;

    return <>{stepHeader('Review and submit', 'Confirm your details before submitting your accommodation application.', ShieldCheck)}<div className="space-y-4 text-sm"><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-black text-slate-950 dark:text-white">Applicant</p><p className="mt-1 text-slate-500 dark:text-slate-400">{form.firstName} {form.lastName} · {form.email} · {form.phoneNumber}</p></div><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-black text-slate-950 dark:text-white">Studies</p><p className="mt-1 text-slate-500 dark:text-slate-400">{form.university?.toUpperCase()} · {form.studentNumber} · {form.faculty} · {form.yearOfStudy}</p></div><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-black text-slate-950 dark:text-white">Selected residences</p><p className="mt-1 text-slate-500 dark:text-slate-400">{selectedPropertyNames.join(', ') || 'None selected'}</p></div><label className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-500/10"><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} /><span className="text-sm text-slate-700 dark:text-slate-300">I confirm that the information provided is accurate.</span></label>{errors.terms && <p className="text-xs font-bold text-red-600">{errors.terms}</p>}{submitError && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300">Something went wrong while submitting. Please try again.</p>}</div></>;
  };

  if (!applicationType) {
    return <ApplicationTypeCards onAccommodation={() => navigate('/application?type=accommodation')} />;
  }

  if (applicationType !== 'accommodation') {
    return <ApplicationTypeCards onAccommodation={() => navigate('/application?type=accommodation')} />;
  }

  if (existingApplication === undefined) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-400 dark:bg-slate-950">Loading application...</div>;
  }

  if (existingApplication) {
    const statusClass = STATUS_META[existingApplication.status] || STATUS_META.pending;
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto max-w-4xl px-4 py-6"><button onClick={() => navigate('/application')} className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-black text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><ArrowLeft className="mr-1 h-3.5 w-3.5" />Application types</button><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><CheckCircle className="h-6 w-6" /></div><h1 className="text-2xl font-black text-slate-950 dark:text-white">Accommodation application submitted</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your application is saved and ready for review by the relevant property team.</p><div className="mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${statusClass}">{existingApplication.status?.replace('_', ' ') || 'pending'}</div><div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs font-bold text-slate-400">Reference</p><p className="mt-1 font-mono text-sm font-black text-slate-950 dark:text-white">{existingApplication.reference || existingApplication.id}</p></div></div></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <button onClick={() => navigate('/application')} className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-black text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><ArrowLeft className="mr-1 h-3.5 w-3.5" />Application types</button>
        <div className="mb-5 rounded-3xl bg-slate-950 p-6 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h1 className="text-2xl font-black sm:text-3xl">Accommodation application</h1><p className="mt-2 text-sm text-slate-300">Browse sections freely. Required fields are checked only on final submit.</p></div>
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white"><MapPin className="h-4 w-4" /> Step {step} of 6</div>
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between"><p className="text-sm font-black text-slate-950 dark:text-white">Accommodation</p><p className="text-xs font-black text-blue-600">{Math.round((step / STEPS.length) * 100)}% viewed</p></div>
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${(step / STEPS.length) * 100}%` }} /></div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {STEPS.map(({ id, title, icon: Icon }) => <button key={id} onClick={() => goToStep(id)} className={`rounded-2xl border px-3 py-3 text-xs font-black transition-all ${step === id ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'border-slate-200 text-slate-500 hover:border-blue-300 dark:border-slate-800 dark:text-slate-400'}`}><Icon className="mx-auto mb-1 h-4 w-4" />{title}</button>)}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {renderStep()}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => goToStep(Math.max(1, step - 1))} disabled={step === 1} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><ArrowLeft className="mr-2 h-4 w-4" />Previous</button>
            {step < 6 ? <button type="button" onClick={() => goToStep(step + 1)} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700">Next<ArrowRight className="ml-2 h-4 w-4" /></button> : <button type="button" onClick={submit} disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Submitting...' : 'Submit application'}<CheckCircle className="ml-2 h-4 w-4" /></button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationPage;
