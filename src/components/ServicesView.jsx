import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  Layers,
  Cpu,
  Palette,
  Sparkles,
  Code,
  Shield
} from 'lucide-react';
import { getServices } from '../api/serviceApi';

export default function ServicesView({ setActiveView, setSelectedService }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'Web Development':
        return (
          <Layers
            size={24}
            style={{ color: 'var(--burgundy-main)' }}
          />
        );

      case 'Mobile App Development':
        return (
          <Cpu
            size={24}
            style={{ color: 'var(--burgundy-main)' }}
          />
        );

      case 'UI/UX Design':
        return (
          <Palette
            size={24}
            style={{ color: 'var(--burgundy-main)' }}
          />
        );

      case 'AI & ML Solutions':
        return (
          <Sparkles
            size={24}
            style={{ color: 'var(--burgundy-main)' }}
          />
        );

      case 'Custom Software':
        return (
          <Code
            size={24}
            style={{ color: 'var(--burgundy-main)' }}
          />
        );

      case 'Digital Solutions':
        return (
          <Shield
            size={24}
            style={{ color: 'var(--burgundy-main)' }}
          />
        );

      default:
        return (
          <Layers
            size={24}
            style={{ color: 'var(--burgundy-main)' }}
          />
        );
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
          shortDescription: service.description,
          description: service.description
        }));

        setServices(formattedServices);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Unable to load services.');
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  if (loading) {
    return (
      <div
        className="section"
        style={{ paddingTop: '3rem' }}
      >
        <div className="container">
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="section"
        style={{ paddingTop: '3rem' }}
      >
        <div className="container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="section"
      style={{ paddingTop: '3rem' }}
    >
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <h1
            className="section-title"
            style={{ fontSize: '2.5rem' }}
          >
            Our Services
          </h1>

          <p className="section-subtitle">
            Explore technology services tailored to your business needs.
            Select a service to inspect deliverables, technologies, and
            available package tiers.
          </p>
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}
        >
          {services.map((service) => (
            <div
              key={service.serviceId}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >

              {/* Service Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--burgundy-light)'
                  }}
                >
                  {getServiceIcon(service.serviceName || service.title)}
                </div>

                <h2
                  style={{
                    fontSize: '1.35rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  {service.title}
                </h2>
              </div>

              {/* Service Description */}
              <p
                style={{
                  fontSize: '0.925rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '2rem',
                  flexGrow: 1,
                  lineHeight: '1.6'
                }}
              >
                {service.shortDescription}
              </p>

              {/* View Details */}
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between'
                  }}
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