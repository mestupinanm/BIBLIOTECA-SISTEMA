/* ============================================
   EVENTS / TRIVIA SCREEN
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var TRIVIA = [
    {
      q: { es: 'En que piso se encuentra la Sala de Ciencias e Ingenieria?', en: 'On which floor is the Science and Engineering Room located?' },
      options: {
        es: ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'],
        en: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4']
      },
      correct: 1
    },
    {
      q: { es: 'Cuantas salas de estudio tiene esta seccion de la biblioteca?', en: 'How many study rooms does this section of the library have?' },
      options: {
        es: ['4', '6', '8', '10'],
        en: ['4', '6', '8', '10']
      },
      correct: 2
    },
    {
      q: { es: 'Como se llama el sistema de bibliotecas de la Universidad de los Andes?', en: 'What is the name of the Universidad de los Andes library system?' },
      options: {
        es: ['SIBILA', 'IRUS', 'OPAC', 'ALEPH'],
        en: ['SIBILA', 'IRUS', 'OPAC', 'ALEPH']
      },
      correct: 1
    },
    {
      q: { es: 'Cual es el horario de la biblioteca de lunes a viernes?', en: 'What are the library hours Monday through Friday?' },
      options: {
        es: ['8 AM - 6 PM', '7 AM - 9 PM', '9 AM - 8 PM', '6 AM - 10 PM'],
        en: ['8 AM - 6 PM', '7 AM - 9 PM', '9 AM - 8 PM', '6 AM - 10 PM']
      },
      correct: 1
    },
    {
      q: { es: 'Que robot te esta asistiendo ahora mismo?', en: 'Which robot is assisting you right now?' },
      options: {
        es: ['NAO', 'Pepper', 'Spot', 'Atlas'],
        en: ['NAO', 'Pepper', 'Spot', 'Atlas']
      },
      correct: 1
    }
  ];

  var state = {
    currentQuestion: 0,
    score: 0,
    answered: false
  };

  function renderIntro() {
    var introEl = document.getElementById('events-intro');
    var questionEl = document.getElementById('events-question');
    var resultEl = document.getElementById('events-result');

    if (introEl) {
      introEl.classList.remove('hidden');
      introEl.innerHTML =
        '<div class="events-intro-icon">' +
        '  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>' +
        '  </svg>' +
        '</div>' +
        '<h1 class="events-intro-title" data-i18n="events.trivia_title">' + PepperLib.i18n.t('events.trivia_title') + '</h1>' +
        '<p class="events-intro-desc" data-i18n="events.trivia_desc">' + PepperLib.i18n.t('events.trivia_desc') + '</p>' +
        '<button class="btn btn--primary" id="btn-trivia-start" data-i18n="events.start">' + PepperLib.i18n.t('events.start') + '</button>';

      var btnStart = document.getElementById('btn-trivia-start');
      if (btnStart) {
        btnStart.addEventListener('click', function () {
          state.currentQuestion = 0;
          state.score = 0;
          state.answered = false;
          renderQuestion();
        });
      }
    }
    if (questionEl) questionEl.classList.add('hidden');
    if (resultEl) resultEl.classList.add('hidden');
  }

  function renderQuestion() {
    var introEl = document.getElementById('events-intro');
    var questionEl = document.getElementById('events-question');
    var resultEl = document.getElementById('events-result');

    if (introEl) introEl.classList.add('hidden');
    if (questionEl) questionEl.classList.remove('hidden');
    if (resultEl) resultEl.classList.add('hidden');

    var lang = PepperLib.State.language;
    var q = TRIVIA[state.currentQuestion];
    var total = TRIVIA.length;
    var progress = ((state.currentQuestion) / total) * 100;

    var html =
      '<div class="trivia-progress">' +
      '  <span class="trivia-score">' + PepperLib.i18n.t('events.question') + ' ' + (state.currentQuestion + 1) + ' ' + PepperLib.i18n.t('events.of') + ' ' + total + '</span>' +
      '  <div class="trivia-progress-bar"><div class="trivia-progress-fill" style="width:' + progress + '%"></div></div>' +
      '  <span class="trivia-score">' + PepperLib.i18n.t('events.score') + ': ' + state.score + '</span>' +
      '</div>' +
      '<div class="trivia-question-text">' + (q.q[lang] || q.q['es']) + '</div>' +
      '<div class="trivia-answers">';

    var options = q.options[lang] || q.options['es'];
    for (var i = 0; i < options.length; i++) {
      html += '<button class="trivia-answer-btn" data-index="' + i + '">' + options[i] + '</button>';
    }

    html += '</div>';

    questionEl.innerHTML = html;
    state.answered = false;

    // Attach answer handlers
    var answerBtns = questionEl.querySelectorAll('.trivia-answer-btn');
    for (var j = 0; j < answerBtns.length; j++) {
      answerBtns[j].addEventListener('click', function () {
        if (state.answered) return;
        state.answered = true;

        var selected = parseInt(this.getAttribute('data-index'));
        var correct = q.correct;

        // Disable all buttons
        var allBtns = questionEl.querySelectorAll('.trivia-answer-btn');
        for (var k = 0; k < allBtns.length; k++) {
          allBtns[k].classList.add('disabled');
          if (parseInt(allBtns[k].getAttribute('data-index')) === correct) {
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
          question: state.currentQuestion,
          selected: selected,
          correct: correct,
          isCorrect: selected === correct
        });

        // Auto advance after 1.5s
        setTimeout(function () {
          state.currentQuestion++;
          if (state.currentQuestion < TRIVIA.length) {
            renderQuestion();
          } else {
            renderResult();
          }
        }, 1500);
      });
    }
  }

  function renderResult() {
    var introEl = document.getElementById('events-intro');
    var questionEl = document.getElementById('events-question');
    var resultEl = document.getElementById('events-result');

    if (introEl) introEl.classList.add('hidden');
    if (questionEl) questionEl.classList.add('hidden');
    if (resultEl) resultEl.classList.remove('hidden');

    var total = TRIVIA.length;
    var percentage = Math.round((state.score / total) * 100);

    var messageKey;
    if (percentage >= 80) messageKey = 'events.result_great';
    else if (percentage >= 50) messageKey = 'events.result_good';
    else messageKey = 'events.result_ok';

    resultEl.innerHTML =
      '<div class="events-result-score">' + state.score + '/' + total + '</div>' +
      '<div class="events-result-label" data-i18n="' + messageKey + '">' + PepperLib.i18n.t(messageKey) + '</div>' +
      '<div style="display:flex;gap:16px;justify-content:center">' +
      '  <button class="btn btn--primary" id="btn-trivia-replay" data-i18n="events.play_again">' + PepperLib.i18n.t('events.play_again') + '</button>' +
      '  <button class="btn btn--secondary" id="btn-trivia-menu" data-i18n="events.back_menu">' + PepperLib.i18n.t('events.back_menu') + '</button>' +
      '</div>';

    var btnReplay = document.getElementById('btn-trivia-replay');
    if (btnReplay) {
      btnReplay.addEventListener('click', function () {
        state.currentQuestion = 0;
        state.score = 0;
        state.answered = false;
        renderQuestion();
      });
    }

    var btnMenu = document.getElementById('btn-trivia-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', function () {
        PepperLib.State.go(PepperLib.SCREENS.FEEDBACK);
      });
    }

    PepperLib.Analytics.log('trivia_completed', { score: state.score, total: total });
  }

  PepperLib.State.registerScreen('events', {
    init: function () {},

    onEnter: function () {
      PepperLib.Inactivity.reset();
      renderIntro();
    },

    onExit: function () {
      state.currentQuestion = 0;
      state.score = 0;
      state.answered = false;
    }
  });
})();
