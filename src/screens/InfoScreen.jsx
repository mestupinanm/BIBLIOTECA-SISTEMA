import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Analytics } from '../services/analytics.js';
import { FAQS, HOURS, TAB_SERVICE_MAP } from '../legacyData.js';

const NEWS_LINK = 'https://www.uniandes.edu.co/es/noticias';
const NEWS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';

function normalizeNewsImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/')) {
    return `https://www.uniandes.edu.co${imageUrl}`;
  }
  return imageUrl;
}

function extractNewsCards(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const articles = Array.from(doc.querySelectorAll('.card-container'));

  return articles
    .map((article, index) => {
      const titleElement = article.querySelector('.ss3-cardTitle-sm-500');
      const title = titleElement?.textContent?.trim() || '';
      const contentTypeElement = article.querySelector('.ss3-tag-md-400');
      const contentType = contentTypeElement?.textContent?.trim() || '';
      const dateElement = article.querySelector('.ss3-cardDate-400');
      const publishedAt = dateElement?.textContent?.trim() || '';
      const imageElement = article.querySelector('img');
      let imageUrl = imageElement?.getAttribute('src') || '';

      if (!imageUrl || imageUrl.includes('data:image')) {
        imageUrl = imageElement?.getAttribute('data-src') || '';
      }

      const linkElement = article.querySelector('a[href]');
      let articleUrl = linkElement?.getAttribute('href') || '';
      if (articleUrl && articleUrl.startsWith('/')) {
        articleUrl = `https://www.uniandes.edu.co${articleUrl}`;
      }

      const summaryElement = article.querySelector('p');
      const summary = summaryElement?.textContent?.trim() || '';

      return {
        id: `${title}-${index}`,
        title,
        contentType,
        publishedAt,
        imageUrl: normalizeNewsImageUrl(imageUrl),
        articleUrl,
        summary
      };
    })
    .filter((article) => article.title);
}

