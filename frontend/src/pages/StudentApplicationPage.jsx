import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Home,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import { applicationsAPI, propertiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { validateSAID } from '../utils/validateSAID';

const ACCOMMODATION_STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Studies', icon: GraduationCap },
  { id: 3, title: 'Accommodation', icon: MapPin },
  { id: 4, title: 'Guardian', icon: Users },
  { id: 5, title: 'Documents', icon: Upload },
  { id: 6, title: 'Review', icon: CheckCircle },
];

const UNIVERSITY_STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Studies', icon: GraduationCap },
  { id: 3, title: 'Universities', icon: Home },
  { id: 4, title: 'Results', icon: Upload },
  { id: 5, title: 'Review', icon: CheckCircle },
];

const INITIAL_PROFILE_FORM = {
  firstName: '',
  lastName: '',
  idNumber: '',
  phoneNumber: '',
  nationality: 'South African',
  studentNumber: '',
  faculty: '',
  yearOfStudy: '',
  degreeProgram: '',
  financialAid: '',
  nsfasApplicant: false,
  parentGuardianName: '',
  parentGuardianIdNumber: '',
  parentGuardianPhone: '',
  parentGuardianEmail: '',
  studentIdDocument: null,
  parentGuardianIdDocument: null,
};

const STATUS_META = {
  pending: { label: 'Pending', className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300' },
  under_review: { label: 'Under review', className: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-500/10 dark:text-brand-300' },
  approved: { label: 'Approved', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300' },
  partially_approved: { label: 'Partially approved', className: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-500/10 dark:text-brand-300' },
  rejected: { label: 'Rejected', className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300' },
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Could not read file'));
  reader.readAsDataURL(file);
});

const profileToFormFields = (profile) => {
  if (!profile) return {};
  return {
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    idNumber: profile.id_number || '',
    phoneNumber: profile.phone_number || '',
    nationality: profile.nationality || 'South African',
    studentNumber: profile.student_number || '',
    faculty: profile.faculty || '',
    yearOfStudy: profile.year_of_study || '',
    degreeProgram: profile.degree_program || '',
    financialAid: profile.financial_aid || '',
    nsfasApplicant: Boolean(profile.nsfas_applicant),
    parentGuardianName: profile.parent_guardian_name || '',
    parentGuardianIdNumber: profile.parent_guardian_id_number || '',
    parentGuardianPhone: profile.parent_guardian_phone || '',
    parentGuardianEmail: profile.parent_guardian_email || '',
  };
};

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

const DocumentInput = ({ label, fileName, onUpload, onRemove, error }) => (
  <Field label={label} optional error={error}>
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900">
      <input id={`doc-${label}`} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onUpload(e.target.files?.[0] || null)} />
      <label htmlFor={`doc-${label}`} className="cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-300">
        {fileName ? <span className="text-emerald-600">{fileName}</span> : 'Upload JPG, PNG, or PDF (max 5 MB)'}
      </label>
      {fileName && <button type="button" onClick={onRemove} className="ml-3 text-xs font-bold text-red-500 hover:underline">Remove</button>}
    </div>
  </Field>
);

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold capitalize ${meta.className}`}>{meta.label.replace('_', ' ')}</span>;
};

const ResultsEditor = ({ title, results, onChange, fileName, onUploadDocument, onRemoveDocument }) => {
  const addRow = () => onChange([...results, { subject: '', mark: '' }]);
  const updateRow = (i, key, value) => onChange(results.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  const removeRow = (i) => onChange(results.filter((_, idx) => idx !== i));
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"><Plus className="h-3.5 w-3.5" />Add subject</button>
      </div>
      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input value={r.subject} onChange={(e) => updateRow(i, 'subject', e.target.value)} placeholder="Subject" className={inputClass} />
            <input value={r.mark} onChange={(e) => updateRow(i, 'mark', e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="%" className={`${inputClass} w-20`} />
            <button type="button" onClick={() => removeRow(i)} className="shrink-0 rounded-xl border border-slate-200 px-3 text-slate-400 hover:bg-slate-50 dark:border-slate-700"><X className="h-4 w-4" /></button>
          </div>
        ))}
        {!results.length && <p className="text-xs text-slate-400">No subjects added yet.</p>}
      </div>
      <div className="mt-3">
        <DocumentInput label={`${title} slip`} fileName={fileName} onUpload={onUploadDocument} onRemove={onRemoveDocument} />
      </div>
    </div>
  );
};

const ApplicationTypeCards = ({ accommodationApp, universityApp, loading }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
          <p className="mb-2 inline-flex rounded-full bg-brand-500/15 px-3 py-1 text-xs font-bold text-brand-200 ring-1 ring-brand-400/20">My Applications</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Choose application type</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Apply for accommodation, university admission, or both — your personal details only need to be entered once.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <button onClick={() => navigate('/application?type=accommodation')} className="group overflow-hidden rounded-3xl border border-brand-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-brand-400 hover:shadow-xl dark:border-brand-900/60 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Home className="h-7 w-7" />
              </div>
              {loading ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">Checking...</span> : accommodationApp && <StatusBadge status={accommodationApp.overall_status} />}
            </div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Accommodation Application</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {accommodationApp ? 'You have already submitted your accommodation application. Open it to view status per property and your reference.' : 'Apply once and select up to three preferred residences from verified accommodation listings.'}
            </p>
            {accommodationApp && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Reference</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-950 dark:text-white">{accommodationApp.reference}</p>
              </div>
            )}
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white group-hover:bg-brand-700">
              {accommodationApp ? 'View status' : 'Start application'} <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          <button onClick={() => navigate('/application?type=university')} className="group overflow-hidden rounded-3xl border border-gold-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-gold-400 hover:shadow-xl dark:border-gold-900/60 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-300">
                <GraduationCap className="h-7 w-7" />
              </div>
              {loading ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">Checking...</span> : universityApp && <StatusBadge status={universityApp.overall_status} />}
            </div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">University Application</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {universityApp ? 'You have already submitted your university application. Open it to view status per choice and your reference.' : 'Apply to up to three universities and programmes using your Grade 11 and Grade 12 June results.'}
            </p>
            {universityApp && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Reference</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-950 dark:text-white">{universityApp.reference}</p>
              </div>
            )}
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-bold text-white group-hover:bg-gold-700">
              {universityApp ? 'View status' : 'Start application'} <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentApplicationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const params = new URLSearchParams(location.search);
  const applicationType = params.get('type');

  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(undefined);
  const [accommodationApp, setAccommodationApp] = useState(undefined);
  const [universityApp, setUniversityApp] = useState(undefined);
  const [properties, setProperties] = useState([]);
  const [propertySearch, setPropertySearch] = useState('');
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState(INITIAL_PROFILE_FORM);
  const [accommodationForm, setAccommodationForm] = useState({ selectedResidences: [], roomType: '', specialRequirements: '' });
  const [accommodationDocs, setAccommodationDocs] = useState({ proofOfRegistration: null, bankStatement: null, nsfasLetter: null });
  const [universityChoices, setUniversityChoices] = useState([{ university: '', programme: '' }]);
  const [grade11Results, setGrade11Results] = useState([]);
  const [grade12JuneResults, setGrade12JuneResults] = useState([]);
  const [grade11Doc, setGrade11Doc] = useState(null);
  const [grade12JuneDoc, setGrade12JuneDoc] = useState(null);

  const profileApplied = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, accRes, uniRes] = await Promise.all([
          applicationsAPI.getProfile(),
          applicationsAPI.getMyAccommodation(),
          applicationsAPI.getMyUniversity(),
        ]);
        setProfile(profileRes.data.profile);
        setAccommodationApp(accRes.data.application);
        setUniversityApp(uniRes.data.application);
      } catch {
        setProfile(null);
        setAccommodationApp(null);
        setUniversityApp(null);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (applicationType === 'accommodation' && !properties.length) {
      propertiesAPI.getProperties({ per_page: 100 }).then((res) => setProperties(res.data.properties || [])).catch(() => {});
    }
  }, [applicationType, properties.length]);

  useEffect(() => {
    if (profile && !profileApplied.current) {
      profileApplied.current = true;
      setForm((prev) => ({ ...prev, ...profileToFormFields(profile) }));
    }
  }, [profile]);

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

  const setAccommodationValue = (key, value) => {
    setAccommodationForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const selectResidence = (id) => setAccommodationForm((prev) => {
    const selected = prev.selectedResidences;
    if (selected.includes(id)) return { ...prev, selectedResidences: selected.filter((x) => x !== id) };
    if (selected.length >= 3) return prev;
    return { ...prev, selectedResidences: [...selected, id] };
  });

  const uploadDocument = async (setter, key, file, maxBytes = 5 * 1024 * 1024) => {
    if (!file) { setter((prev) => ({ ...prev, [key]: null })); return; }
    if (file.size > maxBytes) {
      setErrors((prev) => ({ ...prev, [key]: 'File must be under 5 MB' }));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setter((prev) => ({ ...prev, [key]: { name: file.name, dataUrl } }));
      setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    } catch {
      setErrors((prev) => ({ ...prev, [key]: 'Could not read file' }));
    }
  };

  const stepHeader = (title, text, Icon) => (
    <div className="mb-5 flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><Icon className="h-5 w-5" /></div>
      <div><h3 className="text-base font-bold text-slate-950 dark:text-white">{title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p></div>
    </div>
  );

  const renderPersonalStep = () => (
    <>
      {stepHeader('Personal information', `Signed in as ${user?.email || ''}. Required fields are checked only on final submit.`, User)}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput label="First name" value={form.firstName} onChange={(e) => setValue('firstName', e.target.value)} error={errors.firstName} />
        <TextInput label="Last name" value={form.lastName} onChange={(e) => setValue('lastName', e.target.value)} error={errors.lastName} />
        <TextInput label="SA ID number" value={form.idNumber} onChange={(e) => setValue('idNumber', e.target.value.replace(/\D/g, ''))} error={errors.idNumber} />
        <TextInput label="Phone number" value={form.phoneNumber} onChange={(e) => setValue('phoneNumber', e.target.value)} error={errors.phoneNumber} />
        <TextInput label="Nationality" value={form.nationality} onChange={(e) => setValue('nationality', e.target.value)} optional />
        <DocumentInput label="Student / applicant ID document" fileName={form.studentIdDocument?.name} onUpload={(file) => uploadDocument(setForm, 'studentIdDocument', file)} onRemove={() => setForm((p) => ({ ...p, studentIdDocument: null }))} error={errors.studentIdDocument} />
      </div>
    </>
  );

  const renderStudiesStep = () => (
    <>
      {stepHeader('Studies and funding', `Registered university: ${user?.university?.toUpperCase() || 'Not set'}.`, GraduationCap)}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput label="Student number" value={form.studentNumber} onChange={(e) => setValue('studentNumber', e.target.value)} error={errors.studentNumber} optional={applicationType === 'university'} />
        <TextInput label="Faculty / field" value={form.faculty} onChange={(e) => setValue('faculty', e.target.value)} error={errors.faculty} optional={applicationType === 'university'} />
        <SelectInput label="Year of study" value={form.yearOfStudy} onChange={(e) => setValue('yearOfStudy', e.target.value)} error={errors.yearOfStudy} optional={applicationType === 'university'}>
          <option value="">Select year</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12 / Matric">Grade 12 / Matric</option>
          <option value="1st-year">1st Year</option>
          <option value="2nd-year">2nd Year</option>
          <option value="3rd-year">3rd Year</option>
          <option value="4th-year">4th Year</option>
          <option value="honours">Honours</option>
          <option value="masters">Masters</option>
        </SelectInput>
        <TextInput label="Degree programme" value={form.degreeProgram} onChange={(e) => setValue('degreeProgram', e.target.value)} optional />
        <SelectInput label="Financial aid" value={form.financialAid} onChange={(e) => setValue('financialAid', e.target.value)} error={errors.financialAid} optional={applicationType === 'university'}>
          <option value="">Select source</option>
          <option value="nsfas">NSFAS</option>
          <option value="bursary">Bursary</option>
          <option value="loan">Student loan</option>
          <option value="self-funded">Self funded</option>
          <option value="parent-funded">Parent funded</option>
        </SelectInput>
      </div>
      <label className="mt-4 flex gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-500/10">
        <input type="checkbox" checked={form.nsfasApplicant} onChange={(e) => setValue('nsfasApplicant', e.target.checked)} />
        <span className="text-sm text-slate-700 dark:text-slate-300"><b>NSFAS recipient or applicant</b><br />Tick this if you receive or applied for NSFAS funding.</span>
      </label>
    </>
  );

  const renderGuardianStep = () => (
    <>
      {stepHeader('Parent or guardian', 'Provide guardian contact details for your application.', Users)}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput label="Parent/guardian name" value={form.parentGuardianName} onChange={(e) => setValue('parentGuardianName', e.target.value)} error={errors.parentGuardianName} />
        <TextInput label="Parent/guardian ID number" value={form.parentGuardianIdNumber} onChange={(e) => setValue('parentGuardianIdNumber', e.target.value.replace(/\D/g, ''))} error={errors.parentGuardianIdNumber} />
        <TextInput label="Parent/guardian phone" value={form.parentGuardianPhone} onChange={(e) => setValue('parentGuardianPhone', e.target.value)} error={errors.parentGuardianPhone} />
        <TextInput label="Parent/guardian email" type="email" value={form.parentGuardianEmail} onChange={(e) => setValue('parentGuardianEmail', e.target.value)} optional />
        <DocumentInput label="Parent/guardian ID document" fileName={form.parentGuardianIdDocument?.name} onUpload={(file) => uploadDocument(setForm, 'parentGuardianIdDocument', file)} onRemove={() => setForm((p) => ({ ...p, parentGuardianIdDocument: null }))} error={errors.parentGuardianIdDocument} />
      </div>
    </>
  );

  // ---- Accommodation wizard ----

  const selectedPropertyNames = properties.filter((p) => accommodationForm.selectedResidences.includes(p.id)).map((p) => p.name);

  const validateAccommodation = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.phoneNumber.trim()) next.phoneNumber = 'Required';
    if (!form.idNumber.trim()) next.idNumber = 'Required';
    else if (!validateSAID(form.idNumber).isValid) next.idNumber = validateSAID(form.idNumber).error;
    if (!form.studentNumber.trim()) next.studentNumber = 'Required';
    if (!form.faculty.trim()) next.faculty = 'Required';
    if (!form.yearOfStudy) next.yearOfStudy = 'Required';
    if (!form.financialAid) next.financialAid = 'Required';
    if (!accommodationForm.selectedResidences.length) next.selectedResidences = 'Select at least one residence';
    if (!accommodationForm.roomType) next.roomType = 'Required';
    if (!form.parentGuardianName.trim()) next.parentGuardianName = 'Required';
    if (!form.parentGuardianIdNumber.trim()) next.parentGuardianIdNumber = 'Required';
    if (!form.parentGuardianPhone.trim()) next.parentGuardianPhone = 'Required';
    if (!termsAccepted) next.terms = 'Accept the terms before submitting';
    return next;
  };

  const accommodationStepWithError = (next) => {
    if (next.firstName || next.lastName || next.phoneNumber || next.idNumber) return 1;
    if (next.studentNumber || next.faculty || next.yearOfStudy || next.financialAid) return 2;
    if (next.selectedResidences || next.roomType) return 3;
    if (next.parentGuardianName || next.parentGuardianIdNumber || next.parentGuardianPhone) return 4;
    return 6;
  };

  const submitAccommodation = async () => {
    const next = validateAccommodation();
    if (Object.keys(next).length) {
      setErrors(next);
      setStep(accommodationStepWithError(next));
      return;
    }
    setLoading(true);
    setSubmitError('');
    try {
      const res = await applicationsAPI.submitAccommodation({
        ...form,
        studentIdDocument: form.studentIdDocument?.dataUrl || null,
        parentGuardianIdDocument: form.parentGuardianIdDocument?.dataUrl || null,
        selectedResidences: accommodationForm.selectedResidences,
        roomType: accommodationForm.roomType,
        specialRequirements: accommodationForm.specialRequirements,
        documents: {
          proofOfRegistration: accommodationDocs.proofOfRegistration?.dataUrl || null,
          bankStatement: accommodationDocs.bankStatement?.dataUrl || null,
          nsfasLetter: accommodationDocs.nsfasLetter?.dataUrl || null,
        },
      });
      setAccommodationApp(res.data.application);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.response?.status === 409) setAccommodationApp(err.response.data.application);
      else setSubmitError(err.response?.data?.error || 'Something went wrong while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAccommodationStep = () => {
    if (step === 1) return renderPersonalStep();
    if (step === 2) return renderStudiesStep();
    if (step === 3) return (
      <>
        {stepHeader('Accommodation preferences', 'Search and select up to three preferred residences.', MapPin)}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} placeholder="Search property by name, address, or university..." className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
            {propertySearch && <button type="button" onClick={() => setPropertySearch('')} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Clear</button>}
          </div>
        </div>
        {errors.selectedResidences && <p className="mb-3 text-xs font-bold text-red-600">{errors.selectedResidences}</p>}
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} found</span>
          <span>{accommodationForm.selectedResidences.length}/3 selected</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((p) => {
            const active = accommodationForm.selectedResidences.includes(p.id);
            return (
              <button type="button" key={p.id} onClick={() => selectResidence(p.id)} className={`rounded-2xl border p-4 text-left transition-all ${active ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex justify-between gap-3">
                  <div><p className="text-sm font-bold text-slate-950 dark:text-white">{p.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.address}</p></div>
                  {active && <CheckCircle className="h-5 w-5 shrink-0 text-brand-600" />}
                </div>
                <p className="mt-3 text-xs font-bold text-brand-600">R{p.price_min?.toLocaleString()} to R{p.price_max?.toLocaleString()}</p>
              </button>
            );
          })}
        </div>
        {!filteredProperties.length && <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">No properties match your search.</div>}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectInput label="Room type" value={accommodationForm.roomType} onChange={(e) => setAccommodationValue('roomType', e.target.value)} error={errors.roomType}>
            <option value="">Select type</option>
            <option value="single">Single</option>
            <option value="double">2-sharing</option>
          </SelectInput>
          <TextInput label="Special requirements" value={accommodationForm.specialRequirements} onChange={(e) => setAccommodationValue('specialRequirements', e.target.value)} optional placeholder="Accessibility, quiet room, etc." />
        </div>
      </>
    );
    if (step === 4) return renderGuardianStep();
    if (step === 5) return (
      <>
        {stepHeader('Supporting documents', 'Documents can be uploaded now or later after submitting.', Upload)}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DocumentInput label="Proof of registration" fileName={accommodationDocs.proofOfRegistration?.name} onUpload={(file) => uploadDocument(setAccommodationDocs, 'proofOfRegistration', file)} onRemove={() => setAccommodationDocs((p) => ({ ...p, proofOfRegistration: null }))} />
          <DocumentInput label="Bank statement" fileName={accommodationDocs.bankStatement?.name} onUpload={(file) => uploadDocument(setAccommodationDocs, 'bankStatement', file)} onRemove={() => setAccommodationDocs((p) => ({ ...p, bankStatement: null }))} />
          <DocumentInput label="NSFAS letter" fileName={accommodationDocs.nsfasLetter?.name} onUpload={(file) => uploadDocument(setAccommodationDocs, 'nsfasLetter', file)} onRemove={() => setAccommodationDocs((p) => ({ ...p, nsfasLetter: null }))} />
        </div>
      </>
    );
    return (
      <>
        {stepHeader('Review and submit', 'Confirm your details before submitting your accommodation application.', ShieldCheck)}
        <div className="space-y-4 text-sm">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-bold text-slate-950 dark:text-white">Applicant</p><p className="mt-1 text-slate-500 dark:text-slate-400">{form.firstName} {form.lastName} · {user?.email} · {form.phoneNumber}</p></div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-bold text-slate-950 dark:text-white">Studies</p><p className="mt-1 text-slate-500 dark:text-slate-400">{form.studentNumber} · {form.faculty} · {form.yearOfStudy}</p></div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-bold text-slate-950 dark:text-white">Selected residences</p><p className="mt-1 text-slate-500 dark:text-slate-400">{selectedPropertyNames.join(', ') || 'None selected'}</p></div>
          <label className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-500/10">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
            <span className="text-sm text-slate-700 dark:text-slate-300">I confirm that the information provided is accurate and I agree to the <Link to="/terms" className="font-bold text-brand-600 underline">Terms</Link> and <Link to="/privacy" className="font-bold text-brand-600 underline">Privacy Policy</Link>.</span>
          </label>
          {errors.terms && <p className="text-xs font-bold text-red-600">{errors.terms}</p>}
          {submitError && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300">{submitError}</p>}
        </div>
      </>
    );
  };

  // ---- University wizard ----

  const updateUniversityChoice = (i, next) => setUniversityChoices((prev) => prev.map((c, idx) => (idx === i ? next : c)));
  const addUniversityChoice = () => { if (universityChoices.length < 3) setUniversityChoices((prev) => [...prev, { university: '', programme: '' }]); };
  const removeUniversityChoice = (i) => setUniversityChoices((prev) => prev.filter((_, idx) => idx !== i));

  const validateUniversity = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.phoneNumber.trim()) next.phoneNumber = 'Required';
    if (!form.idNumber.trim()) next.idNumber = 'Required';
    else if (!validateSAID(form.idNumber).isValid) next.idNumber = validateSAID(form.idNumber).error;
    const validChoices = universityChoices.filter((c) => c.university.trim());
    if (!validChoices.length) next.universityChoices = 'Add at least one university';
    if (!termsAccepted) next.terms = 'Accept the terms before submitting';
    return next;
  };

  const universityStepWithError = (next) => {
    if (next.firstName || next.lastName || next.phoneNumber || next.idNumber) return 1;
    if (next.universityChoices) return 3;
    return 5;
  };

  const submitUniversity = async () => {
    const next = validateUniversity();
    if (Object.keys(next).length) {
      setErrors(next);
      setStep(universityStepWithError(next));
      return;
    }
    setLoading(true);
    setSubmitError('');
    try {
      const res = await applicationsAPI.submitUniversity({
        ...form,
        studentIdDocument: form.studentIdDocument?.dataUrl || null,
        parentGuardianIdDocument: form.parentGuardianIdDocument?.dataUrl || null,
        universityChoices: universityChoices.filter((c) => c.university.trim()),
        grade11Results: grade11Results.filter((r) => r.subject.trim()),
        grade12JuneResults: grade12JuneResults.filter((r) => r.subject.trim()),
        grade11ResultsDocument: grade11Doc?.dataUrl || null,
        grade12JuneResultsDocument: grade12JuneDoc?.dataUrl || null,
      });
      setUniversityApp(res.data.application);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.response?.status === 409) setUniversityApp(err.response.data.application);
      else setSubmitError(err.response?.data?.error || 'Something went wrong while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUniversityStep = () => {
    if (step === 1) return renderPersonalStep();
    if (step === 2) return renderStudiesStep();
    if (step === 3) return (
      <>
        {stepHeader('University choices', 'Add up to three universities and programmes you want to apply to.', Home)}
        {errors.universityChoices && <p className="mb-3 text-xs font-bold text-red-600">{errors.universityChoices}</p>}
        <div className="space-y-3">
          {universityChoices.map((choice, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[1fr_1fr_auto]">
              <input value={choice.university} onChange={(e) => updateUniversityChoice(i, { ...choice, university: e.target.value })} placeholder="University name" className={inputClass} />
              <input value={choice.programme} onChange={(e) => updateUniversityChoice(i, { ...choice, programme: e.target.value })} placeholder="Programme (optional)" className={inputClass} />
              <button type="button" onClick={() => removeUniversityChoice(i)} disabled={universityChoices.length === 1} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-400 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        {universityChoices.length < 3 && (
          <button type="button" onClick={addUniversityChoice} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"><Plus className="h-3.5 w-3.5" />Add another university</button>
        )}
      </>
    );
    if (step === 4) return (
      <>
        {stepHeader('Grade 11 and Grade 12 June results', 'Add your subjects and marks. You can also upload a copy of your results slip.', Upload)}
        <div className="space-y-4">
          <ResultsEditor title="Grade 11 final results" results={grade11Results} onChange={setGrade11Results} fileName={grade11Doc?.name} onUploadDocument={async (file) => {
            if (!file) { setGrade11Doc(null); return; }
            if (file.size > 5 * 1024 * 1024) { setErrors((prev) => ({ ...prev, grade11Doc: 'File must be under 5 MB' })); return; }
            const dataUrl = await readFileAsDataUrl(file);
            setGrade11Doc({ name: file.name, dataUrl });
          }} onRemoveDocument={() => setGrade11Doc(null)} />
          <ResultsEditor title="Grade 12 June results" results={grade12JuneResults} onChange={setGrade12JuneResults} fileName={grade12JuneDoc?.name} onUploadDocument={async (file) => {
            if (!file) { setGrade12JuneDoc(null); return; }
            if (file.size > 5 * 1024 * 1024) { setErrors((prev) => ({ ...prev, grade12JuneDoc: 'File must be under 5 MB' })); return; }
            const dataUrl = await readFileAsDataUrl(file);
            setGrade12JuneDoc({ name: file.name, dataUrl });
          }} onRemoveDocument={() => setGrade12JuneDoc(null)} />
        </div>
      </>
    );
    return (
      <>
        {stepHeader('Review and submit', 'Confirm your details before submitting your university application.', ShieldCheck)}
        <div className="space-y-4 text-sm">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-bold text-slate-950 dark:text-white">Applicant</p><p className="mt-1 text-slate-500 dark:text-slate-400">{form.firstName} {form.lastName} · {user?.email} · {form.phoneNumber}</p></div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-bold text-slate-950 dark:text-white">University choices</p><p className="mt-1 text-slate-500 dark:text-slate-400">{universityChoices.filter((c) => c.university.trim()).map((c) => c.programme ? `${c.university} (${c.programme})` : c.university).join(', ') || 'None selected'}</p></div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-bold text-slate-950 dark:text-white">Results captured</p><p className="mt-1 text-slate-500 dark:text-slate-400">Grade 11: {grade11Results.filter((r) => r.subject.trim()).length} subjects · Grade 12 June: {grade12JuneResults.filter((r) => r.subject.trim()).length} subjects</p></div>
          <label className="flex gap-3 rounded-2xl border border-gold-100 bg-gold-50 p-4 dark:border-gold-900 dark:bg-gold-500/10">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
            <span className="text-sm text-slate-700 dark:text-slate-300">I confirm that the information provided is accurate and I agree to the <Link to="/terms" className="font-bold text-brand-600 underline">Terms</Link> and <Link to="/privacy" className="font-bold text-brand-600 underline">Privacy Policy</Link>.</span>
          </label>
          {errors.terms && <p className="text-xs font-bold text-red-600">{errors.terms}</p>}
          {submitError && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300">{submitError}</p>}
        </div>
      </>
    );
  };

  const goToStep = (id) => { setStep(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const loadingSummary = accommodationApp === undefined || universityApp === undefined;

  if (!applicationType || (applicationType !== 'accommodation' && applicationType !== 'university')) {
    return <ApplicationTypeCards accommodationApp={accommodationApp} universityApp={universityApp} loading={loadingSummary} />;
  }

  const isAccommodation = applicationType === 'accommodation';
  const existingApplication = isAccommodation ? accommodationApp : universityApp;
  const STEPS = isAccommodation ? ACCOMMODATION_STEPS : UNIVERSITY_STEPS;
  const theme = isAccommodation
    ? {
      percentText: 'text-brand-600',
      progressBar: 'bg-brand-600',
      activeStepChip: 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
      primaryButton: 'bg-brand-600 hover:bg-brand-700',
      stepsGridCols: 'md:grid-cols-6',
    }
    : {
      percentText: 'text-gold-600',
      progressBar: 'bg-gold-600',
      activeStepChip: 'border-gold-500 bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300',
      primaryButton: 'bg-gold-600 hover:bg-gold-700',
      stepsGridCols: 'md:grid-cols-5',
    };

  if (loadingSummary) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-400 dark:bg-slate-950">Loading application...</div>;
  }

  if (existingApplication) {
    const meta = STATUS_META[existingApplication.overall_status] || STATUS_META.pending;
    const rows = isAccommodation ? existingApplication.properties : existingApplication.choices;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <button onClick={() => navigate('/application')} className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300"><ArrowLeft className="mr-1 h-3.5 w-3.5" />Application types</button>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><CheckCircle className="h-6 w-6" /></div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{isAccommodation ? 'Accommodation' : 'University'} application submitted</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your application is saved. Each {isAccommodation ? 'property' : 'university'} reviews its own decision independently.</p>
            <div className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${meta.className}`}>{meta.label}</div>
            <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs font-bold text-slate-400">Reference</p><p className="mt-1 font-mono text-sm font-bold text-slate-950 dark:text-white">{existingApplication.reference}</p></div>
            {Boolean(rows?.length) && (
              <div className="mt-4 space-y-2">
                {rows.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">{isAccommodation ? row.property_name : (row.programme ? `${row.university} — ${row.programme}` : row.university)}</p>
                    <StatusBadge status={row.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <button onClick={() => navigate('/application')} className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300"><ArrowLeft className="mr-1 h-3.5 w-3.5" />Application types</button>
        <div className="mb-5 rounded-3xl bg-slate-950 p-6 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{isAccommodation ? 'Accommodation' : 'University'} application</h1>
              <p className="mt-2 text-sm text-slate-300">Browse sections freely. Required fields are checked only on final submit.</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white"><MapPin className="h-4 w-4" /> Step {step} of {STEPS.length}</div>
          </div>
        </div>
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold text-slate-950 dark:text-white">{isAccommodation ? 'Accommodation' : 'University'}</p><p className={`text-xs font-bold ${theme.percentText}`}>{Math.round((step / STEPS.length) * 100)}% viewed</p></div>
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${theme.progressBar}`} style={{ width: `${(step / STEPS.length) * 100}%` }} /></div>
          <div className={`grid grid-cols-2 gap-2 ${theme.stepsGridCols}`}>
            {STEPS.map(({ id, title, icon: Icon }) => (
              <button key={id} onClick={() => goToStep(id)} className={`rounded-2xl border px-3 py-3 text-xs font-bold transition-all ${step === id ? theme.activeStepChip : 'border-slate-200 text-slate-500 hover:border-brand-300 dark:border-slate-800 dark:text-slate-400'}`}>
                <Icon className="mx-auto mb-1 h-4 w-4" />{title}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isAccommodation ? renderAccommodationStep() : renderUniversityStep()}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => goToStep(Math.max(1, step - 1))} disabled={step === 1} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><ArrowLeft className="mr-2 h-4 w-4" />Previous</button>
            {step < STEPS.length ? (
              <button type="button" onClick={() => goToStep(step + 1)} className={`inline-flex items-center justify-center rounded-xl ${theme.primaryButton} px-5 py-2.5 text-sm font-bold text-white`}>Next<ArrowRight className="ml-2 h-4 w-4" /></button>
            ) : (
              <button type="button" onClick={isAccommodation ? submitAccommodation : submitUniversity} disabled={loading} className={`inline-flex items-center justify-center rounded-xl ${theme.primaryButton} px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50`}>{loading ? 'Submitting...' : 'Submit application'}<CheckCircle className="ml-2 h-4 w-4" /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationPage;
