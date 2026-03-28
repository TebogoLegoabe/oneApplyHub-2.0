import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Upload, FileText, CreditCard, Users, GraduationCap, MapPin,
  Phone, DollarSign, AlertCircle, CheckCircle, X, Shield, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { propertiesAPI } from '../services/api';
import { validateSAID, formatDOBFromID } from '../utils/validateSAID';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Financial', icon: DollarSign },
  { id: 4, title: 'Accommodation', icon: MapPin },
  { id: 5, title: 'Parent/Guardian', icon: Users },
  { id: 6, title: 'Documents', icon: Upload },
  { id: 7, title: 'Review', icon: CheckCircle },
];

const INITIAL_FORM_DATA = {
  firstName: '',
  lastName: '',
  idNumber: '',
  dateOfBirth: '',
  gender: '',
  nationality: 'South African',
  phoneNumber: '',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  university: '',
  studentNumber: '',
  faculty: '',
  yearOfStudy: '',
  degreeProgram: '',
  expectedGraduation: '',
  financialAid: '',
  nsfasApplicant: false,
  parentGuardianIncome: '',
  bankName: '',
  accountNumber: '',
  selectedResidences: [],
  roomType: '',
  specialRequirements: '',
  dietaryRequirements: '',
  parentGuardianName: '',
  parentGuardianIdNumber: '',
  parentGuardianPhone: '',
  parentGuardianEmail: '',
  parentGuardianAddress: '',
  documents: {
    studentCard: null,
    studentId: null,
    parentGuardianId: null,
    proofOfRegistration: null,
    bankStatement: null,
    nsfasLetter: null,
    medicalCertificate: null,
  },
};

// ---------------------------------------------------------------------------
// Sub-components defined OUTSIDE the page component to prevent focus loss
// ---------------------------------------------------------------------------
const InputField = ({ label, value, onChange, type = 'text', required, placeholder, error, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 text-sm ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white'
      }`}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const SAIDInput = ({ label, value, onChange, validationResult, error, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      maxLength={13}
      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-mono tracking-wider text-sm ${
        error ? 'border-red-300 bg-red-50' : validationResult?.isValid ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white'
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder="e.g. 0001015009087"
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    {validationResult && !error && (
      <div className={`mt-2 p-3 rounded-xl text-sm ${validationResult.isValid ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        {validationResult.isValid ? (
          <div className="space-y-1">
            <div className="flex items-center text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Valid SA ID Number
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-emerald-600 text-xs">
              <span>DOB: {formatDOBFromID(validationResult.dateOfBirth)}</span>
              <span>Age: {validationResult.age}</span>
              <span>Gender: {validationResult.gender}</span>
              <span>{validationResult.citizenship}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-4 h-4 mr-1.5" /> {validationResult.error}
          </div>
        )}
      </div>
    )}
  </div>
);

