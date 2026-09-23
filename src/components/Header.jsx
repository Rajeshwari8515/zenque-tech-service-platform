import React from 'react';
import { UserCheck, ShieldCheck } from 'lucide-react';

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
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setActiveView('client-portal')}
            title="Open Client Portal & Account Login"
          >
            <UserCheck size={14} />
            <span>Client Login</span>
          </button>

          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setActiveView('admin-portal')}
            title="Open Admin Portal Login"
          >
            <ShieldCheck size={14} />
            <span>Admin Login</span>
          </button>
        </div>

      </div>
    </header>
  );
}
