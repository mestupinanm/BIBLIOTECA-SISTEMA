import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Analytics } from '../services/analytics.js';
import { FAQS, HOURS, TAB_SERVICE_MAP } from '../legacyData.js';

const NEWS_LINK = 'https://www.uniandes.edu.co/es/noticias';

export default function InfoScreen() {
  const { currentScreen, SCREENS, language, resetInactivity, t, setLastAction } = useApp();
  const isActive = currentScreen === SCREENS.INFO;
  const [activeTab, setActiveTab] = useState('hours');
  const [openFaq, setOpenFaq] = useState([]);

  useEffect(() => {
    if (!isActive) return;
    resetInactivity();
    setActiveTab('hours');
    setOpenFaq([]);
    setLastAction(t('info.screen_title'));
  }, [isActive, resetInactivity, setLastAction, t]);

  function renderHours() {
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;
    const todaySchedule = HOURS.schedule[todayIndex];
    const todayTime = todaySchedule.closedKey ? t(todaySchedule.closedKey) : todaySchedule.time;

    return (
      <>
        <div className="hours-today">
          <div className="hours-today-label">{t('info.today')}</div>
          <div className="hours-today-value">{todayTime}</div>
        </div>
        <div className="hours-week">
          {HOURS.schedule.map((day, index) => {
            const time = day.closedKey ? t(day.closedKey) : day.time;
            return (
              <div key={day.dayKey} className={`hours-day${index === todayIndex ? ' today' : ''}`}>
                <span className="hours-day-name">{t(day.dayKey)}</span>
                <span className="hours-day-time">{time}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  function renderNews() {
    return (
      <section className="news-panel">
        <div className="news-panel-copy">
          <h3>{t('info.news_title')}</h3>
          <p>{t('info.news_copy')}</p>
          <a className="btn btn--primary" id="btn-news-open" href={NEWS_LINK} target="_blank" rel="noopener noreferrer">
            {t('info.news_cta')}
          </a>
          <span className="news-panel-hint">{t('info.news_hint')}</span>
        </div>
        <div className="news-direct-card">
          <div className="news-direct-pill">uniandes.edu.co</div>
          <h4>{NEWS_LINK}</h4>
          <p>{t('info.news_copy')}</p>
          <div className="news-direct-actions">
            <a className="news-direct-link" href={NEWS_LINK} target="_blank" rel="noopener noreferrer">
              {NEWS_LINK}
            </a>
          </div>
        </div>
      </section>
    );
  }

  function renderFaq() {
    return (
      <div className="faq-list">
        {FAQS.map((faq, index) => (
          <article key={faq.q.es} className={`faq-item${openFaq.includes(index) ? ' open' : ''}`} data-faq={index}>
            <button
              className="faq-question"
              onClick={() => {
                setOpenFaq((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]));
                Analytics.count('info_faq', `faq_${index}`);
              }}
            >
              <span>{faq.q[language] || faq.q.es}</span>
              <svg className="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="faq-answer">{faq.a[language] || faq.a.es}</div>
          </article>
        ))}
      </div>
    );
  }

  const content = activeTab === 'hours' ? renderHours() : activeTab === 'news' ? renderNews() : renderFaq();

  return (
    <section id="screen-info" className={`screen${isActive ? ' active with-topbar' : ''}`}>
      <div className="info-container">
        <div className="info-tabs">
          {['hours', 'news', 'faq'].map((tab) => (
            <button
              key={tab}
              className={`info-tab${activeTab === tab ? ' active' : ''}`}
              data-tab={tab}
              onClick={() => {
                setActiveTab(tab);
                Analytics.count('info', `tab_${tab}`);
                setLastAction(`${t('info.screen_title')} - ${t(`info.${tab}`)}`, `tab_${tab}`, 'info');
                Analytics.insertInformacion(TAB_SERVICE_MAP[tab] || tab);
              }}
            >
              {t(`info.${tab}`)}
            </button>
          ))}
        </div>
        <div className="info-content" id="info-content">
          {content}
        </div>
      </div>
    </section>
  );
}
