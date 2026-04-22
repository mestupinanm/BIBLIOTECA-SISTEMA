import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { Analytics } from '../services/analytics.js';
import { ACTIVITIES_URL } from '../legacyData.js';

const FALLBACK_ACTIVITIES = [
  {
    id: 'library-trivia',
    type: 'trivia',
    enabled: true,
    title: { es: 'Trivia de la biblioteca', en: 'Library trivia' },
    description: {
      es: 'Pon a prueba lo que sabes sobre la biblioteca, sus servicios y la universidad.',
      en: 'Put your knowledge of the library, its services, and the university to the test.'
    },
    cta: { es: 'Comenzar trivia', en: 'Start trivia' },
    content: {
      questions: [
        {
          question: {
            es: 'En que piso se encuentra la Sala de Ciencias e Ingenieria?',
            en: 'On which floor is the Science and Engineering Room located?'
          },
          options: {
            es: ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'],
            en: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4']
          },
          correct: 1
        }
      ]
    }
  }
];

function getLangText(value, language) {
  if (!value) return '';
  return value[language] || value.es || '';
}

export default function EventsScreen() {
  const { currentScreen, SCREENS, language, resetInactivity, t, setLastAction } = useApp();
  const isActive = currentScreen === SCREENS.EVENTS;
  const [activities, setActivities] = useState([]);
  const [activeActivity, setActiveActivity] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    if (!isActive) return;

    resetInactivity();
    setLastAction(t('events.screen_title'));

    fetch(ACTIVITIES_URL)
      .then((response) => {
        if (!response.ok) throw new Error('events_data_unavailable');
        return response.json();
      })
      .then((data) => {
        setActivities(data?.activities?.length ? data.activities : FALLBACK_ACTIVITIES);
      })
      .catch(() => {
        setActivities(FALLBACK_ACTIVITIES);
      });

    setActiveActivity(null);
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  }, [isActive, resetInactivity, setLastAction, t]);

  function startActivity(activityId) {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;

    Analytics.count('events', 'trivia_started');
    Analytics.insertEventos(getLangText(activity.title, language));
    setLastAction(`${t('events.screen_title')} - ${activityId}`, activityId, 'events');
    setActiveActivity(activity);
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  }

  const total = activeActivity?.content?.questions?.length || 0;
  const question = activeActivity?.content?.questions?.[currentQuestion];

  function handleAnswer(index) {
    if (!question || answered) return;

    const isCorrect = index === question.correct;
    setAnswered(true);
    setSelectedAnswer(index);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    Analytics.log('trivia_answer', {
      activity: activeActivity.id,
      question: currentQuestion,
      selected: index,
      correct: question.correct,
      isCorrect
    });

    window.setTimeout(() => {
      if (currentQuestion + 1 < total) {
        setCurrentQuestion((prev) => prev + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        Analytics.count('events', 'trivia_completed');
        Analytics.log('trivia_completed', { activity: activeActivity.id, score: isCorrect ? score + 1 : score, total });
      }
    }, 1300);
  }

  const finished = !!activeActivity && total > 0 && currentQuestion >= total - 1 && answered;
  const finalScore = finished ? (selectedAnswer === question?.correct ? score + 1 : score) : score;
  const percentage = total ? Math.round((finalScore / total) * 100) : 0;
  const messageKey = percentage >= 80 ? 'events.result_great' : percentage >= 50 ? 'events.result_good' : 'events.result_ok';

  return (
    <section id="screen-events" className={`screen${isActive ? ' active with-topbar' : ''}`}>
      <div className="events-container">
        <div className={`events-intro${activeActivity ? ' hidden' : ''}`} id="events-intro">
          <section className="events-library">
            <div className="events-library-head">
              <span className="events-library-badge">{t('events.library_arcade')}</span>
              <h2>{t('events.select_activity')}</h2>
            </div>
            <div className="events-activity-grid">
              {activities.map((activity) => {
                const badgeKey = activity.type === 'game' ? 'events.badge_game' : 'events.badge_trivia';
                const stateKey = activity.enabled ? 'events.available_now' : 'events.coming_soon';
                return (
                  <article key={activity.id} className={`events-activity-card${activity.enabled ? '' : ' is-disabled'}`}>
                    <div className="events-activity-top">
                      <span className="events-activity-kind">{t(badgeKey)}</span>
                      <span className="events-activity-state">{t(stateKey)}</span>
                    </div>
                    <h3>{getLangText(activity.title, language)}</h3>
                    <p>{getLangText(activity.description, language)}</p>
                    <button
                      className={`btn ${activity.enabled ? 'btn--primary' : 'btn--secondary'} events-activity-btn`}
                      data-activity={activity.id}
                      disabled={!activity.enabled}
                      onClick={() => startActivity(activity.id)}
                    >
                      {getLangText(activity.cta, language)}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <div className={`events-question${activeActivity && !finished ? '' : ' hidden'}`} id="events-question">
          {question ? (
            <article className="events-question-card">
              <div className="events-question-header">
                <span className="events-progress-label">
                  {t('events.question')} {currentQuestion + 1} {t('events.of')} {total}
                </span>
                <span className="events-progress-score">
                  {t('events.score')}: {score}
                </span>
              </div>
              <div className="events-progress-bar">
                <div className="events-progress-fill" style={{ width: `${((currentQuestion + 1) / total) * 100}%` }} />
              </div>
              <h3 className="events-question-text">{getLangText(question.question, language)}</h3>
              <div className="events-option-list">
                {(question.options?.[language] || question.options?.es || []).map((option, index) => {
                  let className = 'events-option-btn';
                  if (answered && index === question.correct) className += ' correct';
                  if (answered && index === selectedAnswer && selectedAnswer !== question.correct) className += ' wrong';
                  return (
                    <button key={option} className={className} data-index={index} disabled={answered} onClick={() => handleAnswer(index)}>
                      {option}
                    </button>
                  );
                })}
              </div>
            </article>
          ) : null}
        </div>

        <div className={`events-result${finished ? '' : ' hidden'}`} id="events-result">
          {finished ? (
            <article className="events-result-card">
              <span className="events-result-kicker">{getLangText(activeActivity.title, language)}</span>
              <div className="events-result-score">
                {finalScore}/{total}
              </div>
              <div className="events-result-label">{t(messageKey)}</div>
              <div className="events-result-actions">
                <button className="btn btn--primary" id="btn-trivia-replay" onClick={() => startActivity(activeActivity.id)}>
                  {t('events.play_again')}
                </button>
                <button
                  className="btn btn--secondary"
                  id="btn-trivia-menu"
                  onClick={() => {
                    setActiveActivity(null);
                    setCurrentQuestion(0);
                    setScore(0);
                    setAnswered(false);
                    setSelectedAnswer(null);
                  }}
                >
                  {t('events.back_menu')}
                </button>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
