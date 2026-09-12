import React from 'react';
import { X, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

export default function RequestModal({ isOpen, onClose, onProceedToEnquiry, selectedService, selectedPackage }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy-main)', textTransform: 'uppercase' }}>
              Service Request Connection
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              Request Technology Service
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Selected Context Summary */}
        <div style={{ 
          backgroundColor: 'var(--bg-subtle)', 
          borderRadius: 'var(--radius-md)', 
          padding: '1.25rem', 
          marginBottom: '1.5rem',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--burgundy-main)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Layers size={14} />
            <span>CARRIED FORWARD SELECTION</span>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {selectedService ? selectedService.title : 'Web Development'}
          </div>

          {selectedPackage ? (
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--burgundy-main)' }}>
                  Selected Package: {selectedPackage.name} ({selectedPackage.tier})
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Duration: {selectedPackage.duration}</div>
              </div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedPackage.price}</strong>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Package: Custom Scope Request
            </div>
          )}
        </div>

        {/* Journey Step Explanation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Module 2 — Project Enquiry Connection:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--burgundy-main)', flexShrink: 0 }} />
              <span>Selected Service ({selectedService?.title || 'Web Development'}) pre-filled</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--burgundy-main)', flexShrink: 0 }} />
              <span>Selected Package ({selectedPackage?.name || 'Custom Scope'}) pre-filled</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--burgundy-main)', flexShrink: 0 }} />
              <span>Next Step: Provide project requirements & generate Enquiry ID (ZT-10234)</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{ 
          backgroundColor: 'var(--burgundy-light)', 
          border: '1px solid var(--burgundy-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.85rem', 
          marginBottom: '1.5rem',
          fontSize: '0.8125rem',
          color: 'var(--burgundy-main)'
        }}>
          <strong>Module 2 Ready:</strong> Click below to proceed to the guided Project Enquiry form.
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <span>Back to Discovery</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onProceedToEnquiry}>
            <span>Proceed to Project Enquiry</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
