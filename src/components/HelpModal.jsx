import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';

export default function HelpModal() {
  const { helpOpen, closeHelp, t } = useApp();

  return (
    <div id="help-overlay" className={`overlay${helpOpen ? '' : ' hidden'}`}>
      <div className="overlay-card">
        <div className="overlay-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="overlay-title">{t('help.title')}</h2>
        <p className="overlay-message">{t('help.message')}</p>
        <button className="btn btn--secondary overlay-dismiss" id="btn-help-dismiss" onClick={closeHelp}>
          {t('help.dismiss')}
        </button>
      </div>
    </div>
  );
}
