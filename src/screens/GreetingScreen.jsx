import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Robot } from '../services/robot.js';

export default function GreetingScreen() {
  const { currentScreen, SCREENS, setLanguage, startSession, goTo, stopInactivity } = useApp();
  const isActive = currentScreen === SCREENS.GREETING;

  useEffect(() => {
    if (!isActive) return;
    stopInactivity();
    Robot.speak('Hola! Bienvenido a la biblioteca.');
  }, [isActive, stopInactivity]);

  function handleLanguageSelect(lang) {
    setLanguage(lang);
    startSession(lang);
    goTo(SCREENS.MENU, {}, { pushHistory: false });
  }

  return (
    <section id="screen-greeting" className={`screen${isActive ? ' active' : ''}`}>
      <div className="greeting-container">
        <div className="greeting-robot">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="3" />
            <line x1="12" y1="8" x2="12" y2="11" />
            <circle cx="8" cy="16" r="1" fill="var(--color-primary)" />
            <circle cx="16" cy="16" r="1" fill="var(--color-primary)" />
            <path d="M9 19h6" />
          </svg>
          <div className="greeting-robot-eyes">
            <div className="greeting-eye" />
            <div className="greeting-eye" />
          </div>
        </div>
        <h1 className="greeting-title">
          <span className="greeting-line1">Bienvenido</span>
          <span className="greeting-line2">Welcome</span>
        </h1>
        <p className="greeting-subtitle">Selecciona tu idioma / Choose your language</p>
        <div className="greeting-buttons">
          <button className="greeting-lang-btn" data-lang="es" onClick={() => handleLanguageSelect('es')}>
            <span className="greeting-lang-flag">ES</span>
            <span className="greeting-lang-name">Espanol</span>
          </button>
          <button className="greeting-lang-btn" data-lang="en" onClick={() => handleLanguageSelect('en')}>
            <span className="greeting-lang-flag">EN</span>
            <span className="greeting-lang-name">English</span>
          </button>
        </div>
      </div>
    </section>
  );
}
