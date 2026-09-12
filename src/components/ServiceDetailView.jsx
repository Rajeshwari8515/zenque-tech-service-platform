import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, PackageCheck } from 'lucide-react';
import { SERVICES_DATA } from '../data/mockServices';

export default function ServiceDetailView({ service, setActiveView, setSelectedService, setSelectedPackage, onRequestClick }) {
  const currentService = service || SERVICES_DATA[0];

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        
        {/* Back Link */}
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setActiveView('services')}
          style={{ marginBottom: '1.75rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Services</span>
        </button>

        {/* Selected Service Hero Header */}
        <div className="card" style={{ marginBottom: '3rem', padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            
            <div>
              <span className="badge-tag">Service Specifications</span>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {currentService.title}
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
                {currentService.fullDescription}
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => onRequestClick(currentService, null)}
                >
                  <span>Request This Service</span>
                  <ArrowRight size={16} />
                </button>

                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedService(currentService);
                    setActiveView('packages');
                  }}
                >
                  <PackageCheck size={16} />
                  <span>View Packages</span>
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                QUICK SUMMARY
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                3 Available Package Options
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Choose a pre-configured package or submit custom project requirements.
              </p>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ width: '100%' }}
                onClick={() => {
                  setSelectedService(currentService);
                  setActiveView('packages');
                }}
              >
                <span>Choose Package</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        </div>

        {/* What We Provide Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>What We Provide</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {currentService.whatWeProvide.map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies Section */}
        <div className="card" style={{ marginBottom: '3rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Technologies</h2>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {currentService.technologies.map((tech) => (
              <span key={tech} style={{ 
                fontSize: '0.875rem', 
                backgroundColor: 'var(--bg-subtle)', 
                color: 'var(--text-primary)', 
                padding: '0.4rem 0.9rem', 
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                border: '1px solid var(--border-light)'
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Available Packages Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Available Packages</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select a package tier to proceed to quotation request.</p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSelectedService(currentService);
                setActiveView('packages');
              }}
            >
              <span>Compare Full Matrix</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {currentService.packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  border: pkg.isFeatured ? '2px solid var(--burgundy-main)' : '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
                    {pkg.tier}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pkg.price}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{pkg.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{pkg.description}</p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', flexGrow: 1, fontSize: '0.85rem' }}>
                  {pkg.features.slice(0, 3).map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--burgundy-main)', flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`btn ${pkg.isFeatured ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setSelectedService(currentService);
                    setSelectedPackage(pkg);
                    setActiveView('packages');
                  }}
                >
                  <span>Choose Package</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
