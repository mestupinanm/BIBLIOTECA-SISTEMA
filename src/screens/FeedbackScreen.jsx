import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Analytics } from '../services/analytics.js';
import { RATING_MAP } from '../legacyData.js';

export default function FeedbackScreen() {
  const { currentScreen, SCREENS, stopInactivity, endSession, goTo, analyticsState, lastAction, t } = useApp();
  const isActive = currentScreen === SCREENS.FEEDBACK;
  const [selectedRating, setSelectedRating] = useState('');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return undefined;

    stopInactivity();
    setSelectedRating('');
    setComment('');
    setSent(false);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isActive, stopInactivity]);

  function sendFeedback() {
    const puntuacion = RATING_MAP[selectedRating] || selectedRating;

    Analytics.count('feedback', selectedRating, analyticsState);
    Analytics.insertFeedback(selectedRating, analyticsState, lastAction);
    Analytics.log('feedback', { rating: selectedRating }, analyticsState);
    Analytics.insertCalidadServicio(puntuacion, comment);

    setSent(true);

    timerRef.current = window.setTimeout(() => {
      endSession();
      goTo(SCREENS.IDLE, {}, { pushHistory: false });
    }, 3000);
  }

  return (
    <section id="screen-feedback" className={`screen${isActive ? ' active' : ''}`}>
      <div className="feedback-container" data-selected-rating={selectedRating || undefined}>
        <h1 className="feedback-title">{t('feedback.title')}</h1>
        <p className="feedback-caption">{t('feedback.caption')}</p>

        <div className={`feedback-options${selectedRating ? ' hidden' : ''}`}>
          <button className="feedback-btn" data-rating="excelente" onClick={() => setSelectedRating('excelente')}>
            <span className="feedback-emoji">&#129395;</span>
            <span>{t('feedback.excelente')}</span>
          </button>
          <button className="feedback-btn" data-rating="bueno" onClick={() => setSelectedRating('bueno')}>
            <span className="feedback-emoji">&#128077;</span>
            <span>{t('feedback.bueno')}</span>
          </button>
          <button className="feedback-btn" data-rating="regular" onClick={() => setSelectedRating('regular')}>
            <span className="feedback-emoji">&#128528;</span>
            <span>{t('feedback.regular')}</span>
          </button>
          <button className="feedback-btn" data-rating="malo" onClick={() => setSelectedRating('malo')}>
            <span className="feedback-emoji">&#128078;</span>
            <span>{t('feedback.malo')}</span>
          </button>
          <button className="feedback-btn" data-rating="pesimo" onClick={() => setSelectedRating('pesimo')}>
            <span className="feedback-emoji">&#128552;</span>
            <span>{t('feedback.pesimo')}</span>
        </button>
      </div>

        <div className={`feedback-comment-section${selectedRating && !sent ? '' : ' hidden'}`} id="feedback-comment-section">
          <p className="feedback-comment-prompt">{t('feedback.comment_prompt')}</p>
          <textarea
            id="feedback-comment-input"
            className="feedback-comment-input"
            rows="3"
            maxLength="300"
            placeholder={t('feedback.comment_placeholder')}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <button className="btn btn--primary" id="btn-feedback-send" onClick={sendFeedback}>
            {t('feedback.send')}
          </button>
        </div>

        <div className={`feedback-thanks${sent ? '' : ' hidden'}`} id="feedback-thanks">
          <h2>{t('feedback.thanks')}</h2>
        </div>
      </div>
    </section>
  );
}
