import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  UploadCloud,
  X,
  Calendar,
  Phone,
  Mail,
  User,
  Building2,
  Edit3,
  Copy,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import { SERVICES_DATA } from '../data/mockServices';

import {
  generateNextEnquiryId,
  saveNewEnquiry,
  formatConsultationSchedule
} from '../utils/enquiryStorage';

import {
  getServices,
  getPackagesByService,
  createEnquiry,
  createConsultation
} from '../api/serviceApi';

import {
  uploadEnquiryFile
} from '../api/fileApi';

export default function ProjectEnquiryView({
  selectedService,
  selectedPackage,
  setSelectedService,
  setSelectedPackage,
  setActiveView,
  enquiries,
  setEnquiries,
  setSelectedEnquiryId,
  currentUser
}) {

  // ============================================================
  // STEP STATE & VALIDATION STATE
  // ============================================================

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ============================================================
  // ACTIVE SERVICE
  // ============================================================

  const activeService = selectedService || SERVICES_DATA[0];

  const activeServiceTitle =
    activeService?.title ||
    activeService?.serviceName ||
    'Selected Service';

  // ============================================================
  // BACKEND SERVICES
  // ============================================================

  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceError, setServiceError] = useState('');

  // ============================================================
  // BACKEND PACKAGES
  // ============================================================

  const [availablePackages, setAvailablePackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageError, setPackageError] = useState('');

  // ============================================================
  // LOAD SERVICES FROM BACKEND
  // ============================================================

  useEffect(() => {
    async function loadServices() {
      try {
        setLoadingServices(true);
        setServiceError('');

        const data = await getServices();

        setAvailableServices(data);
      } catch (error) {
        console.error(
          'Failed to load services:',
          error
        );

        setServiceError(
          'Unable to load services.'
        );

        setAvailableServices([]);
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  // ============================================================
  // LOAD PACKAGES FROM BACKEND
  // ============================================================

  useEffect(() => {
    async function loadPackages() {

      // --------------------------------------------------------
      // BACKEND SERVICE
      // --------------------------------------------------------

      if (selectedService?.serviceId) {
        try {
          setLoadingPackages(true);
          setPackageError('');

          const data =
            await getPackagesByService(
              selectedService.serviceId
            );

          const formattedPackages =
            data.map((pkg, index) => ({
              id: pkg.packageId,

              tier:
                index === 0
                  ? 'STARTER'
                  : index === 1
                    ? 'PROFESSIONAL'
                    : 'ENTERPRISE',

              name: pkg.packageName,

              price:
                `₹${Number(pkg.price).toLocaleString('en-IN')}`,

              description:
                pkg.description,

              features: [
                pkg.description
              ],

              isFeatured:
                index === 1
            }));

          setAvailablePackages(
            formattedPackages
          );

          // Automatically select Professional package
          // if no package is currently selected.
          if (
            !selectedPackage &&
            formattedPackages.length > 0
          ) {
            const defaultPackage =
              formattedPackages.find(
                (pkg) =>
                  pkg.isFeatured
              ) ||
              formattedPackages[0];

            setSelectedPackage(
              defaultPackage
            );
          }

        } catch (error) {

          console.error(
            'Failed to load enquiry packages:',
            error
          );

          setPackageError(
            'Unable to load packages.'
          );

          setAvailablePackages([]);

        } finally {
          setLoadingPackages(false);
        }

        return;
      }

      // --------------------------------------------------------
      // OLD MOCK SERVICE FALLBACK
      // --------------------------------------------------------

      if (selectedService?.packages) {
        setAvailablePackages(
          selectedService.packages
        );
      } else {
        setAvailablePackages([]);
      }

      setLoadingPackages(false);
      setPackageError('');
    }

    loadPackages();

    // We intentionally reload when selectedService changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  // ============================================================
  // ACTIVE PACKAGE
  // ============================================================

  const activePackage =
    selectedPackage ||
    availablePackages.find(
      (pkg) => pkg.isFeatured
    ) ||
    availablePackages[0] ||
    null;

  // ============================================================
  // FORM STATE
  // ============================================================

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
      {
        name: 'project_brief_draft.pdf',
        size: '1.2 MB',
        type: 'application/pdf',
        rawFile: new File(["Sample project brief draft text content for testing upload."], 'project_brief_draft.pdf', { type: 'application/pdf' })
      }
    ],

    needsConsultation: 'yes',

    preferredDate: new Date(
      Date.now() + 86400000 * 3
    )
      .toISOString()
      .split('T')[0],

    preferredTime:
      '10:00 AM - 12:00 PM'
  });

  // Pre-fill user contact info from authenticated user account
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.name || currentUser.fullName || prev.fullName,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        companyName: currentUser.companyName || prev.companyName
      }));
    }
  }, [currentUser]);

  // ============================================================
  // ENQUIRY ID
  // ============================================================

  const [enquiryId, setEnquiryId] =
    useState(() =>
      generateNextEnquiryId()
    );

  // ============================================================
  // INPUT HANDLER & VALIDATION
  // ============================================================

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.projectName || !formData.projectName.trim()) {
      errs.projectName = 'Project Name is required.';
    }
    if (!formData.projectDescription || !formData.projectDescription.trim()) {
      errs.projectDescription = 'Project Description is required.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    if (currentUser) return true;
    const errs = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }
    if (!formData.email || !formData.email.trim()) {
      errs.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. alex@company.com).';
    }
    if (!formData.phone || !formData.phone.trim()) {
      errs.phone = 'Phone Number is required.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep6 = () => {
    if (formData.needsConsultation !== 'yes') {
      setFieldErrors({});
      return true;
    }
    const errs = {};
    if (!formData.preferredDate || !formData.preferredDate.trim()) {
      errs.preferredDate = 'Preferred Date is required for call scheduling.';
    }
    if (!formData.preferredTime || !formData.preferredTime.trim()) {
      errs.preferredTime = 'Preferred Time Slot is required for call scheduling.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ============================================================
  // ADD SAMPLE FILE
  // ============================================================

  const handleAddSampleFile = () => {

    const sampleFiles = [
      {
        name: 'architecture_diagram.png',
        size: '2.4 MB',
        type: 'image/png',
        rawFile: new File(["Sample architecture diagram binary content"], 'architecture_diagram.png', { type: 'image/png' })
      },
      {
        name: 'functional_specs.docx',
        size: '850 KB',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        rawFile: new File(["Sample functional specifications document content"], 'functional_specs.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      },
      {
        name: 'brand_assets.png',
        size: '1.5 MB',
        type: 'image/png',
        rawFile: new File(["Sample brand assets image content"], 'brand_assets.png', { type: 'image/png' })
      }
    ];

    const newFile =
      sampleFiles[
      formData.files.length %
      sampleFiles.length
      ];

    setFormData((prev) => ({
      ...prev,
      files: [
        ...prev.files,
        newFile
      ]
    }));
  };

  // ============================================================
  // REMOVE FILE
  // ============================================================

  const handleRemoveFile = (
    index
  ) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter(
        (_, i) => i !== index
      )
    }));
  };

  // ============================================================
  // REAL FILE UPLOAD
  // ============================================================

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;

    const allowedExts = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    const validFiles = [];

    for (const file of uploadedFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        alert(`File "${file.name}" has an unsupported file type (.${ext}). Allowed types: PDF, DOC, DOCX, JPG, PNG.`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" exceeds the maximum allowed size of 10MB.`);
        continue;
      }
      validFiles.push({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: file.type,
        rawFile: file
      });
    }

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [
          ...prev.files,
          ...validFiles
        ]
      }));
    }
  };

  // ============================================================
  // SUBMIT ENQUIRY
  // ============================================================

  const handleSubmitEnquiry = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      // Resolve numeric serviceId
      let sId = 1;
      if (selectedService?.serviceId && typeof selectedService.serviceId === 'number') {
        sId = selectedService.serviceId;
      } else if (selectedService?.id && typeof selectedService.id === 'number') {
        sId = selectedService.id;
      } else {
        const title = (selectedService?.title || selectedService?.serviceName || '').toLowerCase();
        const matched = availableServices.find(s => (s.serviceName || '').toLowerCase() === title);
        if (matched?.serviceId) {
          sId = matched.serviceId;
        } else if (title.includes('web')) sId = 1;
        else if (title.includes('mobile') || title.includes('app')) sId = 2;
        else if (title.includes('ui') || title.includes('ux')) sId = 3;
        else if (title.includes('ai') || title.includes('ml')) sId = 4;
        else if (title.includes('custom') || title.includes('software')) sId = 5;
        else if (title.includes('digital')) sId = 6;
      }

      // Resolve numeric packageId
      let pId = 1;
      if (activePackage?.packageId && typeof activePackage.packageId === 'number') {
        pId = activePackage.packageId;
      } else if (activePackage?.id && typeof activePackage.id === 'number') {
        pId = activePackage.id;
      } else if (typeof activePackage?.id === 'string' && !isNaN(Number(activePackage.id))) {
        pId = Number(activePackage.id);
      } else {
        const matchedInAvailable = availablePackages.find(p => p.name === activePackage?.name || p.packageName === activePackage?.name);
        if (matchedInAvailable?.id && typeof matchedInAvailable.id === 'number') {
          pId = matchedInAvailable.id;
        } else if (matchedInAvailable?.packageId && typeof matchedInAvailable.packageId === 'number') {
          pId = matchedInAvailable.packageId;
        } else {
          const tierName = (activePackage?.tier || activePackage?.name || '').toUpperCase();
          let offset = 2;
          if (tierName.includes('BASIC') || tierName.includes('STARTER')) offset = 1;
          if (tierName.includes('PREMIUM') || tierName.includes('ENTERPRISE')) offset = 3;
          pId = (sId - 1) * 3 + offset;
        }
      }

      const payload = {
        serviceId: sId,
        packageId: pId,
        projectName: formData.projectName || 'Zenque Technology Project',
        description: formData.projectDescription || `Full-scale ${activeServiceTitle} implementation tailored to business growth.`,
        requiredFeatures: formData.requiredFeatures || '',
        additionalRequirements: formData.additionalRequirements || '',
        budget: formData.budget || '₹50K – ₹1L',
        timeline: formData.timeline || '2–4 Weeks'
      };

      const backendResponse = await createEnquiry(payload);
      const generatedId = backendResponse.enquiryId || backendResponse.id;

      setEnquiryId(generatedId);

      // Submit consultation to backend if client requested a call
      if (formData.needsConsultation === 'yes') {
        try {
          const pDate = formData.preferredDate || new Date().toISOString().split('T')[0];
          
          const convert24 = (ts) => {
            if (!ts) return "10:00:00";
            const cleanTs = ts.trim();
            const m = cleanTs.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (!m) return /^\d{2}:\d{2}(:\d{2})?$/.test(cleanTs) ? (cleanTs.length === 5 ? `${cleanTs}:00` : cleanTs) : "10:00:00";
            let h = parseInt(m[1], 10);
            const min = m[2];
            const ampm = m[3] ? m[3].toUpperCase() : null;
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return `${h.toString().padStart(2, '0')}:${min}:00`;
          };

          const rawTime = formData.preferredTime || "10:00 AM - 12:00 PM";
          const startTimeStr = rawTime.includes('-') ? rawTime.split('-')[0].trim() : rawTime.trim();
          const pTime = convert24(startTimeStr);

          await createConsultation({
            enquiryId: generatedId,
            preferredDate: pDate,
            preferredTime: pTime,
            notes: `Discovery call requested by ${formData.fullName || 'Client'} (${formData.companyName || 'N/A'})`,
            status: 'Requested'
          });
        } catch (consultationErr) {
          console.error('Failed to submit consultation booking to server:', consultationErr);
        }
      }

      // Upload attached files to backend using generatedId
      if (formData.files && formData.files.length > 0) {
        for (const fileItem of formData.files) {
          try {
            const fileToUpload = fileItem.rawFile || new File(["Sample file content"], fileItem.name, { type: fileItem.type || 'application/pdf' });
            await uploadEnquiryFile(generatedId, fileToUpload);
          } catch (uploadErr) {
            console.error(`Failed to upload file ${fileItem.name} for enquiry ${generatedId}:`, uploadErr);
          }
        }
      }

      const newEnquiryObj = {
        enquiryId: generatedId,
        id: generatedId,
        userId: backendResponse.userId || currentUser?.userId,
        service: activeServiceTitle,
        serviceTitle: activeServiceTitle,
        package: activePackage ? activePackage.name : 'Custom Package',
        packageTier: activePackage ? activePackage.name : 'Custom Package',
        projectName: backendResponse.projectName || formData.projectName || 'Zenque Technology Project',
        projectDescription: backendResponse.description || formData.projectDescription || `Full-scale ${activeServiceTitle} implementation tailored to business growth.`,
        requiredFeatures: backendResponse.requiredFeatures || formData.requiredFeatures || '',
        additionalRequirements: backendResponse.additionalRequirements || formData.additionalRequirements || '',
        budget: backendResponse.budget || formData.budget || '₹50K – ₹1L',
        timeline: backendResponse.timeline || formData.timeline || '2–4 Weeks',
        clientName: formData.fullName || 'Alex Morgan',
        fullName: formData.fullName || 'Alex Morgan',
        companyName: (formData.companyName && formData.companyName.trim()) ? formData.companyName.trim() : 'Not provided',
        email: formData.email || 'alex@example.com',
        phone: formData.phone || '+91 98765 43210',
        uploadedFiles: formData.files || [],
        files: formData.files || [],
        consultation: formData.needsConsultation || 'yes',
        requestCall: formData.needsConsultation || 'yes',
        needsConsultation: formData.needsConsultation || 'yes',
        preferredDate: formData.preferredDate || '',
        preferredTime: formData.preferredTime || '',
        status: backendResponse.status || 'Enquiry Submitted',
        submittedDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        createdAt: new Date().toISOString()
      };

      const updated = saveNewEnquiry(newEnquiryObj);

      if (setEnquiries) {
        setEnquiries(updated);
      }

      if (setSelectedEnquiryId) {
        setSelectedEnquiryId(generatedId);
      }

      setStep(8);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Failed to submit enquiry:', error);
      setSubmitError(error.message || 'Failed to submit enquiry to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // COPY ENQUIRY ID
  // ============================================================

  const handleCopyId = () => {

    navigator.clipboard.writeText(
      enquiryId
    );

    setCopiedId(true);

    setTimeout(
      () => setCopiedId(false),
      2000
    );
  };

  // ============================================================
  // STEP DEFINITIONS
  // ============================================================

  const stepsList = [
    {
      id: 1,
      label: 'Requirements'
    },
    {
      id: 2,
      label: 'Budget'
    },
    {
      id: 3,
      label: 'Timeline'
    },
    {
      id: 4,
      label: 'Contact'
    },
    {
      id: 5,
      label: 'Files'
    },
    {
      id: 6,
      label: 'Consultation'
    },
    {
      id: 7,
      label: 'Review'
    }
  ];

  // ============================================================
  // BUDGET OPTIONS
  // ============================================================

  const budgetOptions = [
    'Below ₹25K',
    '₹25K – ₹50K',
    '₹50K – ₹1L',
    '₹1L – ₹2L',
    '₹2L+',
    'Not Sure'
  ];

  // ============================================================
  // TIMELINE OPTIONS
  // ============================================================

  const timelineOptions = [
    'Less than 2 Weeks',
    '2–4 Weeks',
    '1–2 Months',
    '2–3 Months',
    '3+ Months',
    'Flexible'
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="section"
      style={{
        paddingTop: '2rem',
        paddingBottom: '5rem',
        backgroundColor:
          'var(--bg-main)'
      }}
    >

      <div
        className="container"
        style={{
          maxWidth: '960px'
        }}
      >

        {/* ====================================================== */}
        {/* PROGRESS INDICATOR */}
        {/* ====================================================== */}

        {step <= 7 && (
          <div
            style={{
              marginBottom:
                '2.5rem'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                marginBottom:
                  '1.25rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >

              <div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize:
                      '0.8125rem',
                    color:
                      'var(--burgundy-main)',
                    fontWeight: 700,
                    textTransform:
                      'uppercase',
                    letterSpacing:
                      '0.04em'
                  }}
                >
                  <span>
                    Guided Service Enquiry
                  </span>

                  <span
                    style={{
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    •
                  </span>

                  <span>
                    Step {step} of 7
                  </span>
                </div>

                <h1
                  style={{
                    fontSize:
                      '1.75rem',
                    color:
                      'var(--text-primary)',
                    marginTop:
                      '0.2rem'
                  }}
                >
                  Request a Service
                </h1>

              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setActiveView(
                    'services'
                  )
                }
                style={{
                  fontSize:
                    '0.8125rem'
                }}
              >
                <ArrowLeft size={14} />

                <span>
                  Back to Services
                </span>
              </button>

            </div>

            {/* STEPPER */}

            <div className="stepper-bar-container">

              <div className="stepper-bar">

                <div className="step-node completed">

                  <div className="step-badge">
                    <Check size={12} />
                  </div>

                  <span
                    className="step-node-label"
                    style={{
                      fontWeight: 600
                    }}
                  >
                    Service
                  </span>

                </div>

                <div className="step-connector active" />

                {stepsList.map(
                  (st, idx) => {

                    const isCompleted =
                      step > st.id;

                    const isActive =
                      step === st.id;

                    return (
                      <React.Fragment
                        key={st.id}
                      >

                        <div
                          className={`step-node ${isCompleted
                              ? 'completed'
                              : ''
                            } ${isActive
                              ? 'active'
                              : ''
                            }`}
                          onClick={() => {

                            if (
                              st.id <
                              step
                            ) {
                              setStep(
                                st.id
                              );
                            }

                          }}
                          style={{
                            cursor:
                              st.id <
                                step
                                ? 'pointer'
                                : 'default'
                          }}
                        >

                          <div className="step-badge">

                            {isCompleted ? (
                              <Check size={12} />
                            ) : (
                              st.id
                            )}

                          </div>

                          <span className="step-node-label">
                            {st.label}
                          </span>

                        </div>

                        {idx <
                          stepsList.length -
                          1 && (
                            <div
                              className={`step-connector ${step >
                                  st.id
                                  ? 'active'
                                  : ''
                                }`}
                            />
                          )}

                      </React.Fragment>
                    );

                  }
                )}

              </div>

            </div>

            {/* SELECTED SERVICE / PACKAGE */}

            <div
              style={{
                backgroundColor:
                  'var(--bg-surface)',
                border:
                  '1px solid var(--border-light)',
                borderRadius:
                  'var(--radius-md)',
                padding:
                  '0.85rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                boxShadow:
                  'var(--shadow-sm)',
                marginTop:
                  '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '0.75rem'
                }}
              >

                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius:
                      'var(--radius-sm)',
                    backgroundColor:
                      'var(--burgundy-light)',
                    color:
                      'var(--burgundy-main)',
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    fontWeight: 700,
                    fontSize:
                      '0.85rem'
                  }}
                >
                  ZT
                </div>

                <div>

                  <div
                    style={{
                      fontSize:
                        '0.75rem',
                      color:
                        'var(--text-muted)',
                      textTransform:
                        'uppercase',
                      fontWeight: 600
                    }}
                  >
                    Target Scope Selection
                  </div>

                  <div
                    style={{
                      fontSize:
                        '0.95rem',
                      fontWeight: 700,
                      color:
                        'var(--text-primary)'
                    }}
                  >

                    {activeServiceTitle}

                    <span
                      style={{
                        color:
                          'var(--text-muted)',
                        fontWeight: 400
                      }}
                    >
                      {' '}—{' '}
                    </span>

                    <span
                      style={{
                        color:
                          'var(--burgundy-main)'
                      }}
                    >
                      {activePackage
                        ? activePackage.name
                        : 'Loading Package...'}
                    </span>

                  </div>

                </div>

              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setIsServiceModalOpen(
                    true
                  )
                }
                style={{
                  fontSize:
                    '0.8125rem',
                  padding:
                    '0.35rem 0.75rem'
                }}
              >
                <Edit3 size={13} />

                <span>
                  Change Service / Package
                </span>

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 1 */}
        {/* ====================================================== */}

        {step === 1 && (
          <div
            className="card"
            style={{
              padding: '2.25rem',
              backgroundColor:
                '#FFFFFF'
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.75rem',
                borderBottom:
                  '1px solid var(--border-light)',
                paddingBottom:
                  '1rem'
              }}
            >

              <h2
                style={{
                  fontSize:
                    '1.5rem',
                  color:
                    'var(--text-primary)',
                  marginBottom:
                    '0.35rem'
                }}
              >
                Tell Us About Your Project
              </h2>

              <p
                style={{
                  fontSize:
                    '0.9rem',
                  color:
                    'var(--text-secondary)'
                }}
              >
                Provide high-level details so our solution architects can customize your service quotation.
              </p>

            </div>

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: '1.5rem'
              }}
            >

              <div>

                <label
                  className="form-label"
                  htmlFor="projectName"
                >
                  Project Name{' '}
                  <span
                    style={{
                      color:
                        '#DC2626'
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  id="projectName"
                  type="text"
                  className="form-input"
                  style={{ borderColor: fieldErrors.projectName ? '#DC2626' : undefined }}
                  placeholder="e.g. Corporate Client Portal & Dashboard"
                  value={
                    formData.projectName
                  }
                  onChange={(e) =>
                    handleInputChange(
                      'projectName',
                      e.target.value
                    )
                  }
                />
                {fieldErrors.projectName && (
                  <div style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertCircle size={14} />
                    <span>{fieldErrors.projectName}</span>
                  </div>
                )}

              </div>

              <div>

                <label
                  className="form-label"
                  htmlFor="projectDescription"
                >
                  Project Description{' '}
                  <span
                    style={{
                      color:
                        '#DC2626'
                    }}
                  >
                    *
                  </span>
                </label>

                <textarea
                  id="projectDescription"
                  className="form-textarea"
                  style={{ borderColor: fieldErrors.projectDescription ? '#DC2626' : undefined }}
                  rows={4}
                  placeholder="Describe your overall goals, business objectives, and key deliverables expected from Zenque Tech..."
                  value={
                    formData.projectDescription
                  }
                  onChange={(e) =>
                    handleInputChange(
                      'projectDescription',
                      e.target.value
                    )
                  }
                />
                {fieldErrors.projectDescription && (
                  <div style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertCircle size={14} />
                    <span>{fieldErrors.projectDescription}</span>
                  </div>
                )}

              </div>

              <div>

                <label
                  className="form-label"
                  htmlFor="requiredFeatures"
                >
                  Required Features &
                  Functionality
                </label>

                <textarea
                  id="requiredFeatures"
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. User Authentication, Payment Gateway Integration, Admin Analytics Panel, Push Notifications..."
                  value={
                    formData.requiredFeatures
                  }
                  onChange={(e) =>
                    handleInputChange(
                      'requiredFeatures',
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label
                  className="form-label"
                  htmlFor="additionalRequirements"
                >
                  Additional Requirements /
                  Technical Preferences
                </label>

                <textarea
                  id="additionalRequirements"
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Compliance requirements, cloud hosting preferences (AWS/GCP), existing API endpoints to integrate..."
                  value={
                    formData.additionalRequirements
                  }
                  onChange={(e) =>
                    handleInputChange(
                      'additionalRequirements',
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',
                marginTop:
                  '2.25rem',
                paddingTop:
                  '1.25rem',
                borderTop:
                  '1px solid var(--border-light)'
              }}
            >

              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  if (validateStep1()) {
                    setStep(2);
                  }
                }}
              >
                <span>
                  Continue to Budget
                </span>

                <ArrowRight size={16} />

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 2 */}
        {/* ====================================================== */}

        {step === 2 && (
          <div
            className="card"
            style={{
              padding: '2.25rem',
              backgroundColor:
                '#FFFFFF'
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.75rem',
                borderBottom:
                  '1px solid var(--border-light)',
                paddingBottom:
                  '1rem'
              }}
            >

              <h2
                style={{
                  fontSize:
                    '1.5rem',
                  color:
                    'var(--text-primary)',
                  marginBottom:
                    '0.35rem'
                }}
              >
                What is your estimated budget?
              </h2>

              <p
                style={{
                  fontSize:
                    '0.9rem',
                  color:
                    'var(--text-secondary)'
                }}
              >
                Select an approximate investment range. This helps us tailor the scope and engineering stack.
              </p>

            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom:
                  '2.25rem'
              }}
            >

              {budgetOptions.map(
                (option) => {

                  const isSelected =
                    formData.budget ===
                    option;

                  return (
                    <div
                      key={option}
                      onClick={() =>
                        handleInputChange(
                          'budget',
                          option
                        )
                      }
                      className={`selectable-option-card ${isSelected
                          ? 'selected'
                          : ''
                        }`}
                    >

                      <div className="option-radio">

                        {isSelected && (
                          <div className="option-radio-inner" />
                        )}

                      </div>

                      <span
                        style={{
                          fontSize:
                            '1.05rem',
                          fontWeight:
                            isSelected
                              ? 700
                              : 500,
                          color:
                            isSelected
                              ? 'var(--burgundy-main)'
                              : 'var(--text-primary)'
                        }}
                      >
                        {option}
                      </span>

                    </div>
                  );

                }
              )}

            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                paddingTop:
                  '1.25rem',
                borderTop:
                  '1px solid var(--border-light)'
              }}
            >

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setStep(1)
                }
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={() =>
                  setStep(3)
                }
              >
                <span>
                  Continue to Timeline
                </span>

                <ArrowRight size={16} />

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 3 */}
        {/* ====================================================== */}

        {step === 3 && (
          <div
            className="card"
            style={{
              padding: '2.25rem',
              backgroundColor:
                '#FFFFFF'
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.75rem',
                borderBottom:
                  '1px solid var(--border-light)',
                paddingBottom:
                  '1rem'
              }}
            >

              <h2
                style={{
                  fontSize:
                    '1.5rem',
                  color:
                    'var(--text-primary)',
                  marginBottom:
                    '0.35rem'
                }}
              >
                When would you like the project completed?
              </h2>

              <p
                style={{
                  fontSize:
                    '0.9rem',
                  color:
                    'var(--text-secondary)'
                }}
              >
                Choose your ideal target timeline for delivery and milestone launch.
              </p>

            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom:
                  '2.25rem'
              }}
            >

              {timelineOptions.map(
                (option) => {

                  const isSelected =
                    formData.timeline ===
                    option;

                  return (
                    <div
                      key={option}
                      onClick={() =>
                        handleInputChange(
                          'timeline',
                          option
                        )
                      }
                      className={`selectable-option-card ${isSelected
                          ? 'selected'
                          : ''
                        }`}
                    >

                      <div className="option-radio">

                        {isSelected && (
                          <div className="option-radio-inner" />
                        )}

                      </div>

                      <span
                        style={{
                          fontSize:
                            '1.05rem',
                          fontWeight:
                            isSelected
                              ? 700
                              : 500,
                          color:
                            isSelected
                              ? 'var(--burgundy-main)'
                              : 'var(--text-primary)'
                        }}
                      >
                        {option}
                      </span>

                    </div>
                  );

                }
              )}

            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                paddingTop:
                  '1.25rem',
                borderTop:
                  '1px solid var(--border-light)'
              }}
            >

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setStep(2)
                }
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={() =>
                  setStep(4)
                }
              >
                <span>
                  Continue to Contact
                </span>

                <ArrowRight size={16} />

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 4 */}
        {/* ====================================================== */}

        {step === 4 && (
          <div
            className="card"
            style={{
              padding: '2.25rem',
              backgroundColor:
                '#FFFFFF'
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.75rem',
                borderBottom:
                  '1px solid var(--border-light)',
                paddingBottom:
                  '1rem'
              }}
            >

              <h2
                style={{
                  fontSize:
                    '1.5rem',
                  color:
                    'var(--text-primary)',
                  marginBottom:
                    '0.35rem'
                }}
              >
                Client Contact Details
              </h2>

              <p
                style={{
                  fontSize:
                    '0.9rem',
                  color:
                    'var(--text-secondary)'
                }}
              >
                {currentUser 
                  ? 'Your identity is automatically bound to your authenticated client account.'
                  : 'Provide your contact details so our team can send the formal quotation reference.'}
              </p>

            </div>

            {currentUser ? (
              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--burgundy-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CLIENT CONTACT
                  </div>
                  <span className="badge-tag" style={{ margin: 0, padding: '0.2rem 0.65rem', fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#047857', border: '1px solid #6EE7B7' }}>
                    <ShieldCheck size={13} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: '-2px' }} />
                    Verified Client Account
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Name</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name || currentUser.fullName || 'Not provided'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.email || 'Not provided'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phone</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.phone || 'Not provided'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Company</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.companyName || 'Not provided'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px dashed var(--border-light)', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--burgundy-main)', flexShrink: 0 }} />
                  <span>"These details are taken from your account."</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  marginBottom:
                    '2.25rem'
                }}
              >

                <div>

                  <label
                    className="form-label"
                    htmlFor="fullName"
                  >
                    Full Name{' '}
                    <span
                      style={{
                        color:
                          '#DC2626'
                      }}
                    >
                      *
                    </span>
                  </label>

                  <div
                    style={{
                      position:
                        'relative'
                    }}
                  >

                    <User
                      size={16}
                      style={{
                        position:
                          'absolute',
                        left: '12px',
                        top: '50%',
                        transform:
                          'translateY(-50%)',
                        color:
                          'var(--text-muted)'
                      }}
                    />

                    <input
                      id="fullName"
                      type="text"
                      className="form-input"
                      style={{
                        paddingLeft:
                          '2.25rem',
                        borderColor: fieldErrors.fullName ? '#DC2626' : undefined
                      }}
                      placeholder="e.g. Alex Morgan"
                      value={
                        formData.fullName
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'fullName',
                          e.target.value
                        )
                      }
                    />

                  </div>
                  {fieldErrors.fullName && (
                    <div style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={14} />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}

                </div>

                <div>

                  <label
                    className="form-label"
                    htmlFor="companyName"
                  >
                    Company / Organization Name
                  </label>

                  <div
                    style={{
                      position:
                        'relative'
                    }}
                  >

                    <Building2
                      size={16}
                      style={{
                        position:
                          'absolute',
                        left: '12px',
                        top: '50%',
                        transform:
                          'translateY(-50%)',
                        color:
                          'var(--text-muted)'
                      }}
                    />

                    <input
                      id="companyName"
                      type="text"
                      className="form-input"
                      style={{
                        paddingLeft:
                          '2.25rem'
                      }}
                      placeholder="e.g. Nexus Tech Innovations"
                      value={
                        formData.companyName
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'companyName',
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div>

                  <label
                    className="form-label"
                    htmlFor="email"
                  >
                    Email Address{' '}
                    <span
                      style={{
                        color:
                          '#DC2626'
                      }}
                    >
                      *
                    </span>
                  </label>

                  <div
                    style={{
                      position:
                        'relative'
                    }}
                  >

                    <Mail
                      size={16}
                      style={{
                        position:
                          'absolute',
                        left: '12px',
                        top: '50%',
                        transform:
                          'translateY(-50%)',
                        color:
                          'var(--text-muted)'
                      }}
                    />

                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      style={{
                        paddingLeft:
                          '2.25rem',
                        borderColor: fieldErrors.email ? '#DC2626' : undefined
                      }}
                      placeholder="alex@nexustech.com"
                      value={
                        formData.email
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'email',
                          e.target.value
                        )
                      }
                    />

                  </div>
                  {fieldErrors.email && (
                    <div style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={14} />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}

                </div>

                <div>

                  <label
                    className="form-label"
                    htmlFor="phone"
                  >
                    Phone Number{' '}
                    <span
                      style={{
                        color:
                          '#DC2626'
                      }}
                    >
                      *
                    </span>
                  </label>

                  <div
                    style={{
                      position:
                        'relative'
                    }}
                  >

                    <Phone
                      size={16}
                      style={{
                        position:
                          'absolute',
                        left: '12px',
                        top: '50%',
                        transform:
                          'translateY(-50%)',
                        color:
                          'var(--text-muted)'
                      }}
                    />

                    <input
                      id="phone"
                      type="tel"
                      className="form-input"
                      style={{
                        paddingLeft:
                          '2.25rem',
                        borderColor: fieldErrors.phone ? '#DC2626' : undefined
                      }}
                      placeholder="+91 98765 43210"
                      value={
                        formData.phone
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'phone',
                          e.target.value
                        )
                      }
                    />

                  </div>
                  {fieldErrors.phone && (
                    <div style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={14} />
                      <span>{fieldErrors.phone}</span>
                    </div>
                  )}

                </div>

              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                paddingTop:
                  '1.25rem',
                borderTop:
                  '1px solid var(--border-light)'
              }}
            >

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setStep(3)
                }
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  if (validateStep4()) {
                    setStep(5);
                  }
                }}
              >
                <span>
                  Continue to Files
                </span>

                <ArrowRight size={16} />

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 5 */}
        {/* ====================================================== */}

        {step === 5 && (
          <div
            className="card"
            style={{
              padding: '2.25rem',
              backgroundColor:
                '#FFFFFF'
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.75rem',
                borderBottom:
                  '1px solid var(--border-light)',
                paddingBottom:
                  '1rem'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >

                <div>

                  <h2
                    style={{
                      fontSize:
                        '1.5rem',
                      color:
                        'var(--text-primary)',
                      marginBottom:
                        '0.35rem'
                    }}
                  >
                    Add Project Files
                  </h2>

                  <p
                    style={{
                      fontSize:
                        '0.9rem',
                      color:
                        'var(--text-secondary)'
                    }}
                  >
                    Upload any files that help us understand your project scope, design references, or specifications.
                  </p>

                </div>

                <span
                  className="badge-tag"
                  style={{
                    margin: 0,
                    textTransform:
                      'none',
                    fontWeight: 500
                  }}
                >
                  Optional Step
                </span>

              </div>

            </div>

            <div
              className="file-dropzone-box"
              style={{
                marginBottom:
                  '1.75rem'
              }}
            >

              <input
                type="file"
                id="file-upload-input"
                multiple
                style={{
                  display: 'none'
                }}
                onChange={
                  handleFileUpload
                }
              />

              <label
                htmlFor="file-upload-input"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection:
                    'column',
                  alignItems:
                    'center'
                }}
              >

                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius:
                      'var(--radius-full)',
                    backgroundColor:
                      'var(--burgundy-light)',
                    color:
                      'var(--burgundy-main)',
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    marginBottom:
                      '1rem'
                  }}
                >
                  <UploadCloud size={24} />
                </div>

                <div
                  style={{
                    fontSize:
                      '1.05rem',
                    fontWeight: 700,
                    color:
                      'var(--text-primary)',
                    marginBottom:
                      '0.35rem'
                  }}
                >
                  Click or drag files here to upload
                </div>

                <div
                  style={{
                    fontSize:
                      '0.8125rem',
                    color:
                      'var(--text-muted)',
                    marginBottom:
                      '1rem'
                  }}
                >
                  Supported formats: PDF, DOC, DOCX, PNG, JPG (Max file size: 25MB)
                </div>

              </label>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={
                  handleAddSampleFile
                }
                style={{
                  marginTop:
                    '0.5rem'
                }}
              >
                <span>
                  + Add Sample Document Card
                </span>
              </button>

            </div>

            <div
              style={{
                marginBottom:
                  '2.25rem'
              }}
            >

              <div
                style={{
                  fontSize:
                    '0.85rem',
                  fontWeight: 700,
                  color:
                    'var(--text-secondary)',
                  textTransform:
                    'uppercase',
                  marginBottom:
                    '0.75rem'
                }}
              >
                Attached Files (
                {formData.files.length}
                )
              </div>

              {formData.files.length ===
                0 ? (

                <div
                  style={{
                    padding:
                      '1.25rem',
                    backgroundColor:
                      'var(--bg-subtle)',
                    borderRadius:
                      'var(--radius-md)',
                    fontStyle:
                      'italic',
                    fontSize:
                      '0.875rem',
                    color:
                      'var(--text-muted)',
                    textAlign:
                      'center'
                  }}
                >
                  No files attached yet. You can skip this step or upload files above.
                </div>

              ) : (

                <div
                  style={{
                    display: 'flex',
                    flexDirection:
                      'column',
                    gap: '0.65rem'
                  }}
                >

                  {formData.files.map(
                    (file, idx) => (

                      <div
                        key={idx}
                        className="uploaded-file-card"
                      >

                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap:
                              '0.75rem'
                          }}
                        >

                          <div
                            style={{
                              padding:
                                '0.5rem',
                              backgroundColor:
                                'var(--burgundy-light)',
                              color:
                                'var(--burgundy-main)',
                              borderRadius:
                                'var(--radius-sm)'
                            }}
                          >
                            <FileText
                              size={18}
                            />
                          </div>

                          <div>

                            <div
                              style={{
                                fontSize:
                                  '0.9rem',
                                fontWeight: 600,
                                color:
                                  'var(--text-primary)'
                              }}
                            >
                              {file.name}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  '0.75rem',
                                color:
                                  'var(--text-muted)'
                              }}
                            >
                              {file.size}
                            </div>

                          </div>

                        </div>

                        <button
                          className="close-btn"
                          onClick={() =>
                            handleRemoveFile(
                              idx
                            )
                          }
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                paddingTop:
                  '1.25rem',
                borderTop:
                  '1px solid var(--border-light)'
              }}
            >

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setStep(4)
                }
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={() =>
                  setStep(6)
                }
              >
                <span>
                  Continue to Consultation
                </span>

                <ArrowRight size={16} />

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 6 */}
        {/* ====================================================== */}

        {step === 6 && (
          <div
            className="card"
            style={{
              padding: '2.25rem',
              backgroundColor:
                '#FFFFFF'
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.75rem',
                borderBottom:
                  '1px solid var(--border-light)',
                paddingBottom:
                  '1rem'
              }}
            >

              <h2
                style={{
                  fontSize:
                    '1.5rem',
                  color:
                    'var(--text-primary)',
                  marginBottom:
                    '0.35rem'
                }}
              >
                Would You Like a Consultation?
              </h2>

              <p
                style={{
                  fontSize:
                    '0.9rem',
                  color:
                    'var(--text-secondary)'
                }}
              >
                Select whether you would like to schedule a direct discovery call with our lead technical architect.
              </p>

            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                marginBottom:
                  '2.25rem'
              }}
            >

              <div
                onClick={() =>
                  handleInputChange(
                    'needsConsultation',
                    'yes'
                  )
                }
                className={`selectable-option-card ${formData.needsConsultation ===
                    'yes'
                    ? 'selected'
                    : ''
                  }`}
                style={{
                  flexDirection:
                    'column',
                  alignItems:
                    'flex-start',
                  padding:
                    '1.5rem'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    width: '100%',
                    marginBottom:
                      '0.75rem'
                  }}
                >

                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius:
                        'var(--radius-md)',
                      backgroundColor:
                        'var(--burgundy-light)',
                      color:
                        'var(--burgundy-main)',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center'
                    }}
                  >
                    <Phone size={20} />
                  </div>

                  <div className="option-radio">
                    {formData.needsConsultation ===
                      'yes' && (
                        <div className="option-radio-inner" />
                      )}
                  </div>

                </div>

                <div
                  style={{
                    fontSize:
                      '1.15rem',
                    fontWeight: 700,
                    color:
                      'var(--text-primary)',
                    marginBottom:
                      '0.35rem'
                  }}
                >
                  Request a Call
                </div>

                <p
                  style={{
                    fontSize:
                      '0.85rem',
                    color:
                      'var(--text-secondary)'
                  }}
                >
                  Schedule a 30-minute discovery session to discuss architectural specifications with an engineering lead.
                </p>

              </div>

              <div
                onClick={() =>
                  handleInputChange(
                    'needsConsultation',
                    'no'
                  )
                }
                className={`selectable-option-card ${formData.needsConsultation ===
                    'no'
                    ? 'selected'
                    : ''
                  }`}
                style={{
                  flexDirection:
                    'column',
                  alignItems:
                    'flex-start',
                  padding:
                    '1.5rem'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    width: '100%',
                    marginBottom:
                      '0.75rem'
                  }}
                >

                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius:
                        'var(--radius-md)',
                      backgroundColor:
                        'var(--bg-subtle)',
                      color:
                        'var(--text-secondary)',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center'
                    }}
                  >
                    <FileText size={20} />
                  </div>

                  <div className="option-radio">
                    {formData.needsConsultation ===
                      'no' && (
                        <div className="option-radio-inner" />
                      )}
                  </div>

                </div>

                <div
                  style={{
                    fontSize:
                      '1.15rem',
                    fontWeight: 700,
                    color:
                      'var(--text-primary)',
                    marginBottom:
                      '0.35rem'
                  }}
                >
                  Continue Without a Call
                </div>

                <p
                  style={{
                    fontSize:
                      '0.85rem',
                    color:
                      'var(--text-secondary)'
                  }}
                >
                  Proceed directly to formal quotation issuance based on your written project requirements.
                </p>

              </div>

            </div>

            {formData.needsConsultation ===
              'yes' && (

                <div
                  style={{
                    backgroundColor:
                      'var(--bg-subtle)',
                    borderRadius:
                      'var(--radius-md)',
                    padding:
                      '1.5rem',
                    marginBottom:
                      '2.25rem',
                    border:
                      '1px solid var(--border-light)'
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        '0.9rem',
                      fontWeight: 700,
                      color:
                        'var(--burgundy-main)',
                      textTransform:
                        'uppercase',
                      marginBottom:
                        '1rem',
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Calendar size={16} />

                    <span>
                      Preferred Schedule
                    </span>

                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1.25rem'
                    }}
                  >

                    <div>

                      <label
                        className="form-label"
                        htmlFor="preferredDate"
                      >
                        Preferred Date{' '}
                        <span style={{ color: '#DC2626' }}>*</span>
                      </label>

                      <input
                        id="preferredDate"
                        type="date"
                        className="form-input"
                        style={{ borderColor: fieldErrors.preferredDate ? '#DC2626' : undefined }}
                        value={
                          formData.preferredDate
                        }
                        onChange={(e) =>
                          handleInputChange(
                            'preferredDate',
                            e.target.value
                          )
                        }
                      />
                      {fieldErrors.preferredDate && (
                        <div style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertCircle size={14} />
                          <span>{fieldErrors.preferredDate}</span>
                        </div>
                      )}

                    </div>

                    <div>

                      <label
                        className="form-label"
                        htmlFor="preferredTime"
                      >
                        Preferred Time Slot{' '}
                        <span style={{ color: '#DC2626' }}>*</span>
                      </label>

                      <select
                        id="preferredTime"
                        className="form-input"
                        style={{ borderColor: fieldErrors.preferredTime ? '#DC2626' : undefined }}
                        value={
                          formData.preferredTime
                        }
                        onChange={(e) =>
                          handleInputChange(
                            'preferredTime',
                            e.target.value
                          )
                        }
                      >

                        <option value="10:00 AM - 12:00 PM">
                          10:00 AM - 12:00 PM IST
                        </option>

                        <option value="02:00 PM - 04:00 PM">
                          02:00 PM - 04:00 PM IST
                        </option>

                        <option value="04:00 PM - 06:00 PM">
                          04:00 PM - 06:00 PM IST
                        </option>

                        <option value="07:00 PM - 09:00 PM">
                          07:00 PM - 09:00 PM IST
                        </option>

                      </select>
                      {fieldErrors.preferredTime && (
                        <div style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertCircle size={14} />
                          <span>{fieldErrors.preferredTime}</span>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                paddingTop:
                  '1.25rem',
                borderTop:
                  '1px solid var(--border-light)'
              }}
            >

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setStep(5)
                }
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  if (validateStep6()) {
                    setStep(7);
                  }
                }}
              >
                <span>
                  Continue to Review
                </span>

                <ArrowRight size={16} />

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 7 */}
        {/* ====================================================== */}

        {step === 7 && (
          <div
            className="card"
            style={{
              padding:
                '2.25rem',
              backgroundColor:
                '#FFFFFF'
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.75rem',
                borderBottom:
                  '1px solid var(--border-light)',
                paddingBottom:
                  '1rem'
              }}
            >

              <h2
                style={{
                  fontSize:
                    '1.5rem',
                  color:
                    'var(--text-primary)',
                  marginBottom:
                    '0.35rem'
                }}
              >
                Review Your Enquiry
              </h2>

              <p
                style={{
                  fontSize:
                    '0.9rem',
                  color:
                    'var(--text-secondary)'
                }}
              >
                Please review all details before submitting your structured project enquiry to Zenque Tech.
              </p>

            </div>

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap:
                  '1.25rem',
                marginBottom:
                  '2.25rem'
              }}
            >

              {/* SERVICE */}

              <div className="review-section-box">

                <div className="review-section-header">

                  <span className="review-section-title">
                    SERVICE
                  </span>

                  <button
                    className="review-edit-btn"
                    onClick={() =>
                      setIsServiceModalOpen(
                        true
                      )
                    }
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                </div>

                <div
                  style={{
                    fontSize:
                      '1.1rem',
                    fontWeight: 700,
                    color:
                      'var(--text-primary)'
                  }}
                >
                  {activeServiceTitle}
                </div>

                <div
                  style={{
                    fontSize:
                      '0.875rem',
                    color:
                      'var(--burgundy-main)',
                    fontWeight: 600,
                    marginTop:
                      '0.2rem'
                  }}
                >
                  {activePackage
                    ? `${activePackage.name} (${activePackage.tier || 'Package'} Tier — ${activePackage.price})`
                    : 'Custom Package Scope'}
                </div>

              </div>

              {/* PROJECT */}

              <div className="review-section-box">

                <div className="review-section-header">

                  <span className="review-section-title">
                    PROJECT
                  </span>

                  <button
                    className="review-edit-btn"
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                </div>

                <div
                  style={{
                    fontSize:
                      '1.05rem',
                    fontWeight: 700,
                    color:
                      'var(--text-primary)',
                    marginBottom:
                      '0.35rem'
                  }}
                >
                  {formData.projectName ||
                    'Zenque Technology Project'}
                </div>

                <p
                  style={{
                    fontSize:
                      '0.875rem',
                    color:
                      'var(--text-secondary)',
                    marginBottom:
                      '0.5rem',
                    lineHeight:
                      '1.5'
                  }}
                >
                  {formData.projectDescription ||
                    'No description provided.'}
                </p>

                {formData.requiredFeatures && (
                  <div
                    style={{
                      fontSize:
                        '0.8125rem',
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    <strong>
                      Features:
                    </strong>{' '}
                    {
                      formData.requiredFeatures
                    }
                  </div>
                )}

              </div>

              {/* BUDGET / TIMELINE */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(240px, 1fr))',
                  gap:
                    '1.25rem'
                }}
              >

                <div className="review-section-box">

                  <div className="review-section-header">

                    <span className="review-section-title">
                      ESTIMATED BUDGET
                    </span>

                    <button
                      className="review-edit-btn"
                      onClick={() =>
                        setStep(2)
                      }
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                  </div>

                  <div
                    style={{
                      fontSize:
                        '1.1rem',
                      fontWeight: 700,
                      color:
                        'var(--text-primary)'
                    }}
                  >
                    {formData.budget}
                  </div>

                </div>

                <div className="review-section-box">

                  <div className="review-section-header">

                    <span className="review-section-title">
                      PREFERRED TIMELINE
                    </span>

                    <button
                      className="review-edit-btn"
                      onClick={() =>
                        setStep(3)
                      }
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                  </div>

                  <div
                    style={{
                      fontSize:
                        '1.1rem',
                      fontWeight: 700,
                      color:
                        'var(--text-primary)'
                    }}
                  >
                    {formData.timeline}
                  </div>

                </div>

              </div>

              {/* CONTACT */}

              <div className="review-section-box">

                <div className="review-section-header">

                  <span className="review-section-title">
                    CONTACT DETAILS
                  </span>

                  <button
                    className="review-edit-btn"
                    onClick={() =>
                      setStep(4)
                    }
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(200px, 1fr))',
                    gap:
                      '0.75rem',
                    fontSize:
                      '0.875rem'
                  }}
                >

                  <div>

                    <span
                      style={{
                        color:
                          'var(--text-muted)',
                        fontSize:
                          '0.75rem',
                        display:
                          'block'
                      }}
                    >
                      FULL NAME
                    </span>

                    <strong
                      style={{
                        color:
                          'var(--text-primary)'
                      }}
                    >
                      {formData.fullName ||
                        'Alex Morgan'}
                    </strong>

                  </div>

                  <div>

                    <span
                      style={{
                        color:
                          'var(--text-muted)',
                        fontSize:
                          '0.75rem',
                        display:
                          'block'
                      }}
                    >
                      COMPANY
                    </span>

                    <strong
                      style={{
                        color:
                          'var(--text-primary)'
                      }}
                    >
                      {formData.companyName ||
                        'Not provided'}
                    </strong>

                  </div>

                  <div>

                    <span
                      style={{
                        color:
                          'var(--text-muted)',
                        fontSize:
                          '0.75rem',
                        display:
                          'block'
                      }}
                    >
                      EMAIL ADDRESS
                    </span>

                    <strong
                      style={{
                        color:
                          'var(--text-primary)'
                      }}
                    >
                      {formData.email ||
                        'alex@example.com'}
                    </strong>

                  </div>

                  <div>

                    <span
                      style={{
                        color:
                          'var(--text-muted)',
                        fontSize:
                          '0.75rem',
                        display:
                          'block'
                      }}
                    >
                      PHONE NUMBER
                    </span>

                    <strong
                      style={{
                        color:
                          'var(--text-primary)'
                      }}
                    >
                      {formData.phone ||
                        '+91 98765 43210'}
                    </strong>

                  </div>

                </div>

              </div>

              {/* FILES */}

              <div className="review-section-box">

                <div className="review-section-header">

                  <span className="review-section-title">
                    ATTACHED FILES
                  </span>

                  <button
                    className="review-edit-btn"
                    onClick={() =>
                      setStep(5)
                    }
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                </div>

                {formData.files.length ===
                  0 ? (

                  <div
                    style={{
                      fontSize:
                        '0.875rem',
                      color:
                        'var(--text-muted)',
                      fontStyle:
                        'italic'
                    }}
                  >
                    No files attached.
                  </div>

                ) : (

                  <div
                    style={{
                      display:
                        'flex',
                      flexWrap:
                        'wrap',
                      gap:
                        '0.5rem'
                    }}
                  >

                    {formData.files.map(
                      (
                        file,
                        idx
                      ) => (

                        <span
                          key={idx}
                          style={{
                            fontSize:
                              '0.8125rem',
                            backgroundColor:
                              'var(--bg-subtle)',
                            padding:
                              '0.35rem 0.75rem',
                            borderRadius:
                              'var(--radius-sm)',
                            color:
                              'var(--text-primary)',
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            gap:
                              '0.35rem',
                            border:
                              '1px solid var(--border-light)'
                          }}
                        >

                          <FileText
                            size={13}
                            style={{
                              color:
                                'var(--burgundy-main)'
                            }}
                          />

                          {file.name} (
                          {file.size})

                        </span>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* CONSULTATION */}

              <div className="review-section-box">

                <div className="review-section-header">

                  <span className="review-section-title">
                    CONSULTATION PREFERENCE
                  </span>

                  <button
                    className="review-edit-btn"
                    onClick={() =>
                      setStep(6)
                    }
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                </div>

                <div
                  style={{
                    fontSize:
                      '0.95rem',
                    fontWeight: 600,
                    color:
                      'var(--text-primary)'
                  }}
                >

                  {formData.needsConsultation ===
                    'yes' ? (

                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap:
                          '0.5rem',
                        color:
                          'var(--burgundy-main)'
                      }}
                    >

                      <Calendar
                        size={16}
                      />

                      <span>
                        Requested Discovery Call — {formatConsultationSchedule(formData.preferredDate, formData.preferredTime) || 'Schedule Pending'}
                      </span>

                    </div>

                  ) : (

                    <span
                      style={{
                        color:
                          'var(--text-secondary)'
                      }}
                    >
                      Direct Quotation — No
                      Call Requested
                    </span>

                  )}

                </div>

              </div>

            </div>

            {/* SUBMISSION ERROR BANNER */}
            {submitError && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  color: '#991B1B',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {submitError}
              </div>
            )}

            {/* SUBMISSION CALLOUT */}

            <div
              style={{
                backgroundColor:
                  'var(--burgundy-light)',
                borderRadius:
                  'var(--radius-md)',
                border:
                  '1px solid var(--burgundy-border)',
                padding:
                  '1.25rem',
                marginBottom:
                  '2rem',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                flexWrap:
                  'wrap',
                gap:
                  '1rem'
              }}
            >

              <div>

                <div
                  style={{
                    fontSize:
                      '1rem',
                    fontWeight: 700,
                    color:
                      'var(--burgundy-main)'
                  }}
                >
                  Ready to submit your enquiry?
                </div>

                <div
                  style={{
                    fontSize:
                      '0.8125rem',
                    color:
                      'var(--text-secondary)',
                    marginTop:
                      '0.15rem'
                  }}
                >
                  Upon submission, you will receive a unique Enquiry ID (
                  <strong
                    style={{
                      color:
                        'var(--burgundy-main)'
                    }}
                  >
                    {enquiryId}
                  </strong>
                  ) for tracking.
                </div>

              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={
                  handleSubmitEnquiry
                }
                disabled={
                  isSubmitting
                }
                style={{
                  minWidth:
                    '180px'
                }}
              >

                {isSubmitting ? (

                  <span>
                    Submitting...
                  </span>

                ) : (

                  <>
                    <span>
                      Submit Enquiry
                    </span>

                    <ArrowRight
                      size={16}
                    />
                  </>

                )}

              </button>

            </div>

            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'flex-start'
              }}
            >

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setStep(6)
                }
              >
                <ArrowLeft size={16} />

                <span>
                  Back to Consultation
                </span>

              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 8 — SUCCESS */}
        {/* ====================================================== */}

        {step === 8 && (
          <div
            className="card"
            style={{
              padding:
                '3.5rem 2.25rem',
              textAlign:
                'center',
              backgroundColor:
                '#FFFFFF',
              maxWidth:
                '720px',
              margin:
                '0 auto'
            }}
          >

            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius:
                  'var(--radius-full)',
                backgroundColor:
                  'var(--status-green-bg)',
                color:
                  'var(--status-green)',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                margin:
                  '0 auto 1.5rem auto',
                boxShadow:
                  '0 4px 16px rgba(5, 150, 105, 0.15)'
              }}
            >
              <CheckCircle2
                size={44}
              />
            </div>

            <h1
              style={{
                fontSize:
                  '2.25rem',
                color:
                  'var(--text-primary)',
                marginBottom:
                  '0.5rem'
              }}
            >
              Enquiry Submitted Successfully
            </h1>

            <p
              style={{
                fontSize:
                  '1.05rem',
                color:
                  'var(--text-secondary)',
                marginBottom:
                  '2.25rem'
              }}
            >
              Your project enquiry has been sent to Zenque Tech. Our solution architects will review your scope requirements and prepare a formal quotation.
            </p>

            {/* ENQUIRY ID */}

            <div
              style={{
                backgroundColor:
                  'var(--bg-main)',
                border:
                  '2px dashed var(--burgundy-border)',
                borderRadius:
                  'var(--radius-lg)',
                padding:
                  '1.75rem',
                marginBottom:
                  '2.25rem',
                position:
                  'relative'
              }}
            >

              <div
                style={{
                  fontSize:
                    '0.75rem',
                  fontWeight: 800,
                  color:
                    'var(--burgundy-main)',
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.08em',
                  marginBottom:
                    '0.5rem'
                }}
              >
                OFFICIAL ENQUIRY IDENTIFIER
              </div>

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  gap:
                    '0.75rem',
                  margin:
                    '0.5rem 0'
                }}
              >

                <span
                  style={{
                    fontSize:
                      '2.5rem',
                    fontWeight: 800,
                    color:
                      'var(--text-primary)',
                    letterSpacing:
                      '0.05em',
                    fontFamily:
                      'monospace'
                  }}
                >
                  {enquiryId}
                </span>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={
                    handleCopyId
                  }
                  style={{
                    padding:
                      '0.4rem 0.65rem'
                  }}
                  title="Copy Enquiry ID"
                >
                  <Copy size={15} />

                  <span>
                    {copiedId
                      ? 'Copied!'
                      : 'Copy'}
                  </span>

                </button>

              </div>

              <div
                style={{
                  fontSize:
                    '0.875rem',
                  color:
                    'var(--text-secondary)',
                  fontWeight: 500
                }}
              >
                Keep this ID to track your enquiry progress and quotation status.
              </div>

            </div>



            {/* ACTION BUTTONS */}

            <div
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap:
                  '0.85rem',
                maxWidth:
                  '420px',
                margin:
                  '0 auto'
              }}
            >

              <button
                className="btn btn-primary"
                style={{
                  width:
                    '100%',
                  justifyContent:
                    'center',
                  padding:
                    '0.85rem'
                }}
                onClick={() => {

                  if (
                    setSelectedEnquiryId
                  ) {
                    setSelectedEnquiryId(
                      enquiryId
                    );
                  }

                  setActiveView(
                    'client-portal'
                  );

                }}
              >

                <User size={16} />

                <span>
                  Go to Client Login
                </span>

                <ArrowRight
                  size={16}
                />

              </button>

              <button
                className="btn btn-outline"
                style={{
                  width:
                    '100%',
                  justifyContent:
                    'center'
                }}
                onClick={() => {

                  setStep(1);

                  setActiveView(
                    'home'
                  );

                }}
              >
                <span>
                  Back to Home
                </span>
              </button>

            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* SERVICE / PACKAGE MODAL */}
        {/* ====================================================== */}

        {isServiceModalOpen && (

          <div
            className="modal-overlay"
            onClick={() =>
              setIsServiceModalOpen(
                false
              )
            }
          >

            <div
              className="modal-card"
              style={{
                maxWidth:
                  '680px'
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>

                  <div
                    style={{
                      fontSize:
                        '0.75rem',
                      fontWeight: 700,
                      color:
                        'var(--burgundy-main)',
                      textTransform:
                        'uppercase'
                    }}
                  >
                    Enquiry Scope Configuration
                  </div>

                  <h3
                    style={{
                      fontSize:
                        '1.35rem',
                      color:
                        'var(--text-primary)'
                    }}
                  >
                    Change Service or Package
                  </h3>

                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setIsServiceModalOpen(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>

              </div>

              {/* ================================================== */}
              {/* SERVICE SELECT - BACKEND */}
              {/* ================================================== */}

              <div
                style={{
                  marginBottom:
                    '1.5rem'
                }}
              >

                <label className="form-label">
                  Select Technology Service:
                </label>

                {loadingServices && (
                  <p
                    style={{
                      color:
                        'var(--text-secondary)'
                    }}
                  >
                    Loading services...
                  </p>
                )}

                {serviceError && (
                  <p
                    style={{
                      color:
                        'var(--burgundy-main)'
                    }}
                  >
                    {serviceError}
                  </p>
                )}

                {!loadingServices &&
                  !serviceError && (

                    <div
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(200px, 1fr))',
                        gap:
                          '0.75rem'
                      }}
                    >

                      {availableServices.map(
                        (srv) => {

                          const isSelected =
                            activeService?.serviceId ===
                            srv.serviceId;

                          return (

                            <div
                              key={
                                srv.serviceId
                              }
                              onClick={() => {

                                // Set backend service
                                setSelectedService(
                                  srv
                                );

                                // Clear old package immediately
                                setSelectedPackage(
                                  null
                                );

                              }}
                              style={{
                                padding:
                                  '0.75rem',
                                borderRadius:
                                  'var(--radius-sm)',
                                border:
                                  isSelected
                                    ? '2px solid var(--burgundy-main)'
                                    : '1px solid var(--border-light)',
                                backgroundColor:
                                  isSelected
                                    ? 'var(--burgundy-light)'
                                    : '#FFFFFF',
                                cursor:
                                  'pointer',
                                fontSize:
                                  '0.875rem',
                                fontWeight:
                                  isSelected
                                    ? 700
                                    : 500,
                                color:
                                  isSelected
                                    ? 'var(--burgundy-main)'
                                    : 'var(--text-primary)'
                              }}
                            >
                              {srv.serviceName}
                            </div>

                          );

                        }
                      )}

                    </div>

                  )}

              </div>

              {/* ================================================== */}
              {/* PACKAGE SELECT - BACKEND */}
              {/* ================================================== */}

              <div
                style={{
                  marginBottom:
                    '1.75rem'
                }}
              >

                <label className="form-label">
                  Select Package Tier:
                </label>

                {loadingPackages && (

                  <p
                    style={{
                      color:
                        'var(--text-secondary)'
                    }}
                  >
                    Loading packages...
                  </p>

                )}

                {packageError && (

                  <p
                    style={{
                      color:
                        'var(--burgundy-main)'
                    }}
                  >
                    {packageError}
                  </p>

                )}

                {!loadingPackages &&
                  !packageError && (

                    <div
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(180px, 1fr))',
                        gap:
                          '0.75rem'
                      }}
                    >

                      {availablePackages.map(
                        (pkg) => {

                          const isSelected =
                            activePackage &&
                            activePackage.id ===
                            pkg.id;

                          return (

                            <div
                              key={pkg.id}
                              onClick={() =>
                                setSelectedPackage(
                                  pkg
                                )
                              }
                              style={{
                                padding:
                                  '0.85rem',
                                borderRadius:
                                  'var(--radius-sm)',
                                border:
                                  isSelected
                                    ? '2px solid var(--burgundy-main)'
                                    : '1px solid var(--border-light)',
                                backgroundColor:
                                  isSelected
                                    ? 'var(--burgundy-light)'
                                    : '#FFFFFF',
                                cursor:
                                  'pointer'
                              }}
                            >

                              <div
                                style={{
                                  fontSize:
                                    '0.75rem',
                                  fontWeight: 700,
                                  color:
                                    'var(--burgundy-main)',
                                  textTransform:
                                    'uppercase'
                                }}
                              >
                                {pkg.tier}
                              </div>

                              <div
                                style={{
                                  fontSize:
                                    '0.95rem',
                                  fontWeight: 700,
                                  color:
                                    'var(--text-primary)'
                                }}
                              >
                                {pkg.name}
                              </div>

                              <div
                                style={{
                                  fontSize:
                                    '0.85rem',
                                  color:
                                    'var(--text-secondary)'
                                }}
                              >
                                {pkg.price}
                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  )}

              </div>

              {/* APPLY */}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '0.75rem'
                }}
              >

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setIsServiceModalOpen(
                      false
                    )
                  }
                >
                  <span>
                    Apply & Update Enquiry
                  </span>
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}