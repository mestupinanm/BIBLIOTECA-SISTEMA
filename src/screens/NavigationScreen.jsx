import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { NAV_CATEGORIES } from '../legacyData.js';
import { Analytics } from '../services/analytics.js';

function CategoryIcon({ id }) {
  if (id === 'rooms') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  if (id === 'services') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function NavigationScreen() {
  const { currentScreen, SCREENS, goTo, resetInactivity, t, setLastAction } = useApp();
  const isActive = currentScreen === SCREENS.NAVIGATION;

  useEffect(() => {
    if (!isActive) return;
    resetInactivity();
    setLastAction(t('nav.screen_title'));
  }, [isActive, resetInactivity, setLastAction, t]);

  return (
    <section id="screen-navigation" className={`screen${isActive ? ' active with-topbar' : ''}`}>
      <div className="nav-container">
        <div className="nav-categories" id="nav-categories">
          {NAV_CATEGORIES.map((category) => (
            <section key={category.id} className="nav-category" data-cat={category.id}>
              <header className="nav-category-header">
                <div className="nav-category-badge">
                  <CategoryIcon id={category.id} />
                </div>
                <div className="nav-category-copy">
                  <h3>{t(category.titleKey)}</h3>
                  <p>{t('nav.quick_hint')}</p>
                </div>
              </header>
              <div className="nav-category-items">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    className="nav-item"
                    data-dest={item.id}
                    onClick={() => {
                      Analytics.log('destination_request', { destination: item.id });
                      goTo(SCREENS.NAVIGATION_GUIDE, { destination: item.id });
                    }}
                  >
                    <span className="nav-item-name">{t(item.nameKey)}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
