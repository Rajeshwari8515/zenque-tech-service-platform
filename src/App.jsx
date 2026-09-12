import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Breadcrumb from './components/Breadcrumb';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ServicesView from './components/ServicesView';
import ServiceDetailView from './components/ServiceDetailView';
import PackagesView from './components/PackagesView';
import ProjectEnquiryView from './components/ProjectEnquiryView';
import ClientPortalView from './components/ClientPortalView';
import AdminPortalView from './components/AdminPortalView';
import RequestModal from './components/RequestModal';
import { SERVICES_DATA } from './data/mockServices';
import { LayoutDashboard, UserCheck, Globe, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [selectedService, setSelectedService] = useState(SERVICES_DATA[0]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Shared Enquiries State (Connecting Client Module 3 & Admin Module 4)
  const [enquiries, setEnquiries] = useState([
    {
      id: 'ZT-10234',
      serviceTitle: 'Web Development',
      packageTier: 'Standard Package',
      submittedDate: '12 Sep 2026',
      status: 'quotation_sent',
      projectName: 'Corporate Portal & Admin Dashboard',
      projectDescription: 'High-performance web application with custom authentication, responsive frontend, and database backend.',
      requiredFeatures: 'User Login, Admin Analytics Panel, Third-Party API Sync',
      additionalRequirements: 'ISO security compliance, zero-downtime deployment',
      budget: '₹50K – ₹1L',
      timeline: '2–4 Weeks',
      fullName: 'Alex Morgan',
      companyName: 'ABC Technologies',
      email: 'alex@abctechnologies.com',
      phone: '+91 98765 43210',
      files: [
        { name: 'project_brief_draft.pdf', size: '1.2 MB' }
      ],
      needsConsultation: 'yes',
      preferredDate: '15 Sep 2026',
      preferredTime: '10:00 AM - 12:00 PM',
      quotation: {
        id: 'QT-10234',
        issuedDate: '12 Sep 2026',
        validUntil: '30 Sep 2026',
        totalAmount: '₹77,000',
        architectNotes: 'Includes full source code ownership, Docker containerization scripts, and 4 weeks of SLA technical support.',
        breakdown: [
          { desc: 'Standard Web Application Scope & Frontend Architecture', cost: '₹65,000' },
          { desc: 'Database Schema Setup & REST API Integration', cost: '₹12,000' }
        ]
      }
    },
    {
      id: 'ZT-10235',
      serviceTitle: 'UI/UX Design',
      packageTier: 'Basic Package',
      submittedDate: '10 Sep 2026',
      status: 'quotation_sent',
      projectName: 'Mobile App Wireframes',
      projectDescription: 'Figma wireframes and design system for cross-platform app.',
      requiredFeatures: 'Interactive Figma Prototype, Color Palette',
      additionalRequirements: 'Developer handoff documentation',
      budget: '₹25K – ₹50K',
      timeline: 'Less than 2 Weeks',
      fullName: 'Sarah Jenkins',
      companyName: 'Apex Solutions',
      email: 'sarah@apexsolutions.com',
      phone: '+91 98123 45678',
      files: [],
      needsConsultation: 'no',
      quotation: {
        id: 'QT-10235',
        issuedDate: '11 Sep 2026',
        validUntil: '25 Sep 2026',
        totalAmount: '₹35,000',
        architectNotes: 'Complete Figma design system with exported asset library.',
        breakdown: [
          { desc: 'Basic UI/UX Design Kit & Wireframes', cost: '₹30,000' },
          { desc: 'Clickable Mobile Prototype & Exported Assets', cost: '₹5,000' }
        ]
      }
    }
  ]);

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

  const handleRequestClick = (service = null, pkg = null) => {
    if (service) setSelectedService(service);
    if (pkg) setSelectedPackage(pkg);
    setActiveView('enquiry');
  };

  const handleHowItWorksClick = () => {
    if (activeView !== 'home') {
      setActiveView('home');
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return (
          <HomeView 
            setActiveView={setActiveView}
            setSelectedService={setSelectedService}
            onRequestClick={(srv, pkg) => handleRequestClick(srv, pkg)}
          />
        );
      case 'services':
        return (
          <ServicesView 
            setActiveView={setActiveView}
            setSelectedService={setSelectedService}
          />
        );
      case 'service-detail':
        return (
          <ServiceDetailView 
            service={selectedService}
            setActiveView={setActiveView}
            setSelectedService={setSelectedService}
            setSelectedPackage={setSelectedPackage}
            onRequestClick={(srv, pkg) => handleRequestClick(srv, pkg)}
          />
        );
      case 'packages':
        return (
          <PackagesView 
            selectedService={selectedService}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            setActiveView={setActiveView}
            onRequestClick={(srv, pkg) => handleRequestClick(srv, pkg)}
          />
        );
      case 'enquiry':
        return (
          <ProjectEnquiryView 
            selectedService={selectedService}
            selectedPackage={selectedPackage}
            setSelectedService={setSelectedService}
            setSelectedPackage={setSelectedPackage}
            setActiveView={setActiveView}
          />
        );
      case 'client-portal':
        return (
          <ClientPortalView 
            setActiveView={setActiveView}
            enquiries={enquiries}
            setEnquiries={setEnquiries}
          />
        );
      case 'admin-portal':
        return (
          <AdminPortalView 
            setActiveView={setActiveView}
            enquiries={enquiries}
            setEnquiries={setEnquiries}
          />
        );
      default:
        return (
          <HomeView 
            setActiveView={setActiveView}
            setSelectedService={setSelectedService}
            onRequestClick={(srv, pkg) => handleRequestClick(srv, pkg)}
          />
        );
    }
  };

  const isPublicView = ['home', 'services', 'service-detail', 'packages', 'enquiry'].includes(activeView);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Subtle Prototype Demonstration Navigation Bar */}
      <div style={{ 
        backgroundColor: '#0F172A', 
        color: '#94A3B8', 
        fontSize: '0.75rem', 
        padding: '0.35rem 1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justify: 'space-between',
        borderBottom: '1px solid #1E293B',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <ShieldCheck size={14} style={{ color: '#E8B6BC' }} />
          <span>Zenque Tech Platform Prototype</span>
          <span style={{ color: '#475569' }}>|</span>
          <span>View Mode: <strong style={{ color: '#E2E8F0', textTransform: 'uppercase' }}>{activeView.replace('-', ' ')}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => setActiveView('home')}
            style={{ 
              background: isPublicView ? '#334155' : 'transparent',
              color: '#F8FAFC',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            <Globe size={12} />
            <span>Public Site</span>
          </button>

          <button 
            onClick={() => setActiveView('client-portal')}
            style={{ 
              background: activeView === 'client-portal' ? '#334155' : 'transparent',
              color: '#F8FAFC',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            <UserCheck size={12} />
            <span>Client Area</span>
          </button>

          <button 
            onClick={() => setActiveView('admin-portal')}
            style={{ 
              background: activeView === 'admin-portal' ? 'var(--burgundy-main)' : 'transparent',
              color: '#F8FAFC',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            <LayoutDashboard size={12} />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Header Navigation (ONLY for Public/Client Site views) */}
      {isPublicView && (
        <Header 
          activeView={activeView} 
          setActiveView={setActiveView}
          onRequestClick={() => handleRequestClick()}
          onHowItWorksClick={handleHowItWorksClick}
        />
      )}

      {/* Breadcrumb Trail (ONLY for Public/Client Site views) */}
      {isPublicView && (
        <Breadcrumb 
          activeView={activeView}
          selectedService={selectedService}
          setActiveView={setActiveView}
        />
      )}

      {/* Active Screen View */}
      <main style={{ flexGrow: 1 }}>
        {renderActiveView()}
      </main>

      {/* Platform Footer (ONLY for Public Site & Client Area views) */}
      {activeView !== 'admin-portal' && (
        <Footer 
          setActiveView={setActiveView}
          onRequestClick={() => handleRequestClick()}
        />
      )}

      {/* Connection Modal for Module 2 */}
      <RequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onProceedToEnquiry={() => {
          setIsRequestModalOpen(false);
          setActiveView('enquiry');
        }}
        selectedService={selectedService}
        selectedPackage={selectedPackage}
      />

    </div>
  );
}

