import React from 'react';
import { ChevronRight, Layers, Cpu, Palette, Sparkles, Code, Shield } from 'lucide-react';
import { SERVICES_DATA } from '../data/mockServices';

export default function ServicesView({ setActiveView, setSelectedService }) {
  const getServiceIcon = (id) => {
    switch (id) {
      case 'web-development': return <Layers size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'mobile-development': return <Cpu size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'uiux-design': return <Palette size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'aiml-solutions': return <Sparkles size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'custom-software': return <Code size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'digital-solutions': return <Shield size={24} style={{ color: 'var(--burgundy-main)' }} />;
      default: return <Layers size={24} style={{ color: 'var(--burgundy-main)' }} />;
    }
  };

  return (
    <div className="section" style={{ paddingTop: '3rem' }}>
      <div className="container">
        
        {/* Header */}
        <div className="section-header">
          <h1 className="section-title" style={{ fontSize: '2.5rem' }}>Our Services</h1>
          <p className="section-subtitle">
            Explore technology services tailored to your business needs. Select a service to inspect deliverables, technologies, and available package tiers.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {SERVICES_DATA.map((service) => (
            <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--burgundy-light)' }}>
                  {getServiceIcon(service.id)}
                </div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>{service.title}</h2>
              </div>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '2rem', flexGrow: 1, lineHeight: '1.6' }}>
                {service.shortDescription}
              </p>

              <div>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  onClick={() => {
                    setSelectedService(service);
                    setActiveView('service-detail');
                  }}
                >
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
