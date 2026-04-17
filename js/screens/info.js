/* ============================================
   INFO SCREEN - Hours, News, FAQs
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var NEWS_LINK = 'https://www.uniandes.edu.co/es/noticias';
  var HOURS = {
    schedule: [
      { dayKey: 'info.day_mon', time: '7:00 AM - 9:00 PM' },
      { dayKey: 'info.day_tue', time: '7:00 AM - 9:00 PM' },
      { dayKey: 'info.day_wed', time: '7:00 AM - 9:00 PM' },
      { dayKey: 'info.day_thu', time: '7:00 AM - 9:00 PM' },
      { dayKey: 'info.day_fri', time: '7:00 AM - 9:00 PM' },
      { dayKey: 'info.day_sat', time: '8:00 AM - 4:00 PM' },
      { dayKey: 'info.day_sun', closedKey: 'info.closed' }
    ]
  };
  var FAQS = [
    {
      q: { es: 'Como puedo prestar un libro?', en: 'How can I borrow a book?' },
      a: { es: 'Dirigete a Recepcion con tu carnet universitario. El personal te asistira con el proceso de prestamo. Tambien puedes usar la estacion de autoservicio.', en: 'Go to Reception with your university ID. Staff will assist you with the borrowing process. You can also use the self-checkout station.' }
    },
    {
      q: { es: 'Cuantos libros puedo tener prestados?', en: 'How many books can I have on loan?' },
      a: { es: 'Los estudiantes de pregrado pueden tener hasta 5 libros prestados simultaneamente. Estudiantes de posgrado pueden tener hasta 8.', en: 'Undergraduate students can have up to 5 books on loan simultaneously. Graduate students can have up to 8.' }
    },
    {
      q: { es: 'Donde estan los banos?', en: 'Where are the restrooms?' },
      a: { es: 'Los banos estan ubicados en el costado derecho de la biblioteca. Puedes usar la opcion "Adonde voy?" para que te guie.', en: 'The restrooms are located on the right side of the library. You can use the "Where do I go?" option for directions.' }
    },
    {
      q: { es: 'Puedo reservar una sala de estudio?', en: 'Can I reserve a study room?' },
      a: { es: 'Si, las salas de estudio se pueden reservar a traves del sistema IRUS o directamente en Recepcion.', en: 'Yes, study rooms can be reserved through the IRUS system or directly at Reception.' }
    },
    {
      q: { es: 'Hay impresoras disponibles?', en: 'Are printers available?' },
      a: { es: 'Si, hay impresoras disponibles para los estudiantes. Consulta en Recepcion sobre el servicio de impresion.', en: 'Yes, printers are available for students. Ask at Reception about the printing service.' }
    },
    {
      q: { es: 'Que hago si pierdo un libro prestado?', en: 'What if I lose a borrowed book?' },
      a: { es: 'Dirigete a Recepcion lo antes posible para reportar la perdida. El personal te indicara el procedimiento a seguir.', en: 'Go to Reception as soon as possible to report the loss. Staff will guide you through the procedure.' }
    }
  ];

  function renderHours() {
    var today = new Date().getDay();
    var todayIndex = today === 0 ? 6 : today - 1;
    var todaySchedule = HOURS.schedule[todayIndex];
    var todayTime = todaySchedule.closedKey ? PepperLib.i18n.t(todaySchedule.closedKey) : todaySchedule.time;
    var html = '';

    html += '<div class="hours-today">';
    html += '  <div class="hours-today-label" data-i18n="info.today">' + PepperLib.i18n.t('info.today') + '</div>';
    html += '  <div class="hours-today-value">' + todayTime + '</div>';
    html += '</div>';
    html += '<div class="hours-week">';

    for (var d = 0; d < HOURS.schedule.length; d++) {
      var day = HOURS.schedule[d];
      var isToday = d === todayIndex;
      var time = day.closedKey ? PepperLib.i18n.t(day.closedKey) : day.time;
      html += '<div class="hours-day' + (isToday ? ' today' : '') + '">';
      html += '  <span class="hours-day-name" data-i18n="' + day.dayKey + '">' + PepperLib.i18n.t(day.dayKey) + '</span>';
      html += '  <span class="hours-day-time">' + time + '</span>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderNews() {
    var html = '';
    html += '<section class="news-panel">';
    html += '  <div class="news-panel-copy">';
    html += '    <h3 data-i18n="info.news_title">' + PepperLib.i18n.t('info.news_title') + '</h3>';
    html += '    <p data-i18n="info.news_copy">' + PepperLib.i18n.t('info.news_copy') + '</p>';
    html += '    <a class="btn btn--primary" id="btn-news-open" href="' + NEWS_LINK + '" target="_blank" rel="noopener noreferrer" data-i18n="info.news_cta">' + PepperLib.i18n.t('info.news_cta') + '</a>';
    html += '    <span class="news-panel-hint" data-i18n="info.news_hint">' + PepperLib.i18n.t('info.news_hint') + '</span>';
    html += '  </div>';
    html += '  <div class="news-direct-card">';
    html += '    <div class="news-direct-pill">uniandes.edu.co</div>';
    html += '    <h4>' + NEWS_LINK + '</h4>';
    html += '    <p data-i18n="info.news_copy">' + PepperLib.i18n.t('info.news_copy') + '</p>';
    html += '    <div class="news-direct-actions">';
    html += '      <a class="news-direct-link" href="' + NEWS_LINK + '" target="_blank" rel="noopener noreferrer">' + NEWS_LINK + '</a>';
    html += '    </div>';
    html += '  </div>';
    html += '</section>';
    return html;
  }

  function renderFaq() {
    var lang = PepperLib.State.language;
    var html = '<div class="faq-list">';

    for (var i = 0; i < FAQS.length; i++) {
      html += '<article class="faq-item" data-faq="' + i + '">';
      html += '  <button class="faq-question">';
      html += '    <span>' + (FAQS[i].q[lang] || FAQS[i].q.es) + '</span>';
      html += '    <svg class="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      html += '  </button>';
      html += '  <div class="faq-answer">' + (FAQS[i].a[lang] || FAQS[i].a.es) + '</div>';
      html += '</article>';
    }

    html += '</div>';
    return html;
  }

  function bindFaqToggles() {
    var buttons = document.querySelectorAll('.faq-item .faq-question');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var item = this.parentElement;
        item.classList.toggle('open');
        var idx = item.getAttribute('data-faq');
        PepperLib.Analytics.count('info_faq', 'faq_' + idx);
      });
    }
  }

  function renderTab(tab) {
    var content = document.getElementById('info-content');
    var tabs = document.querySelectorAll('.info-tab');
    var html = '';

    if (!content) return;

    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tab);
    }

    if (tab === 'hours') html = renderHours();
    if (tab === 'news') html = renderNews();
    if (tab === 'faq') html = renderFaq();

    content.innerHTML = html;
    if (tab === 'faq') bindFaqToggles();
  }

  var TAB_SERVICE_MAP = {
    'hours': 'Información',
    'news':  'Noticias',
    'faq':   'Preguntas frecuentes'
  };

  PepperLib.State.registerScreen('info', {
    init: function () {
      var tabs = document.querySelectorAll('.info-tab');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function () {
          var tab = this.getAttribute('data-tab');
          renderTab(tab);
          PepperLib.Analytics.count('info', 'tab_' + tab);
          PepperLib.LastAction = PepperLib.i18n.t('info.screen_title') + ' — ' + PepperLib.i18n.t('info.' + tab);
          PepperLib.LastActionItem = 'tab_' + tab;
          PepperLib.LastActionCategory = 'info';
          PepperLib.Analytics.insertInformacion(TAB_SERVICE_MAP[tab] || tab);
        });
      }
    },

    onEnter: function () {
      PepperLib.Inactivity.reset();
      renderTab('hours');
    },

    onExit: function () {}
  });
})();
