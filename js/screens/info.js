/* ============================================
   INFO SCREEN - Hours, News, FAQs
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

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

  var NEWS = [
    {
      date: '2026-03-25',
      title: { es: 'Nuevos recursos electronicos disponibles', en: 'New electronic resources available' },
      body: { es: 'La biblioteca ha incorporado nuevas bases de datos academicas. Consulta en recepcion para mas detalles.', en: 'The library has added new academic databases. Ask at reception for details.' }
    },
    {
      date: '2026-03-20',
      title: { es: 'Taller de busqueda bibliografica', en: 'Bibliographic search workshop' },
      body: { es: 'Inscribete al taller gratuito sobre busqueda en bases de datos. Proximo martes a las 3 PM en la Sala 255A.', en: 'Sign up for the free workshop on database searching. Next Tuesday at 3 PM in Room 255A.' }
    },
    {
      date: '2026-03-15',
      title: { es: 'Horario extendido en semana de parciales', en: 'Extended hours during exam week' },
      body: { es: 'Durante la semana de parciales, la biblioteca abrira hasta las 10 PM de lunes a viernes.', en: 'During exam week, the library will be open until 10 PM Monday through Friday.' }
    }
  ];

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

  var currentTab = 'hours';

  function renderTab(tab) {
    currentTab = tab;
    var content = document.getElementById('info-content');
    if (!content) return;

    var lang = PepperLib.State.language;

    // Update tab buttons
    var tabs = document.querySelectorAll('.info-tab');
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].classList.toggle('active', tabs[t].getAttribute('data-tab') === tab);
    }

    var html = '';

    if (tab === 'hours') {
      var today = new Date().getDay(); // 0=Sun, 1=Mon...
      var todayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0 index
      var todaySchedule = HOURS.schedule[todayIndex];
      var todayTime = todaySchedule.closedKey
        ? PepperLib.i18n.t(todaySchedule.closedKey)
        : todaySchedule.time;

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

    } else if (tab === 'news') {
      html += '<div class="news-iframe-wrap">';
      html += '<iframe src="https://www.uniandes.edu.co/es/noticias?page=1" ' +
              'title="Noticias Universidad de los Andes" ' +
              'sandbox="allow-scripts allow-same-origin allow-popups" ' +
              'scrolling="yes"></iframe>';
      html += '</div>';

    } else if (tab === 'faq') {
      for (var f = 0; f < FAQS.length; f++) {
        var faq = FAQS[f];
        html += '<div class="faq-item" data-faq="' + f + '">';
        html += '  <button class="faq-question">';
        html += '    <span>' + (faq.q[lang] || faq.q['es']) + '</span>';
        html += '    <svg class="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        html += '  </button>';
        html += '  <div class="faq-answer">' + (faq.a[lang] || faq.a['es']) + '</div>';
        html += '</div>';
      }

      // Attach FAQ toggle after rendering
      setTimeout(function () {
        var faqItems = document.querySelectorAll('.faq-item .faq-question');
        for (var q = 0; q < faqItems.length; q++) {
          faqItems[q].addEventListener('click', function () {
            var item = this.parentElement;
            item.classList.toggle('open');
            PepperLib.Analytics.log('faq_opened', { index: item.getAttribute('data-faq') });
          });
        }
      }, 0);
    }

    content.innerHTML = html;
  }

  PepperLib.State.registerScreen('info', {
    init: function () {
      // Tab click handlers
      var tabs = document.querySelectorAll('.info-tab');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function () {
          var tab = this.getAttribute('data-tab');
          renderTab(tab);
          PepperLib.Analytics.log('info_tab', { tab: tab });
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