export default function InfoScreen() {
  const { currentScreen, SCREENS, language, resetInactivity, t, setLastAction } = useApp();
  const isActive = currentScreen === SCREENS.INFO;
  const [activeTab, setActiveTab] = useState('hours');
  const [openFaq, setOpenFaq] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [newsPage, setNewsPage] = useState(0);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [hasMoreNews, setHasMoreNews] = useState(true);

  useEffect(() => {
    if (!isActive) return;
    resetInactivity();
    setActiveTab('hours');
    setOpenFaq([]);
    setLastAction(t('info.screen_title'));
  }, [isActive, resetInactivity, setLastAction, t]);

  const loadNews = useCallback(async (pageToLoad, append = false) => {
    if (isLoadingNews) return;

    setIsLoadingNews(true);
    setNewsError('');

    let targetUrl = NEWS_LINK;
    if (pageToLoad > 0) {
      targetUrl += `?page=${pageToLoad}`;
    }

    try {
      const response = await fetch(`${NEWS_PROXY}${encodeURIComponent(targetUrl)}`);
      if (!response.ok) {
        throw new Error('news_proxy_error');
      }

      const rawHtml = await response.text();
      const parsedItems = extractNewsCards(rawHtml);

      if (parsedItems.length === 0) {
        if (!append) {
          setNewsItems([]);
        }
        setHasMoreNews(false);
        return;
      }

      setNewsItems((prev) => {
        if (!append) return parsedItems;

        const seen = new Set(prev.map((item) => item.articleUrl || item.title));
        const merged = [...prev];
        parsedItems.forEach((item) => {
          const key = item.articleUrl || item.title;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
          }
        });
        return merged;
      });
      setHasMoreNews(true);
      setNewsPage(pageToLoad);
    } catch (error) {
      console.error('Error cargando noticias:', error);
      setNewsError('No se pudieron cargar las noticias en este momento.');
    } finally {
      setIsLoadingNews(false);
    }
  }, [isLoadingNews]);

  useEffect(() => {
    if (!isActive || activeTab !== 'news' || newsItems.length > 0 || isLoadingNews) return;
    loadNews(0, false);
  }, [activeTab, isActive, isLoadingNews, loadNews, newsItems.length]);

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
    const leadStory = newsItems[0] || null;
    const secondaryStories = newsItems.slice(1);

    return (
      <section className="news-panel">
        <div className="news-stage">
          <header className="news-stage-header">
            <div className="news-stage-copy">
              <div className="news-stage-kicker">Portal Uniandes</div>
              <h3>{t('info.news_title')}</h3>
              <p>{t('info.news_copy')}</p>
            </div>
            <a className="btn btn--secondary news-stage-link" id="btn-news-open" href={NEWS_LINK} target="_blank" rel="noopener noreferrer">
              {t('info.news_cta')}
            </a>
          </header>

          {isLoadingNews && newsItems.length === 0 ? <div className="news-loading-state">Cargando las noticias, por favor espera...</div> : null}

          {newsError ? (
            <div className="news-error-state">
              <p>{newsError}</p>
              <button className="btn btn--secondary news-inline-btn" onClick={() => loadNews(newsPage || 0, newsPage > 0)}>
                Intentar de nuevo
              </button>
            </div>
          ) : null}

          {leadStory ? (
            <>
              <article className="news-feature">
                {leadStory.imageUrl ? (
                  <img className="news-feature-image" src={leadStory.imageUrl} alt={leadStory.title} />
                ) : (
                  <div className="news-feature-image news-feature-image--placeholder">Sin imagen</div>
                )}
                <div className="news-feature-body">
                  {(leadStory.contentType || leadStory.publishedAt) ? (
                    <div className="news-card-meta news-card-meta--feature">
                      {leadStory.contentType ? <span className="news-card-tag">{leadStory.contentType}</span> : null}
                      {leadStory.publishedAt ? <span className="news-card-date">{leadStory.publishedAt}</span> : null}
                    </div>
                  ) : null}
                  <h4 className="news-feature-title">{leadStory.title}</h4>
                  {leadStory.summary ? <p className="news-feature-summary">{leadStory.summary}</p> : null}
                  {leadStory.articleUrl ? (
                    <a className="news-card-link news-card-link--feature" href={leadStory.articleUrl} target="_blank" rel="noopener noreferrer">
                      Leer noticia
                    </a>
                  ) : null}
                </div>
              </article>

              {secondaryStories.length > 0 ? (
                <div className="news-grid">
                  {secondaryStories.map((item) => (
                    <article key={item.id} className="news-card">
                      {item.imageUrl ? (
                        <img className="news-card-image" src={item.imageUrl} alt={item.title} />
                      ) : (
                        <div className="news-card-image news-card-image--placeholder">Sin imagen</div>
                      )}
                      <div className="news-card-body">
                        {(item.contentType || item.publishedAt) ? (
                          <div className="news-card-meta">
                            {item.contentType ? <span className="news-card-tag">{item.contentType}</span> : null}
                            {item.publishedAt ? <span className="news-card-date">{item.publishedAt}</span> : null}
                          </div>
                        ) : null}
                        <h5 className="news-card-title">{item.title}</h5>
                        {item.summary ? <p className="news-card-summary">{item.summary}</p> : null}
                        {item.articleUrl ? (
                          <a className="news-card-link" href={item.articleUrl} target="_blank" rel="noopener noreferrer">
                            Leer noticia
                          </a>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="news-feed-actions">
                {hasMoreNews ? (
                  <button
                    className="btn btn--primary news-load-more"
                    onClick={() => loadNews(newsPage + 1, true)}
                    disabled={isLoadingNews}
                  >
                    {isLoadingNews ? 'Cargando...' : 'Cargar más noticias'}
                  </button>
                ) : (
                  <span className="news-feed-end">No hay más noticias por cargar.</span>
                )}
              </div>
            </>
          ) : null}

          {!isLoadingNews && !newsError && !leadStory ? <div className="news-empty-state">No se encontraron noticias.</div> : null}
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
                if (tab === 'news' && newsItems.length === 0 && !isLoadingNews) {
                  loadNews(0, false);
                }
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
