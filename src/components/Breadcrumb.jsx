import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ activeView, selectedService, setActiveView }) {
  if (activeView === 'home') return null;

  return (
    <div style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', padding: '0.75rem 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        
        <span 
          onClick={() => setActiveView('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
          className="nav-hover"
        >
          <Home size={14} />
          <span>Home</span>
        </span>

        <ChevronRight size={14} />

        <span 
          onClick={() => setActiveView('services')}
          style={{ 
            cursor: activeView !== 'services' ? 'pointer' : 'default',
            color: activeView === 'services' ? 'var(--burgundy-main)' : 'var(--text-secondary)',
            fontWeight: activeView === 'services' ? 600 : 400
          }}
        >
          Services
        </span>

        {(activeView === 'service-detail' || activeView === 'packages' || activeView === 'enquiry') && selectedService && (
          <>
            <ChevronRight size={14} />
            <span 
              onClick={() => setActiveView('service-detail')}
              style={{ 
                cursor: activeView !== 'service-detail' ? 'pointer' : 'default',
                color: activeView === 'service-detail' ? 'var(--burgundy-main)' : 'var(--text-secondary)',
                fontWeight: activeView === 'service-detail' ? 600 : 400
              }}
            >
              {selectedService.title}
            </span>
          </>
        )}

        {activeView === 'packages' && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--burgundy-main)', fontWeight: 600 }}>
              Packages
            </span>
          </>
        )}

        {activeView === 'enquiry' && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--burgundy-main)', fontWeight: 600 }}>
              Project Enquiry
            </span>
          </>
        )}

        {activeView === 'client-portal' && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--burgundy-main)', fontWeight: 600 }}>
              Client Portal
            </span>
          </>
        )}

      </div>
    </div>
  );
}