const FileUploadComponent = ({ label, file, error, onUpload, required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
      error ? 'border-red-300 bg-red-50' : file ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 bg-gray-50 dark:bg-gray-700'
    }`}>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onUpload(e.target.files[0])}
        className="hidden"
        id={label}
      />
      <label htmlFor={label} className="cursor-pointer">
        {file ? (
          <div className="flex items-center justify-center space-x-2 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium text-sm">{file.name}</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onUpload(null); }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Upload className="w-7 h-7 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload</p>
            <p className="text-xs text-gray-400">PDF, JPG, PNG (max 5MB)</p>
          </div>
        )}
      </label>
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const StudentApplicationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [stepErrors, setStepErrors] = useState({});
  const [idValidation, setIdValidation] = useState(null);
  const [parentIdValidation, setParentIdValidation] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertiesAPI.getProperties({ per_page: 50 });
        setProperties(response.data.properties || []);
      } catch {
        // silently fail — list defaults to empty
      }
    };
    fetchProperties();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleIdChange = (value) => {
    handleInputChange('idNumber', value);
    if (value.replace(/\s/g, '').length === 13) {
      const result = validateSAID(value);
      setIdValidation(result);
      if (result.isValid && result.dateOfBirth) {
        const dob = result.dateOfBirth;
        const formatted = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;
        handleInputChange('dateOfBirth', formatted);
        handleInputChange('gender', result.gender.toLowerCase());
      }
    } else {
      setIdValidation(null);
    }
  };

  const handleParentIdChange = (value) => {
    handleInputChange('parentGuardianIdNumber', value);
    if (value.replace(/\s/g, '').length === 13) {
      setParentIdValidation(validateSAID(value));
    } else {
      setParentIdValidation(null);
    }
  };

  const handleFileUpload = (documentType, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setStepErrors((prev) => ({ ...prev, [documentType]: 'File size must be under 5MB' }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [documentType]: file },
    }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[documentType];
      return next;
    });
  };

  const handleResidenceSelection = (propertyId) => {
    setFormData((prev) => {
      const current = prev.selectedResidences;
      if (current.includes(propertyId)) {
        return { ...prev, selectedResidences: current.filter((id) => id !== propertyId) };
      }
      if (current.length < 3) {
        return { ...prev, selectedResidences: [...current, propertyId] };
      }
      return prev;
    });
  };

  const validateStep = (step) => {
    const errors = {};
    switch (step) {
      case 1: {
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.idNumber.trim()) {
          errors.idNumber = 'ID number is required';
        } else {
          const idResult = validateSAID(formData.idNumber);
          if (!idResult.isValid) errors.idNumber = idResult.error;
        }
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = 'Phone number is required';
        } else if (!/^(\+27|0)\d{9}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
          errors.phoneNumber = 'Enter a valid SA phone number (e.g. 0812345678)';
        }
        break;
      }
      case 2:
        if (!formData.university) errors.university = 'University is required';
        if (!formData.studentNumber.trim()) errors.studentNumber = 'Student number is required';
        if (!formData.faculty) errors.faculty = 'Faculty is required';
        if (!formData.yearOfStudy) errors.yearOfStudy = 'Year of study is required';
        break;
      case 3:
        if (!formData.financialAid) errors.financialAid = 'Financial aid source is required';
        break;
      case 4:
        if (formData.selectedResidences.length === 0) errors.selectedResidences = 'Select at least 1 residence';
        if (!formData.roomType) errors.roomType = 'Room type is required';
        break;
      case 5:
        if (!formData.parentGuardianName.trim()) errors.parentGuardianName = 'Parent/Guardian name is required';
        if (!formData.parentGuardianIdNumber.trim()) {
          errors.parentGuardianIdNumber = 'ID number is required';
        } else {
          const parentResult = validateSAID(formData.parentGuardianIdNumber);
          if (!parentResult.isValid) errors.parentGuardianIdNumber = parentResult.error;
        }
        if (!formData.parentGuardianPhone.trim()) errors.parentGuardianPhone = 'Phone number is required';
        break;
      case 6:
        if (!formData.documents.studentCard) errors.studentCard = 'Student card is required';
        if (!formData.documents.studentId) errors.studentId = 'Student ID document is required';
        if (!formData.documents.proofOfRegistration) errors.proofOfRegistration = 'Proof of registration is required';
        break;
      default:
        break;
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setStepErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setStepErrors({ terms: 'You must accept the terms and conditions' });
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Personal Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please provide your personal details as they appear on your ID document.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required placeholder="Enter first name" error={stepErrors.firstName} />
              <InputField label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required placeholder="Enter last name" error={stepErrors.lastName} />
              <SAIDInput
                label="SA ID Number"
                value={formData.idNumber}
                onChange={handleIdChange}
                validationResult={idValidation}
                error={stepErrors.idNumber}
                required
              />
              <InputField label="Date of Birth" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} type="date" />
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Gender</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <InputField label="Nationality" value={formData.nationality} onChange={(e) => handleInputChange('nationality', e.target.value)} placeholder="e.g. South African" />
              <InputField label="Phone Number" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} type="tel" required placeholder="e.g. 0812345678" error={stepErrors.phoneNumber} />
              <InputField label="Email Address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" required placeholder="your@email.com" error={stepErrors.email} />
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-500" /> Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField label="Contact Name" value={formData.emergencyContactName} onChange={(e) => handleInputChange('emergencyContactName', e.target.value)} placeholder="Full name" />
                <InputField label="Contact Phone" value={formData.emergencyContactPhone} onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)} type="tel" placeholder="Phone number" />
                <InputField label="Relationship" value={formData.emergencyContactRelation} onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)} placeholder="e.g. Parent" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Academic Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about your studies.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">University <span className="text-red-500">*</span></label>
                <select
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${stepErrors.university ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                >
                  <option value="">Select University</option>
                  <option value="wits">University of the Witwatersrand</option>
                  <option value="uj">University of Johannesburg</option>
                </select>
                {stepErrors.university && <p className="mt-1 text-sm text-red-600">{stepErrors.university}</p>}
              </div>
              <InputField label="Student Number" value={formData.studentNumber} onChange={(e) => handleInputChange('studentNumber', e.target.value)} required placeholder="e.g. 2307134" error={stepErrors.studentNumber} />
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Faculty <span className="text-red-500">*</span></label>
                <select
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${stepErrors.faculty ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                  value={formData.faculty}
                  onChange={(e) => handleInputChange('faculty', e.target.value)}
                >
                  <option value="">Select Faculty</option>
                  <option value="engineering">Engineering</option>
                  <option value="commerce">Commerce</option>
                  <option value="law">Law</option>
                  <option value="health-sciences">Health Sciences</option>
                  <option value="humanities">Humanities</option>
                  <option value="science">Science</option>
                  <option value="education">Education</option>
                  <option value="management">Management</option>
                  <option value="art-design">Art & Design</option>
                </select>
                {stepErrors.faculty && <p className="mt-1 text-sm text-red-600">{stepErrors.faculty}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Year of Study <span className="text-red-500">*</span></label>
                <select
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${stepErrors.yearOfStudy ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                  value={formData.yearOfStudy}
                  onChange={(e) => handleInputChange('yearOfStudy', e.target.value)}
                >
                  <option value="">Select Year</option>
                  <option value="1st-year">1st Year</option>
                  <option value="2nd-year">2nd Year</option>
                  <option value="3rd-year">3rd Year</option>
                  <option value="4th-year">4th Year</option>
                  <option value="honours">Honours</option>
                  <option value="masters">Masters</option>
                  <option value="phd">PhD</option>
                </select>
                {stepErrors.yearOfStudy && <p className="mt-1 text-sm text-red-600">{stepErrors.yearOfStudy}</p>}
              </div>
              <InputField label="Degree Program" value={formData.degreeProgram} onChange={(e) => handleInputChange('degreeProgram', e.target.value)} placeholder="e.g. Bachelor of Engineering" />
              <InputField label="Expected Graduation" value={formData.expectedGraduation} onChange={(e) => handleInputChange('expectedGraduation', e.target.value)} type="date" />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Financial Information</h3>
              <p className="text-sm text-gray-500">Help us understand your funding situation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Financial Aid Source <span className="text-red-500">*</span></label>
                <select
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${stepErrors.financialAid ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                  value={formData.financialAid}
                  onChange={(e) => handleInputChange('financialAid', e.target.value)}
                >
                  <option value="">Select Source</option>
                  <option value="nsfas">NSFAS</option>
                  <option value="bursary">Bursary</option>
                  <option value="loan">Student Loan</option>
                  <option value="self-funded">Self Funded</option>
                  <option value="parent-funded">Parent/Guardian Funded</option>
                  <option value="other">Other</option>
                </select>
                {stepErrors.financialAid && <p className="mt-1 text-sm text-red-600">{stepErrors.financialAid}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Parent/Guardian Annual Income</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  value={formData.parentGuardianIncome}
                  onChange={(e) => handleInputChange('parentGuardianIncome', e.target.value)}
                >
                  <option value="">Select Income Range</option>
                  <option value="0-50000">R0 – R50,000</option>
                  <option value="50000-100000">R50,000 – R100,000</option>
                  <option value="100000-200000">R100,000 – R200,000</option>
                  <option value="200000-350000">R200,000 – R350,000</option>
                  <option value="350000+">R350,000+</option>
                </select>
              </div>
            </div>

            <label className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.nsfasApplicant}
                onChange={(e) => handleInputChange('nsfasApplicant', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">NSFAS Recipient / Applicant</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tick if you receive or have applied for NSFAS funding</p>
              </div>
            </label>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-blue-500" /> Banking Details
                <span className="ml-2 text-sm font-normal text-gray-400">(Optional)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Bank Name" value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} placeholder="e.g. FNB" />
                <InputField label="Account Number" value={formData.accountNumber} onChange={(e) => handleInputChange('accountNumber', e.target.value)} placeholder="Account number" />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Accommodation Preferences</h3>
              <p className="text-sm text-gray-500">Select up to 3 preferred residences in order of priority.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Preferred Residences <span className="text-red-500">*</span>
                  <span className="ml-2 text-blue-600">({formData.selectedResidences.length}/3 selected)</span>
                </label>
              </div>
              {stepErrors.selectedResidences && <p className="mb-2 text-sm text-red-600">{stepErrors.selectedResidences}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto pr-1">
                {properties.map((property) => {
                  const isSelected = formData.selectedResidences.includes(property.id);
                  const selectionIndex = formData.selectedResidences.indexOf(property.id);
                  return (
                    <div
                      key={property.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 bg-white dark:bg-gray-700'
                      }`}
                      onClick={() => handleResidenceSelection(property.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{property.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{property.address}</p>
                          <p className="text-sm font-semibold text-blue-600 mt-1.5">
                            R{property.price_min?.toLocaleString()} – R{property.price_max?.toLocaleString()}/mo
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold ml-2 flex-shrink-0">
                            {selectionIndex + 1}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {properties.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No properties available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Room Type Preference <span className="text-red-500">*</span></label>
                <select
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${stepErrors.roomType ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                  value={formData.roomType}
                  onChange={(e) => handleInputChange('roomType', e.target.value)}
                >
                  <option value="">Select Room Type</option>
                  <option value="single">Single Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="apartment">Apartment Style</option>
                  <option value="no-preference">No Preference</option>
                </select>
                {stepErrors.roomType && <p className="mt-1 text-sm text-red-600">{stepErrors.roomType}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Dietary Requirements</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  value={formData.dietaryRequirements}
                  onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                >
                  <option value="">No Special Requirements</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                  <option value="gluten-free">Gluten Free</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Special Requirements or Disabilities</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm resize-none"
                rows={3}
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                placeholder="Please describe any special accommodations needed..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Parent/Guardian Information</h3>
              <p className="text-sm text-gray-500">Provide details for your parent or legal guardian.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Full Name" value={formData.parentGuardianName} onChange={(e) => handleInputChange('parentGuardianName', e.target.value)} required placeholder="Full name" error={stepErrors.parentGuardianName} />
              <SAIDInput
                label="SA ID Number"
                value={formData.parentGuardianIdNumber}
                onChange={handleParentIdChange}
                validationResult={parentIdValidation}
                error={stepErrors.parentGuardianIdNumber}
                required
              />
              <InputField label="Phone Number" value={formData.parentGuardianPhone} onChange={(e) => handleInputChange('parentGuardianPhone', e.target.value)} type="tel" required placeholder="e.g. 0812345678" error={stepErrors.parentGuardianPhone} />
              <InputField label="Email Address" value={formData.parentGuardianEmail} onChange={(e) => handleInputChange('parentGuardianEmail', e.target.value)} type="email" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Home Address</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm resize-none"
                rows={3}
                value={formData.parentGuardianAddress}
                onChange={(e) => handleInputChange('parentGuardianAddress', e.target.value)}
                placeholder="Full residential address"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Document Upload</h3>
              <p className="text-sm text-gray-500">Upload the required documents. All documents must be clear and legible.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FileUploadComponent label="Student Card" file={formData.documents.studentCard} error={stepErrors.studentCard} onUpload={(f) => handleFileUpload('studentCard', f)} required />
              <FileUploadComponent label="Student ID Document" file={formData.documents.studentId} error={stepErrors.studentId} onUpload={(f) => handleFileUpload('studentId', f)} required />
              <FileUploadComponent label="Parent/Guardian ID" file={formData.documents.parentGuardianId} error={stepErrors.parentGuardianId} onUpload={(f) => handleFileUpload('parentGuardianId', f)} />
              <FileUploadComponent label="Proof of Registration" file={formData.documents.proofOfRegistration} error={stepErrors.proofOfRegistration} onUpload={(f) => handleFileUpload('proofOfRegistration', f)} required />
              <FileUploadComponent label="Bank Statement (Last 3 months)" file={formData.documents.bankStatement} error={stepErrors.bankStatement} onUpload={(f) => handleFileUpload('bankStatement', f)} />
              {formData.nsfasApplicant && <FileUploadComponent label="NSFAS Approval Letter" file={formData.documents.nsfasLetter} error={stepErrors.nsfasLetter} onUpload={(f) => handleFileUpload('nsfasLetter', f)} />}
              <FileUploadComponent label="Medical Certificate (if applicable)" file={formData.documents.medicalCertificate} error={stepErrors.medicalCertificate} onUpload={(f) => handleFileUpload('medicalCertificate', f)} />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">Document Requirements</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                  <li>Accepted formats: PDF, JPG, PNG</li>
                  <li>Maximum file size: 5MB per document</li>
                  <li>Documents must be current and valid</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Review & Submit</h3>
              <p className="text-sm text-gray-500">Please verify all information before submitting your application.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-blue-500" /> Personal Information
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-gray-600">ID: {formData.idNumber}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{formData.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{formData.phoneNumber}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm">
                  <GraduationCap className="w-4 h-4 mr-2 text-blue-500" /> Academic Information
                </h4>
                <p className="text-sm text-gray-600">
                  {formData.university === 'wits' ? 'Wits' : formData.university === 'uj' ? 'UJ' : formData.university}
                </p>
                <p className="text-sm text-gray-600">Student #: {formData.studentNumber}</p>
                <p className="text-sm text-gray-600 capitalize">{formData.faculty} – {formData.yearOfStudy}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm">
                  <DollarSign className="w-4 h-4 mr-2 text-blue-500" /> Financial Information
                </h4>
                <p className="text-sm text-gray-600 capitalize">Source: {formData.financialAid}</p>
                {formData.nsfasApplicant && <p className="text-sm text-emerald-600 font-semibold">NSFAS Applicant</p>}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-blue-500" /> Selected Residences
                </h4>
                {formData.selectedResidences.map((id, index) => {
                  const property = properties.find((p) => p.id === id);
                  return <p key={id} className="text-sm text-gray-600">{index + 1}. {property?.name || 'Unknown'}</p>;
                })}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-blue-500" /> Parent/Guardian
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{formData.parentGuardianName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{formData.parentGuardianPhone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" /> Documents
                </h4>
                <p className="text-sm text-gray-600">
                  {Object.values(formData.documents).filter(Boolean).length} / {Object.keys(formData.documents).length} uploaded
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">Before Submitting</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400">
                  <li>Ensure all information is accurate and complete</li>
                  <li>Verify all required documents have been uploaded</li>
                  <li>Applications cannot be modified after submission</li>
                </ul>
              </div>
            </div>

            <label className={`flex items-start space-x-3 p-4 rounded-xl cursor-pointer border-2 transition-colors ${
              termsAccepted ? 'bg-emerald-50 border-emerald-200' : stepErrors.terms ? 'bg-red-50 border-red-200' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (stepErrors.terms) setStepErrors((prev) => { const n = { ...prev }; delete n.terms; return n; });
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 mt-0.5"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                I confirm that all information provided is accurate and I agree to the terms and conditions of oneApplyHub.
              </span>
            </label>
            {stepErrors.terms && <p className="text-sm text-red-600">{stepErrors.terms}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Your accommodation application has been submitted successfully.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Reference: <span className="font-mono font-semibold">APP-{Date.now().toString().slice(-8)}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">You will receive a confirmation email shortly.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Student Accommodation Application</h1>
          <p className="text-blue-100 mt-2">Complete each step to submit your application.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="hidden md:flex items-center justify-between mb-5">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <>
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-2 text-center font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${currentStep > step.id ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </>
              );
            })}
          </div>
          <div className="md:hidden flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Step {currentStep} of {STEPS.length}</span>
            <span className="text-sm font-semibold text-blue-600">{STEPS[currentStep - 1].title}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-8">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </button>
          {currentStep === 7 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg shadow-emerald-200 text-sm"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> Submitting...</>
              ) : (
                <><CheckCircle className="w-4 h-4 mr-2" /> Submit Application</>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationPage;
