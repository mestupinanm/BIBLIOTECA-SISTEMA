/* ============================================
   EVENTS / TRIVIA SCREEN
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var DATA_URL = 'assets/data/events/activities.json';
  var fallbackActivities = [
    {
      id: 'library-trivia',
      type: 'trivia',
      enabled: true,
      title: {
        es: 'Trivia de la biblioteca',
        en: 'Library trivia'
      },
      description: {
        es: 'Pon a prueba lo que sabes sobre la biblioteca, sus servicios y la universidad.',
        en: 'Put your knowledge of the library, its services, and the university to the test.'
      },
      cta: {
        es: 'Comenzar trivia',
        en: 'Start trivia'
      },
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
  var activities = [];
  var activeActivity = null;
  var state = {
    currentQuestion: 0,
    score: 0,
    answered: false
  };

  function getLangText(value) {
    if (!value) return '';
    return value[PepperLib.State.language] || value.es || '';
  }

  function loadActivities() {
    if (activities.length) return Promise.resolve(activities);
    if (typeof fetch === 'undefined') {
      activities = fallbackActivities;
      return Promise.resolve(activities);
    }

    return fetch(DATA_URL)
      .then(function (response) {
        if (!response.ok) throw new Error('events_data_unavailable');
        return response.json();
      })
      .then(function (data) {
        activities = data && data.activities ? data.activities : fallbackActivities;
        return activities;
      })
      .catch(function () {
        activities = fallbackActivities;
        return activities;
      });
  }

  function renderLibrary() {
    var introEl = document.getElementById('events-intro');
    var questionEl = document.getElementById('events-question');
    var resultEl = document.getElementById('events-result');
    var html = '';

    if (!introEl) return;

    html += '<section class="events-library">';
    html += '  <div class="events-library-head">';
    html += '    <span class="events-library-badge" data-i18n="events.library_arcade">' + PepperLib.i18n.t('events.library_arcade') + '</span>';
    html += '    <h2 data-i18n="events.select_activity">' + PepperLib.i18n.t('events.select_activity') + '</h2>';
    html += '  </div>';
    html += '  <div class="events-activity-grid">';

    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var badgeKey = activity.type === 'game' ? 'events.badge_game' : 'events.badge_trivia';
      var stateKey = activity.enabled ? 'events.available_now' : 'events.coming_soon';

      html += '<article class="events-activity-card' + (activity.enabled ? '' : ' is-disabled') + '">';
      html += '  <div class="events-activity-top">';
      html += '    <span class="events-activity-kind" data-i18n="' + badgeKey + '">' + PepperLib.i18n.t(badgeKey) + '</span>';
      html += '    <span class="events-activity-state" data-i18n="' + stateKey + '">' + PepperLib.i18n.t(stateKey) + '</span>';
      html += '  </div>';
      html += '  <h3>' + getLangText(activity.title) + '</h3>';
      html += '  <p>' + getLangText(activity.description) + '</p>';
      html += '  <button class="btn ' + (activity.enabled ? 'btn--primary' : 'btn--secondary') + ' events-activity-btn" data-activity="' + activity.id + '"' + (activity.enabled ? '' : ' disabled') + '>' + getLangText(activity.cta) + '</button>';
      html += '</article>';
    }

    html += '  </div>';
    html += '</section>';

    introEl.classList.remove('hidden');
    introEl.innerHTML = html;
    if (questionEl) questionEl.classList.add('hidden');
    if (resultEl) resultEl.classList.add('hidden');

    var buttons = introEl.querySelectorAll('[data-activity]');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].addEventListener('click', function () {
        startActivity(this.getAttribute('data-activity'));
      });
    }
  }

  function startActivity(activityId) {
    PepperLib.Analytics.count('events', 'trivia_started');
    PepperLib.LastAction = PepperLib.i18n.t('events.screen_title') + ' — ' + activityId;
    for (var i = 0; i < activities.length; i++) {
      if (activities[i].id === activityId) {
        activeActivity = activities[i];
        break;
      }
    }

    state.currentQuestion = 0;
    state.score = 0;
    state.answered = false;

    if (activeActivity && activeActivity.type === 'trivia') {
      renderQuestion();
    }
  }

  function renderQuestion() {
    var questionEl = document.getElementById('events-question');
    var introEl = document.getElementById('events-intro');
    var resultEl = document.getElementById('events-result');
    var questions = activeActivity.content.questions;
    var q = questions[state.currentQuestion];
    var options = getLangText(q.options) ? q.options[PepperLib.State.language] || q.options.es : [];
    var total = questions.length;
    var progress = ((state.currentQuestion + 1) / total) * 100;
    var html = '';

    if (introEl) introEl.classList.add('hidden');
    if (resultEl) resultEl.classList.add('hidden');
    if (!questionEl) return;

    html += '<article class="events-question-card">';
    html += '  <div class="events-question-header">';
    html += '    <span class="events-progress-label">' + PepperLib.i18n.t('events.question') + ' ' + (state.currentQuestion + 1) + ' ' + PepperLib.i18n.t('events.of') + ' ' + total + '</span>';
    html += '    <span class="events-progress-score">' + PepperLib.i18n.t('events.score') + ': ' + state.score + '</span>';
    html += '  </div>';
    html += '  <div class="events-progress-bar"><div class="events-progress-fill" style="width:' + progress + '%"></div></div>';
    html += '  <h3 class="events-question-text">' + getLangText(q.question) + '</h3>';
    html += '  <div class="events-option-list">';
    for (var i = 0; i < options.length; i++) {
      html += '    <button class="events-option-btn" data-index="' + i + '">' + options[i] + '</button>';
    }
    html += '  </div>';
    html += '</article>';

    questionEl.classList.remove('hidden');
    questionEl.innerHTML = html;
    state.answered = false;

    var answerBtns = questionEl.querySelectorAll('.events-option-btn');
    for (var j = 0; j < answerBtns.length; j++) {
      answerBtns[j].addEventListener('click', function () {
        if (state.answered) return;
        state.answered = true;

        var selected = parseInt(this.getAttribute('data-index'), 10);
        var correct = q.correct;
        var allBtns = questionEl.querySelectorAll('.events-option-btn');

        for (var k = 0; k < allBtns.length; k++) {
          allBtns[k].disabled = true;
          if (parseInt(allBtns[k].getAttribute('data-index'), 10) === correct) {
            allBtns[k].classList.add('correct');
          }
        }

        if (selected === correct) {
          this.classList.add('correct');
          state.score++;
        } else {
          this.classList.add('wrong');
        }

        PepperLib.Analytics.log('trivia_answer', {
          activity: activeActivity.id,
          question: state.currentQuestion,
          selected: selected,
          correct: correct,
          isCorrect: selected === correct
        });

        setTimeout(function () {
          state.currentQuestion++;
          if (state.currentQuestion < questions.length) {
            renderQuestion();
          } else {
            renderResult();
          }
        }, 1300);
      });
    }
  }

  function renderResult() {
    var questionEl = document.getElementById('events-question');
    var resultEl = document.getElementById('events-result');
    var introEl = document.getElementById('events-intro');
    var total = activeActivity.content.questions.length;
    var percentage = Math.round((state.score / total) * 100);
    var messageKey = percentage >= 80 ? 'events.result_great' : percentage >= 50 ? 'events.result_good' : 'events.result_ok';
    var html = '';

    if (introEl) introEl.classList.add('hidden');
    if (questionEl) questionEl.classList.add('hidden');
    if (!resultEl) return;

    html += '<article class="events-result-card">';
    html += '  <span class="events-result-kicker">' + getLangText(activeActivity.title) + '</span>';
    html += '  <div class="events-result-score">' + state.score + '/' + total + '</div>';
    html += '  <div class="events-result-label" data-i18n="' + messageKey + '">' + PepperLib.i18n.t(messageKey) + '</div>';
    html += '  <div class="events-result-actions">';
    html += '    <button class="btn btn--primary" id="btn-trivia-replay" data-i18n="events.play_again">' + PepperLib.i18n.t('events.play_again') + '</button>';
    html += '    <button class="btn btn--secondary" id="btn-trivia-menu" data-i18n="events.back_menu">' + PepperLib.i18n.t('events.back_menu') + '</button>';
    html += '  </div>';
    html += '</article>';

    resultEl.classList.remove('hidden');
    resultEl.innerHTML = html;

    document.getElementById('btn-trivia-replay').addEventListener('click', function () {
      startActivity(activeActivity.id);
    });
    document.getElementById('btn-trivia-menu').addEventListener('click', function () {
      renderLibrary();
    });

    PepperLib.Analytics.count('events', 'trivia_completed');
    PepperLib.Analytics.log('trivia_completed', { activity: activeActivity.id, score: state.score, total: total });
  }

  PepperLib.State.registerScreen('events', {
    init: function () {},

    onEnter: function () {
      PepperLib.Inactivity.reset();
      loadActivities().then(function () {
        renderLibrary();
      });
    },

    onExit: function () {
      activeActivity = null;
      state.currentQuestion = 0;
      state.score = 0;
      state.answered = false;
    }
  });
})();
