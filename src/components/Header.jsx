import React from 'react';
import { ArrowRight, UserCheck } from 'lucide-react';

export default function Header({ activeView, setActiveView, onRequestClick, onHowItWorksClick }) {
  return (
    <header className="header">
      <div className="container nav-container">
        
        {/* Logo */}
        <div className="brand-logo" onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">Z</div>
          <div>
            ZENQUE<span style={{ color: 'var(--burgundy-main)', marginLeft: '2px' }}>TECH</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <span 
                className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
                onClick={() => setActiveView('home')}
              >
                Home
              </span>
            </li>
            <li>
              <span 
                className={`nav-link ${activeView === 'services' || activeView === 'service-detail' || activeView === 'packages' ? 'active' : ''}`}
                onClick={() => setActiveView('services')}
              >
                Services
              </span>
            </li>
            <li>
              <span 
                className="nav-link"
                onClick={onHowItWorksClick}
              >
                How It Works
              </span>
            </li>
          </ul>
        </nav>

        {/* Right Side Actions */}
        <div className="nav-actions">
          <div 
            className="login-preview-badge" 
            onClick={() => setActiveView('client-portal')}
            style={{ cursor: 'pointer' }}
            title="Open Client Portal & Account Login"
          >
            <UserCheck size={14} style={{ color: 'var(--burgundy-main)' }} />
            <span>Client Login</span>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onRequestClick}>
            <span>Request a Service</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </header>
  );
}
