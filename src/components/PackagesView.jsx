import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { SERVICES_DATA } from '../data/mockServices';

export default function PackagesView({ selectedService, selectedPackage, setSelectedPackage, setActiveView, onRequestClick }) {
  const currentService = selectedService || SERVICES_DATA[0];

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        
        {/* Back Link */}
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setActiveView('service-detail')}
          style={{ marginBottom: '1.75rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Service Details ({currentService.title})</span>
        </button>

        {/* Selected Service Header */}
        <div className="section-header">
          <div className="badge-tag">
            <Sparkles size={14} />
            <span>{currentService.title}</span>
          </div>
          <h1 className="section-title" style={{ fontSize: '2.5rem' }}>Choose a Package</h1>
          <p className="section-subtitle">
            Select the package that best fits your project requirements. Every tier can be customized during the enquiry submission.
          </p>
        </div>

        {/* Package Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
          {currentService.packages.map((pkg) => {
            const isSelected = selectedPackage && selectedPackage.id === pkg.id;
            const isFeatured = pkg.isFeatured;

            return (
              <div 
                key={pkg.id}
                className="card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  position: 'relative',
                  border: isSelected || isFeatured ? '2px solid var(--burgundy-main)' : '1px solid var(--border-light)',
                  boxShadow: isSelected || isFeatured ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  backgroundColor: isSelected ? 'var(--burgundy-light)' : '#FFFFFF'
                }}
              >
                {isFeatured && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--burgundy-main)',
                    color: '#FFFFFF',
                    padding: '0.2rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Recommended Package
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem', paddingTop: isFeatured ? '0.5rem' : '0' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                    {pkg.tier}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0.35rem 0' }}>
                    {pkg.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {pkg.description}
                  </p>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--bg-subtle)', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1.5rem' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Investment</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {pkg.price}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <Clock size={13} style={{ color: 'var(--burgundy-main)' }} />
                    <span>Duration: {pkg.duration}</span>
                  </div>
                </div>

                <div style={{ flexGrow: 1, marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Key Deliverables:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--burgundy-main)', flexShrink: 0, marginTop: '2px' }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={`btn ${isFeatured || isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    onRequestClick(currentService, pkg);
                  }}
                >
                  <span>Choose This Package</span>
                  <ArrowRight size={16} />
                </button>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
