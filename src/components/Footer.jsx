import React from 'react';
import { ShieldCheck, Cpu, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function Footer({ setActiveView, onRequestClick }) {
  return (
    <footer style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', marginTop: 'auto', borderTop: '1px solid var(--border-dark)' }}>
      <div className="container section-sm">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #722F37, #4C1D95)' }}>Z</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: '#FFFFFF' }}>
                ZENQUE<span style={{ color: '#E8B6BC' }}>TECH</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Enterprise technology service booking & transparent quotation platform. Engineered for scale, speed, and continuous evolution.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E8B6BC', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>SOC2 & Enterprise Architecture Compliant</span>
            </div>
          </div>

          {/* Quick Module 1 Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Service Discovery
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <span onClick={() => setActiveView('home')} style={{ color: 'var(--text-on-dark-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>
                  Platform Overview
                </span>
              </li>
              <li>
                <span onClick={() => setActiveView('services')} style={{ color: 'var(--text-on-dark-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>
                  Explore Services Catalog
                </span>
              </li>
              <li>
                <span onClick={() => setActiveView('service-detail')} style={{ color: 'var(--text-on-dark-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>
                  Service Architecture Specs
                </span>
              </li>
              <li>
                <span onClick={() => setActiveView('packages')} style={{ color: 'var(--text-on-dark-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>
                  Tiered Service Packages
                </span>
              </li>
            </ul>
          </div>

          {/* Business Capabilities */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tech Domains
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-on-dark-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} style={{ color: '#E8B6BC' }} /> Web & SaaS Platform Engineering</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} style={{ color: '#E8B6BC' }} /> Multi-Cloud DevOps Infrastructure</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} style={{ color: '#E8B6BC' }} /> Enterprise AI & Data Pipelines</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} style={{ color: '#E8B6BC' }} /> Cybersecurity & Systems Audit</li>
            </ul>
          </div>



        </div>

        {/* Sub-footer */}
        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-on-dark-muted)' }}>
          <div>© {new Date().getFullYear()} Zenque Tech Enterprise Services. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span onClick={() => setActiveView('client-portal')} style={{ color: '#E8B6BC', cursor: 'pointer', fontWeight: 600 }}>Client Portal</span>
            <span onClick={() => setActiveView('admin-portal')} style={{ color: '#64748B', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>Staff Admin Access</span>
            <span>Terms of Engagement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
