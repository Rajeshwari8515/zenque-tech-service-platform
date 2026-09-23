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
import { getStoredEnquiries, saveStoredEnquiries } from './utils/enquiryStorage';

export default function App() {
  // Authenticated Client User State with localStorage persistence
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('zenque_current_user');
      const savedToken = localStorage.getItem('zenque_auth_token');
      return (savedUser && savedToken) ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeView, setActiveViewState] = useState(() => {
    try {
      const savedView = localStorage.getItem('zenque_active_view');
      const savedUser = localStorage.getItem('zenque_current_user');
      const savedToken = localStorage.getItem('zenque_auth_token');
      if (savedView) return savedView;
      if (savedUser && savedToken) return 'client-portal';
      return 'home';
    } catch (e) {
      return 'home';
    }
  });

  const setActiveView = (view) => {
    setActiveViewState(view);
    try {
      localStorage.setItem('zenque_active_view', view);
    } catch (e) {}
  };

  const [selectedService, setSelectedService] = useState(SERVICES_DATA[0]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('ZT-10234');

  const handleSetCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('zenque_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zenque_current_user');
      localStorage.removeItem('zenque_auth_token');
      localStorage.removeItem('zenque_active_view');
      setActiveViewState('home');
    }
  };

  // Shared Enquiries State synced with localStorage key "zenque_enquiries"
  const [enquiries, setEnquiriesState] = useState(() => getStoredEnquiries());

  const setEnquiries = (newEnquiriesOrFn) => {
    setEnquiriesState(prev => {
      const next = typeof newEnquiriesOrFn === 'function' ? newEnquiriesOrFn(prev) : newEnquiriesOrFn;
      saveStoredEnquiries(next);
      return next;
    });
  };

  // Sync state if localStorage changes from any component or window event
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      localStorage.removeItem('zenque_current_user');
      localStorage.removeItem('zenque_auth_token');
      localStorage.removeItem('zenque_active_view');
      setActiveViewState('home');
    };

    window.addEventListener('zenque_auth_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('zenque_auth_unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (e.type === 'zenque_enquiries_updated' && e.detail) {
        setEnquiriesState(e.detail);
      } else if (e.type === 'storage' && e.key === 'zenque_enquiries') {
        setEnquiriesState(getStoredEnquiries());
      }
    };

    window.addEventListener('zenque_enquiries_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('zenque_enquiries_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

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
            enquiries={enquiries}
            setEnquiries={setEnquiries}
            setSelectedEnquiryId={setSelectedEnquiryId}
            currentUser={currentUser}
          />
        );
      case 'client-portal':
        return (
          <ClientPortalView 
            setActiveView={setActiveView}
            enquiries={enquiries}
            setEnquiries={setEnquiries}
            selectedEnquiryId={selectedEnquiryId}
            setSelectedEnquiryId={setSelectedEnquiryId}
            currentUser={currentUser}
            setCurrentUser={handleSetCurrentUser}
          />
        );
      case 'admin-portal':
        return (
          <AdminPortalView 
            setActiveView={setActiveView}
            enquiries={enquiries}
            setEnquiries={setEnquiries}
            selectedEnquiryId={selectedEnquiryId}
            setSelectedEnquiryId={setSelectedEnquiryId}
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
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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

