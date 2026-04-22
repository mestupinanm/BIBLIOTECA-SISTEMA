import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Analytics } from '../services/analytics.js';
import { Robot } from '../services/robot.js';
import { DEST_CATEGORY_LABELS, MAP_COORDS, MAP_IMAGE_EN, MAP_IMAGE_ES, NAV_DEST_CATEGORIES } from '../legacyData.js';

function buildMarker(x, y, type) {
  return (
    <div className={`map-marker ${type}`} style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="map-marker-core" />
      <div className="map-marker-pulse" />
      <div className="map-marker-pulse map-marker-pulse--delayed" />
    </div>
  );
}

function getShortLabel(label) {
  return label.replace(/^Sala\s+/i, '').replace(/^Room\s+/i, '');
}

export default function NavigationGuideScreen() {
  const { currentScreen, screenParams, SCREENS, language, t, goTo, resetInactivity, setLastAction } = useApp();
  const isActive = currentScreen === SCREENS.NAVIGATION_GUIDE;
  const [overlayState, setOverlayState] = useState('hidden');
  const timeoutRef = useRef([]);
  const destinationId = screenParams.destination || null;

  const destinationLabel = destinationId ? t(`dest.${destinationId}`) : '';
  const categoryId = destinationId ? NAV_DEST_CATEGORIES[destinationId] || 'navigation' : 'navigation';
  const mapSrc = language === 'en' ? MAP_IMAGE_EN : MAP_IMAGE_ES;

  const markers = useMemo(() => {
    if (!destinationId) return null;
    const here = MAP_COORDS.you_are_here;
    const dest = MAP_COORDS[destinationId];

    return (
      <>
        {here ? buildMarker(here.x, here.y, 'marker-here') : null}
        {dest && (dest.x !== here?.x || dest.y !== here?.y) ? buildMarker(dest.x, dest.y, 'marker-dest') : null}
      </>
    );
  }, [destinationId]);

  useEffect(() => {
    if (!isActive) return undefined;

    resetInactivity();
    if (destinationId) {
      setLastAction(destinationLabel, destinationId, categoryId);
    }

    return () => {
      timeoutRef.current.forEach((timer) => window.clearTimeout(timer));
      timeoutRef.current = [];
      setOverlayState('hidden');
    };
  }, [categoryId, destinationId, destinationLabel, isActive, resetInactivity, setLastAction]);

  function startSimulation() {
    const shortLabel = getShortLabel(destinationLabel);
    const firstTimer = window.setTimeout(() => {
      setOverlayState('arrived');
      const secondTimer = window.setTimeout(() => {
        setOverlayState('hidden');
        goTo(SCREENS.FEEDBACK);
      }, 1500);
      timeoutRef.current.push(secondTimer);
    }, 3000);

    timeoutRef.current.push(firstTimer);

    Analytics.insertNavegacion(
      DEST_CATEGORY_LABELS[categoryId] || categoryId,
      shortLabel,
      'Llevame'
    );
    Robot.navigateTo(destinationId);
    setOverlayState('navigating');
  }

  return (
    <section id="screen-navigation-guide" className={`screen${isActive ? ' active with-topbar' : ''}`}>
      <div className="guide-container">
        <div className="guide-map-full" id="guide-map">
          <div className="map-inner">
            <div className="map-image-wrapper" id="guide-map-wrapper">
              <img className="map-img" id="guide-map-img" src={mapSrc} alt="Floor map" />
              <div className="map-markers" id="guide-map-markers">
                {markers}
              </div>
            </div>
          </div>
        </div>

        <div className={`guide-sim-overlay${overlayState === 'hidden' ? ' hidden' : ''}`} id="guide-sim-overlay">
          <div className="guide-sim-content">
            <div className="guide-sim-spinner" />
            <p className="guide-sim-msg" id="guide-sim-msg">
              {overlayState === 'arrived'
                ? language === 'en'
                  ? `You have arrived at ${getShortLabel(destinationLabel)}`
                  : `Has llegado a ${getShortLabel(destinationLabel)}`
                : language === 'en'
                  ? `Navigating to ${getShortLabel(destinationLabel)}...`
                  : `Navegando hacia ${getShortLabel(destinationLabel)}...`}
            </p>
          </div>
        </div>

        <div className="guide-overlay-bar">
          <div className="guide-overlay-info">
            <h2 className="guide-destination" id="guide-destination">
              {destinationLabel}
            </h2>
            <div className="guide-legend">
              <span className="guide-legend-here">
                <span className="guide-legend-dot" />
                <span>{t('nav.you_are_here')}</span>
              </span>
              <span className="guide-legend-dest">
                <span className="guide-legend-dot" />
                <span>{t('nav.your_dest')}</span>
              </span>
            </div>
          </div>
          <div className="guide-actions">
            <button className="btn btn--primary guide-btn" id="btn-guide-me" onClick={startSimulation} disabled={!destinationId}>
              {t('nav.guide_me')}
            </button>
            <button
              className="btn btn--secondary guide-btn"
              id="btn-guide-done"
              onClick={() => {
                if (destinationId) {
                  const shortLabel = getShortLabel(destinationLabel);
                  Analytics.count('navigation', destinationId);
                  Analytics.count('navigation_category', categoryId);
                  Analytics.insertNavegacion(DEST_CATEGORY_LABELS[categoryId] || categoryId, shortLabel, 'Listo');
                }
                goTo(SCREENS.FEEDBACK);
              }}
            >
              {t('nav.done')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
