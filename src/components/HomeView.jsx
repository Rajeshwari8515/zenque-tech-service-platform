import React from 'react';
import { ArrowRight, ChevronRight, Layers, Cpu, Code, Sparkles, Shield, Palette } from 'lucide-react';
import { SERVICES_DATA, PROCESS_STEPS } from '../data/mockServices';

export default function HomeView({ setActiveView, setSelectedService, onRequestClick }) {
  
  const getServiceIcon = (id) => {
    switch (id) {
      case 'web-development': return <Layers size={22} style={{ color: 'var(--burgundy-main)' }} />;
      case 'mobile-development': return <Cpu size={22} style={{ color: 'var(--burgundy-main)' }} />;
      case 'uiux-design': return <Palette size={22} style={{ color: 'var(--burgundy-main)' }} />;
      case 'aiml-solutions': return <Sparkles size={22} style={{ color: 'var(--burgundy-main)' }} />;
      case 'custom-software': return <Code size={22} style={{ color: 'var(--burgundy-main)' }} />;
      case 'digital-solutions': return <Shield size={22} style={{ color: 'var(--burgundy-main)' }} />;
      default: return <Layers size={22} style={{ color: 'var(--burgundy-main)' }} />;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)', paddingTop: '4rem', paddingBottom: '4.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Hero Left Content */}
            <div>
              <div className="badge-tag">
                <span>Enterprise Technology Partner</span>
              </div>
              
              <h1 style={{ marginBottom: '1.25rem', fontSize: '3.1rem', letterSpacing: '-0.03em', lineHeight: '1.15' }}>
                Build Your Project With <span style={{ color: 'var(--burgundy-main)' }}>Zenque Tech</span>
              </h1>
              
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '540px' }}>
                Technology engineering services tailored to your business needs. Discover services, review fixed packages, and receive a formal project quotation.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={onRequestClick}>
                  <span>Request a Service</span>
                  <ArrowRight size={18} />
                </button>
                
                <button className="btn btn-secondary btn-lg" onClick={() => setActiveView('services')}>
                  <span>Explore Services</span>
                </button>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div style={{ position: 'relative' }}>
              <div style={{ 
                backgroundColor: 'var(--bg-subtle)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border-light)', 
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  CENTRAL ENQUIRY WORKFLOW
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Transparent Service Quotations
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Select your service or package, submit project specifications, and receive your unique Enquiry ID (e.g. ZT-10234) for real-time quotation tracking.
                </p>
                
                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Preview</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enquiry ZT-10234 • Quotation Issued</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--burgundy-light)', color: 'var(--burgundy-main)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                    Active
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Explore Our Services Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div className="section-header center">
            <div className="badge-tag">Service Offerings</div>
            <h2 className="section-title">Explore Our Services</h2>
            <p className="section-subtitle">
              Choose from our enterprise technology services to view detailed specifications and package options.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {SERVICES_DATA.map((service) => (
              <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--burgundy-light)' }}>
                    {getServiceIcon(service.id)}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{service.title}</h3>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', flexGrow: 1, lineHeight: '1.5' }}>
                  {service.shortDescription}
                </p>

                <div>
                  <button 
                    className="btn btn-secondary btn-sm" 
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
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="section-header center">
            <div className="badge-tag">Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple 4-step journey from service selection to project execution.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--burgundy-main)', fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="section-sm" style={{ backgroundColor: 'var(--burgundy-main)', color: '#FFFFFF' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '2rem' }}>Have a Project in Mind?</h2>
          <p style={{ color: '#FCE7F3', maxWidth: '540px', margin: '0 auto 1.5rem', fontSize: '1rem' }}>
            Select a service or request a custom quotation tailored to your requirements.
          </p>
          <button className="btn btn-dark btn-lg" onClick={onRequestClick}>
            <span>Request a Service</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
