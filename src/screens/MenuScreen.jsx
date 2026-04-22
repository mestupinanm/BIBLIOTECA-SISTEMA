import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { MENU_CATEGORIES } from '../legacyData.js';
import { Analytics } from '../services/analytics.js';

const MENU_ITEMS = [
  {
    target: 'navigation',
    labelKey: 'menu.navigation',
    descKey: 'menu.navigation.desc',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    )
  },
  {
    target: 'shelves',
    labelKey: 'menu.shelves',
    descKey: 'menu.shelves.desc',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="7" height="18" />
        <rect x="9" y="3" width="7" height="18" />
        <rect x="16" y="3" width="6" height="18" />
        <line x1="2" y1="21" x2="22" y2="21" />
      </svg>
    )
  },
  {
    target: 'books',
    labelKey: 'menu.books',
    descKey: 'menu.books.desc',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="13" y2="11" />
      </svg>
    )
  },
  {
    target: 'info',
    labelKey: 'menu.info',
    descKey: 'menu.info.desc',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    )
  },
  {
    target: 'events',
    labelKey: 'menu.events',
    descKey: 'menu.events.desc',
    accent: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.8 5.67 6.26.91-4.53 4.41 1.07 6.24L12 17.27 6.4 20.23l1.07-6.24L2.94 9.58l6.26-.91L12 3z" />
      </svg>
    )
  }
];

export default function MenuScreen() {
  const { currentScreen, SCREENS, goTo, resetInactivity, t, setLastAction, clearHistory } = useApp();
  const isActive = currentScreen === SCREENS.MENU;

  useEffect(() => {
    if (!isActive) return;
    resetInactivity();
    clearHistory();
    setLastAction(t('menu.title'));
  }, [clearHistory, isActive, resetInactivity, setLastAction, t]);

  return (
    <section id="screen-menu" className={`screen${isActive ? ' active with-topbar' : ''}`}>
      <div className="menu-container">
        <h1 className="menu-title">{t('menu.title')}</h1>
        <div className="menu-grid">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.target}
              className={`menu-card${item.accent ? ' menu-card--accent' : ''}`}
              data-target={item.target}
              onClick={() => {
                Analytics.insertGeneralInteraction(MENU_CATEGORIES[item.target] || item.target, () => {
                  goTo(item.target);
                });
              }}
            >
              <div className="menu-card-icon">{item.icon}</div>
              <span className="menu-card-label">{t(item.labelKey)}</span>
              <span className="menu-card-desc">{t(item.descKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
