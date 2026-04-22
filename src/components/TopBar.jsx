import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';

export default function TopBar() {
  const { topbarVisible, showBackButton, back, toggleLanguage, language, openHelp, screenTitle, t } = useApp();

  return (
    <header id="topbar" className={topbarVisible ? '' : 'hidden'}>
      <button
        id="btn-back"
        className="topbar-btn topbar-btn--back"
        aria-label="Back"
        onClick={() => {
          back();
        }}
        style={{ visibility: showBackButton ? 'visible' : 'hidden' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>{t('nav.back')}</span>
      </button>

      <h2 id="screen-title" className="topbar-title">
        {screenTitle}
      </h2>

      <div className="topbar-right">
        <button id="btn-lang-toggle" className="topbar-btn topbar-btn--lang" aria-label="Toggle language" onClick={toggleLanguage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span id="lang-label">{language === 'es' ? 'EN' : 'ES'}</span>
        </button>

        <button id="btn-help" className="topbar-btn topbar-btn--help" aria-label="Help" onClick={openHelp}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{t('help.button')}</span>
        </button>
      </div>
    </header>
  );
}
