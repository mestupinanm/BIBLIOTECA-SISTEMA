/* ============================================
   INTERNATIONALIZATION (i18n)
   Spanish (es) and English (en)
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  PepperLib.i18n = {
    strings: {
      es: {
        // Navigation
        'nav.back': 'Volver',

        // Idle
        'idle.hint': 'Toca la pantalla para comenzar',

        // Help
        'help.button': 'Ayuda',
        'help.title': 'Necesitas ayuda?',
        'help.message': 'Un bibliotecario ha sido notificado y vendra a asistirte. Por favor espera aqui.',
        'help.dismiss': 'Cerrar',
        'help.location_unknown': 'No registrada',

        // Menu
        'menu.title': 'Como puedo ayudarte?',
        'menu.navigation': 'A donde voy?',
        'menu.navigation.desc': 'Te guio a tu destino',
        'menu.shelves': 'Buscar libro',
        'menu.shelves.desc': 'Busca por tema en las estanterias',
        'menu.books': 'Servicios de libros',
        'menu.books.desc': 'Prestamo y devolucion',
        'menu.info': 'Informacion',
        'menu.info.desc': 'Horarios, noticias y preguntas',
        'menu.events': 'Eventos',
        'menu.events.desc': 'Trivia y actividades',

        // Navigation screen
        'nav.you_are_here': 'Aqui estas',
        'nav.your_dest': 'Tu destino',
        'nav.screen_title': 'Selecciona un destino',
        'nav.cat.rooms': 'Salas de estudio',
        'nav.cat.services': 'Servicios',
        'nav.cat.access': 'Accesos',
        'nav.guide_me': 'Llevame',
        'nav.done': 'Listo',
        'nav.directions': 'Indicaciones',
        'nav.map_label': 'Mapa del piso',
        'nav.quick_hint': 'Elige un destino y te mostrare la ruta en el mapa',

        // Destinations
        'dest.reception': 'Recepcion',
        'dest.elevator': 'Ascensor',
        'dest.stairs_main': 'Escaleras principales',
        'dest.stairs_emergency': 'Escaleras de emergencia',
        'dest.restroom_m': 'Bano hombres',
        'dest.restroom_f': 'Bano mujeres',
        'dest.room_251': 'Sala 251',
        'dest.room_254': 'Sala 254',
        'dest.room_255a': 'Sala 255A',
        'dest.room_255b': 'Sala 255B',
        'dest.room_255c': 'Sala 255C',
        'dest.room_255d': 'Sala 255D',
        'dest.room_257': 'Sala 257',
        'dest.room_ml253': 'Sala multimedia ML-253',
        'dest.book_lift': 'Subidor de libros',
        'dest.reference': 'Referencia',
        'dest.col_engineering': 'Ingenieria',
        'dest.col_sciences': 'Ciencias',
        'dest.col_humanities': 'Humanidades',
        'dest.col_social': 'Ciencias sociales',
        'dest.col_arts': 'Artes',
        'dest.entry_exit': 'Entrada / Salida',
        'dest.equipment_workshop': 'Taller de equipos',

        // Books
        'books.screen_title': 'Servicios de libros',
        'books.borrow': 'Prestamo',
        'books.borrow_desc': 'Quiero pedir un libro',
        'books.return': 'Devolucion',
        'books.return_desc': 'Quiero devolver un libro',
        'books.borrow_title': 'Prestamo de libros',
        'books.borrow_message': 'Para solicitar un prestamo, por favor dirigete a Recepcion donde un bibliotecario te asistira, o utiliza la estacion de autoservicio.',
        'books.return_title': 'Devolucion de libros',
        'books.return_message': 'Para devolver un libro, por favor dirigete a Recepcion o utiliza el buzon de devolucion disponible en el primer piso.',
        'books.go_reception': 'Llevame a Recepcion',
        'books.back_options': 'Volver a opciones',
        'books.hero_eyebrow': 'Servicios disponibles',
        'books.hero_title': 'Prestamo y devolucion sin perderte',
        'books.hero_copy': 'Selecciona lo que quieres hacer y te mostrare los pasos mas claros para continuar en la biblioteca.',

        // Info
        'info.screen_title': 'Informacion',
        'info.hours': 'Horarios',
        'info.news': 'Noticias',
        'info.faq': 'Preguntas frecuentes',
        'info.today': 'Hoy',
        'info.news_title': 'Noticias Uniandes',
        'info.news_copy': 'Consulta las noticias mas recientes directamente desde el portal oficial de la Universidad.',
        'info.news_cta': 'Abrir noticias',
        'info.news_hint': 'Si el panel no carga, usa este acceso directo.',
        'info.hours_value': '7:00 AM - 9:00 PM',
        'info.day_mon': 'Lunes',
        'info.day_tue': 'Martes',
        'info.day_wed': 'Miercoles',
        'info.day_thu': 'Jueves',
        'info.day_fri': 'Viernes',
        'info.day_sat': 'Sabado',
        'info.day_sun': 'Domingo',
        'info.closed': 'Cerrado',

        // Events
        'events.screen_title': 'Eventos',
        'events.trivia_title': 'Trivia de la Biblioteca',
        'events.trivia_desc': 'Pon a prueba tus conocimientos sobre la biblioteca y la universidad. 5 preguntas rapidas!',
        'events.start': 'Comenzar',
        'events.question': 'Pregunta',
        'events.of': 'de',
        'events.score': 'Puntos',
        'events.next': 'Siguiente',
        'events.result_title': 'Resultado final',
        'events.result_great': 'Excelente!',
        'events.result_good': 'Bien hecho!',
        'events.result_ok': 'Sigue intentando!',
        'events.play_again': 'Jugar de nuevo',
        'events.back_menu': 'Volver al menu',
        'events.select_activity': 'Elige una actividad',
        'events.available_now': 'Disponible ahora',
        'events.coming_soon': 'Proximamente',
        'events.badge_trivia': 'Trivia',
        'events.badge_game': 'Juego',
        'events.library_arcade': 'Zona de eventos',

        // Shelves search
        'shelves.screen_title': 'Buscar libro por tema',
        'shelves.panel_hint': 'Toca una estanteria para ver sus temas',
        'shelves.search_placeholder': 'Busca un tema...',
        'shelves.search_meta_default': 'Explora las estanterias o escribe un tema.',
        'shelves.search_results': 'resultados',
        'shelves.search_empty': 'No encontramos coincidencias. Intenta con otra palabra clave.',
        'shelves.select_hint': 'Selecciona una estanteria para ver su ubicacion',
        'shelves.shelf_label': 'Estanteria',
        'shelves.section_label': 'Seccion',
        'shelves.no_results': 'Sin resultados para tu busqueda',
        'shelves.topics_count': 'temas',
        'shelves.view_topics': 'Ver temas',
        'shelves.hide_topics': 'Ocultar temas',
        'shelves.tap_topic': 'Toca un tema para ver la ubicacion',

        // Feedback
        'feedback.title': 'Como fue tu experiencia?',
        'feedback.bad': 'Mala',
        'feedback.ok': 'Regular',
        'feedback.great': 'Buena',
        'feedback.excelente': 'Excelente',
        'feedback.bueno': 'Bueno',
        'feedback.regular': 'Regular',
        'feedback.malo': 'Malo',
        'feedback.pesimo': 'Pesimo',
        'feedback.thanks': 'Gracias por tu opinion!',
        'feedback.caption': 'Tu opinion ayuda a que Nova atienda mejor',
        'feedback.comment_prompt': 'Quieres agregar algun comentario? (opcional)',
        'feedback.comment_placeholder': 'Escribe aqui tu comentario...',
        'feedback.send': 'Enviar'
      },

      en: {
        // Navigation
        'nav.back': 'Back',

        // Idle
        'idle.hint': 'Touch the screen to start',

        // Help
        'help.button': 'Help',
        'help.title': 'Need help?',
        'help.message': 'A librarian has been notified and will come to assist you. Please wait here.',
        'help.dismiss': 'Close',
        'help.location_unknown': 'Not recorded',

        // Menu
        'menu.title': 'How can I help you?',
        'menu.navigation': 'Where do I go?',
        'menu.navigation.desc': 'I\'ll guide you there',
        'menu.shelves': 'Find a book',
        'menu.shelves.desc': 'Browse by topic on the shelves',
        'menu.books': 'Book services',
        'menu.books.desc': 'Borrow and return',
        'menu.info': 'Information',
        'menu.info.desc': 'Hours, news, and FAQs',
        'menu.events': 'Events',
        'menu.events.desc': 'Trivia and activities',

        // Navigation screen
        'nav.you_are_here': 'You are here',
        'nav.your_dest': 'Your destination',
        'nav.screen_title': 'Select a destination',
        'nav.cat.rooms': 'Study rooms',
        'nav.cat.services': 'Services',
        'nav.cat.access': 'Access points',
        'nav.guide_me': 'Guide me',
        'nav.done': 'Done',
        'nav.directions': 'Directions',
        'nav.map_label': 'Floor map',
        'nav.quick_hint': 'Choose a destination and I will show the route on the map',

        // Destinations
        'dest.reception': 'Reception',
        'dest.elevator': 'Elevator',
        'dest.stairs_main': 'Main stairs',
        'dest.stairs_emergency': 'Emergency stairs',
        'dest.restroom_m': 'Men\'s restroom',
        'dest.restroom_f': 'Women\'s restroom',
        'dest.room_251': 'Room 251',
        'dest.room_254': 'Room 254',
        'dest.room_255a': 'Room 255A',
        'dest.room_255b': 'Room 255B',
        'dest.room_255c': 'Room 255C',
        'dest.room_255d': 'Room 255D',
        'dest.room_257': 'Room 257',
        'dest.room_ml253': 'Multimedia room ML-253',
        'dest.book_lift': 'Book lift',
        'dest.reference': 'Reference',
        'dest.col_engineering': 'Engineering',
        'dest.col_sciences': 'Sciences',
        'dest.col_humanities': 'Humanities',
        'dest.col_social': 'Social sciences',
        'dest.col_arts': 'Arts',
        'dest.entry_exit': 'Entry / Exit',
        'dest.equipment_workshop': 'Equipment workshop',

        // Books
        'books.screen_title': 'Book services',
        'books.borrow': 'Borrow',
        'books.borrow_desc': 'I want to borrow a book',
        'books.return': 'Return',
        'books.return_desc': 'I want to return a book',
        'books.borrow_title': 'Book borrowing',
        'books.borrow_message': 'To borrow a book, please go to Reception where a librarian will assist you, or use the self-checkout station.',
        'books.return_title': 'Book return',
        'books.return_message': 'To return a book, please go to Reception or use the return drop-box available on the first floor.',
        'books.go_reception': 'Take me to Reception',
        'books.back_options': 'Back to options',
        'books.hero_eyebrow': 'Available services',
        'books.hero_title': 'Borrowing and returns without the guesswork',
        'books.hero_copy': 'Choose what you need and I will show the clearest next step inside the library.',

        // Info
        'info.screen_title': 'Information',
        'info.hours': 'Hours',
        'info.news': 'News',
        'info.faq': 'Frequently asked questions',
        'info.today': 'Today',
        'info.news_title': 'Uniandes news',
        'info.news_copy': 'Check the latest stories directly from the official Universidad de los Andes news portal.',
        'info.news_cta': 'Open news',
        'info.news_hint': 'If the panel does not load, use this direct access.',
        'info.hours_value': '7:00 AM - 9:00 PM',
        'info.day_mon': 'Monday',
        'info.day_tue': 'Tuesday',
        'info.day_wed': 'Wednesday',
        'info.day_thu': 'Thursday',
        'info.day_fri': 'Friday',
        'info.day_sat': 'Saturday',
        'info.day_sun': 'Sunday',
        'info.closed': 'Closed',

        // Events
        'events.screen_title': 'Events',
        'events.trivia_title': 'Library Trivia',
        'events.trivia_desc': 'Test your knowledge about the library and the university. 5 quick questions!',
        'events.start': 'Start',
        'events.question': 'Question',
        'events.of': 'of',
        'events.score': 'Score',
        'events.next': 'Next',
        'events.result_title': 'Final result',
        'events.result_great': 'Excellent!',
        'events.result_good': 'Well done!',
        'events.result_ok': 'Keep trying!',
        'events.play_again': 'Play again',
        'events.back_menu': 'Back to menu',
        'events.select_activity': 'Choose an activity',
        'events.available_now': 'Available now',
        'events.coming_soon': 'Coming soon',
        'events.badge_trivia': 'Trivia',
        'events.badge_game': 'Game',
        'events.library_arcade': 'Events arcade',

        // Shelves search
        'shelves.screen_title': 'Find book by topic',
        'shelves.panel_hint': 'Tap a shelf to see its topics',
        'shelves.search_placeholder': 'Search a topic...',
        'shelves.search_meta_default': 'Browse the shelves or type a topic.',
        'shelves.search_results': 'results',
        'shelves.search_empty': 'No matches found. Try another keyword.',
        'shelves.select_hint': 'Select a shelf to see its location',
        'shelves.shelf_label': 'Shelf',
        'shelves.section_label': 'Section',
        'shelves.no_results': 'No results for your search',
        'shelves.topics_count': 'topics',
        'shelves.view_topics': 'View topics',
        'shelves.hide_topics': 'Hide topics',
        'shelves.tap_topic': 'Tap a topic to see its location',

        // Feedback
        'feedback.title': 'How was your experience?',
        'feedback.bad': 'Bad',
        'feedback.ok': 'Okay',
        'feedback.great': 'Great',
        'feedback.excelente': 'Excellent',
        'feedback.bueno': 'Good',
        'feedback.regular': 'Okay',
        'feedback.malo': 'Bad',
        'feedback.pesimo': 'Very bad',
        'feedback.thanks': 'Thank you for your feedback!',
        'feedback.caption': 'Your feedback helps Nova assist better',
        'feedback.comment_prompt': 'Would you like to add a comment? (optional)',
        'feedback.comment_placeholder': 'Write your comment here...',
        'feedback.send': 'Send'
      }
    },

    t: function (key) {
      var lang = PepperLib.State ? PepperLib.State.language : 'es';
      return (this.strings[lang] && this.strings[lang][key]) ||
             (this.strings['es'] && this.strings['es'][key]) ||
             key;
    },

    applyToDOM: function () {
      var elements = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < elements.length; i++) {
        elements[i].textContent = this.t(elements[i].getAttribute('data-i18n'));
      }

      var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
      for (var j = 0; j < placeholders.length; j++) {
        placeholders[j].setAttribute('placeholder', this.t(placeholders[j].getAttribute('data-i18n-placeholder')));
      }
    }
  };
})();
