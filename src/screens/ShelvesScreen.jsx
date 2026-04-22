import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Analytics } from '../services/analytics.js';
import { Robot } from '../services/robot.js';
import { MAP_COORDS, MAP_IMAGE_EN, MAP_IMAGE_ES, SHELF_NUMBERS, SHELF_TOPICS } from '../legacyData.js';

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buildMarker(x, y) {
  return (
    <div className="map-marker marker-dest" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="map-marker-core" />
      <div className="map-marker-pulse" />
      <div className="map-marker-pulse map-marker-pulse--delayed" />
    </div>
  );
}

function buildShelfIndex() {
  const shelves = {};

  SHELF_TOPICS.forEach((entry) => {
    if (!shelves[entry.shelf]) {
      shelves[entry.shelf] = {
        shelf: entry.shelf,
        coordKey: entry.coordKey,
        topics: []
      };
    }

    entry.topics.forEach((topic) => {
      if (!shelves[entry.shelf].topics.includes(topic)) {
        shelves[entry.shelf].topics.push(topic);
      }
    });
  });

  return shelves;
}

export default function ShelvesScreen() {
  const { currentScreen, SCREENS, language, goTo, resetInactivity, t, setLastAction } = useApp();
  const isActive = currentScreen === SCREENS.SHELVES;
  const [activeShelf, setActiveShelf] = useState('01');
  const [activeTopic, setActiveTopic] = useState(null);
  const [mapShelf, setMapShelf] = useState(null);
  const [mapTopic, setMapTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const shelves = useMemo(() => buildShelfIndex(), []);

  const filteredShelves = useMemo(() => {
    const query = normalize(searchTerm);

    return SHELF_NUMBERS.reduce((list, number) => {
      const shelf = shelves[number];
      if (!shelf) return list;

      const topics = !query ? shelf.topics.slice() : shelf.topics.filter((topic) => normalize(topic).includes(query));
      if (!query || topics.length) {
        list.push({
          shelf: number,
          coordKey: shelf.coordKey,
          topics,
          allTopics: shelf.topics
        });
      }

      return list;
    }, []);
  }, [searchTerm, shelves]);

  useEffect(() => {
    if (!isActive) return;
    resetInactivity();
    setActiveShelf('01');
    setActiveTopic(null);
    setMapShelf(null);
    setMapTopic(null);
    setSearchTerm('');
  }, [isActive, resetInactivity]);

  function updateLastActionForShelf(shelf, topic = null) {
    if (!shelf) return;
    const label = topic ? `${topic} · ${t('shelves.shelf_label')} ${shelf}` : `${language === 'en' ? 'Shelf' : 'Estanteria'} ${shelf}`;
    setLastAction(label, `shelf_${shelf}`, 'shelves');
  }

  function selectShelf(shelfNumber) {
    if (activeShelf === shelfNumber) {
      setActiveShelf(null);
      setActiveTopic(null);
      setMapShelf(null);
      setMapTopic(null);
      return;
    }

    setActiveShelf(shelfNumber);
    setActiveTopic(null);
    setMapShelf(shelfNumber);
    setMapTopic(null);
    Analytics.count('shelves', `shelf_${shelfNumber}`);
    updateLastActionForShelf(shelfNumber);
  }

  function focusTopic(shelfNumber, topicName) {
    setActiveShelf(shelfNumber);
    setActiveTopic(topicName);
    setMapShelf(shelfNumber);
    setMapTopic(topicName);
    updateLastActionForShelf(shelfNumber, topicName);
  }

  function handleSearch(nextSearchTerm) {
    setSearchTerm(nextSearchTerm);

    const query = normalize(nextSearchTerm);
    const nextFiltered = SHELF_NUMBERS.reduce((list, number) => {
      const shelf = shelves[number];
      if (!shelf) return list;
      const topics = !query ? shelf.topics.slice() : shelf.topics.filter((topic) => normalize(topic).includes(query));
      if (!query || topics.length) {
        list.push({
          shelf: number,
          coordKey: shelf.coordKey,
          topics,
          allTopics: shelf.topics
        });
      }
      return list;
    }, []);

    if (nextSearchTerm && nextFiltered.length) {
      const firstShelf = nextFiltered[0];
      const firstTopic = firstShelf.topics[0] || null;
      setActiveShelf(firstShelf.shelf);
      setActiveTopic(firstTopic);
      setMapShelf(firstShelf.shelf);
      setMapTopic(firstTopic);
      updateLastActionForShelf(firstShelf.shelf, firstTopic);
    } else if (!nextSearchTerm) {
      setActiveShelf('01');
      setActiveTopic(null);
      setMapShelf(null);
      setMapTopic(null);
    } else {
      setActiveShelf(null);
      setActiveTopic(null);
      setMapShelf(null);
      setMapTopic(null);
    }
  }

  const mapCoord = mapShelf ? MAP_COORDS[shelves[mapShelf]?.coordKey] : null;
  const mapSrc = language === 'en' ? MAP_IMAGE_EN : MAP_IMAGE_ES;
  const searchMeta = !searchTerm
    ? t('shelves.search_meta_default')
    : filteredShelves.length
      ? `${filteredShelves.length} ${t('shelves.search_results')}`
      : t('shelves.search_empty');

  return (
    <section id="screen-shelves" className={`screen${isActive ? ' active with-topbar' : ''}`}>
      <div className="shelves-container">
        <div className="shelves-list-panel">
          <div className="shelves-panel-header">
            <h3>{t('shelves.screen_title')}</h3>
            <p>{t('shelves.panel_hint')}</p>
          </div>
          <div className="shelves-search-wrap">
            <label className="sr-only" htmlFor="shelves-search">
              {t('shelves.search_placeholder')}
            </label>
            <div className="shelves-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="shelves-search"
                type="text"
                autoComplete="off"
                placeholder={t('shelves.search_placeholder')}
                value={searchTerm}
                onChange={(event) => handleSearch(event.target.value)}
              />
            </div>
            <div className="shelves-search-meta" id="shelves-search-meta">
              {searchMeta}
            </div>
          </div>
          <div className="shelves-list" id="shelves-list">
            {filteredShelves.length ? (
              filteredShelves.map((shelf) => {
                const isShelfActive = shelf.shelf === activeShelf;
                const visibleTopics = searchTerm ? shelf.topics : shelf.allTopics;
                const isExpanded = searchTerm ? shelf.topics.length > 0 : isShelfActive;

                return (
                  <article key={shelf.shelf} className={`shelf-item${isShelfActive ? ' active' : ''}`} data-shelf={shelf.shelf}>
                    <button className="shelf-item-header" data-shelf-toggle={shelf.shelf} onClick={() => selectShelf(shelf.shelf)}>
                      <div className="shelf-item-num">{shelf.shelf}.</div>
                      <div className="shelf-item-info">
                        <div className="shelf-item-title">{t('shelves.shelf_label')}</div>
                        <div className="shelf-item-subtitle">
                          {visibleTopics.length} {t('shelves.topics_count')}
                        </div>
                      </div>
                      <span className="shelf-item-cta">{t(isExpanded ? 'shelves.hide_topics' : 'shelves.view_topics')}</span>
                    </button>

                    {isExpanded ? (
                      <div className="shelf-item-body">
                        <p className="shelf-item-helper">{t('shelves.tap_topic')}</p>
                        <div className="shelf-topic-list">
                          {visibleTopics.map((topic) => (
                            <button
                              key={`${shelf.shelf}-${topic}`}
                              className={`shelf-topic-tag${activeTopic === topic ? ' is-active' : ''}`}
                              data-topic={topic}
                              data-shelf-topic={shelf.shelf}
                              onClick={() => {
                                focusTopic(shelf.shelf, topic);
                                Analytics.log('shelf_topic_selected', { shelf: shelf.shelf, topic });
                              }}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <div className="shelves-empty">{t('shelves.search_empty')}</div>
            )}
          </div>
        </div>

        <div className="shelves-map-panel">
          <div className="shelves-map-area">
            <div className="map-inner">
              <div className="map-image-wrapper" id="shelves-map-wrapper">
                <img className="map-img" id="shelves-map-img" src={mapSrc} alt="Floor map" />
                <div className="map-markers" id="shelves-map-markers">
                  {mapCoord ? buildMarker(mapCoord.x, mapCoord.y) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="shelves-map-footer">
            <span className="shelves-map-hint" id="shelves-map-hint">
              {mapShelf ? `${mapTopic ? `${mapTopic} · ` : ''}${t('shelves.shelf_label')} ${mapShelf}` : t('shelves.select_hint')}
            </span>
            <div className={`shelves-map-actions${mapShelf ? '' : ' hidden'}`} id="shelves-info-actions">
              <button
                className="btn btn--primary"
                id="btn-shelves-guide-me"
                onClick={() => {
                  if (!mapShelf) return;
                  Analytics.insertBuscarLibro(mapShelf, mapTopic, 'Llevame');
                  Robot.navigateTo(`shelf_${mapShelf}`);
                }}
              >
                {t('nav.guide_me')}
              </button>
              <button
                className="btn btn--secondary"
                id="btn-shelves-done"
                onClick={() => {
                  if (mapShelf) {
                    Analytics.insertBuscarLibro(mapShelf, mapTopic, 'Listo');
                  }
                  goTo(SCREENS.FEEDBACK);
                }}
              >
                {t('nav.done')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
