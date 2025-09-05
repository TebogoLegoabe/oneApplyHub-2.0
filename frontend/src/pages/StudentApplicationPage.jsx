import React, { useState, useEffect } from 'react';
import { User, Upload, FileText, CreditCard, Users, GraduationCap, MapPin, Calendar, Phone, Mail, DollarSign, AlertCircle, CheckCircle, X } from 'lucide-react';

const StudentApplicationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    phoneNumber: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Academic Information
    university: '',
    studentNumber: '',
    faculty: '',
    yearOfStudy: '',
    degreeProgram: '',
    expectedGraduation: '',
    
    // Financial Information
    financialAid: '',
    nsfasApplicant: false,
    parentGuardianIncome: '',
    bankName: '',
    accountNumber: '',
    
    // Accommodation Preferences
    selectedResidences: [],
    roomType: '',
    specialRequirements: '',
    dietaryRequirements: '',
    
    // Parent/Guardian Information
    parentGuardianName: '',
    parentGuardianIdNumber: '',
    parentGuardianPhone: '',
    parentGuardianEmail: '',
    parentGuardianAddress: '',
    
    // Documents
    documents: {
      studentCard: null,
      studentId: null,
      parentGuardianId: null,
      proofOfRegistration: null,
      bankStatement: null,
      nsfasLetter: null,
      medicalCertificate: null
    }
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Academic Details', icon: GraduationCap },
    { id: 3, title: 'Financial Information', icon: DollarSign },
    { id: 4, title: 'Accommodation Preferences', icon: MapPin },
    { id: 5, title: 'Parent/Guardian Details', icon: Users },
    { id: 6, title: 'Document Upload', icon: Upload },
    { id: 7, title: 'Review & Submit', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/properties?per_page=50');
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (documentType, file) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const handleResidenceSelection = (propertyId) => {
    setFormData(prev => {
      const currentSelections = prev.selectedResidences;
      if (currentSelections.includes(propertyId)) {
        // Remove if already selected
        return {
          ...prev,
          selectedResidences: currentSelections.filter(id => id !== propertyId)
        };
      } else if (currentSelections.length < 3) {
        // Add if less than 3 selected
        return {
          ...prev,
          selectedResidences: [...currentSelections, propertyId]
        };
      }
      return prev; // Don't add if already 3 selected
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.idNumber && formData.email && formData.phoneNumber;
      case 2:
        return formData.university && formData.studentNumber && formData.faculty && formData.yearOfStudy;
      case 3:
        return formData.financialAid && (formData.nsfasApplicant || formData.parentGuardianIncome);
      case 4:
        return formData.selectedResidences.length > 0 && formData.roomType;
      case 5:
        return formData.parentGuardianName && formData.parentGuardianIdNumber && formData.parentGuardianPhone;
      case 6:
        return formData.documents.studentCard && formData.documents.studentId && formData.documents.proofOfRegistration;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadComponent = ({ label, documentType, required = false, accept = ".pdf,.jpg,.jpeg,.png" }) => {
    const file = formData.documents[documentType];
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileUpload(documentType, e.target.files[0])}
            className="hidden"
            id={documentType}
          />
          <label htmlFor={documentType} className="cursor-pointer">
            {file ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>{file.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Click to upload {label.toLowerCase()}</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                >
                  <option value="">Select University</option>
                  <option value="wits">University of the Witwatersrand</option>
                  <option value="uj">University of Johannesburg</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Number *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.studentNumber}
                  onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree Program</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.degreeProgram}
                  onChange={(e) => handleInputChange('degreeProgram', e.target.value)}
                  placeholder="e.g., Bachelor of Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.expectedGraduation}
                  onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Aid Source *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Annual Income</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.parentGuardianIncome}
                  onChange={(e) => handleInputChange('parentGuardianIncome', e.target.value)}
                >
                  <option value="">Select Income Range</option>
                  <option value="0-50000">R0 - R50,000</option>
                  <option value="50000-100000">R50,000 - R100,000</option>
                  <option value="100000-200000">R100,000 - R200,000</option>
                  <option value="200000-350000">R200,000 - R350,000</option>
                  <option value="350000+">R350,000+</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nsfasApplicant"
                checked={formData.nsfasApplicant}
                onChange={(e) => handleInputChange('nsfasApplicant', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="nsfasApplicant" className="text-sm text-gray-700">
                I am an NSFAS recipient or applicant
              </label>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Banking Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Accommodation Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select up to 3 preferred residences * ({formData.selectedResidences.length}/3 selected)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.selectedResidences.includes(property.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleResidenceSelection(property.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{property.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                        <p className="text-sm font-medium text-blue-600 mt-2">
                          R{property.price_min} - R{property.price_max}/month
                        </p>
                      </div>
                      {formData.selectedResidences.includes(property.id) && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Preference *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.roomType}
                  onChange={(e) => handleInputChange('roomType', e.target.value)}
                >
                  <option value="">Select Room Type</option>
                  <option value="single">Single Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="apartment">Apartment Style</option>
                  <option value="no-preference">No Preference</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirements</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements or Disabilities</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.parentGuardianName}
                  onChange={(e) => handleInputChange('parentGuardianName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.parentGuardianIdNumber}
                  onChange={(e) => handleInputChange('parentGuardianIdNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.parentGuardianPhone}
                  onChange={(e) => handleInputChange('parentGuardianPhone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.parentGuardianEmail}
                  onChange={(e) => handleInputChange('parentGuardianEmail', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={formData.parentGuardianAddress}
                onChange={(e) => handleInputChange('parentGuardianAddress', e.target.value)}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadComponent
                label="Student Card"
                documentType="studentCard"
                required={true}
              />
              <FileUploadComponent
                label="Student ID Document"
                documentType="studentId"
                required={true}
              />
              <FileUploadComponent
                label="Parent/Guardian ID"
                documentType="parentGuardianId"
                required={true}
              />
              <FileUploadComponent
                label="Proof of Registration"
                documentType="proofOfRegistration"
                required={true}
              />
              <FileUploadComponent
                label="Bank Statement (Last 3 months)"
                documentType="bankStatement"
              />
              {formData.nsfasApplicant && (
                <FileUploadComponent
                  label="NSFAS Approval Letter"
                  documentType="nsfasLetter"
                />
              )}
              <FileUploadComponent
                label="Medical Certificate (if applicable)"
                documentType="medicalCertificate"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Document Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All documents must be clear and legible</li>
                    <li>Accepted formats: PDF, JPG, PNG</li>
                    <li>Maximum file size: 5MB per document</li>
                    <li>Documents must be current and valid</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Review & Submit Application</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  <p className="text-sm text-gray-600">{formData.firstName} {formData.lastName}</p>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                  <p className="text-sm text-gray-600">{formData.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Academic Information</h4>
                  <p className="text-sm text-gray-600">{formData.university}</p>
                  <p className="text-sm text-gray-600">Student #: {formData.studentNumber}</p>
                  <p className="text-sm text-gray-600">{formData.faculty} - {formData.yearOfStudy}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Financial Information</h4>
                  <p className="text-sm text-gray-600">Source: {formData.financialAid}</p>
                  {formData.nsfasApplicant && (
                    <p className="text-sm text-gray-600">NSFAS Applicant</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Selected Residences</h4>
                  {formData.selectedResidences.map((id, index) => {
                    const property = properties.find(p => p.id === id);
                    return (
                      <p key={id} className="text-sm text-gray-600">
                        {index + 1}. {property?.name}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Before submitting:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ensure all information is accurate and complete</li>
                    <li>Check that all required documents have been uploaded</li>
                    <li>Review your residence preferences carefully</li>
                    <li>Applications cannot be modified after submission</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="termsAccept"
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="termsAccept" className="text-sm text-gray-700">
                I confirm that all information provided is accurate and I agree to the terms and conditions
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your accommodation application has been successfully submitted. You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Application Reference: APP-{Date.now()}
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Student Accommodation Application</h1>
          <p className="text-blue-100 mt-2">Complete your application in easy steps</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {currentStep === 7 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationPage;