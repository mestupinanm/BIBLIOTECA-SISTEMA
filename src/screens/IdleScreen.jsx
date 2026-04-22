import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';

function formatClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr} ${ampm}`;
}

export default function IdleScreen() {
  const { currentScreen, SCREENS, goTo, stopInactivity, t } = useApp();
  const [clock, setClock] = useState(formatClock());
  const isActive = currentScreen === SCREENS.IDLE;

  useEffect(() => {
    if (!isActive) return undefined;

    stopInactivity();
    setClock(formatClock());
    const intervalId = window.setInterval(() => {
      setClock(formatClock());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isActive, stopInactivity]);

  return (
    <section id="screen-idle" className={`screen${isActive ? ' active' : ''}`} onClick={() => goTo(SCREENS.GREETING)}>
      <div className="idle-container">
        <div className="idle-logo">
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="3" />
            <line x1="12" y1="8" x2="12" y2="11" />
          </svg>
          <div className="idle-robot-eyes">
            <div className="idle-eye" />
            <div className="idle-eye" />
          </div>
        </div>
        <h1 className="idle-title">Biblioteca General</h1>
        <p className="idle-subtitle">Sala de Ciencias e Ingenieria</p>
        <div className="idle-divider" />
        <div className="idle-clock" id="idle-clock">
          {clock}
        </div>
        <p className="idle-hint">{t('idle.hint')}</p>
        <div className="idle-pulse" />
      </div>
    </section>
  );
}
