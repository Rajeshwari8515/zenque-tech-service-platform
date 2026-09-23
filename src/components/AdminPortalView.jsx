import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Calendar, 
  Layers, 
  Package, 
  Users, 
  LogOut, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  FileCheck, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { SERVICES_DATA } from '../data/mockServices';
import { getStoredEnquiries, saveStoredEnquiries, formatConsultationSchedule } from '../utils/enquiryStorage';
import { loginUser, getAllUsers, getUserById, clearAuthSession, getAuthToken } from '../api/authApi';
import { 
  getAllEnquiries, 
  updateEnquiryStatus as updateEnquiryStatusApi, 
  createQuotation as createQuotationApi, 
  getQuotationByEnquiry, 
  updateQuotationStatus as updateQuotationStatusApi,
  getServices,
  getConsultationByEnquiry,
  createConsultation as createConsultationApi,
  scheduleConsultation as scheduleConsultationApi
} from '../api/serviceApi';
import { getEnquiryFiles } from '../api/fileApi';

export default function AdminPortalView({ 
  setActiveView,
  enquiries: propsEnquiries,
  setEnquiries: propsSetEnquiries,
  selectedEnquiryId: propsSelectedEnquiryId,
  setSelectedEnquiryId: propsSetSelectedEnquiryId
}) {
  // Admin Login Authentication State (Default logged out for role separation)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = getAuthToken();
    const savedUser = localStorage.getItem('zenque_current_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role === 'ADMIN') {
          setAdminUser(parsed);
          setIsAdminLoggedIn(true);
        }
      } catch (e) {}
    }

    const handleUnauthorized = () => {
      setAdminUser(null);
      setIsAdminLoggedIn(false);
      setAdminLoginError("Session expired or authentication invalid. Please sign in again.");
    };

    window.addEventListener('zenque_auth_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('zenque_auth_unauthorized', handleUnauthorized);
    };
  }, []);


  // Active Admin Sub-Tab
  // ('dashboard' | 'enquiries' | 'enquiry-detail' | 'create-quotation' | 'quotations' | 'consultations' | 'services' | 'packages' | 'clients')
  const [adminTab, setAdminTab] = useState('dashboard');
  
  // Local state fallback for enquiries
  const [localEnquiries, setLocalEnquiries] = useState(() => getStoredEnquiries());
  const enquiries = propsEnquiries && propsEnquiries.length > 0 ? propsEnquiries : localEnquiries;
  const setEnquiries = propsSetEnquiries || setLocalEnquiries;

  // Active Selected Enquiry ID for detail/quotation
  const [internalSelectedEnquiryId, setInternalSelectedEnquiryId] = useState(() => propsSelectedEnquiryId || 'ZT-10234');
  const selectedEnquiryId = propsSelectedEnquiryId || internalSelectedEnquiryId;
  const setSelectedEnquiryId = (id) => {
    setInternalSelectedEnquiryId(id);
    if (propsSetSelectedEnquiryId) propsSetSelectedEnquiryId(id);
  };

  // Status Filter for Enquiries List
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isSendQuotationModalOpen, setIsSendQuotationModalOpen] = useState(false);
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [scheduleErrors, setScheduleErrors] = useState({});
  const [newStatus, setNewStatus] = useState('Under Review');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Quotation Form State (for Screen 5: Create Quotation)
  const [quotationFormData, setQuotationFormData] = useState({
    baseCost: '65000',
    additionalCost: '12000',
    validityDays: '15',
    validUntilDate: '2026-09-30',
    architectNotes: 'Includes full source code ownership, Docker containerization scripts, and 4 weeks of SLA technical support.'
  });

  // Services Management State (Screen 10)
  const [servicesList, setServicesList] = useState([
    { id: 'web-development', title: 'Web Development', active: true, packagesCount: 3 },
    { id: 'mobile-development', title: 'Mobile App Development', active: true, packagesCount: 3 },
    { id: 'uiux-design', title: 'UI/UX Design', active: true, packagesCount: 3 },
    { id: 'aiml-solutions', title: 'AI & ML Solutions', active: true, packagesCount: 3 },
    { id: 'custom-software', title: 'Custom Software', active: true, packagesCount: 3 },
    { id: 'digital-solutions', title: 'Digital Solutions', active: true, packagesCount: 3 }
  ]);

  // Consultations Management State (Screen 9)
  const [consultationsList, setConsultationsList] = useState([]);

  // Current active enquiry object from shared state
  const currentEnquiry = enquiries.find(e => (e.enquiryId || e.id) === selectedEnquiryId) || enquiries[0] || {};

  // Fetch real backend enquiries
  const fetchBackendEnquiries = async () => {
    try {
      setIsLoading(true);
      const [backendData, srvsData, usersData] = await Promise.all([
        getAllEnquiries().catch(() => null),
        getServices().catch(() => []),
        getAllUsers().catch(() => [])
      ]);

      const userMap = {};
      if (Array.isArray(usersData)) {
        usersData.forEach(u => {
          if (u.userId) userMap[u.userId] = u;
        });
      }

      if (backendData && Array.isArray(backendData) && backendData.length > 0) {
        const srvMap = {};
        if (Array.isArray(srvsData)) {
          srvsData.forEach(s => { srvMap[s.serviceId] = s.serviceName; });
        }

        const enriched = await Promise.all(backendData.map(async (item) => {
          let quotation = null;
          try {
            quotation = await getQuotationByEnquiry(item.enquiryId);
          } catch (e) {
            // No quotation found
          }

          let consultation = null;
          try {
            consultation = await getConsultationByEnquiry(item.enquiryId);
          } catch (e) {
            // No consultation found
          }

          let userInfo = userMap[item.userId] || null;
          if (!userInfo && item.userId) {
            try {
              userInfo = await getUserById(item.userId);
            } catch (uErr) {}
          }

          const srvId = item.serviceId;
          const pkgId = item.packageId;
          const serviceTitle = srvMap[srvId] || (srvId === 1 ? 'Web Development' : srvId === 2 ? 'Mobile App Development' : srvId === 3 ? 'UI/UX Design' : srvId === 4 ? 'Cloud & Infrastructure' : 'Custom Software');
          const packageTier = pkgId === 1 || pkgId === 4 || pkgId === 7 || pkgId === 10 ? 'Basic Package' : pkgId === 2 || pkgId === 5 || pkgId === 8 || pkgId === 11 ? 'Standard Package' : 'Premium Package';

          const formattedQuotation = quotation ? {
            id: quotation.quotationId,
            quotationId: quotation.quotationId,
            issuedDate: quotation.issuedDate ? new Date(quotation.issuedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            validUntil: quotation.validity || 'Valid 30 Days',
            totalAmount: '₹' + (quotation.totalAmount ? quotation.totalAmount.toLocaleString('en-IN') : '0'),
            architectNotes: quotation.notes,
            serviceCost: quotation.serviceCost,
            additionalCost: quotation.additionalCost,
            status: quotation.status,
            breakdown: [
              { desc: `${serviceTitle} (${packageTier}) Core Scope`, cost: '₹' + (quotation.serviceCost ? quotation.serviceCost.toLocaleString('en-IN') : '0') },
              { desc: 'API Integration & Cloud Infrastructure Setup', cost: '₹' + (quotation.additionalCost ? quotation.additionalCost.toLocaleString('en-IN') : '0') }
            ]
          } : null;

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

          const clientNameVal = userInfo?.name || (item.userId === 1 ? 'Alex Morgan' : item.userId === 3 ? 'Sarah Jenkins' : `Client #${item.userId || 'N/A'}`);
          const companyNameVal = (userInfo?.companyName && userInfo.companyName.trim()) ? userInfo.companyName.trim() : 'Not provided';
          const emailVal = userInfo?.email || (item.userId === 1 ? 'alex@abctechnologies.com' : item.userId === 3 ? 'sarah@apexsolutions.com' : 'client@zenquetech.com');
          const phoneVal = userInfo?.phone || item.phone || '+91 98765 43210';

          const rawItemDate = item.createdAt || item.created_at || item.submittedDate;
          const displayDate = rawItemDate ? new Date(rawItemDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          return {
            ...item,
            enquiryId: item.enquiryId,
            id: item.enquiryId,
            userId: item.userId,
            serviceId: item.serviceId,
            packageId: item.packageId,
            service: serviceTitle,
            serviceTitle: serviceTitle,
            package: packageTier,
            packageTier: packageTier,
            projectName: item.projectName || 'Enterprise Portal',
            projectDescription: item.description || 'Custom web application scope',
            description: item.description || '',
            requiredFeatures: item.requiredFeatures || '',
            additionalRequirements: item.additionalRequirements || '',
            budget: item.budget || '₹50K – ₹1L',
            timeline: item.timeline || '2–4 Weeks',
            status: item.status || 'Enquiry Submitted',
            consultationObj: consultation,
            preferredDate: consultation?.preferredDate || item.preferredDate || '',
            preferredTime: consultation?.preferredTime || item.preferredTime || '',
            fullName: clientNameVal,
            clientName: clientNameVal,
            companyName: companyNameVal,
            email: emailVal,
            phone: phoneVal,
            submittedDate: displayDate,
            createdAt: rawItemDate || new Date().toISOString(),
            files: enquiryFilesList.length > 0 ? enquiryFilesList : (item.files || []),
            quotation: formattedQuotation
          };
        }));

        setLocalEnquiries(enriched);
        saveStoredEnquiries(enriched);
        if (setEnquiries) setEnquiries(enriched);

        const realConsultations = enriched
          .filter(item => item.consultationObj || item.preferredDate)
          .map((item, idx) => {
            const cObj = item.consultationObj;
            const dateVal = cObj?.preferredDate || item.preferredDate;
            const timeVal = cObj?.preferredTime || item.preferredTime;
            const formattedSched = formatConsultationSchedule(dateVal, timeVal);
            return {
              id: cObj?.consultationId ? `CON-${cObj.consultationId}` : `CON-${100 + idx + 1}`,
              enquiryId: item.enquiryId || item.id,
              client: `${item.fullName}${item.companyName && item.companyName !== 'Not provided' ? ` (${item.companyName})` : ''}`,
              date: formattedSched.includes(',') ? formattedSched.split(',')[0].trim() : (formattedSched || 'Pending'),
              time: formattedSched.includes(',') ? formattedSched.split(',')[1].trim() : (timeVal || 'Pending'),
              status: cObj?.status || 'Requested'
            };
          });
        if (realConsultations.length > 0) {
          setConsultationsList(realConsultations);
        }
      }
    } catch (err) {
      console.error("Error fetching backend enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchBackendEnquiries();
    }
  }, [isAdminLoggedIn]);

  // Handler for saving/sending quotation
  const handleSendQuotationSubmit = async () => {
    const targetId = currentEnquiry.enquiryId || currentEnquiry.id || selectedEnquiryId;
    const sCost = parseFloat(quotationFormData.baseCost || '0');
    const aCost = parseFloat(quotationFormData.additionalCost || '0');

    try {
      setIsSaving(true);
      // 1. Create quotation via POST /api/quotations
      const createdQuotation = await createQuotationApi({
        enquiryId: targetId,
        serviceCost: sCost,
        additionalCost: aCost,
        validity: quotationFormData.validUntilDate || '2026-09-30',
        notes: quotationFormData.architectNotes,
        status: 'Draft'
      });

      const qId = createdQuotation.quotationId || (targetId.startsWith('ZT-') ? `QT-${targetId.substring(3)}` : 'QT-10234');

      // 2. Send quotation via PUT /api/quotations/{quotationId}/status with {"status":"Sent"}
      await updateQuotationStatusApi(qId, 'Sent');

      // 3. Re-fetch real backend data to update state
      await fetchBackendEnquiries();
      setIsSendQuotationModalOpen(false);
      setAdminTab('enquiry-detail');
    } catch (err) {
      alert("Failed to save & send quotation: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for updating enquiry status manually
  const handleUpdateStatusSubmit = async () => {
    const targetId = currentEnquiry.enquiryId || currentEnquiry.id || selectedEnquiryId;
    try {
      setIsSaving(true);
      await updateEnquiryStatusApi(targetId, newStatus);
      await fetchBackendEnquiries();
      setIsStatusUpdateModalOpen(false);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Enquiry Submitted':
      case 'new':
        return <span className="status-pill" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC' }}>Enquiry Submitted</span>;
      case 'Under Review':
      case 'under_review':
        return <span className="status-pill status-review">Under Review</span>;
      case 'Quotation Sent':
      case 'quotation_sent':
        return <span className="status-pill status-quotation">Quotation Sent</span>;
      case 'Client Response':
      case 'accepted':
      case 'approved':
        return <span className="status-pill status-accepted">Client Response</span>;
      case 'rejected':
        return <span className="status-pill status-rejected">Declined</span>;
      case 'Project Started':
      case 'project_started':
        return <span className="status-pill" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD', fontWeight: 700 }}>Project Started</span>;
      case 'Completed':
      case 'completed':
        return <span className="status-pill" style={{ backgroundColor: '#D1FAE5', color: '#047857', border: '1px solid #6EE7B7', fontWeight: 700 }}>Completed</span>;
      default:
        return <span className="status-pill status-review">{status}</span>;
    }
  };

  // Helper for Client Response Display
  const renderClientResponseBadge = (status) => {
    if (['accepted', 'approved', 'project_started', 'completed', 'Client Response', 'Project Started', 'Completed'].includes(status)) {
      return (
        <span style={{ backgroundColor: '#D1FAE5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.8125rem', border: '1px solid #6EE7B7' }}>
          ACCEPTED
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.8125rem', border: '1px solid #FCA5A5' }}>
          DECLINED
        </span>
      );
    }
    if (status === 'Quotation Sent' || status === 'quotation_sent') {
      return <span style={{ color: '#D97706', fontWeight: 600, fontSize: '0.8125rem' }}>Quotation Sent (Awaiting Response)</span>;
    }
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{status || 'Under Review'}</span>;
  };



  // =========================================================================
  // SCREEN 1 — ADMIN LOGIN SCREEN (If logged out)
  // =========================================================================
  if (!isAdminLoggedIn) {
    return (
      <div className="section" style={{ paddingTop: '3rem', paddingBottom: '6rem', backgroundColor: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', flex: 1 }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          
          {/* Back to Public Website Navigation */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button 
              onClick={() => setActiveView('home')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', backgroundColor: '#1E293B', borderColor: '#334155' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Public Website</span>
            </button>
          </div>

          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#1E293B', borderColor: '#334155', boxShadow: 'var(--shadow-lg)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="brand-icon" style={{ margin: '0 auto 1rem auto', width: '48px', height: '48px', fontSize: '1.4rem' }}>Z</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--burgundy-border)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ZENQUE TECH INTERNAL PORTAL
              </div>
              <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginTop: '0.25rem' }}>
                Admin Portal
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                Operational dashboard for enquiry review & quotation management.
              </p>
            </div>

            {/* Error Alert */}
            {adminLoginError && (
              <div style={{ color: '#FCA5A5', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, color: '#F87171' }} />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              setAdminLoginError('');
              try {
                const userResp = await loginUser(adminEmail.trim(), adminPassword);
                setAdminUser(userResp);
                setIsAdminLoggedIn(true);
                setAdminLoginError('');
              } catch (err) {
                setAdminLoginError(err.message || 'Invalid admin credentials.');
              }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                
                <div>
                  <label className="form-label" htmlFor="admin-email" style={{ color: '#F8FAFC' }}>
                    Admin Email
                  </label>
                  <input 
                    id="admin-email"
                    type="email"
                    className="form-input"
                    style={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="admin-password" style={{ color: '#F8FAFC' }}>
                    Password
                  </label>
                  <input 
                    id="admin-password"
                    type="password"
                    className="form-input"
                    style={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>

              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                <span>Login to Admin Portal</span>
                <ArrowRight size={16} />
              </button>
            </form>

          </div>

        </div>
      </div>
    );
  }


  // =========================================================================
  // LOGGED-IN INTERNAL ADMIN MANAGEMENT AREA (Screens 2 to 12)
  // =========================================================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', flex: 1 }}>
      
      {/* ========================================================================= */}
      {/* ADMIN SIDEBAR NAVIGATION */}
      {/* ========================================================================= */}
      <aside className="admin-sidebar">
        
        {/* Brand */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon" style={{ width: '34px', height: '34px', fontSize: '1rem' }}>Z</div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              ZENQUE<span style={{ color: 'var(--burgundy-border)' }}>TECH</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              Admin Operations
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1.25rem 0.85rem', flexGrow: 1 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            
            <li>
              <button 
                className={`admin-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setAdminTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>

            <li>
              <button 
                className={`admin-nav-item ${adminTab === 'enquiries' || adminTab === 'enquiry-detail' || adminTab === 'create-quotation' ? 'active' : ''}`}
                onClick={() => setAdminTab('enquiries')}
              >
                <FileText size={18} />
                <span>Client Enquiries</span>
                <span className="admin-badge-count">{enquiries.length}</span>
              </button>
            </li>

            <li>
              <button 
                className={`admin-nav-item ${adminTab === 'quotations' ? 'active' : ''}`}
                onClick={() => setAdminTab('quotations')}
              >
                <Receipt size={18} />
                <span>Quotations</span>
              </button>
            </li>

            <li>
              <button 
                className={`admin-nav-item ${adminTab === 'consultations' ? 'active' : ''}`}
                onClick={() => setAdminTab('consultations')}
              >
                <Calendar size={18} />
                <span>Consultations</span>
              </button>
            </li>

            <li style={{ margin: '0.75rem 0 0.25rem 0.75rem', fontSize: '0.7rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
              Catalog & Clients
            </li>

            <li>
              <button 
                className={`admin-nav-item ${adminTab === 'services' ? 'active' : ''}`}
                onClick={() => setAdminTab('services')}
              >
                <Layers size={18} />
                <span>Services</span>
              </button>
            </li>

            <li>
              <button 
                className={`admin-nav-item ${adminTab === 'packages' ? 'active' : ''}`}
                onClick={() => setAdminTab('packages')}
              >
                <Package size={18} />
                <span>Packages</span>
              </button>
            </li>

            <li>
              <button 
                className={`admin-nav-item ${adminTab === 'clients' ? 'active' : ''}`}
                onClick={() => setAdminTab('clients')}
              >
                <Users size={18} />
                <span>Clients</span>
              </button>
            </li>

          </ul>
        </nav>

        {/* Switcher to Public / Client Portal */}
        <div style={{ padding: '1rem', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveView('home')}
            style={{ width: '100%', justifyContent: 'center', backgroundColor: '#1E293B', color: '#F8FAFC', borderColor: '#334155' }}
          >
            <ExternalLink size={14} />
            <span>Exit to Public Website</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
            clearAuthSession();
            setAdminUser(null);
            setIsAdminLoggedIn(false);
          }}
            style={{ width: '100%', justifyContent: 'center', backgroundColor: 'transparent', color: '#94A3B8', borderColor: 'transparent' }}
          >
            <LogOut size={14} />
            <span>Admin Logout</span>
          </button>
        </div>

      </aside>


      {/* ========================================================================= */}
      {/* MAIN ADMIN WORKSPACE AREA */}
      {/* ========================================================================= */}
      <main style={{ flexGrow: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
              Zenque Tech Solutions Architecture Console
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {adminTab.replace('-', ' ')}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--burgundy-main)' }} />
              <span>Admin: <strong>Senior Solutions Architect</strong></span>
            </div>
          </div>
        </div>


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 2 — ADMIN DASHBOARD */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'dashboard' && (
          <div>
            
            {/* Operational Summary Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
              
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Total Enquiries
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {enquiries.length}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Submitted by clients
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  New / Under Review
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#D97706' }}>
                  {enquiries.filter(e => e.status === 'under_review' || e.status === 'new').length}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#D97706', marginTop: '0.2rem', fontWeight: 600 }}>
                  Requires quotation drafting
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Pending Quotations
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--burgundy-main)' }}>
                  {enquiries.filter(e => e.status === 'quotation_sent').length}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Sent to client for response
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Approved Projects
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--status-green)' }}>
                  {enquiries.filter(e => e.status === 'accepted' || e.status === 'project_started').length}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--status-green)', marginTop: '0.2rem', fontWeight: 600 }}>
                  Accepted by client
                </div>
              </div>

            </div>

            {/* Recent Enquiries Table (What needs attention) */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Action Needed: Recent Enquiries</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review requirements and issue formal quotations</p>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setAdminTab('enquiries')}
                >
                  <span>View All Enquiries</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>ENQUIRY ID</th>
                      <th>CLIENT</th>
                      <th>SERVICE</th>
                      <th>CLIENT RESPONSE</th>
                      <th>STATUS</th>
                      <th>SUBMITTED</th>
                      <th style={{ textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((enq) => (
                      <tr key={enq.enquiryId || enq.id}>
                        <td>
                          <strong style={{ fontFamily: 'monospace', color: 'var(--burgundy-main)', fontSize: '0.95rem' }}>{enq.enquiryId || enq.id}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{enq.fullName || enq.clientName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{enq.companyName}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{enq.serviceTitle || enq.service} ({enq.packageTier || enq.package})</td>
                        <td>{renderClientResponseBadge(enq.status)}</td>
                        <td>{renderStatusBadge(enq.status)}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{enq.submittedDate}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedEnquiryId(enq.enquiryId || enq.id);
                              setAdminTab('enquiry-detail');
                            }}
                            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                          >
                            <span>View</span>
                            <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 3 — CLIENT ENQUIRIES LIST & FILTER */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'enquiries' && (
          <div>
            
            {/* Filter Bar */}
            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={16} style={{ color: 'var(--burgundy-main)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Filter by Status:</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['All', 'Enquiry Submitted', 'Under Review', 'Quotation Sent', 'Client Response', 'Project Started', 'Completed'].map((st) => (
                    <button 
                      key={st}
                      className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setStatusFilter(st)}
                      style={{ fontSize: '0.8125rem', padding: '0.3rem 0.75rem' }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enquiries Master Table */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>ENQUIRY ID</th>
                      <th>CLIENT & COMPANY</th>
                      <th>SERVICE SCOPE</th>
                      <th>BUDGET</th>
                      <th>TIMELINE</th>
                      <th>STATUS</th>
                      <th>SUBMITTED</th>
                      <th style={{ textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries
                      .filter(e => {
                        if (statusFilter === 'All') return true;
                        if (statusFilter === 'Enquiry Submitted') return e.status === 'Enquiry Submitted' || e.status === 'new';
                        if (statusFilter === 'Under Review') return e.status === 'Under Review' || e.status === 'under_review';
                        if (statusFilter === 'Quotation Sent') return e.status === 'Quotation Sent' || e.status === 'quotation_sent';
                        if (statusFilter === 'Client Response') return e.status === 'Client Response' || e.status === 'accepted' || e.status === 'approved' || e.status === 'rejected';
                        if (statusFilter === 'Project Started') return e.status === 'Project Started' || e.status === 'project_started';
                        if (statusFilter === 'Completed') return e.status === 'Completed' || e.status === 'completed';
                        return true;
                      })
                      .map((enq) => (
                        <tr key={enq.enquiryId || enq.id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: 'var(--burgundy-main)', fontSize: '0.95rem' }}>{enq.enquiryId || enq.id}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{enq.fullName || enq.clientName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{enq.companyName} • {enq.email}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{enq.serviceTitle || enq.service}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--burgundy-main)' }}>{enq.packageTier || enq.package}</div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{enq.budget}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{enq.timeline}</td>
                          <td>{renderStatusBadge(enq.status)}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{enq.submittedDate}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedEnquiryId(enq.enquiryId || enq.id);
                                setAdminTab('enquiry-detail');
                              }}
                              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                            >
                              <span>View & Manage</span>
                              <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 4 — ENQUIRY DETAILS & ADMIN ACTIONS */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'enquiry-detail' && (
          <div>
            
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setAdminTab('enquiries')}
              style={{ marginBottom: '1.5rem' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Client Enquiries List</span>
            </button>

            {/* Header Box */}
            <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--burgundy-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CLIENT ENQUIRY ARCHITECTURE REVIEW
                  </div>
                  <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                    Enquiry {currentEnquiry.id}
                  </h1>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Submitted by <strong>{currentEnquiry.fullName} ({currentEnquiry.companyName})</strong> on {currentEnquiry.submittedDate}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {renderStatusBadge(currentEnquiry.status)}
                  
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setNewStatus(currentEnquiry.status);
                      setIsStatusUpdateModalOpen(true);
                    }}
                  >
                    <Edit size={14} />
                    <span>Update Status</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Prominent Client Response Card */}
            {['accepted', 'approved', 'project_started', 'completed'].includes(currentEnquiry.status) && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ECFDF5', borderColor: '#6EE7B7', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CLIENT DECISION RECEIVED
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46', marginTop: '0.2rem' }}>
                    Quotation: {currentEnquiry.quotation ? currentEnquiry.quotation.id : `QT-${currentEnquiry.id.split('-')[1]}`} &nbsp;•&nbsp; Client Response: <span style={{ color: '#047857', backgroundColor: '#D1FAE5', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #6EE7B7' }}>ACCEPTED</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#047857', marginTop: '0.35rem' }}>
                    Current Status: <strong>{currentEnquiry.status === 'project_started' ? 'Project Started' : currentEnquiry.status === 'completed' ? 'Completed' : 'Approved'}</strong>
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setNewStatus(currentEnquiry.status);
                    setIsStatusUpdateModalOpen(true);
                  }}
                >
                  <Edit size={16} />
                  <span>Update Status</span>
                </button>
              </div>
            )}

            {currentEnquiry.status === 'rejected' && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase' }}>
                  CLIENT DECISION RECEIVED
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7F1D1D', marginTop: '0.2rem' }}>
                  Quotation: {currentEnquiry.quotation ? currentEnquiry.quotation.id : `QT-${currentEnquiry.id.split('-')[1]}`} &nbsp;•&nbsp; Client Response: DECLINED
                </div>
                {currentEnquiry.rejectReason && (
                  <div style={{ fontSize: '0.875rem', color: '#991B1B', marginTop: '0.25rem' }}>
                    Reason: {currentEnquiry.rejectReason}
                  </div>
                )}
              </div>
            )}

            {/* Admin Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedEnquiryId(currentEnquiry.id);
                  setAdminTab('create-quotation');
                }}
              >
                <Receipt size={16} />
                <span>Create / Edit Quotation (QT-{currentEnquiry.id.split('-')[1]})</span>
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const cObj = currentEnquiry.consultationObj;
                  let pDate = cObj?.preferredDate || currentEnquiry.preferredDate || '';
                  if (!pDate || !/^\d{4}-\d{2}-\d{2}$/.test(pDate)) {
                    pDate = new Date().toISOString().split('T')[0];
                  }
                  let pTime = cObj?.preferredTime || currentEnquiry.preferredTime || '';
                  if (!pTime || !/^\d{2}:\d{2}/.test(pTime)) {
                    pTime = '10:00';
                  } else {
                    pTime = pTime.substring(0, 5);
                  }
                  setScheduleFormData({
                    preferredDate: pDate,
                    preferredTime: pTime,
                    notes: cObj?.notes || ''
                  });
                  setScheduleErrors({});
                  setIsScheduleModalOpen(true);
                }}
              >
                <Calendar size={16} />
                <span>Schedule Consultation Call</span>
              </button>
            </div>

            {/* Sections Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Client Info */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--burgundy-main)', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  Client Contact
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                  <div>Name: <strong>{currentEnquiry.fullName}</strong></div>
                  <div>Company: <strong>{currentEnquiry.companyName}</strong></div>
                  <div>Email: <strong>{currentEnquiry.email}</strong></div>
                  <div>Phone: <strong>{currentEnquiry.phone}</strong></div>
                </div>
              </div>

              {/* Scope Info */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--burgundy-main)', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  Service Scope & Target
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                  <div>Service: <strong>{currentEnquiry.serviceTitle}</strong></div>
                  <div>Package Tier: <strong>{currentEnquiry.packageTier}</strong></div>
                  <div>Budget Range: <strong>{currentEnquiry.budget}</strong></div>
                  <div>Timeline: <strong>{currentEnquiry.timeline}</strong></div>
                </div>
              </div>

            </div>

            {/* Full Requirements */}
            <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Project Requirements
              </h3>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>PROJECT NAME</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentEnquiry.projectName}</div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>DESCRIPTION</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{currentEnquiry.projectDescription}</p>
              </div>

              {currentEnquiry.requiredFeatures && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>REQUIRED FEATURES</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{currentEnquiry.requiredFeatures}</div>
                </div>
              )}

              {currentEnquiry.files.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>ATTACHED CLIENT FILES</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {currentEnquiry.files.map((f, i) => (
                      <span key={i} style={{ fontSize: '0.8125rem', backgroundColor: 'var(--bg-subtle)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={14} style={{ color: 'var(--burgundy-main)' }} />
                        {f.name} ({f.size})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 5 — CREATE / EDIT QUOTATION */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'create-quotation' && (
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', maxWidth: '780px' }}>
            
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                ADMIN QUOTATION AUTHORING
              </div>
              <h2 style={{ fontSize: '1.65rem', color: 'var(--text-primary)' }}>
                Create Quotation for Enquiry {currentEnquiry.id}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Draft cost breakdown and technical scope notes to send to client {currentEnquiry.fullName} ({currentEnquiry.companyName}).
              </p>
            </div>

            {/* Readonly Context Box */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.75rem', border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <div>Quotation ID: <strong style={{ fontFamily: 'monospace', color: 'var(--burgundy-main)' }}>QT-{currentEnquiry.id.split('-')[1]}</strong></div>
              <div>Target Service: <strong>{currentEnquiry.serviceTitle} ({currentEnquiry.packageTier})</strong></div>
              <div>Client Email: <strong>{currentEnquiry.email}</strong></div>
              <div>Client Budget: <strong>{currentEnquiry.budget}</strong></div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.25rem' }}>
              
              <div>
                <label className="form-label">Core Service Package Cost (₹):</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={quotationFormData.baseCost} 
                  onChange={(e) => setQuotationFormData({ ...quotationFormData, baseCost: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Additional Cloud / API Setup Cost (₹):</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={quotationFormData.additionalCost} 
                  onChange={(e) => setQuotationFormData({ ...quotationFormData, additionalCost: e.target.value })}
                />
              </div>

              {/* Total Calculation Display */}
              <div style={{ backgroundColor: 'var(--burgundy-light)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--burgundy-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--burgundy-main)' }}>Calculated Total Investment:</span>
                <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--burgundy-main)' }}>
                  ₹{(parseInt(quotationFormData.baseCost || '0', 10) + parseInt(quotationFormData.additionalCost || '0', 10)).toLocaleString('en-IN')}
                </strong>
              </div>

              <div>
                <label className="form-label">Quotation Expiry Date:</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={quotationFormData.validUntilDate} 
                  onChange={(e) => setQuotationFormData({ ...quotationFormData, validUntilDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Architect Notes & Deliverable Guarantees:</label>
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  value={quotationFormData.architectNotes} 
                  onChange={(e) => setQuotationFormData({ ...quotationFormData, architectNotes: e.target.value })}
                />
              </div>

            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <button className="btn btn-secondary" onClick={() => setAdminTab('enquiry-detail')}>
                <span>Cancel</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => alert("Draft quotation saved.")}>
                  <span>Save Draft</span>
                </button>

                <button className="btn btn-primary btn-lg" onClick={() => setIsSendQuotationModalOpen(true)}>
                  <Send size={16} />
                  <span>Send Quotation to Client</span>
                </button>
              </div>
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 7 & 8 — QUOTATIONS MANAGEMENT & CLIENT RESPONSES */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'quotations' && (
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Issued Quotations & Client Responses</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track issued quotation status and client acceptance decisions.</p>
            </div>

            <table className="portal-table">
              <thead>
                <tr>
                  <th>QUOTATION ID</th>
                  <th>ENQUIRY ID</th>
                  <th>CLIENT & COMPANY</th>
                  <th>SERVICE SCOPE</th>
                  <th>TOTAL AMOUNT</th>
                  <th>STATUS</th>
                  <th>DATE ISSUED</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.filter(e => e.quotation).map((enq) => (
                  <tr key={enq.id}>
                    <td><strong style={{ fontFamily: 'monospace', color: 'var(--burgundy-main)' }}>{enq.quotation.id}</strong></td>
                    <td><span style={{ fontFamily: 'monospace' }}>{enq.id}</span></td>
                    <td><strong>{enq.fullName}</strong> ({enq.companyName})</td>
                    <td>{enq.serviceTitle} ({enq.packageTier})</td>
                    <td><strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{enq.quotation.totalAmount}</strong></td>
                    <td>{renderStatusBadge(enq.status)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{enq.quotation.issuedDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setAdminTab('enquiry-detail');
                        }}
                      >
                        <span>View Enquiry</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 9 — CONSULTATIONS */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'consultations' && (
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Discovery Call Consultations</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage technical discovery sessions requested by clients.</p>
            </div>

            <table className="portal-table">
              <thead>
                <tr>
                  <th>CONSULTATION ID</th>
                  <th>ENQUIRY ID</th>
                  <th>CLIENT NAME</th>
                  <th>PREFERRED DATE</th>
                  <th>TIME SLOT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {consultationsList.map((con) => (
                  <tr key={con.id}>
                    <td><strong style={{ fontFamily: 'monospace' }}>{con.id}</strong></td>
                    <td><span style={{ fontFamily: 'monospace', color: 'var(--burgundy-main)' }}>{con.enquiryId}</span></td>
                    <td><strong>{con.client}</strong></td>
                    <td>{con.date}</td>
                    <td>{con.time}</td>
                    <td>
                      <span className="status-pill status-accepted">{con.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert(`Consultation ${con.id} marked completed.`)}>
                        <span>Mark Completed</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 10 — SERVICES MANAGEMENT */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'services' && (
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Services Catalog Management</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage active services displayed on public platform.</p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => alert("Add Service form modal opened.")}>
                <Plus size={14} />
                <span>Add Service</span>
              </button>
            </div>

            <table className="portal-table">
              <thead>
                <tr>
                  <th>SERVICE TITLE</th>
                  <th>PACKAGES COUNT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {servicesList.map((srv) => (
                  <tr key={srv.id}>
                    <td><strong>{srv.title}</strong></td>
                    <td>{srv.packagesCount} Package Tiers</td>
                    <td>
                      <span className="status-pill status-accepted">Active</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => alert(`Editing service ${srv.title}`)}>
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 11 — PACKAGES MANAGEMENT */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'packages' && (
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Service Packages Catalog</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage tiers (Basic, Standard, Premium) across all services.</p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => alert("Add Package modal opened.")}>
                <Plus size={14} />
                <span>Add Package Tier</span>
              </button>
            </div>

            <table className="portal-table">
              <thead>
                <tr>
                  <th>PACKAGE NAME</th>
                  <th>SERVICE</th>
                  <th>TIER</th>
                  <th>ESTIMATED PRICE</th>
                  <th>DURATION</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES_DATA.flatMap(s => s.packages.map(p => ({ ...p, serviceTitle: s.title }))).map((pkg) => (
                  <tr key={pkg.id}>
                    <td><strong>{pkg.name}</strong></td>
                    <td>{pkg.serviceTitle}</td>
                    <td><span className="badge-tag" style={{ margin: 0, fontSize: '0.7rem' }}>{pkg.tier}</span></td>
                    <td><strong>{pkg.price}</strong></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{pkg.duration}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert(`Editing package ${pkg.name}`)}>
                        <Edit size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* ------------------------------------------------------------------------- */}
        {/* SCREEN 12 — CLIENTS DIRECTORY */}
        {/* ------------------------------------------------------------------------- */}
        {adminTab === 'clients' && (
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Client Accounts Directory</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Directory of all organizations and clients who submitted enquiries.</p>
            </div>

            <table className="portal-table">
              <thead>
                <tr>
                  <th>CLIENT NAME</th>
                  <th>COMPANY / ORGANIZATION</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>TOTAL ENQUIRIES</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td><strong>{enq.fullName}</strong></td>
                    <td>{enq.companyName}</td>
                    <td>{enq.email}</td>
                    <td>{enq.phone}</td>
                    <td><span className="badge-tag" style={{ margin: 0 }}>1 Enquiry ({enq.id})</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setAdminTab('enquiry-detail');
                        }}
                      >
                        <span>View Enquiries</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>


      {/* ========================================================================= */}
      {/* SCREEN 6 — SEND QUOTATION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isSendQuotationModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSendQuotationModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                  Confirmation
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                  Send quotation to client?
                </h3>
              </div>
              <button className="close-btn" onClick={() => setIsSendQuotationModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Sending quotation <strong>QT-{((currentEnquiry.enquiryId || currentEnquiry.id || '').split('-')[1]) || '10234'}</strong> for Enquiry <strong>{currentEnquiry.enquiryId || currentEnquiry.id}</strong> to client <strong>{currentEnquiry.email}</strong>.
            </p>

            <div style={{ backgroundColor: 'var(--status-blue-bg)', border: '1px solid #BAE6FD', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.8125rem', color: '#0369A1' }}>
              Sending the quotation will update the enquiry status to <strong>"Quotation Sent"</strong> and make the quotation available to the client in their Client Portal.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsSendQuotationModalOpen(false)}>
                <span>Cancel</span>
              </button>

              <button className="btn btn-primary btn-sm" onClick={handleSendQuotationSubmit}>
                <Send size={14} />
                <span>Confirm & Send Quotation</span>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* STATUS UPDATE MODAL */}
      {/* ========================================================================= */}
      {isStatusUpdateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStatusUpdateModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  Update Status for {currentEnquiry.enquiryId || currentEnquiry.id}
                </h3>
              </div>
              <button className="close-btn" onClick={() => setIsStatusUpdateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Select New Status:</label>
              <select 
                className="form-input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Enquiry Submitted">Enquiry Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Client Response">Client Response</option>
                <option value="Project Started">Project Started</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsStatusUpdateModalOpen(false)}>
                <span>Cancel</span>
              </button>

              <button className="btn btn-primary btn-sm" onClick={handleUpdateStatusSubmit}>
                <span>Save Status Update</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE CONSULTATION MODAL */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="modal-overlay" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                  Consultation Management
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  Schedule Consultation
                </h3>
              </div>
              <button className="close-btn" onClick={() => setIsScheduleModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Select consultation date and time for client <strong>{currentEnquiry.fullName}</strong> (Enquiry <strong>{currentEnquiry.enquiryId || currentEnquiry.id}</strong>).
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const errs = {};
              const todayStr = new Date().toISOString().split('T')[0];

              if (!scheduleFormData.preferredDate) {
                errs.preferredDate = 'Consultation date is required.';
              } else if (scheduleFormData.preferredDate < todayStr) {
                errs.preferredDate = 'Date cannot be in the past.';
              }

              if (!scheduleFormData.preferredTime) {
                errs.preferredTime = 'Consultation time is required.';
              }

              if (Object.keys(errs).length > 0) {
                setScheduleErrors(errs);
                return;
              }

              setScheduleErrors({});
              setIsSaving(true);

              try {
                const targetEnquiryId = currentEnquiry.enquiryId || currentEnquiry.id;
                const cObj = currentEnquiry.consultationObj;

                let savedConsultation = null;
                if (cObj && cObj.consultationId) {
                  savedConsultation = await scheduleConsultationApi(cObj.consultationId, {
                    preferredDate: scheduleFormData.preferredDate,
                    preferredTime: scheduleFormData.preferredTime.length === 5 ? `${scheduleFormData.preferredTime}:00` : scheduleFormData.preferredTime,
                    notes: scheduleFormData.notes || 'Scheduled by Admin',
                    status: 'Scheduled'
                  });
                } else {
                  savedConsultation = await createConsultationApi({
                    enquiryId: targetEnquiryId,
                    preferredDate: scheduleFormData.preferredDate,
                    preferredTime: scheduleFormData.preferredTime.length === 5 ? `${scheduleFormData.preferredTime}:00` : scheduleFormData.preferredTime,
                    notes: scheduleFormData.notes || 'Scheduled by Admin',
                    status: 'Scheduled'
                  });
                }

                await fetchBackendEnquiries();
                setIsScheduleModalOpen(false);

                const formattedSched = formatConsultationSchedule(
                  savedConsultation?.preferredDate || scheduleFormData.preferredDate,
                  savedConsultation?.preferredTime || scheduleFormData.preferredTime
                );

                alert(`Consultation for ${currentEnquiry.fullName} scheduled for ${formattedSched}.`);
              } catch (err) {
                console.error('Failed to schedule consultation:', err);
                alert('Failed to schedule consultation: ' + (err.message || 'Server error'));
              } finally {
                setIsSaving(false);
              }
            }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Consultation Date <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduleFormData.preferredDate}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, preferredDate: e.target.value })}
                  style={{ borderColor: scheduleErrors.preferredDate ? '#DC2626' : undefined }}
                />
                {scheduleErrors.preferredDate && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block' }}>
                    {scheduleErrors.preferredDate}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Consultation Time <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  type="time"
                  className="form-input"
                  value={scheduleFormData.preferredTime}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, preferredTime: e.target.value })}
                  style={{ borderColor: scheduleErrors.preferredTime ? '#DC2626' : undefined }}
                />
                {scheduleErrors.preferredTime && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block' }}>
                    {scheduleErrors.preferredTime}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Optional Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Add meeting link or discussion notes..."
                  value={scheduleFormData.notes}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsScheduleModalOpen(false)}>
                  <span>Cancel</span>
                </button>

                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  <Calendar size={14} />
                  <span>{isSaving ? 'Scheduling...' : 'Schedule Consultation'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
