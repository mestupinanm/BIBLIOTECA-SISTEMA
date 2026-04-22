import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Analytics } from '../services/analytics.js';

export default function BooksScreen() {
  const { currentScreen, SCREENS, t, goTo, resetInactivity, setLastAction } = useApp();
  const isActive = currentScreen === SCREENS.BOOKS;
  const [currentAction, setCurrentAction] = useState(null);

  useEffect(() => {
    if (!isActive) return;
    resetInactivity();
    setCurrentAction(null);
    setLastAction(t('books.screen_title'));
  }, [isActive, resetInactivity, setLastAction, t]);

  function showDetail(action) {
    setCurrentAction(action);
    Analytics.count('books', action);
    const actionLabel = t(action === 'borrow' ? 'books.borrow' : 'books.return');
    setLastAction(`${t('books.screen_title')} - ${actionLabel}`, action, 'books');
  }

  const isBorrow = currentAction === 'borrow';

  return (
    <section id="screen-books" className={`screen${isActive ? ' active with-topbar' : ''}`}>
      <div className="books-container">
        <div className={`books-options${currentAction ? ' hidden' : ''}`} id="books-options">
          <section className="books-hero">
            <span className="books-hero-eyebrow">{t('books.hero_eyebrow')}</span>
            <h2 className="books-hero-title">{t('books.hero_title')}</h2>
            <p className="books-hero-copy">{t('books.hero_copy')}</p>
          </section>
          <div className="books-card-grid">
            <button className="books-card books-card--borrow" data-action="borrow" onClick={() => showDetail('borrow')}>
              <div className="books-card-icon">
                <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <polyline points="8 12 12 8 16 12" />
                  <line x1="12" y1="16" x2="12" y2="8" />
                </svg>
              </div>
              <div className="books-card-copy">
                <span className="books-card-label">{t('books.borrow')}</span>
                <span className="books-card-desc">{t('books.borrow_desc')}</span>
              </div>
            </button>

            <button className="books-card books-card--return" data-action="return" onClick={() => showDetail('return')}>
              <div className="books-card-icon">
                <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <polyline points="16 12 12 16 8 12" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                </svg>
              </div>
              <div className="books-card-copy">
                <span className="books-card-label">{t('books.return')}</span>
                <span className="books-card-desc">{t('books.return_desc')}</span>
              </div>
            </button>
          </div>
        </div>

        <div className={`books-detail${currentAction ? '' : ' hidden'}`} id="books-detail">
          {currentAction ? (
            <article className={`books-detail-panel books-detail-panel--${currentAction}`}>
              <div className={`books-detail-icon books-detail-icon--${currentAction}`}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  {isBorrow ? (
                    <>
                      <polyline points="8 12 12 8 16 12" />
                      <line x1="12" y1="16" x2="12" y2="8" />
                    </>
                  ) : (
                    <>
                      <polyline points="16 12 12 16 8 12" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                    </>
                  )}
                </svg>
              </div>
              <div className="books-detail-copy">
                <h2 className="books-detail-title">{t(isBorrow ? 'books.borrow_title' : 'books.return_title')}</h2>
                <p className="books-detail-message">{t(isBorrow ? 'books.borrow_message' : 'books.return_message')}</p>
              </div>
              <div className="books-detail-actions">
                <button
                  className="btn btn--primary"
                  id="btn-books-llevame"
                  onClick={() => {
                    const tipo = currentAction === 'borrow' ? 'Prestamo' : 'Devolucion';
                    Analytics.insertServiciosLibros(tipo, 'Llevame');
                    Analytics.count('books_reception', currentAction);
                    goTo(SCREENS.NAVIGATION_GUIDE, { destination: 'reception' });
                  }}
                >
                  {t('nav.guide_me')}
                </button>
                <button
                  className="btn btn--secondary"
                  id="btn-books-listo"
                  onClick={() => {
                    const tipo = currentAction === 'borrow' ? 'Prestamo' : 'Devolucion';
                    Analytics.insertServiciosLibros(tipo, 'Listo');
                    goTo(SCREENS.MENU, {}, { pushHistory: false });
                  }}
                >
                  {t('nav.done')}
                </button>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
