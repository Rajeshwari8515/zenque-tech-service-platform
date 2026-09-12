import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  UploadCloud, 
  X, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  Sparkles, 
  Edit3, 
  Copy, 
  ShieldCheck, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { SERVICES_DATA } from '../data/mockServices';

export default function ProjectEnquiryView({ 
  selectedService, 
  selectedPackage, 
  setSelectedService, 
  setSelectedPackage, 
  setActiveView 
}) {
  // Step State (1: Requirements, 2: Budget, 3: Timeline, 4: Contact, 5: Files, 6: Consultation, 7: Review, 8: Success)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Default active service and package
  const activeService = selectedService || SERVICES_DATA[0];
  const activePackage = selectedPackage || activeService.packages.find(p => p.isFeatured) || activeService.packages[0];

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    requiredFeatures: '',
    additionalRequirements: '',
    budget: '₹50K – ₹1L',
    timeline: '2–4 Weeks',
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    files: [
      { name: 'project_brief_draft.pdf', size: '1.2 MB', type: 'application/pdf' }
    ],
    needsConsultation: 'yes',
    preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    preferredTime: '10:00 AM - 12:00 PM'
  });

  // Generated Enquiry ID (Fixed prototype structure ZT-10234, persistent once set)
  const [enquiryId] = useState('ZT-10234');

  // Input Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add dummy file
  const handleAddSampleFile = () => {
    const sampleFiles = [
      { name: 'architecture_diagram.png', size: '2.4 MB', type: 'image/png' },
      { name: 'functional_specs.docx', size: '850 KB', type: 'application/docx' },
      { name: 'brand_assets.zip', size: '4.1 MB', type: 'application/zip' }
    ];
    const newFile = sampleFiles[formData.files.length % sampleFiles.length];
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, newFile]
    }));
  };

  // Remove file
  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Real file upload simulate
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      const formatted = uploadedFiles.map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: f.type
      }));
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...formatted]
      }));
    }
  };

  // Submit Handler
  const handleSubmitEnquiry = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(8); // Move to Success Page
      window.scrollTo(0, 0);
    }, 1200);
  };

  // Copy Enquiry ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(enquiryId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Step definitions
  const stepsList = [
    { id: 1, label: 'Requirements' },
    { id: 2, label: 'Budget' },
    { id: 3, label: 'Timeline' },
    { id: 4, label: 'Contact' },
    { id: 5, label: 'Files' },
    { id: 6, label: 'Consultation' },
    { id: 7, label: 'Review' }
  ];

  const budgetOptions = [
    'Below ₹25K',
    '₹25K – ₹50K',
    '₹50K – ₹1L',
    '₹1L – ₹2L',
    '₹2L+',
    'Not Sure'
  ];

  const timelineOptions = [
    'Less than 2 Weeks',
    '2–4 Weeks',
    '1–2 Months',
    '2–3 Months',
    '3+ Months',
    'Flexible'
  ];

  return (
    <div className="section" style={{ paddingTop: '2rem', paddingBottom: '5rem', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>

        {/* ========================================================================= */}
        {/* GUIDED PROGRESS INDICATOR (Steps 1 to 7) */}
        {/* ========================================================================= */}
        {step <= 7 && (
          <div style={{ marginBottom: '2.5rem' }}>
            
            {/* Header Badge & Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--burgundy-main)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <span>Guided Service Enquiry</span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span>Step {step} of 7</span>
                </div>
                <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  Request a Service
                </h1>
              </div>

              {/* Back to Discovery Link */}
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveView('services')}
                style={{ fontSize: '0.8125rem' }}
              >
                <ArrowLeft size={14} />
                <span>Back to Services</span>
              </button>
            </div>

            {/* Stepper Bar */}
            <div className="stepper-bar-container">
              <div className="stepper-bar">
                {/* Active Service Badge Node */}
                <div className="step-node completed">
                  <div className="step-badge">
                    <Check size={12} />
                  </div>
                  <span className="step-node-label" style={{ fontWeight: 600 }}>Service</span>
                </div>
                <div className="step-connector active" />

                {/* Steps 1 to 7 Nodes */}
                {stepsList.map((st, idx) => {
                  const isCompleted = step > st.id;
                  const isActive = step === st.id;
                  return (
                    <React.Fragment key={st.id}>
                      <div 
                        className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          // Allow jumping back to already reached steps
                          if (st.id < step) setStep(st.id);
                        }}
                        style={{ cursor: st.id < step ? 'pointer' : 'default' }}
                      >
                        <div className="step-badge">
                          {isCompleted ? <Check size={12} /> : st.id}
                        </div>
                        <span className="step-node-label">{st.label}</span>
                      </div>
                      {idx < stepsList.length - 1 && (
                        <div className={`step-connector ${step > st.id ? 'active' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Selected Service & Package Context Bar */}
            <div style={{ 
              backgroundColor: 'var(--bg-surface)', 
              border: '1px solid var(--border-light)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem 1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              marginTop: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '34px', 
                  height: '34px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: 'var(--burgundy-light)', 
                  color: 'var(--burgundy-main)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  ZT
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Target Scope Selection
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeService.title} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span> <span style={{ color: 'var(--burgundy-main)' }}>{activePackage ? activePackage.name : 'Custom Package'}</span>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setIsServiceModalOpen(true)}
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
              >
                <Edit3 size={13} />
                <span>Change Service / Package</span>
              </button>
            </div>

          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 1 — PROJECT REQUIREMENTS */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Tell Us About Your Project
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Provide high-level details so our solution architects can customize your service quotation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Field: Project Name */}
              <div>
                <label className="form-label" htmlFor="projectName">
                  Project Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input 
                  id="projectName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Corporate Client Portal & Dashboard"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>

              {/* Field: Project Description */}
              <div>
                <label className="form-label" htmlFor="projectDescription">
                  Project Description <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea 
                  id="projectDescription"
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe your overall goals, business objectives, and key deliverables expected from Zenque Tech..."
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                />
              </div>

              {/* Field: Required Features */}
              <div>
                <label className="form-label" htmlFor="requiredFeatures">
                  Required Features & Functionality
                </label>
                <textarea 
                  id="requiredFeatures"
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. User Authentication, Payment Gateway Integration, Admin Analytics Panel, Push Notifications..."
                  value={formData.requiredFeatures}
                  onChange={(e) => handleInputChange('requiredFeatures', e.target.value)}
                />
              </div>

              {/* Field: Additional Requirements */}
              <div>
                <label className="form-label" htmlFor="additionalRequirements">
                  Additional Requirements / Technical Preferences
                </label>
                <textarea 
                  id="additionalRequirements"
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Compliance requirements, cloud hosting preferences (AWS/GCP), existing API endpoints to integrate..."
                  value={formData.additionalRequirements}
                  onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                />
              </div>

            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => {
                  if (!formData.projectName.trim()) {
                    handleInputChange('projectName', 'Zenque Technology Project');
                  }
                  if (!formData.projectDescription.trim()) {
                    handleInputChange('projectDescription', `Full-scale ${activeService.title} implementation tailored to business growth.`);
                  }
                  setStep(2);
                }}
              >
                <span>Continue to Budget</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 2 — BUDGET */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                What is your estimated budget?
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Select an approximate investment range. This helps us tailor the scope and engineering stack.
              </p>
            </div>

            {/* Option Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
              {budgetOptions.map((option) => {
                const isSelected = formData.budget === option;
                return (
                  <div 
                    key={option}
                    onClick={() => handleInputChange('budget', option)}
                    className={`selectable-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="option-radio">
                      {isSelected && <div className="option-radio-inner" />}
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--burgundy-main)' : 'var(--text-primary)' }}>
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => setStep(3)}
              >
                <span>Continue to Timeline</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 3 — TIMELINE */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                When would you like the project completed?
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Choose your ideal target timeline for delivery and milestone launch.
              </p>
            </div>

            {/* Option Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
              {timelineOptions.map((option) => {
                const isSelected = formData.timeline === option;
                return (
                  <div 
                    key={option}
                    onClick={() => handleInputChange('timeline', option)}
                    className={`selectable-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="option-radio">
                      {isSelected && <div className="option-radio-inner" />}
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--burgundy-main)' : 'var(--text-primary)' }}>
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setStep(2)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => setStep(4)}
              >
                <span>Continue to Contact</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 4 — CONTACT DETAILS */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Your Contact Details
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Provide your contact details so our team can send the formal quotation reference.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.25rem' }}>
              
              {/* Full Name */}
              <div>
                <label className="form-label" htmlFor="fullName">
                  Full Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="fullName"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="e.g. Alex Morgan"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="form-label" htmlFor="companyName">
                  Company / Organization Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="companyName"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="e.g. Nexus Tech Innovations"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="form-label" htmlFor="email">
                  Email Address <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="alex@nexustech.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="form-label" htmlFor="phone">
                  Phone Number <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="phone"
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setStep(3)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => {
                  if (!formData.fullName.trim()) handleInputChange('fullName', 'Alex Morgan');
                  if (!formData.email.trim()) handleInputChange('email', 'alex@example.com');
                  if (!formData.phone.trim()) handleInputChange('phone', '+91 98765 43210');
                  setStep(5);
                }}
              >
                <span>Continue to Files</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 5 — FILE UPLOAD */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Add Project Files
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Upload any files that help us understand your project scope, design references, or specifications.
                  </p>
                </div>
                <span className="badge-tag" style={{ margin: 0, textTransform: 'none', fontWeight: 500 }}>
                  Optional Step
                </span>
              </div>
            </div>

            {/* Dropzone Area */}
            <div className="file-dropzone-box" style={{ marginBottom: '1.75rem' }}>
              <input 
                type="file" 
                id="file-upload-input" 
                multiple 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'var(--burgundy-light)', 
                  color: 'var(--burgundy-main)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'center',
                  marginBottom: '1rem'
                }}>
                  <UploadCloud size={24} />
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Click or drag files here to upload
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Supported formats: PDF, DOC, DOCX, PNG, JPG (Max file size: 25MB)
                </div>
              </label>

              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleAddSampleFile}
                style={{ marginTop: '0.5rem' }}
              >
                <span>+ Add Sample Document Card</span>
              </button>
            </div>

            {/* Uploaded Files List */}
            <div style={{ marginBottom: '2.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Attached Files ({formData.files.length})
              </div>

              {formData.files.length === 0 ? (
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No files attached yet. You can skip this step or upload files above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {formData.files.map((file, idx) => (
                    <div key={idx} className="uploaded-file-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: 'var(--burgundy-light)', color: 'var(--burgundy-main)', borderRadius: 'var(--radius-sm)' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {file.size}
                          </div>
                        </div>
                      </div>

                      <button 
                        className="close-btn"
                        onClick={() => handleRemoveFile(idx)}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setStep(4)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={() => setStep(6)}
                >
                  <span>Continue to Consultation</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 6 — CONSULTATION */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Would You Like a Consultation?
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Select whether you would like to schedule a direct discovery call with our lead technical architect.
              </p>
            </div>

            {/* Consultation Choice Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.25rem' }}>
              
              {/* Option 1: Request a Call */}
              <div 
                onClick={() => handleInputChange('needsConsultation', 'yes')}
                className={`selectable-option-card ${formData.needsConsultation === 'yes' ? 'selected' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--burgundy-light)', color: 'var(--burgundy-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} />
                  </div>
                  <div className="option-radio">
                    {formData.needsConsultation === 'yes' && <div className="option-radio-inner" />}
                  </div>
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Request a Call
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Schedule a 30-minute discovery session to discuss architectural specifications with an engineering lead.
                </p>
              </div>

              {/* Option 2: Continue Without a Call */}
              <div 
                onClick={() => handleInputChange('needsConsultation', 'no')}
                className={`selectable-option-card ${formData.needsConsultation === 'no' ? 'selected' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div className="option-radio">
                    {formData.needsConsultation === 'no' && <div className="option-radio-inner" />}
                  </div>
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Continue Without a Call
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Proceed directly to formal quotation issuance based on your written project requirements.
                </p>
              </div>

            </div>

            {/* Conditional Date & Time Fields if Request a Call is selected */}
            {formData.needsConsultation === 'yes' && (
              <div style={{ 
                backgroundColor: 'var(--bg-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1.5rem', 
                marginBottom: '2.25rem',
                border: '1px solid var(--border-light)' 
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} />
                  <span>Preferred Schedule</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="form-label" htmlFor="preferredDate">
                      Preferred Date
                    </label>
                    <input 
                      id="preferredDate"
                      type="date"
                      className="form-input"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="preferredTime">
                      Preferred Time Slot
                    </label>
                    <select 
                      id="preferredTime"
                      className="form-input"
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM IST</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM IST</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM IST</option>
                      <option value="07:00 PM - 09:00 PM">07:00 PM - 09:00 PM IST</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setStep(5)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => setStep(7)}
              >
                <span>Continue to Review</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 7 — REVIEW ENQUIRY SUMMARY */}
        {/* ========================================================================= */}
        {step === 7 && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Review Your Enquiry
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Please review all details before submitting your structured project enquiry to Zenque Tech.
              </p>
            </div>

            {/* Review Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.25rem' }}>
              
              {/* Section 1: SERVICE */}
              <div className="review-section-box">
                <div className="review-section-header">
                  <span className="review-section-title">SERVICE</span>
                  <button className="review-edit-btn" onClick={() => setIsServiceModalOpen(true)}>
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeService.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--burgundy-main)', fontWeight: 600, marginTop: '0.2rem' }}>
                  {activePackage ? `${activePackage.name} (${activePackage.tier} Tier — ${activePackage.price})` : 'Custom Package Scope'}
                </div>
              </div>

              {/* Section 2: PROJECT */}
              <div className="review-section-box">
                <div className="review-section-header">
                  <span className="review-section-title">PROJECT</span>
                  <button className="review-edit-btn" onClick={() => setStep(1)}>
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {formData.projectName || 'Zenque Technology Project'}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                  {formData.projectDescription || 'No description provided.'}
                </p>
                {formData.requiredFeatures && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <strong>Features:</strong> {formData.requiredFeatures}
                  </div>
                )}
              </div>

              {/* Section 3 & 4: BUDGET & TIMELINE (2 Column) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                
                <div className="review-section-box">
                  <div className="review-section-header">
                    <span className="review-section-title">ESTIMATED BUDGET</span>
                    <button className="review-edit-btn" onClick={() => setStep(2)}>
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formData.budget}
                  </div>
                </div>

                <div className="review-section-box">
                  <div className="review-section-header">
                    <span className="review-section-title">PREFERRED TIMELINE</span>
                    <button className="review-edit-btn" onClick={() => setStep(3)}>
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formData.timeline}
                  </div>
                </div>

              </div>

              {/* Section 5: CONTACT DETAILS */}
              <div className="review-section-box">
                <div className="review-section-header">
                  <span className="review-section-title">CONTACT DETAILS</span>
                  <button className="review-edit-btn" onClick={() => setStep(4)}>
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>FULL NAME</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formData.fullName || 'Alex Morgan'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>COMPANY</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formData.companyName || 'Nexus Tech'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>EMAIL ADDRESS</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formData.email || 'alex@example.com'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>PHONE NUMBER</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formData.phone || '+91 98765 43210'}</strong>
                  </div>
                </div>
              </div>

              {/* Section 6: FILES */}
              <div className="review-section-box">
                <div className="review-section-header">
                  <span className="review-section-title">ATTACHED FILES</span>
                  <button className="review-edit-btn" onClick={() => setStep(5)}>
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>
                {formData.files.length === 0 ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', italic: 'true' }}>No files attached.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.files.map((file, idx) => (
                      <span key={idx} style={{ 
                        fontSize: '0.8125rem', 
                        backgroundColor: 'var(--bg-subtle)', 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: '1px solid var(--border-light)'
                      }}>
                        <FileText size={13} style={{ color: 'var(--burgundy-main)' }} />
                        {file.name} ({file.size})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 7: CONSULTATION */}
              <div className="review-section-box">
                <div className="review-section-header">
                  <span className="review-section-title">CONSULTATION PREFERENCE</span>
                  <button className="review-edit-btn" onClick={() => setStep(6)}>
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formData.needsConsultation === 'yes' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--burgundy-main)' }}>
                      <Calendar size={16} />
                      <span>Requested Discovery Call — {formData.preferredDate} ({formData.preferredTime})</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Direct Quotation — No Call Requested</span>
                  )}
                </div>
              </div>

            </div>

            {/* Confirmation & Submission Callout */}
            <div style={{ 
              backgroundColor: 'var(--burgundy-light)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--burgundy-border)', 
              padding: '1.25rem', 
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--burgundy-main)' }}>
                  Ready to submit your enquiry?
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Upon submission, you will receive a unique Enquiry ID (<strong style={{ color: 'var(--burgundy-main)' }}>ZT-10234</strong>) for tracking.
                </div>
              </div>

              <button 
                className="btn btn-primary btn-lg"
                onClick={handleSubmitEnquiry}
                disabled={isSubmitting}
                style={{ minWidth: '180px' }}
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Back Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setStep(6)}
              >
                <ArrowLeft size={16} />
                <span>Back to Consultation</span>
              </button>
            </div>

          </div>
        )}


        {/* ========================================================================= */}
        {/* STEP 8 — SUBMISSION SUCCESS PAGE */}
        {/* ========================================================================= */}
        {step === 8 && (
          <div className="card" style={{ padding: '3.5rem 2.25rem', textAlign: 'center', backgroundColor: '#FFFFFF', maxWidth: '720px', margin: '0 auto' }}>
            
            {/* Success Icon */}
            <div style={{ 
              width: '76px', 
              height: '76px', 
              borderRadius: 'var(--radius-full)', 
              backgroundColor: 'var(--status-green-bg)', 
              color: 'var(--status-green)', 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'center', 
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.15)'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <h1 style={{ fontSize: '2.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Enquiry Submitted Successfully
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2.25rem' }}>
              Your project enquiry has been sent to Zenque Tech. Our solution architects will review your scope requirements and prepare a formal quotation.
            </p>

            {/* ENQUIRY ID PROMINENT CARD */}
            <div style={{ 
              backgroundColor: 'var(--bg-main)', 
              border: '2px dashed var(--burgundy-border)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.75rem', 
              marginBottom: '2.25rem',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--burgundy-main)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                OFFICIAL ENQUIRY IDENTIFIER
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                  {enquiryId}
                </span>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyId}
                  style={{ padding: '0.4rem 0.65rem' }}
                  title="Copy Enquiry ID"
                >
                  <Copy size={15} />
                  <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Keep this ID to track your enquiry progress and quotation status.
              </div>
            </div>

            {/* Connection Preview Box for Module 3 */}
            <div style={{ 
              backgroundColor: 'var(--status-blue-bg)', 
              border: '1px solid #BAE6FD', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem 1.25rem', 
              marginBottom: '2.25rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#0369A1',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Module 3 Integration Preview:</strong>
                <div>This Enquiry ID ({enquiryId}) is now registered. In Module 3, clicking "Track Enquiry" or logging into your Client Account will display live status, quotation review, and discussion history for this request.</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setActiveView('client-portal')}
                >
                  <span>Track Enquiry</span>
                  <ArrowRight size={16} />
                </button>

                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setActiveView('client-portal')}
                >
                  <User size={16} />
                  <span>Client Login</span>
                </button>
              </div>

              <button 
                className="btn btn-outline" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setStep(1);
                  setActiveView('home');
                }}
              >
                <span>Back to Home</span>
              </button>
            </div>

          </div>
        )}


        {/* ========================================================================= */}
        {/* SERVICE / PACKAGE SELECTION CHANGE MODAL */}
        {/* ========================================================================= */}
        {isServiceModalOpen && (
          <div className="modal-overlay" onClick={() => setIsServiceModalOpen(false)}>
            <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
              
              <div className="modal-header">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                    Enquiry Scope Configuration
                  </div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                    Change Service or Package
                  </h3>
                </div>
                <button className="close-btn" onClick={() => setIsServiceModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Service Select List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select Technology Service:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {SERVICES_DATA.map((srv) => {
                    const isSelected = activeService.id === srv.id;
                    return (
                      <div 
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv);
                          // Default to standard or first package of new service
                          const defaultPkg = srv.packages.find(p => p.isFeatured) || srv.packages[0];
                          setSelectedPackage(defaultPkg);
                        }}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '2px solid var(--burgundy-main)' : '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'var(--burgundy-light)' : '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--burgundy-main)' : 'var(--text-primary)'
                        }}
                      >
                        {srv.title}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package Select List */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Select Package Tier:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {activeService.packages.map((pkg) => {
                    const isSelected = activePackage && activePackage.id === pkg.id;
                    return (
                      <div 
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '2px solid var(--burgundy-main)' : '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'var(--burgundy-light)' : '#FFFFFF',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                          {pkg.tier}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {pkg.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {pkg.price}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsServiceModalOpen(false)}
                >
                  <span>Apply & Update Enquiry</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
