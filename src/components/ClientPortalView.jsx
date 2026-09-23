import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  LogOut, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Check, 
  X, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  Eye,
  FileCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { SERVICES_DATA } from '../data/mockServices';
import { getStoredEnquiries, saveStoredEnquiries, formatConsultationSchedule } from '../utils/enquiryStorage';
import { loginUser, registerUser, clearAuthSession, getAuthToken } from '../api/authApi';
import { getUserEnquiries, getQuotationByEnquiry, updateQuotationStatus, getConsultationByEnquiry } from '../api/serviceApi';
import { getEnquiryFiles } from '../api/fileApi';

export default function ClientPortalView({ 
  setActiveView,
  initialEnquiryId = 'ZT-10234',
  initialTab = 'dashboard',
  enquiries: propsEnquiries,
  setEnquiries: propsSetEnquiries,
  selectedEnquiryId: propsSelectedEnquiryId,
  setSelectedEnquiryId: propsSetSelectedEnquiryId,
  currentUser: propsCurrentUser,
  setCurrentUser: propsSetCurrentUser
}) {
  const [internalCurrentUser, setInternalCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zenque_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const currentUser = propsCurrentUser !== undefined ? propsCurrentUser : internalCurrentUser;

  const setCurrentUser = (user) => {
    if (propsSetCurrentUser) propsSetCurrentUser(user);
    setInternalCurrentUser(user);
    if (user) {
      localStorage.setItem('zenque_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zenque_current_user');
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!currentUser);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (propsSetCurrentUser) propsSetCurrentUser(null);
      setInternalCurrentUser(null);
      setIsLoggedIn(false);
      setLoginError("Session expired or authentication invalid. Please sign in again.");
    };

    window.addEventListener('zenque_auth_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('zenque_auth_unauthorized', handleUnauthorized);
    };
  }, []);


  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Logout transition state
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutStep, setLogoutStep] = useState('progress'); // 'progress' | 'done'

  const handleLogout = () => {
    setIsLoggingOut(true);
    setLogoutStep('progress');
    
    setTimeout(() => {
      setLogoutStep('done');
      
      setTimeout(() => {
        clearAuthSession();
        if (propsSetCurrentUser) propsSetCurrentUser(null);
        setInternalCurrentUser(null);
        setIsLoggedIn(false);
        setIsLoggingOut(false);
        if (setActiveView) setActiveView('home');
      }, 700);
    }, 600);
  };

  // Client Registration Form State
  const [registerFormData, setRegisterFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Client Area Active Sub-Tab ('dashboard' | 'enquiries' | 'details' | 'quotation' | 'profile')
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Local fallback state if props not passed
  const [localEnquiries, setLocalEnquiries] = useState(() => getStoredEnquiries());

  // Backend user enquiries state
  const [backendEnquiries, setBackendEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiryFetchError, setEnquiryFetchError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Selected Enquiry ID to view in details/quotation
  const [internalSelectedEnquiryId, setInternalSelectedEnquiryId] = useState(() => {
    return propsSelectedEnquiryId || initialEnquiryId;
  });

  const selectedEnquiryId = propsSelectedEnquiryId || internalSelectedEnquiryId;
  const setSelectedEnquiryId = (id) => {
    setInternalSelectedEnquiryId(id);
    if (propsSetSelectedEnquiryId) propsSetSelectedEnquiryId(id);
  };

  // Fetch backend enquiries for the logged-in client user
  useEffect(() => {
    async function loadUserEnquiries() {
      if (!isLoggedIn) return;

      try {
        setLoadingEnquiries(true);
        setEnquiryFetchError('');
        const rawData = await getUserEnquiries();

        const serviceNameMap = {
          1: 'Web Development',
          2: 'Mobile App Development',
          3: 'UI/UX Design',
          4: 'AI & ML Solutions',
          5: 'Custom Software',
          6: 'Digital Solutions'
        };

        const packageNameMap = {
          1: 'Basic Web Package',
          2: 'Standard Web Application',
          3: 'Enterprise Platform',
          4: 'Basic Mobile App',
          5: 'Standard Mobile Application',
          6: 'Enterprise Mobile Solution',
          7: 'UI/UX Audit & Wireframes',
          8: 'Complete Product Design System',
          9: 'Enterprise Brand & UX Platform',
          10: 'Basic AI Integration',
          11: 'Advanced ML & Predictive Models',
          12: 'Enterprise AI Ecosystem',
          13: 'Custom Backend API & Service',
          14: 'Full-Stack Enterprise Software',
          15: 'Distributed Enterprise System',
          16: 'Digital Footprint & SEO Setup',
          17: 'Full Growth Marketing Engine',
          18: 'Omnichannel Digital Transformation'
        };

        const formatted = await Promise.all(rawData.map(async (item) => {
          const serviceTitle = serviceNameMap[item.serviceId] || 'Technology Service';
          const pkgName = packageNameMap[item.packageId] || 'Standard Package';

          let quotationObj = null;
          try {
            const rawQuot = await getQuotationByEnquiry(item.enquiryId, currentUser.userId);
            if (rawQuot) {
              quotationObj = {
                id: rawQuot.quotationId,
                quotationId: rawQuot.quotationId,
                enquiryId: rawQuot.enquiryId,
                serviceCost: `₹${Number(rawQuot.serviceCost).toLocaleString('en-IN')}`,
                additionalCost: `₹${Number(rawQuot.additionalCost).toLocaleString('en-IN')}`,
                totalAmount: `₹${Number(rawQuot.totalAmount).toLocaleString('en-IN')}`,
                validUntil: rawQuot.validity || 'Valid 30 Days',
                validity: rawQuot.validity,
                architectNotes: rawQuot.notes || 'Includes full source code ownership, Docker containerization scripts, and SLA support.',
                status: rawQuot.status,
                rawStatus: rawQuot.status,
                breakdown: [
                  { desc: 'Core Technology Solution Implementation', cost: `₹${Number(rawQuot.serviceCost).toLocaleString('en-IN')}` },
                  { desc: 'Additional Features, SLA & Architecture Integration', cost: `₹${Number(rawQuot.additionalCost).toLocaleString('en-IN')}` }
                ]
              };
            }
          } catch (quotErr) {
            console.warn(`No quotation for ${item.enquiryId}:`, quotErr.message);
          }

          let consultationObj = null;
          try {
            consultationObj = await getConsultationByEnquiry(item.enquiryId);
          } catch (conErr) {
            // No consultation booked for this enquiry
          }

          let effectiveStatus = item.status || 'Enquiry Submitted';
          if (quotationObj) {
            if (quotationObj.status === 'Accepted') {
              effectiveStatus = 'accepted';
            } else if (quotationObj.status === 'Rejected') {
              effectiveStatus = 'rejected';
            } else if (quotationObj.status === 'Sent' || quotationObj.status === 'Quotation Sent') {
              effectiveStatus = 'quotation_sent';
            }
          }

          let enquiryFilesList = [];
          try {
            const rawFiles = await getEnquiryFiles(item.enquiryId);
            if (Array.isArray(rawFiles)) {
              enquiryFilesList = rawFiles.map(f => ({
                id: f.fileId,
                name: f.fileName,
                filePath: f.filePath,
                size: 'Uploaded',
                uploadedAt: f.uploadedAt
              }));
            }
          } catch (fileErr) {
            // Ignore if no files
          }

          return {
            ...item,
            id: item.enquiryId,
            enquiryId: item.enquiryId,
            service: serviceTitle,
            serviceTitle: serviceTitle,
            package: pkgName,
            packageTier: pkgName,
            projectName: item.projectName || 'Zenque Technology Project',
            projectDescription: item.description || `Full-scale ${serviceTitle} implementation.`,
            requiredFeatures: item.requiredFeatures || '',
            additionalRequirements: item.additionalRequirements || '',
            budget: item.budget || '₹50K – ₹1L',
            timeline: item.timeline || '2–4 Weeks',
            clientName: currentUser?.name || 'Valued Client',
            fullName: currentUser?.name || 'Valued Client',
            companyName: currentUser?.companyName || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || '',
            status: effectiveStatus,
            quotation: quotationObj,
            consultationObj: consultationObj,
            preferredDate: consultationObj?.preferredDate || item.preferredDate || '',
            preferredTime: consultationObj?.preferredTime || item.preferredTime || '',
            files: enquiryFilesList,
            needsConsultation: consultationObj ? 'yes' : (item.needsConsultation || 'yes'),
            submittedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
            createdAt: item.createdAt || new Date().toISOString()
          };
        }));

        setBackendEnquiries(formatted);

        if (formatted.length > 0) {
          const match = formatted.find(e => e.enquiryId === selectedEnquiryId);
          if (!match) {
            setSelectedEnquiryId(formatted[0].enquiryId);
          }
        }
      } catch (err) {
        console.error("Failed to load user enquiries:", err);
        setEnquiryFetchError("Unable to load user enquiries from server.");
      } finally {
        setLoadingEnquiries(false);
      }
    }

    loadUserEnquiries();
  }, [isLoggedIn, currentUser?.userId, reloadTrigger]);

  // When logged in, use backendEnquiries for the authenticated client; otherwise fallback
  const enquiries = isLoggedIn
    ? backendEnquiries
    : (propsEnquiries && propsEnquiries.length > 0 ? propsEnquiries : localEnquiries);
  const setEnquiries = propsSetEnquiries || setLocalEnquiries;

  // Keep state synced with localStorage
  useEffect(() => {
    if (!propsEnquiries) {
      setLocalEnquiries(getStoredEnquiries());
    }
  }, [propsEnquiries]);

  // Handler for Client Login Submit
  const handleClientLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccessMsg('');
    setIsSubmittingAuth(true);

    try {
      const user = await loginUser(loginEmail.trim(), loginPassword);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginError('');
    } catch (error) {
      setLoginError(error.message || 'Invalid email or password.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handler for Client Registration Submit
  const handleClientRegister = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccessMsg('');

    if (registerFormData.password !== registerFormData.confirmPassword) {
      setLoginError('Passwords do not match.');
      return;
    }

    setIsSubmittingAuth(true);

    try {
      const payload = {
        name: registerFormData.fullName.trim(),
        companyName: registerFormData.companyName.trim(),
        email: registerFormData.email.trim(),
        password: registerFormData.password,
        phone: registerFormData.phone.trim()
      };

      const registeredUser = await registerUser(payload);

      setLoginEmail(registeredUser.email || registerFormData.email);
      setLoginPassword(registerFormData.password);
      setRegSuccessMsg('Account created successfully! Please sign in with your credentials.');
      setAuthMode('login');
      setRegisterFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setLoginError(error.message || 'Registration failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Modals for Accept/Reject Quotation
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Current active enquiry object
  const currentEnquiry = enquiries.find(e => (e.enquiryId || e.id) === selectedEnquiryId) || enquiries[0] || {};

  // Handler for simulating admin sending quotation for ZT-10234
  const handleSimulateSendQuotation = (enquiryIdToUpdate) => {
    const updated = enquiries.map(item => {
      if ((item.enquiryId || item.id) === enquiryIdToUpdate) {
        return { ...item, status: 'quotation_sent' };
      }
      return item;
    });
    saveStoredEnquiries(updated);
    setEnquiries(updated);
  };

  // Handler for accepting quotation
  const handleConfirmAccept = async () => {
    try {
      const qId = currentEnquiry?.quotation?.id || currentEnquiry?.quotation?.quotationId;
      if (qId) {
        await updateQuotationStatus(qId, 'Accepted');
      }
      setIsAcceptModalOpen(false);
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to accept quotation:", err);
      alert(err.message || "Failed to accept quotation");
    }
  };

  // Handler for rejecting quotation
  const handleConfirmReject = async () => {
    try {
      const qId = currentEnquiry?.quotation?.id || currentEnquiry?.quotation?.quotationId;
      if (qId) {
        await updateQuotationStatus(qId, 'Rejected');
      }
      setIsRejectModalOpen(false);
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to reject quotation:", err);
      alert(err.message || "Failed to reject quotation");
    }
  };

  // Status Badge Helper Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Enquiry Submitted':
      case 'submitted':
      case 'new':
        return (
          <span className="status-pill status-review">
            <Clock size={12} />
            <span>Enquiry Submitted</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="status-pill status-review">
            <Clock size={12} />
            <span>Under Review</span>
          </span>
        );
      case 'quotation_sent':
        return (
          <span className="status-pill status-quotation">
            <FileText size={12} />
            <span>Quotation Sent</span>
          </span>
        );
      case 'accepted':
      case 'approved':
        return (
          <span className="status-pill status-accepted">
            <CheckCircle2 size={12} />
            <span>Quotation Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="status-pill status-rejected">
            <X size={12} />
            <span>Quotation Declined</span>
          </span>
        );
      case 'project_started':
        return (
          <span className="status-pill" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Clock size={12} />
            <span>Project Started</span>
          </span>
        );
      case 'completed':
        return (
          <span className="status-pill" style={{ backgroundColor: '#D1FAE5', color: '#047857', border: '1px solid #6EE7B7', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <CheckCircle2 size={12} />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="status-pill status-review">
            <span>{status}</span>
          </span>
        );
    }
  };


  // =========================================================================
  // SCREEN 1 — CLIENT LOGIN SCREEN (If not logged in)
  // =========================================================================
  // =========================================================================
  // SCREEN 1 — CLIENT AUTHENTICATION SCREEN (Login / Registration)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="section" style={{ paddingTop: '3rem', paddingBottom: '6rem', backgroundColor: 'var(--bg-main)', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          
          {/* Back to Public Website Link */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button 
              onClick={() => setActiveView('home')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Public Website</span>
            </button>
          </div>

          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Header Brand & Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div className="brand-icon" style={{ margin: '0 auto 0.85rem auto', width: '46px', height: '46px', fontSize: '1.3rem' }}>Z</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--burgundy-main)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ZENQUE TECH CLIENT PORTAL
              </div>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {authMode === 'login' ? 'Welcome Back' : 'Create Client Account'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {authMode === 'login' 
                  ? 'Sign in to view your submitted enquiries and track project quotations.' 
                  : 'Register your client account to track project enquiries and review official quotations.'}
              </p>
            </div>

            {/* Success Message Banner */}
            {regSuccessMsg && (
              <div style={{ color: '#047857', backgroundColor: '#D1FAE5', border: '1px solid #6EE7B7', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{regSuccessMsg}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {loginError && (
              <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            {/* LOGIN MODE */}
            {authMode === 'login' ? (
              <>
                <form onSubmit={handleClientLogin}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    
                    <div>
                      <label className="form-label" htmlFor="client-email">
                        Email Address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          id="client-email"
                          type="email"
                          className="form-input"
                          style={{ paddingLeft: '2.25rem' }}
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. client@zenquetech.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label className="form-label" htmlFor="client-password" style={{ margin: 0 }}>
                          Password
                        </label>
                        <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your registered email."); }} style={{ fontSize: '0.78125rem', color: 'var(--burgundy-main)', fontWeight: 600 }}>
                          Forgot Password?
                        </a>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          id="client-password"
                          type="password"
                          className="form-input"
                          style={{ paddingLeft: '2.25rem' }}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  {/* Login Button */}
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingAuth} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                    <span>{isSubmittingAuth ? 'Logging in...' : 'Login to Client Portal'}</span>
                    {!isSubmittingAuth && <ArrowRight size={16} />}
                  </button>
                </form>

                {/* Toggle to Registration / Public Entry */}
                <div style={{ marginTop: '1.75rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have a client account? </span>
                    <span 
                      onClick={() => { setAuthMode('register'); setLoginError(''); setRegSuccessMsg(''); }}
                      style={{ color: 'var(--burgundy-main)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Create an Account
                    </span>
                  </div>
                  <div>
                    <span 
                      onClick={() => setActiveView('enquiry')}
                      style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Submit a new project requirement →
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* REGISTRATION MODE */
              <>
                <form onSubmit={handleClientRegister}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    
                    <div>
                      <label className="form-label" htmlFor="reg-fullname">
                        Full Name <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input 
                        id="reg-fullname"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Alex Morgan"
                        value={registerFormData.fullName}
                        onChange={(e) => setRegisterFormData({ ...registerFormData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="reg-company">
                        Company Name
                      </label>
                      <input 
                        id="reg-company"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Nexus Tech Ltd."
                        value={registerFormData.companyName}
                        onChange={(e) => setRegisterFormData({ ...registerFormData, companyName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="reg-email">
                        Work Email Address <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input 
                        id="reg-email"
                        type="email"
                        className="form-input"
                        placeholder="e.g. alex@nexustech.com"
                        value={registerFormData.email}
                        onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="reg-phone">
                        Phone Number
                      </label>
                      <input 
                        id="reg-phone"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +91 98765 43210"
                        value={registerFormData.phone}
                        onChange={(e) => setRegisterFormData({ ...registerFormData, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="reg-password">
                        Password <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input 
                        id="reg-password"
                        type="password"
                        className="form-input"
                        placeholder="At least 6 characters"
                        value={registerFormData.password}
                        onChange={(e) => setRegisterFormData({ ...registerFormData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="reg-confirmpassword">
                        Confirm Password <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input 
                        id="reg-confirmpassword"
                        type="password"
                        className="form-input"
                        placeholder="Re-enter password"
                        value={registerFormData.confirmPassword}
                        onChange={(e) => setRegisterFormData({ ...registerFormData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                  </div>

                  {/* Register Button */}
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingAuth} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                    <span>{isSubmittingAuth ? 'Creating Account...' : 'Create Client Account'}</span>
                    {!isSubmittingAuth && <ArrowRight size={16} />}
                  </button>
                </form>

                {/* Toggle to Login */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                  <span 
                    onClick={() => { setAuthMode('login'); setLoginError(''); }}
                    style={{ color: 'var(--burgundy-main)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Login to Portal
                  </span>
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    );
  }


  // =========================================================================
  // LOGGED-IN PRIVATE CLIENT AREA (Screens 2 to 8)
  // =========================================================================
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* ========================================================================= */}
      {/* CLIENT PORTAL HEADER NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)', padding: '0.85rem 0', boxShadow: 'var(--shadow-sm)' }}>
        <div className="container nav-container">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="brand-logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
              <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '0.95rem' }}>Z</div>
              <div style={{ fontSize: '1.15rem' }}>
                ZENQUE<span style={{ color: 'var(--burgundy-main)' }}>TECH</span>
              </div>
            </div>
            <span className="badge-tag" style={{ margin: 0, padding: '0.15rem 0.6rem', fontSize: '0.725rem' }}>
              Client Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', listStyle: 'none' }}>
              <li>
                <span 
                  className={`client-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </span>
              </li>
              <li>
                <span 
                  className={`client-nav-link ${activeTab === 'enquiries' || activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('enquiries')}
                >
                  My Enquiries
                </span>
              </li>
              <li>
                <span 
                  className={`client-nav-link ${activeTab === 'quotation' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedEnquiryId('ZT-10234');
                    setActiveTab('quotation');
                  }}
                >
                  Quotations
                </span>
              </li>
              <li>
                <span 
                  className={`client-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </span>
              </li>
            </ul>
          </nav>

          {/* User Account & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--burgundy-light)', color: 'var(--burgundy-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                AM
              </div>
              <span style={{ display: 'none', mdDisplay: 'inline' }}>Alex Morgan</span>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
              title="Sign out of Client Account"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </div>


      {/* ========================================================================= */}
      {/* MAIN CLIENT PORTAL BODY CONTENT */}
      {/* ========================================================================= */}
      <div className="container" style={{ marginTop: '2rem' }}>

        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 2 — CLIENT DASHBOARD */}
        {/* ------------------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div>
            
            {/* Dashboard Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>Welcome Back, Alex</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Track your active technology enquiries and formal project quotations from Zenque Tech.
              </p>
            </div>

            {/* Summary Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Active Enquiries
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {enquiries.length}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--burgundy-main)', marginTop: '0.25rem', fontWeight: 600 }}>
                  Submitted to Zenque Tech
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Pending Quotations
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--burgundy-main)' }}>
                  {enquiries.filter(e => e.status === 'quotation_sent' || e.status === 'under_review').length}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Awaiting review or decision
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Projects Started
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {enquiries.filter(e => e.status === 'accepted').length}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Accepted & scheduled
                </div>
              </div>

            </div>

            {/* Recent Enquiries Table / List */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Recent Enquiries</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your recently submitted service requests</p>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab('enquiries')}
                >
                  <span>View All Enquiries</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>ENQUIRY ID</th>
                      <th>SERVICE</th>
                      <th>PACKAGE</th>
                      <th>SUBMITTED</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((enq) => (
                      <tr key={enq.id}>
                        <td>
                          <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{enq.id}</strong>
                        </td>
                        <td style={{ fontWeight: 600 }}>{enq.serviceTitle}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{enq.packageTier}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{enq.submittedDate}</td>
                        <td>{renderStatusBadge(enq.status)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedEnquiryId(enq.id);
                              setActiveTab('details');
                            }}
                            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                          >
                            <span>View Details</span>
                            <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Action to Submit Another Service Request */}
            <div style={{ 
              backgroundColor: 'var(--burgundy-light)', 
              border: '1px solid var(--burgundy-border)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem 2rem', 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--burgundy-main)', marginBottom: '0.25rem' }}>
                  Need another technology service?
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Submit project requirements for Mobile Apps, AI & ML, UI/UX Design, or Custom Software.
                </p>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => setActiveView('services')}
              >
                <span>Browse Services</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 3 — MY ENQUIRIES */}
        {/* ------------------------------------------------------------------------- */}
        {activeTab === 'enquiries' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>My Enquiries</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Overview of all project enquiries submitted by your account.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {enquiries.map((enq) => (
                <div key={enq.id} className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 800, color: 'var(--burgundy-main)' }}>
                      {enq.id}
                    </span>
                    {renderStatusBadge(enq.status)}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {enq.serviceTitle}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Package: <strong>{enq.packageTier}</strong> • Submitted: {enq.submittedDate}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flexGrow: 1, lineHeight: '1.5' }}>
                    {enq.projectDescription}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => {
                        setSelectedEnquiryId(enq.id);
                        setActiveTab('details');
                      }}
                    >
                      <span>View Details & Track</span>
                      <ArrowRight size={14} />
                    </button>

                    {(enq.status === 'quotation_sent' || enq.status === 'accepted') && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setActiveTab('quotation');
                        }}
                      >
                        <FileText size={14} />
                        <span>Quotation</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 4 & 5 — ENQUIRY DETAILS & VISUAL TRACKING */}
        {/* ------------------------------------------------------------------------- */}
        {activeTab === 'details' && (
          <div>
            
            {/* Top Navigation */}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('enquiries')}
              style={{ marginBottom: '1.5rem' }}
            >
              <ArrowLeft size={14} />
              <span>Back to My Enquiries</span>
            </button>

            {/* Header Details Banner */}
            <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SERVICE ENQUIRY REFERENCE
                  </div>
                  <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                    Enquiry {currentEnquiry.id}
                  </h1>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Submitted on {currentEnquiry.submittedDate} for <strong>{currentEnquiry.serviceTitle} ({currentEnquiry.packageTier})</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  {renderStatusBadge(currentEnquiry.status)}
                </div>
              </div>
            </div>


            {/* ========================================================================= */}
            {/* SCREEN 5 — VISUAL STATUS TIMELINE STEPPER */}
            {/* ========================================================================= */}
            <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                Enquiry Status Timeline
              </h3>

              <div className="tracking-timeline">
                
                {/* Step 1: Submitted */}
                <div className="timeline-step completed">
                  <div className="timeline-node">
                    <Check size={14} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Enquiry Submitted</div>
                    <div className="timeline-sub">{currentEnquiry.submittedDate}</div>
                  </div>
                </div>

                <div className="timeline-line active" />

                {/* Step 2: Under Review */}
                <div className={`timeline-step ${!['Enquiry Submitted', 'submitted', 'new', 'under_review'].includes(currentEnquiry.status) ? 'completed' : currentEnquiry.status === 'under_review' ? 'active' : ''}`}>
                  <div className="timeline-node">
                    {!['Enquiry Submitted', 'submitted', 'new', 'under_review'].includes(currentEnquiry.status) ? <Check size={14} /> : '2'}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Under Review</div>
                    <div className="timeline-sub">Solution Architect</div>
                  </div>
                </div>

                <div className={`timeline-line ${!['Enquiry Submitted', 'submitted', 'new', 'under_review'].includes(currentEnquiry.status) ? 'active' : ''}`} />

                {/* Step 3: Quotation Sent */}
                <div className={`timeline-step ${['accepted', 'approved', 'project_started', 'completed'].includes(currentEnquiry.status) ? 'completed' : currentEnquiry.status === 'quotation_sent' ? 'active' : ''}`}>
                  <div className="timeline-node">
                    {['accepted', 'approved', 'project_started', 'completed'].includes(currentEnquiry.status) ? <Check size={14} /> : '3'}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Quotation Sent</div>
                    <div className="timeline-sub">{currentEnquiry.quotation ? currentEnquiry.quotation.id : 'Pending'}</div>
                  </div>
                </div>

                <div className={`timeline-line ${['accepted', 'approved', 'project_started', 'completed', 'rejected'].includes(currentEnquiry.status) ? 'active' : ''}`} />

                {/* Step 4: Client Response */}
                <div className={`timeline-step ${['project_started', 'completed'].includes(currentEnquiry.status) ? 'completed' : ['accepted', 'approved'].includes(currentEnquiry.status) ? 'active' : currentEnquiry.status === 'rejected' ? 'rejected' : ''}`}>
                  <div className="timeline-node">
                    {['project_started', 'completed', 'accepted', 'approved'].includes(currentEnquiry.status) ? <Check size={14} /> : currentEnquiry.status === 'rejected' ? <X size={14} /> : '4'}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Client Response</div>
                    <div className="timeline-sub">{['accepted', 'approved', 'project_started', 'completed'].includes(currentEnquiry.status) ? 'Client Accepted' : currentEnquiry.status === 'rejected' ? 'Declined' : 'Pending'}</div>
                  </div>
                </div>

                <div className={`timeline-line ${['project_started', 'completed'].includes(currentEnquiry.status) ? 'active' : ''}`} />

                {/* Step 5: Project Started */}
                <div className={`timeline-step ${currentEnquiry.status === 'completed' ? 'completed' : currentEnquiry.status === 'project_started' ? 'active' : ''}`}>
                  <div className="timeline-node">
                    {currentEnquiry.status === 'completed' ? <Check size={14} /> : '5'}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Project Started</div>
                    <div className="timeline-sub">{currentEnquiry.status === 'project_started' || currentEnquiry.status === 'completed' ? 'In Progress' : 'Pending'}</div>
                  </div>
                </div>

                <div className={`timeline-line ${currentEnquiry.status === 'completed' ? 'active' : ''}`} />

                {/* Step 6: Completed */}
                <div className={`timeline-step ${currentEnquiry.status === 'completed' ? 'completed active' : ''}`}>
                  <div className="timeline-node">
                    {currentEnquiry.status === 'completed' ? <Check size={14} /> : '6'}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Completed</div>
                    <div className="timeline-sub">{currentEnquiry.status === 'completed' ? 'Delivered' : 'Pending'}</div>
                  </div>
                </div>

              </div>

              {/* Developer Prototype Toggle for ZT-10234 status */}
              {(currentEnquiry.enquiryId || currentEnquiry.id) === 'ZT-10234' && currentEnquiry.status === 'under_review' && (
                <div style={{ 
                  backgroundColor: 'var(--bg-subtle)', 
                  border: '1px dashed var(--border-dark)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.85rem 1.25rem', 
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.8125rem'
                }}>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>Prototype Interactive Control:</strong> Test how the UI looks when Zenque Tech issues a quotation for this enquiry.
                  </div>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleSimulateSendQuotation('ZT-10234')}
                    style={{ fontSize: '0.78125rem', padding: '0.35rem 0.65rem' }}
                  >
                    <span>⚡ Simulate Admin Issuing Quotation</span>
                  </button>
                </div>
              )}

            </div>


            {/* ========================================================================= */}
            {/* QUOTATION CALLOUT / PREVIEW BOX */}
            {/* ========================================================================= */}
            <div style={{ marginBottom: '2rem' }}>
              {!currentEnquiry.quotation ? (
                <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <Clock size={20} style={{ color: 'var(--burgundy-main)' }} />
                    <h3 style={{ fontSize: '1.15rem' }}>Quotation Not Available Yet</h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Zenque Tech solution architects are reviewing your project requirements. You will receive an automated notification as soon as formal quotation QT-{((currentEnquiry.enquiryId || currentEnquiry.id || '').split('-')[1]) || '10234'} is issued.
                  </p>
                </div>
              ) : (
                <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--burgundy-light)', border: '1px solid var(--burgundy-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--burgundy-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        FORMAL QUOTATION ISSUED
                      </div>
                      <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                        Quotation {currentEnquiry.quotation.id} — Total: {currentEnquiry.quotation.totalAmount}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Valid until {currentEnquiry.quotation.validUntil}. Review deliverables breakdown and response options.
                      </p>
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('quotation')}
                    >
                      <FileText size={16} />
                      <span>View Quotation Details</span>
                    </button>
                  </div>
                </div>
              )}
            </div>


            {/* ========================================================================= */}
            {/* SUBMITTED ENQUIRY SPECIFICATIONS DISPLAY */}
            {/* ========================================================================= */}
            <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                Submitted Enquiry Specifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Service & Package */}
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    SERVICE & PACKAGE
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currentEnquiry.serviceTitle} <span style={{ color: 'var(--burgundy-main)' }}>— {currentEnquiry.packageTier}</span>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    PROJECT NAME & DESCRIPTION
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {currentEnquiry.projectName}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {currentEnquiry.projectDescription}
                  </p>
                  {currentEnquiry.requiredFeatures && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <strong>Required Features:</strong> {currentEnquiry.requiredFeatures}
                    </div>
                  )}
                </div>

                {/* Budget & Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>ESTIMATED BUDGET</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{currentEnquiry.budget}</strong>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>TARGET TIMELINE</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{currentEnquiry.timeline}</strong>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    CLIENT CONTACT DETAILS
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div>Name: <strong>{currentEnquiry.fullName}</strong></div>
                    <div>Company: <strong>{currentEnquiry.companyName}</strong></div>
                    <div>Email: <strong>{currentEnquiry.email}</strong></div>
                    <div>Phone: <strong>{currentEnquiry.phone}</strong></div>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    ATTACHED FILES
                  </div>
                  {currentEnquiry.files.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No files attached.</div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {currentEnquiry.files.map((file, idx) => (
                        <span key={idx} style={{ fontSize: '0.8125rem', backgroundColor: 'var(--bg-subtle)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <FileText size={13} style={{ color: 'var(--burgundy-main)' }} />
                          {file.name} ({file.size})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consultation */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    CONSULTATION PREFERENCE
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {(() => {
                      const cObj = currentEnquiry.consultationObj;
                      const dateVal = cObj?.preferredDate || currentEnquiry.preferredDate;
                      const timeVal = cObj?.preferredTime || currentEnquiry.preferredTime;
                      const statusVal = cObj?.status || 'Requested';
                      const schedStr = formatConsultationSchedule(dateVal, timeVal);

                      if (statusVal === 'Scheduled' || (schedStr && schedStr.trim() !== '')) {
                        const titleText = statusVal === 'Scheduled' ? 'Scheduled Consultation' : 'Requested Call';
                        return (
                          <span style={{ color: 'var(--burgundy-main)', fontWeight: 600 }}>
                            {titleText} — Preferred Schedule: <strong>{schedStr}</strong> (Status: <strong>{statusVal}</strong>)
                          </span>
                        );
                      }
                      if (currentEnquiry.needsConsultation === 'yes') {
                        return (
                          <span style={{ color: 'var(--burgundy-main)', fontWeight: 600 }}>
                            Requested Call (Schedule pending)
                          </span>
                        );
                      }
                      return <span>No discovery call requested.</span>;
                    })()}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 6 — QUOTATION VIEW */}
        {/* ------------------------------------------------------------------------- */}
        {activeTab === 'quotation' && (
          <div>
            
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('details')}
              style={{ marginBottom: '1.5rem' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Enquiry Details ({currentEnquiry.id})</span>
            </button>

            {currentEnquiry.status === 'under_review' ? (
              <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                  <Clock size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Quotation Not Available Yet
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.75rem auto' }}>
                  Zenque Tech solution architects are reviewing your enquiry ({currentEnquiry.id}). You will be notified when a quotation is available.
                </p>

                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => handleSimulateSendQuotation(currentEnquiry.id)}
                >
                  <span>⚡ Simulate Admin Sending Quotation</span>
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
                
                {/* Quotation Document Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <div className="brand-icon" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>Z</div>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>ZENQUE<span style={{ color: 'var(--burgundy-main)' }}>TECH</span></span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Zenque Technologies Pvt. Ltd. • Solution Architecture Team
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                      FORMAL SERVICE QUOTATION
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontFamily: 'monospace', color: 'var(--text-primary)', margin: '0.1rem 0' }}>
                      {currentEnquiry.quotation.id}
                    </h2>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Enquiry Ref: <strong>{currentEnquiry.id}</strong> | Valid Until: {currentEnquiry.quotation.validUntil}
                    </div>
                  </div>
                </div>

                {/* Target Scope Summary */}
                <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    QUOTED SERVICE SCOPE
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currentEnquiry.serviceTitle} ({currentEnquiry.packageTier})
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    {currentEnquiry.projectDescription}
                  </p>
                </div>

                {/* Cost Breakdown Table */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    Cost Breakdown & Investment Schedule
                  </h3>

                  <table className="portal-table" style={{ border: '1px solid var(--border-light)' }}>
                    <thead>
                      <tr>
                        <th>MILESTONE DELIVERABLE</th>
                        <th style={{ textAlign: 'right' }}>INVESTMENT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEnquiry.quotation.breakdown.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 500 }}>{item.desc}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>{item.cost}</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: 'var(--burgundy-light)' }}>
                        <td style={{ fontWeight: 800, color: 'var(--burgundy-main)', fontSize: '1.05rem' }}>
                          TOTAL QUOTATION INVESTMENT
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--burgundy-main)', fontSize: '1.35rem' }}>
                          {currentEnquiry.quotation.totalAmount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Architect Notes & Terms */}
                <div style={{ marginBottom: '2.5rem', backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    NOTES FROM ZENQUE TECH ARCHITECT
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {currentEnquiry.quotation.architectNotes}
                  </p>
                </div>

                {/* Action Buttons / Response Bar */}
                <div style={{ paddingTop: '1.5rem', borderTop: '2px solid var(--border-light)' }}>
                  {currentEnquiry.status === 'quotation_sent' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Accepting this quotation confirms your agreement to proceed with Zenque Tech.
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setIsRejectModalOpen(true)}
                        >
                          <X size={16} />
                          <span>Reject Quotation</span>
                        </button>

                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={() => setIsAcceptModalOpen(true)}
                        >
                          <CheckCircle2 size={18} />
                          <span>Accept Quotation</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {['accepted', 'approved'].includes(currentEnquiry.status) && (
                    <div style={{ backgroundColor: 'var(--status-green-bg)', border: '1px solid #A7F3D0', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--status-green)' }}>
                      <CheckCircle2 size={24} />
                      <div>
                        <strong style={{ fontSize: '1.05rem', display: 'block' }}>Quotation Accepted</strong>
                        <span style={{ fontSize: '0.85rem' }}>You accepted this quotation. Zenque Tech engineering leads have been notified to initiate project kickoff.</span>
                      </div>
                    </div>
                  )}

                  {currentEnquiry.status === 'project_started' && (
                    <div style={{ backgroundColor: '#EDE9FE', border: '1px solid #C4B5FD', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6D28D9' }}>
                      <Clock size={24} />
                      <div>
                        <strong style={{ fontSize: '1.05rem', display: 'block' }}>Project Started</strong>
                        <span style={{ fontSize: '0.85rem' }}>Zenque Tech engineering team has actively commenced project development and milestone execution.</span>
                      </div>
                    </div>
                  )}

                  {currentEnquiry.status === 'completed' && (
                    <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #6EE7B7', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#047857' }}>
                      <CheckCircle2 size={24} />
                      <div>
                        <strong style={{ fontSize: '1.05rem', display: 'block' }}>Project Completed</strong>
                        <span style={{ fontSize: '0.85rem' }}>All technical deliverables and project milestones have been successfully delivered and handed over.</span>
                      </div>
                    </div>
                  )}

                  {currentEnquiry.status === 'rejected' && (
                    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991B1B' }}>
                      <AlertCircle size={24} />
                      <div>
                        <strong style={{ fontSize: '1.05rem', display: 'block' }}>Quotation Declined</strong>
                        <span style={{ fontSize: '0.85rem' }}>You declined this quotation. Reason provided: {currentEnquiry.rejectReason || 'No reason provided'}.</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN PROFILE — CLIENT ACCOUNT DETAILS */}
        {/* ------------------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '2.25rem', backgroundColor: '#FFFFFF', maxWidth: '640px' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Client Account Settings
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Your client profile and verified organization details on Zenque Tech.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value="Alex Morgan" readOnly />
              </div>

              <div>
                <label className="form-label">Company / Organization</label>
                <input type="text" className="form-input" value="Nexus Tech Innovations" readOnly />
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value="alex@nexustech.com" readOnly />
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" value="+91 98765 43210" readOnly />
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--status-green)', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>Verified Client Account</span>
              </div>
            </div>
          </div>
        )}

      </div>


      {/* ========================================================================= */}
      {/* SCREEN 7 — ACCEPT QUOTATION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isAcceptModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAcceptModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-green)', textTransform: 'uppercase' }}>
                  Confirmation Required
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                  Accept this quotation?
                </h3>
              </div>
              <button className="close-btn" onClick={() => setIsAcceptModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              By accepting quotation <strong>{currentEnquiry.quotation.id}</strong> ({currentEnquiry.quotation.totalAmount}), you are confirming that you would like to proceed with this project with Zenque Tech.
            </p>

            <div style={{ 
              backgroundColor: 'var(--status-green-bg)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem 1rem', 
              marginBottom: '1.75rem', 
              fontSize: '0.8125rem',
              color: 'var(--status-green)',
              border: '1px solid #A7F3D0'
            }}>
              <strong>Note:</strong> No payment is charged at this step. Acceptance notifies our engineering lead to schedule milestone execution.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAcceptModalOpen(false)}>
                <span>Cancel</span>
              </button>

              <button className="btn btn-primary btn-sm" onClick={handleConfirmAccept}>
                <CheckCircle2 size={16} />
                <span>Confirm Acceptance</span>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* SCREEN 8 — REJECT QUOTATION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isRejectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>
                  Decline Confirmation
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                  Reject this quotation?
                </h3>
              </div>
              <button className="close-btn" onClick={() => setIsRejectModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Please confirm if you wish to decline quotation <strong>{currentEnquiry.quotation.id}</strong>.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="reject-reason">
                Reason for Rejection (Optional):
              </label>
              <textarea 
                id="reject-reason"
                className="form-textarea"
                rows={3}
                placeholder="e.g. Budget constraints, scope adjustment needed, timeline changed..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsRejectModalOpen(false)}>
                <span>Cancel</span>
              </button>

              <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }} onClick={handleConfirmReject}>
                <span>Confirm Rejection</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOGOUT TRANSITION OVERLAY */}
      {/* ========================================================================= */}
      {isLoggingOut && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div className="card" style={{
            padding: '2.5rem 3rem',
            backgroundColor: '#FFFFFF',
            textAlign: 'center',
            maxWidth: '420px',
            width: '90%',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div className="brand-icon" style={{ margin: '0 auto 1rem auto', width: '50px', height: '50px', fontSize: '1.4rem' }}>
              Z
            </div>
            
            {logoutStep === 'progress' ? (
              <>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Logging out...
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Safely terminating your Zenque Tech authenticated session.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '28px', height: '28px', border: '3px solid var(--burgundy-light)', borderTopColor: 'var(--burgundy-main)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Logged Out Successfully
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Redirecting to Public Home...
                </p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
