import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, Layers, Cpu, Code, Sparkles, Shield, Palette } from 'lucide-react';
import { PROCESS_STEPS } from '../data/mockServices';
import { getServices } from '../api/serviceApi';

export default function HomeView({ setActiveView, setSelectedService, onRequestClick }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'Web Development':
        return <Layers size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'Mobile App Development':
        return <Cpu size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'UI/UX Design':
        return <Palette size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'AI & ML Solutions':
        return <Sparkles size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'Custom Software':
        return <Code size={24} style={{ color: 'var(--burgundy-main)' }} />;
      case 'Digital Solutions':
        return <Shield size={24} style={{ color: 'var(--burgundy-main)' }} />;
      default:
        return <Layers size={24} style={{ color: 'var(--burgundy-main)' }} />;
    }
  };

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices();
        const formattedServices = data.map((service) => ({
          id: service.serviceId,
          serviceId: service.serviceId,
          title: service.serviceName,
          serviceName: service.serviceName,
          shortDescription: service.description,
          description: service.description
        }));
        setServices(formattedServices);
      } catch (err) {
        console.error('Error loading services for home view:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

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
                <button className="btn btn-primary btn-lg" onClick={() => setActiveView('services')}>
                  <span>Explore Services</span>
                  <ArrowRight size={18} />
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

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading services...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {services.map((service) => (
                <div key={service.serviceId} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  
                  {/* Service Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--burgundy-light)' }}>
                      {getServiceIcon(service.serviceName || service.title)}
                    </div>
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                      {service.title}
                    </h3>
                  </div>

                  {/* Service Description */}
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '2rem', flexGrow: 1, lineHeight: '1.6' }}>
                    {service.shortDescription}
                  </p>

                  {/* View Details */}
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
          )}
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
          <button className="btn btn-dark btn-lg" onClick={() => setActiveView('services')}>
            <span>Explore Services</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
