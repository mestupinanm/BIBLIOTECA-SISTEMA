(function () {
  'use strict';

  var DATA = window.LibraryData || {};
  var PepperLib = window.PepperLib || {};
  var PepperRobot = window.PepperRobot || {};
  var NEWS_LINK = 'https://www.uniandes.edu.co/es/noticias';
  var NEWS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
  var FALLBACK_ACTIVITIES = [
    {
      id: 'library-trivia',
      type: 'trivia',
      enabled: true,
      title: { es: 'Trivia de la biblioteca', en: 'Library trivia' },
      description: {
        es: 'Pon a prueba tus conocimientos sobre la biblioteca y la universidad.',
        en: 'Test your knowledge about the library and the university.'
      },
      cta: { es: 'Comenzar', en: 'Start' },
      content: {
        questions: [
          {
            question: {
              es: 'En que piso se encuentra la sala de ciencias e ingenieria?',
              en: 'On which floor is the science and engineering room located?'
            },
            options: {
              es: ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'],
              en: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4']
            },
            correct: 1
          },
          {
            question: {
              es: 'En que ano fue fundada la Universidad de los Andes?',
              en: 'In what year was Universidad de los Andes founded?'
            },
            options: {
              es: ['1948', '1956', '1972', '1986'],
              en: ['1948', '1956', '1972', '1986']
            },
            correct: 0
          },
          {
            question: {
              es: 'Cuantas salas de estudio tiene este piso de la biblioteca?',
              en: 'How many study rooms does this floor of the library have?'
            },
            options: {
              es: ['8', '10', '11', '12'],
              en: ['8', '10', '11', '12']
            },
            correct: 3
          },
          {
            question: {
              es: 'Quien lidero la fundacion de la Universidad de los Andes?',
              en: 'Who led the founding of Universidad de los Andes?'
            },
            options: {
              es: ['Mario Laserna Pinzon', 'Alberto Lleras Camargo', 'Ramon de Zubiria', 'Gabriel Garcia Marquez'],
              en: ['Mario Laserna Pinzon', 'Alberto Lleras Camargo', 'Ramon de Zubiria', 'Gabriel Garcia Marquez']
            },
            correct: 0
          },
          {
            question: {
              es: 'Como se llama el robot que te esta asistiendo?',
              en: 'What is the name of the robot assisting you?'
            },
            options: {
              es: ['NAO', 'Pepper', 'Nova', 'Atlas'],
              en: ['NAO', 'Pepper', 'Nova', 'Atlas']
            },
            correct: 2
          },
          {
            question: {
              es: 'Como puedes reservar una sala de estudio?',
              en: 'How can you reserve a study room?'
            },
            options: {
              es: ['Por el portal web o codigo QR', 'Solo por telefono', 'Solo en el piso 4', 'Enviando un correo'],
              en: ['Through the web portal or QR code', 'Only by phone', 'Only on floor 4', 'By sending an email']
            },
            correct: 0
          },
          {
            question: {
              es: 'Como se llama la mascota iconica de Uniandes?',
              en: 'What is the name of Uniandes\' iconic mascot?'
            },
            options: {
              es: ['Seneca', 'Monserrate', 'Rubik', 'Nova'],
              en: ['Seneca', 'Monserrate', 'Rubik', 'Nova']
            },
            correct: 0
          },
          {
            question: {
              es: 'Que herramienta ayuda a ubicar un libro en la estanteria?',
              en: 'Which tool helps you locate a book on the shelves?'
            },
            options: {
              es: ['GPS Bibliográfico', 'Cineteca', 'Sala Rubik', 'Buzon de devolucion'],
              en: ['Bibliographic GPS', 'Film library', 'Rubik room', 'Return box']
            },
            correct: 0
          }
        ]
      }
    },
    {
      id: 'author-memory',
      type: 'memory',
      enabled: true,
      title: { es: 'Memoria de autores', en: 'Author memory' },
      description: {
        es: 'Empareja autores con sus obras mas conocidas.',
        en: 'Match authors with their best-known works.'
      },
      cta: { es: 'Comenzar', en: 'Start' },
      content: {
        pairs: [
          { author: 'Gabriel Garcia Marquez', work: { es: 'Cien anos de soledad', en: 'One Hundred Years of Solitude' } },
          { author: 'Jane Austen', work: { es: 'Orgullo y prejuicio', en: 'Pride and Prejudice' } },
          { author: 'Miguel de Cervantes', work: { es: 'Don Quijote', en: 'Don Quixote' } },
          { author: 'Mary Shelley', work: { es: 'Frankenstein', en: 'Frankenstein' } }
        ]
      }
    },
    {
      id: 'science-wordsearch',
      type: 'wordsearch',
      enabled: false,
      title: { es: 'Encuentra la palabra', en: 'Find the word' },
      description: {
        es: 'Encuentra los terminos escondidos en una grilla. Disponible muy pronto!',
        en: 'Find hidden terms in a grid. Available very soon.'
      },
      cta: { es: 'Proximamente', en: 'Coming soon' },
      content: {
        grid: ['ROBOTABCDE', 'FGHIJLIBRO', 'CIENCIAKLM', 'NOPDATOSQR', 'STUMAPAVWX', 'YZASALABCD', 'EFGHIJKLMN', 'OPQRSTUVWX', 'YZABCDEFGH', 'IJKLMNOPQR'],
        words: [
          { answer: 'ROBOT', label: { es: 'Robot', en: 'Robot' } },
          { answer: 'LIBRO', label: { es: 'Libro', en: 'Book' } },
          { answer: 'CIENCIA', label: { es: 'Ciencia', en: 'Science' } },
          { answer: 'DATOS', label: { es: 'Datos', en: 'Data' } },
          { answer: 'MAPA', label: { es: 'Mapa', en: 'Map' } },
          { answer: 'SALA', label: { es: 'Sala', en: 'Room' } }
        ]
      }
    }
  ];

  window.PepperLib = PepperLib;

  PepperLib.LastAction = null;
  PepperLib.LastActionItem = null;
  PepperLib.LastActionCategory = null;
  PepperLib.CurrentGeneralId = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function addClass(element, className) {
    if (!element) {
      return;
    }
    if (element.classList) {
      element.classList.add(className);
      return;
    }
    if ((' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1) {
      element.className += (element.className ? ' ' : '') + className;
    }
  }

  function removeClass(element, className) {
    if (!element) {
      return;
    }
    if (element.classList) {
      element.classList.remove(className);
      return;
    }
    element.className = (' ' + element.className + ' ').replace(' ' + className + ' ', ' ').replace(/^\s+|\s+$/g, '');
  }

  function toggleClass(element, className, enabled) {
    if (enabled) {
      addClass(element, className);
    } else {
      removeClass(element, className);
    }
  }


  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripAccents(value) {
    return String(value || '')
      .replace(/[ÁÀÂÄ]/g, 'A')
      .replace(/[áàâä]/g, 'a')
      .replace(/[ÉÈÊË]/g, 'E')
      .replace(/[éèêë]/g, 'e')
      .replace(/[ÍÌÎÏ]/g, 'I')
      .replace(/[íìîï]/g, 'i')
      .replace(/[ÓÒÔÖ]/g, 'O')
      .replace(/[óòôö]/g, 'o')
      .replace(/[ÚÙÛÜ]/g, 'U')
      .replace(/[úùûü]/g, 'u')
      .replace(/[Ñ]/g, 'N')
      .replace(/[ñ]/g, 'n');
  }

  function normalizeText(value) {
    return stripAccents(value).toLowerCase();
  }


  function xhrRequest(method, url, headers, body, onSuccess, onError) {
    var request;
    try {
      request = new XMLHttpRequest();
      request.open(method, url, true);

      if (headers) {
        var headerName;
        for (headerName in headers) {
          if (headers.hasOwnProperty(headerName)) {
            request.setRequestHeader(headerName, headers[headerName]);
          }
        }
      }

      request.onreadystatechange = function () {
        if (request.readyState !== 4) { return; }
        if (request.status === 0) { return; }
        if (request.status >= 200 && request.status < 300) {
          if (onSuccess) { onSuccess(request.responseText, request); }
          return;
        }
        if (onError) { onError(request); }
      };

      request.onerror = function () {
        if (onError) { onError(request); }
      };

      request.send(body || null);
    } catch (e) {
      if (onError) { try { onError(null); } catch (ignored) {} }
    }
  }

  function xhrJson(method, url, headers, bodyObject, onSuccess, onError) {
    var requestHeaders = headers || {};
    var serialised = null;
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    try {
      serialised = bodyObject ? JSON.stringify(bodyObject) : null;
    } catch (e) {
      if (onError) { try { onError(null); } catch (ignored) {} }
      return;
    }
    xhrRequest(method, url, requestHeaders, serialised, function (text, request) {
      var payload = null;
      try { payload = text ? JSON.parse(text) : null; } catch (e) { payload = null; }
      if (onSuccess) { onSuccess(payload, request); }
    }, onError);
  }

  PepperLib.i18n = {
    t: function (key, lang) {
      var language = lang || PepperLib.State.language;
      if (DATA.STRINGS && DATA.STRINGS[language] && DATA.STRINGS[language][key]) {
        return DATA.STRINGS[language][key];
      }
      if (DATA.STRINGS && DATA.STRINGS.es && DATA.STRINGS.es[key]) {
        return DATA.STRINGS.es[key];
      }
      return key;
    },

    applyToDOM: function () {
      var i;
      var nodes = document.querySelectorAll('[data-i18n]');
      var placeholders = document.querySelectorAll('[data-i18n-placeholder]');

      for (i = 0; i < nodes.length; i++) {
        nodes[i].textContent = this.t(nodes[i].getAttribute('data-i18n'));
      }

      for (i = 0; i < placeholders.length; i++) {
        placeholders[i].setAttribute('placeholder', this.t(placeholders[i].getAttribute('data-i18n-placeholder')));
      }
    }
  };

  PepperLib.SCREENS = {
    IDLE: 'idle',
    GREETING: 'greeting',
    MENU: 'menu',
    NAVIGATION: 'navigation',
    NAVIGATION_GUIDE: 'navigation-guide',
    SHELVES: 'shelves',
    BOOKS: 'books',
    INFO: 'info',
    EVENTS: 'events',
    FEEDBACK: 'feedback'
  };

  PepperLib.State = {
    current: null,
    params: {},
    history: [],
    language: 'es',
    session: null,
    screens: {},

    registerScreen: function (name, handler) {
      this.screens[name] = handler;
    },

    createSession: function () {
      return {
        id: 'S' + new Date().getTime() + Math.random().toString(36).substr(2, 4),
        startTime: new Date().toISOString(),
        language: this.language,
        screensVisited: [],
        destinationsRequested: []
      };
    },

    clearHistory: function () {
      this.history = [];
    },

    startSession: function () {
      this.session = this.createSession();
      this.session.language = this.language;
      PepperLib.CurrentGeneralId = null;
      PepperLib.Analytics.log('session_start', {});
    },

    endSession: function () {
      if (this.session) {
        PepperLib.Analytics.log('session_end', {
          duration: new Date().getTime() - new Date(this.session.startTime).getTime()
        });
        PepperLib.Analytics.flush();
      }

      this.session = null;
      this.history = [];
      PepperLib.CurrentGeneralId = null;
      PepperLib.LastAction = null;
      PepperLib.LastActionItem = null;
      PepperLib.LastActionCategory = null;
    },

    setLanguage: function (lang) {
      var currentScreen;
      this.language = lang || 'es';
      byId('lang-label').textContent = this.language === 'es' ? 'EN' : 'ES';
      PepperLib.i18n.applyToDOM();
      currentScreen = this.screens[this.current];
      if (currentScreen && typeof currentScreen.onLanguageChange === 'function') {
        currentScreen.onLanguageChange();
      }
      PepperLib.Analytics.log('language_change', { language: this.language });
    },

    go: function (screenName, params, options) {
      var oldScreenName = this.current;
      var oldScreen = this.screens[oldScreenName];
      var newScreen = this.screens[screenName];
      var oldEl = oldScreenName ? byId('screen-' + oldScreenName) : null;
      var newEl = byId('screen-' + screenName);
      var pushHistory = !options || options.pushHistory !== false;

      if (oldScreenName === screenName) {
        this.params = params || {};
        if (newScreen && typeof newScreen.onEnter === 'function') {
          newScreen.onEnter(this.params);
        }
        return;
      }

      if (oldScreen && typeof oldScreen.onExit === 'function') {
        oldScreen.onExit();
      }

      if (oldScreenName && oldScreenName !== PepperLib.SCREENS.IDLE && oldScreenName !== PepperLib.SCREENS.GREETING && pushHistory) {
        this.history.push({
          screen: oldScreenName,
          params: this.params
        });
      }

      if (oldEl) {
        removeClass(oldEl, 'active');
        removeClass(oldEl, 'with-topbar');
      }

      this.current = screenName;
      this.params = params || {};
      this.updateChrome();

      if (newEl) {
        addClass(newEl, 'active');
        if (DATA.TOPBAR_SCREENS && DATA.TOPBAR_SCREENS.indexOf(screenName) !== -1) {
          addClass(newEl, 'with-topbar');
        }
      }

      PepperLib.i18n.applyToDOM();

      if (newScreen && typeof newScreen.onEnter === 'function') {
        newScreen.onEnter(this.params);
      }

      PepperLib.Analytics.log('screen_view', {
        screen: screenName
      });
    },

    back: function () {
      var previous;

      if (!this.history.length) {
        this.go(PepperLib.SCREENS.MENU, {}, { pushHistory: false });
        return;
      }

      previous = this.history.pop();
      this.go(previous.screen, previous.params || {}, { pushHistory: false });
    },

    updateChrome: function () {
      var topbar = byId('topbar');
      var backButton = byId('btn-back');
      var showTopbar = DATA.TOPBAR_SCREENS && DATA.TOPBAR_SCREENS.indexOf(this.current) !== -1;

      toggleClass(topbar, 'hidden', !showTopbar);

      if (backButton) {
        if (this.current === PepperLib.SCREENS.MENU || this.current === PepperLib.SCREENS.FEEDBACK) {
          backButton.style.visibility = 'hidden';
        } else {
          backButton.style.visibility = 'visible';
        }
      }

    }
  };

  PepperLib.Inactivity = {
    timer: null,
    TIMEOUT_MS: 60000,

    reset: function () {
      clearTimeout(this.timer);
      if (PepperLib.State.current !== PepperLib.SCREENS.IDLE && PepperLib.State.current !== PepperLib.SCREENS.GREETING) {
        this.timer = setTimeout(function () {
          PepperLib.Inactivity.onTimeout();
        }, this.TIMEOUT_MS);
      }
    },

    stop: function () {
      clearTimeout(this.timer);
      this.timer = null;
    },

    onTimeout: function () {
      if (PepperLib.State.current !== PepperLib.SCREENS.IDLE &&
          PepperLib.State.current !== PepperLib.SCREENS.GREETING &&
          PepperLib.State.current !== PepperLib.SCREENS.FEEDBACK) {
        PepperLib.State.go(PepperLib.SCREENS.FEEDBACK, {}, { pushHistory: false });
      } else {
        PepperLib.State.endSession();
        PepperLib.State.go(PepperLib.SCREENS.IDLE, {}, { pushHistory: false });
      }
    }
  };

  PepperLib.Analytics = {
    STORAGE_KEY: 'pepper_analytics',
    buffer: [],

    localEvent: function (type, data) {
      this.buffer.push({
        timestamp: new Date().toISOString(),
        session: PepperLib.State.session ? PepperLib.State.session.id : null,
        type: type,
        data: data || {},
        language: PepperLib.State.language
      });
    },

    authHeaders: function () {
      if (!DATA.SUPABASE || !DATA.SUPABASE.url || !DATA.SUPABASE.key) {
        return null;
      }

      return {
        apikey: DATA.SUPABASE.key,
        Authorization: 'Bearer ' + DATA.SUPABASE.key,
        Prefer: 'return=representation'
      };
    },

    rpc: function (name, payload, onSuccess, onError) {
      var headers = this.authHeaders();
      if (!headers) {
        if (onError) {
          onError();
        }
        return;
      }

      xhrJson('POST', DATA.SUPABASE.url + '/rest/v1/rpc/' + name, headers, payload, function (response) {
        if (onSuccess) {
          onSuccess(response);
        }
      }, onError);
    },

    insert: function (tableName, row, onSuccess, onError) {
      var headers = this.authHeaders();
      if (!headers) {
        if (onError) {
          onError();
        }
        return;
      }

      xhrJson('POST', DATA.SUPABASE.url + '/rest/v1/' + tableName, headers, row, function (response) {
        if (onSuccess) {
          onSuccess(response);
        }
      }, onError);
    },

    insertAndSelectId: function (tableName, row, onSuccess, onError) {
      var headers = this.authHeaders();
      if (!headers) {
        if (onError) {
          onError();
        }
        return;
      }

      headers.Prefer = 'return=representation';
      xhrJson('POST', DATA.SUPABASE.url + '/rest/v1/' + tableName + '?select=id', headers, row, function (response) {
        if (onSuccess) {
          if (response && response.length && response[0] && response[0].id) {
            onSuccess(response[0].id);
            return;
          }
          onSuccess(null);
        }
      }, onError);
    },

    count: function (category, item) {
      this.localEvent('counter', {
        category: category,
        item: item
      });

      this.rpc('increment_counter', {
        p_category: category,
        p_item: item
      });
    },

    log: function (eventType, data) {
      data = data || {};

      if (eventType === 'book_service' && data.action) {
        this.count('books', data.action);
      } else if (eventType === 'destination_request' && data.destination) {
        this.count('navigation', data.destination);
      } else if (eventType === 'shelf_selected' && data.shelf) {
        this.count('shelves', 'shelf_' + data.shelf);
      } else if (eventType === 'info_tab' && data.tab) {
        this.count('info', 'tab_' + data.tab);
      } else if (eventType === 'faq_opened' && typeof data.index !== 'undefined') {
        this.count('info_faq', 'faq_' + data.index);
      } else if (eventType === 'feedback' && data.rating) {
        this.count('feedback', data.rating);
      } else if (eventType === 'trivia_completed') {
        this.count('events', 'trivia_completed');
      }

      this.localEvent(eventType, data);
    },

    insertFeedback: function (rating) {
      this.insert('session_feedback', {
        session_id: PepperLib.State.session ? PepperLib.State.session.id : null,
        rating: rating,
        action_label: PepperLib.LastAction || null,
        action_item: PepperLib.LastActionItem || null,
        action_cat: PepperLib.LastActionCategory || null,
        language: PepperLib.State.language
      });
    },

    insertGeneralInteraction: function (category, callback) {
      this.insertAndSelectId('interacciones_generales', {
        categoria: category
      }, function (id) {
        PepperLib.CurrentGeneralId = id || null;
        if (callback) {
          callback(id || null);
        }
      }, function () {
        if (callback) {
          callback(null);
        }
      });
    },

    insertNavegacion: function (destino, especificacion, eleccion) {
      this.insert('navegacion', {
        id_general: PepperLib.CurrentGeneralId || null,
        destino: destino,
        especificacion: especificacion,
        eleccion: eleccion
      });
    },

    insertBuscarLibro: function (numeroEstanteria, tema, eleccion) {
      this.insert('buscar_libro', {
        id_general: PepperLib.CurrentGeneralId || null,
        numero_estanteria: numeroEstanteria ? parseInt(numeroEstanteria, 10) : null,
        tema: tema || null,
        eleccion: eleccion
      });
    },

    insertServiciosLibros: function (tipo, eleccion) {
      this.insert('servicios_libros', {
        id_general: PepperLib.CurrentGeneralId || null,
        tipo: tipo,
        eleccion: eleccion
      });
    },

    insertInformacion: function (servicio) {
      this.insert('informacion', {
        id_general: PepperLib.CurrentGeneralId || null,
        servicio: servicio
      });
    },

    insertEventos: function (actividad) {
      this.insert('eventos', {
        id_general: PepperLib.CurrentGeneralId || null,
        actividad: actividad
      });
    },

    insertCalidadServicio: function (puntuacion, comentarios) {
      this.insert('calidad_servicio', {
        puntuacion: puntuacion,
        comentarios: comentarios || null,
        id_caso: PepperLib.CurrentGeneralId || null
      });
    },

    flush: function () {
      var existing;
      var combined;

      if (!this.buffer.length) {
        return;
      }

      try {
        existing = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        combined = existing.concat(this.buffer);
        if (combined.length > 500) {
          combined = combined.slice(combined.length - 500);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(combined));
      } catch (error) {
      }

      this.buffer = [];
    }
  };

  PepperLib.Help = {
    getLocationLabel: function () {
      if (PepperLib.LastAction) {
        return PepperLib.LastAction;
      }
      return PepperLib.i18n.t((DATA.SCREEN_TITLES && DATA.SCREEN_TITLES[PepperLib.State.current]) || 'menu.title');
    },

    buildEmailPayload: function () {
      var config = DATA.HELP_CONFIG || {};
      var lastAction = this.getLocationLabel() || PepperLib.i18n.t('help.location_unknown');
      return {
        recipient: config.recipient || 'm.estupinanm@uniandes.edu.co',
        lastAction: lastAction,
        message: 'Soy ' + (config.senderName || 'Nova') + ' y necesito ayuda. Mi ultima peticion fue: ' + lastAction + '.'
      };
    },

    sendEmail: function (onSuccess, onError) {
      var config = DATA.HELP_CONFIG || {};
      var payload = this.buildEmailPayload();
      var form;
      var iframe;
      var hiddenFields;
      var endpoint;
      var fieldName;

      endpoint = 'https://formsubmit.co/' + encodeURIComponent(payload.recipient);
      iframe = document.createElement('iframe');
      iframe.name = 'pepper-help-target';
      iframe.id = 'pepper-help-target';
      iframe.className = 'hidden';
      document.body.appendChild(iframe);

      form = document.createElement('form');
      form.method = 'POST';
      form.action = endpoint;
      form.target = 'pepper-help-target';
      form.className = 'hidden';

      hiddenFields = {
        name: config.senderName || 'Nova',
        subject: (config.formsubmit && config.formsubmit.subject ? config.formsubmit.subject : 'Nova necesita ayuda') + ' - ' + payload.lastAction,
        message: payload.message,
        _captcha: config.formsubmit && config.formsubmit.captcha === false ? 'false' : 'true',
        _template: config.formsubmit && config.formsubmit.template ? config.formsubmit.template : 'table',
        _next: 'about:blank'
      };

      for (fieldName in hiddenFields) {
        if (hiddenFields.hasOwnProperty(fieldName)) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = fieldName;
          input.value = hiddenFields[fieldName];
          form.appendChild(input);
        }
      }

      document.body.appendChild(form);

      try {
        form.submit();
        if (onSuccess) {
          onSuccess({ method: 'form_post' });
        }
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }

      setTimeout(function () {
        if (form && form.parentNode) {
          form.parentNode.removeChild(form);
        }
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2500);
    }
  };

  PepperLib.Utils = {
    getBogotaNow: function () {
      var now = new Date();
      var utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      return new Date(utcTime + (-5 * 60 * 60000));
    },

    getMapSrc: function () {
      return PepperLib.State.language === 'en' ? DATA.MAP_IMAGE_EN : DATA.MAP_IMAGE_ES;
    },

    getAssetPath: function (relativePath) {
      var prefix = window.location.pathname.indexOf('/src/') !== -1 ? '../assets/' : './assets/';
      return prefix + relativePath;
    },

    getFeedbackImagePath: function (rating) {
      return this.getAssetPath('images/feedback-' + rating + '.png');
    },

    buildMarker: function (x, y, type) {
      var markerType = type || 'marker-dest';
      return '<div class="map-marker ' + markerType + '" style="left:' + x + '%;top:' + y + '%;">' +
        '<div class="map-marker-core"></div>' +
        '<div class="map-marker-pulse"></div>' +
        '<div class="map-marker-pulse map-marker-pulse--delayed"></div>' +
        '</div>';
    },

    setLastAction: function (label, item, category) {
      PepperLib.LastAction = label || null;
      PepperLib.LastActionItem = item || null;
      PepperLib.LastActionCategory = category || null;
    }
  };

  (function registerIdleScreen() {
    var clockTimer = null;
    var weekdaysEs = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    var monthsEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    function updateClock() {
      var clock = byId('idle-clock');
      var date = byId('idle-date');
      var now = PepperLib.Utils.getBogotaNow();
      var hours = now.getHours();
      var minutes = now.getMinutes();
      var suffix = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours || 12;

      if (clock) {
        clock.textContent = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + suffix;
      }

      if (date) {
        date.textContent = weekdaysEs[now.getDay()] + ', ' + now.getDate() + ' de ' + monthsEs[now.getMonth()] + ' de ' + now.getFullYear();
      }
    }

    PepperLib.State.registerScreen('idle', {
      init: function () {
        byId('screen-idle').onclick = function () {
          PepperLib.State.go(PepperLib.SCREENS.GREETING);
        };
        updateClock();
      },

      onEnter: function () {
        PepperLib.Inactivity.stop();
        updateClock();
        clockTimer = setInterval(updateClock, 1000);
      },

      onExit: function () {
        clearInterval(clockTimer);
        clockTimer = null;
      }
    });
  })();

  (function registerGreetingScreen() {
    PepperLib.State.registerScreen('greeting', {
      init: function () {
        var buttons = document.querySelectorAll('.greeting-lang-btn');
        var i;

        for (i = 0; i < buttons.length; i++) {
          buttons[i].onclick = function () {
            PepperLib.State.setLanguage(this.getAttribute('data-lang'));
            PepperLib.State.startSession();
            PepperLib.State.go(PepperLib.SCREENS.MENU, {}, { pushHistory: false });
          };
        }
      },

      onEnter: function () {
        PepperLib.Inactivity.stop();
        PepperRobot.speak('Hola! Bienvenido a la biblioteca.');
      },

      onExit: function () {
      }
    });
  })();

  (function registerMenuScreen() {
    PepperLib.State.registerScreen('menu', {
      init: function () {
        var cards = document.querySelectorAll('.menu-card');
        var i;

        for (i = 0; i < cards.length; i++) {
          cards[i].onclick = function () {
            var target = this.getAttribute('data-target');
            var category = DATA.MENU_CATEGORIES && DATA.MENU_CATEGORIES[target] ? DATA.MENU_CATEGORIES[target] : target;

            PepperLib.Analytics.insertGeneralInteraction(category, function () {
              PepperLib.State.go(target);
            });
          };
        }
      },

      onEnter: function () {
        PepperLib.Inactivity.reset();
        PepperLib.State.clearHistory();
        PepperLib.Utils.setLastAction(PepperLib.i18n.t('menu.title'), 'menu', 'menu');
      },

      onExit: function () {
      }
    });
  })();

  (function registerNavigationScreen() {
    function getNavigationIcon(categoryId) {
      if (categoryId === 'rooms') {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>';
      }
      if (categoryId === 'services') {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
      }
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
    }

    function renderCategories() {
      var categories = DATA.NAV_CATEGORIES || [];
      var container = byId('nav-categories');
      var html = '';
      var i;
      var j;
      var items;

      if (!container) {
        return;
      }

      for (i = 0; i < categories.length; i++) {
        items = categories[i].items || [];
        html += '<section class="nav-category" data-cat="' + categories[i].id + '">';
        html += '<header class="nav-category-header">';
        html += '<div class="nav-category-badge">' + getNavigationIcon(categories[i].id) + '</div>';
        html += '<div class="nav-category-copy">';
        html += '<h3 data-i18n="' + categories[i].titleKey + '">' + PepperLib.i18n.t(categories[i].titleKey) + '</h3>';
        html += '<p data-i18n="nav.quick_hint">' + PepperLib.i18n.t('nav.quick_hint') + '</p>';
        html += '</div>';
        html += '</header>';
        html += '<div class="nav-category-items">';

        for (j = 0; j < items.length; j++) {
          html += '<button class="nav-item" data-dest="' + items[j].id + '">';
          html += '<span class="nav-item-name" data-i18n="' + items[j].nameKey + '">' + PepperLib.i18n.t(items[j].nameKey) + '</span>';
          html += '</button>';
        }

        html += '</div>';
        html += '</section>';
      }

      container.innerHTML = html;

      var buttons = container.querySelectorAll('.nav-item');
      for (i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function () {
          var destinationId = this.getAttribute('data-dest');
          PepperLib.Analytics.log('destination_request', {
            destination: destinationId
          });
          PepperLib.State.go(PepperLib.SCREENS.NAVIGATION_GUIDE, {
            destination: destinationId
          });
        };
      }
    }

    PepperLib.State.registerScreen('navigation', {
      init: function () {
        renderCategories();
      },

      onEnter: function () {
        PepperLib.Inactivity.reset();
        renderCategories();
        PepperLib.Utils.setLastAction(PepperLib.i18n.t('nav.screen_title'), 'navigation', 'navigation');
      },

      onExit: function () {
      }
    });
  })();

  (function registerNavigationGuideScreen() {
    var currentDestination = null;
    var simulationTimers = [];

    function clearSimulationTimers() {
      while (simulationTimers.length) {
        clearTimeout(simulationTimers.pop());
      }
    }

    function getDestinationLabel(destinationId) {
      return PepperLib.i18n.t('dest.' + destinationId);
    }

    function getMapDestinationLabel(destinationId) {
      var mapKey = 'dest.map.' + destinationId;
      var mapLabel = PepperLib.i18n.t(mapKey);
      return mapLabel === mapKey ? getDestinationLabel(destinationId) : mapLabel;
    }

    function getShortLabel(destinationId) {
      return getMapDestinationLabel(destinationId).replace(/^Sala\s+/i, '').replace(/^Room\s+/i, '');
    }

    function renderGuide(destinationId) {
      var destinationEl = byId('guide-destination');
      var roomCodeEl = byId('guide-room-code');
      var mapImage = byId('guide-map-img');
      var markers = byId('guide-map-markers');
      var here = DATA.MAP_COORDS ? DATA.MAP_COORDS.you_are_here : null;
      var dest = DATA.MAP_COORDS ? DATA.MAP_COORDS[destinationId] : null;
      var html = '';
      var points;
      var i;

      if (destinationEl) {
        destinationEl.textContent = getMapDestinationLabel(destinationId);
      }

      if (roomCodeEl) {
        roomCodeEl.textContent = getShortLabel(destinationId);
      }

      if (mapImage) {
        mapImage.src = PepperLib.Utils.getMapSrc();
      }

      if (markers) {
        if (here) {
          html += PepperLib.Utils.buildMarker(here.x, here.y, 'marker-here');
        }
        if (dest) {
          points = Object.prototype.toString.call(dest) === '[object Array]' ? dest : [dest];
          for (i = 0; i < points.length; i++) {
            html += PepperLib.Utils.buildMarker(points[i].x, points[i].y, 'marker-dest');
          }
        } else if (window.console && window.console.warn) {
          window.console.warn('[Navigation] No MAP_COORDS entry for destination:', destinationId);
        }
        markers.innerHTML = html;
      }
    }


    function showNavigationNotice(text, onDone) {
      var overlay = byId('guide-sim-overlay');
      var message = byId('guide-sim-msg');
      var timer;

      if (!overlay) {
        if (onDone) {
          onDone();
        }
        return;
      }

      clearSimulationTimers();
      if (message) {
        message.textContent = text;
      }
      removeClass(overlay, 'hidden');

      timer = setTimeout(function () {
        addClass(overlay, 'hidden');
        if (onDone) {
          onDone();
        }
      }, 2200);
      simulationTimers.push(timer);
    }

    var PRE_NAV_SCRIPT = {
      config: { name: 'inicio_navegacion', language: 'Spanish', stepDelay: 100 },
      steps: [
        {
          speech: 'Lo siento si me demoro un poco,',
          animation: 'BodyTalk/Speaking/BodyTalk_2',
          screen: { type: 'subtitle', content: '' }
        },
        {
          speech: 'es que estoy chiquita y aun aprendiendo a caminar sola',
          animation: 'Emotions/Neutral/AskForAttention_3',
          screen: { type: 'subtitle', content: '' }
        }
      ]
    };

    function updatePreNavSubtitle(text) {
      var el = byId('pre-nav-text');
      if (el) {
        el.textContent = text;
      }
    }

    function executeScript(script, onComplete) {
      var steps = script && script.steps ? script.steps : [];
      var idx = 0;

      function next() {
        if (idx >= steps.length) {
          if (onComplete) { onComplete(); }
          return;
        }

        var step = steps[idx++];
        updatePreNavSubtitle(step.speech);

        if (step.animation) {
          PepperRobot.animate(step.animation);
        }

        PepperRobot.speakAndWait(step.speech, function () {
          setTimeout(next, (script.config && script.config.stepDelay) || 100);
        });
      }

      next();
    }

    PepperLib.State.registerScreen('navigation-guide', {
      init: function () {
        byId('btn-guide-me').onclick = function () {
          var category;
          var categoryLabel;

          if (!currentDestination) {
            return;
          }

          category = (DATA.NAV_DEST_CATEGORIES && DATA.NAV_DEST_CATEGORIES[currentDestination]) || 'navigation';
          categoryLabel = (DATA.DEST_CATEGORY_LABELS && DATA.DEST_CATEGORY_LABELS[category]) || category;
          PepperLib.Analytics.count('navigation', currentDestination);
          PepperLib.Analytics.insertNavegacion(categoryLabel, getShortLabel(currentDestination), 'Llevame');

          PepperRobot.setVolume(25);
          removeClass(byId('pre-nav-overlay'), 'hidden');

          executeScript(PRE_NAV_SCRIPT, function () {
            addClass(byId('pre-nav-overlay'), 'hidden');
            var overlay = byId('guide-sim-overlay');
            var message = byId('guide-sim-msg');
            if (overlay && message) {
              message.textContent = PepperLib.State.language === 'en' ? 'Navigating...' : 'Navegando...';
              removeClass(overlay, 'hidden');
            }

            if (!window.PepperRosNavigation) {
              if (overlay) addClass(overlay, 'hidden');
              console.error('[NAV ERROR] PepperRosNavigation no disponible al navegar.');
              return;
            }
            cancelArrivalPoll();
            navActive = true;
            PepperLib.Inactivity.stop();
            navStartTime = Date.now();
            window.PepperRosNavigation.setCurrentPlaceLocal('base', null, null);
            startNavClearLoop();
            try {
              window.PepperRosNavigation.navigateGraphToDestination(resolveGraphDest(currentDestination),
                function onSuccess(response, destination) {
                  navArrivalPoll = pollUntilArrived(resolveGraphDest(currentDestination),
                    function onArrived() {
                      if (overlay) { addClass(overlay, 'hidden'); }
                      PepperLib.Inactivity.reset();
                      showNavigationNotice(
                        PepperLib.State.language === 'en' ? 'We have arrived!' : '¡Llegamos!',
                        function () {
                          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK, {}, { pushHistory: false });
                        }
                      );
                    },
                    function onGiveUp() {
                      navActive = false;
                      startNavClearLoop();
                      PepperLib.Inactivity.reset();
                      if (overlay) { addClass(overlay, 'hidden'); }
                    }
                  );
                },
                function onError(errorString) {
                  cancelArrivalPoll();
                  navActive = false;
                  startNavClearLoop();
                  PepperLib.Inactivity.reset();
                  if (overlay) {
                    addClass(overlay, 'hidden');
                  }
                  console.error('[NAV ERROR] navigateGraphToDestination [' + currentDestination + ']:', errorString);
                }
              );
            } catch (e) {
              cancelArrivalPoll();
              navActive = false;
              startNavClearLoop();
              PepperLib.Inactivity.reset();
              if (overlay) addClass(overlay, 'hidden');
              console.error('[NAV ERROR] navigateGraphToDestination exception:', e);
            }
          });
        };

        byId('btn-guide-done').onclick = function () {
          var category;
          var categoryLabel;

          if (currentDestination) {
            category = (DATA.NAV_DEST_CATEGORIES && DATA.NAV_DEST_CATEGORIES[currentDestination]) || 'navigation';
            categoryLabel = (DATA.DEST_CATEGORY_LABELS && DATA.DEST_CATEGORY_LABELS[category]) || category;
            PepperLib.Analytics.count('navigation', currentDestination);
            PepperLib.Analytics.insertNavegacion(categoryLabel, getShortLabel(currentDestination), 'Listo');
          }

          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK, {}, { pushHistory: false });
        };
      },

      onEnter: function (params) {
        PepperLib.Inactivity.reset();
        clearSimulationTimers();
        currentDestination = params && params.destination ? params.destination : null;
        if (currentDestination) {
          renderGuide(currentDestination);
          PepperLib.Utils.setLastAction(getDestinationLabel(currentDestination), currentDestination, (DATA.NAV_DEST_CATEGORIES && DATA.NAV_DEST_CATEGORIES[currentDestination]) || 'navigation');
        }
      },

      onExit: function () {
        clearSimulationTimers();
        currentDestination = null;
        addClass(byId('guide-sim-overlay'), 'hidden');
      },

      onLanguageChange: function () {
        if (currentDestination) {
          renderGuide(currentDestination);
          PepperLib.Utils.setLastAction(getDestinationLabel(currentDestination), currentDestination, (DATA.NAV_DEST_CATEGORIES && DATA.NAV_DEST_CATEGORIES[currentDestination]) || 'navigation');
        }
      }
    });

    PepperLib.NavigationGuide = {
      getCurrentDestinationLabel: function () {
        return currentDestination ? getDestinationLabel(currentDestination) : null;
      }
    };
  })();

  (function registerShelvesScreen() {
    var shelfIndex = {};
    var activeShelf = null;
    var activeTopic = null;
    var searchTerm = '';

    function buildShelfIndex() {
      var topics = DATA.SHELF_TOPICS || [];
      var rowCounters = {};
      var i;
      var j;
      var entry;
      var rowIndex;
      var layout;
      var size;
      var normalizedEntry;

      shelfIndex = {};

      for (i = 0; i < topics.length; i++) {
        entry = topics[i];
        rowIndex = rowCounters[entry.shelf] || 0;
        layout = DATA.SHELF_SIZE_LAYOUT && DATA.SHELF_SIZE_LAYOUT[entry.shelf] ? DATA.SHELF_SIZE_LAYOUT[entry.shelf] : null;
        size = entry.size || (layout && layout[rowIndex]) || 'single';
        rowCounters[entry.shelf] = rowIndex + 1;

        normalizedEntry = {
          shelf: entry.shelf,
          size: size,
          coordKey: entry.size || layout ? ('shelf_' + entry.shelf + '_' + size) : (entry.coordKey || ('shelf_' + entry.shelf + '_' + size)),
          topics: entry.topics || []
        };

        if (!shelfIndex[entry.shelf]) {
          shelfIndex[entry.shelf] = {
            shelf: entry.shelf,
            coordKey: entry.coordKey,
            topics: [],
            entries: []
          };
        }

        shelfIndex[entry.shelf].entries.push(normalizedEntry);

        for (j = 0; j < normalizedEntry.topics.length; j++) {
          if (shelfIndex[entry.shelf].topics.indexOf(normalizedEntry.topics[j]) === -1) {
            shelfIndex[entry.shelf].topics.push(normalizedEntry.topics[j]);
          }
        }
      }
    }

    function topicBelongsToEntry(entry, topic) {
      var normalizedTopic = normalizeText(topic);
      var i;

      for (i = 0; i < entry.topics.length; i++) {
        if (normalizeText(entry.topics[i]) === normalizedTopic) {
          return true;
        }
      }

      return false;
    }

    function getShelfTopicLabel(topic) {
      if (PepperLib.State.language === 'en' && DATA.SHELF_TOPIC_TRANSLATIONS && DATA.SHELF_TOPIC_TRANSLATIONS[topic]) {
        return DATA.SHELF_TOPIC_TRANSLATIONS[topic];
      }
      return topic;
    }

    function topicMatchesQuery(topic, query) {
      return normalizeText(topic).indexOf(query) !== -1 || normalizeText(getShelfTopicLabel(topic)).indexOf(query) !== -1;
    }

    function getShelfEntryCoord(entry) {
      var coords = DATA.MAP_COORDS || {};
      var exact = coords[entry.coordKey];

      if (exact && typeof exact.x === 'number' && typeof exact.y === 'number') {
        return exact;
      }

      return null;
    }

    function getShelfTopicCoords(shelf, topic) {
      var entries = shelf && shelf.entries ? shelf.entries : [];
      var coords = [];
      var used = {};
      var i;
      var coord;
      var key;

      for (i = 0; i < entries.length; i++) {
        if (!topicBelongsToEntry(entries[i], topic)) {
          continue;
        }

        coord = getShelfEntryCoord(entries[i]);
        if (!coord) {
          continue;
        }

        key = entries[i].coordKey + ':' + coord.x + ':' + coord.y;
        if (!used[key]) {
          coords.push(coord);
          used[key] = true;
        }
      }

      return coords;
    }

    function filteredShelves() {
      var result = [];
      var numbers = DATA.SHELF_NUMBERS || [];
      var query = normalizeText(searchTerm);
      var i;
      var j;
      var shelf;
      var filteredTopics;

      for (i = 0; i < numbers.length; i++) {
        shelf = shelfIndex[numbers[i]];
        filteredTopics = [];

        if (!shelf) {
          continue;
        }

        if (!query) {
          filteredTopics = shelf.topics.slice();
        } else {
          for (j = 0; j < shelf.topics.length; j++) {
            if (topicMatchesQuery(shelf.topics[j], query)) {
              filteredTopics.push(shelf.topics[j]);
            }
          }
        }

        if (!query || filteredTopics.length) {
          result.push({
            shelf: shelf.shelf,
            coordKey: shelf.coordKey,
            topics: filteredTopics,
            allTopics: shelf.topics
          });
        }
      }

      return result;
    }

    function renderMap() {
      var shelf = activeShelf ? shelfIndex[activeShelf] : null;
      var hasDestination = activeShelf && activeTopic;
      var coords = hasDestination && shelf ? getShelfTopicCoords(shelf, activeTopic) : [];
      var hint = byId('shelves-map-hint');
      var actions = byId('shelves-info-actions');
      var guideButton = byId('btn-shelves-guide-me');
      var doneButton = byId('btn-shelves-done');
      var markers = byId('shelves-map-markers');
      var image = byId('shelves-map-img');
      var badge = byId('shelves-map-badge');
      var markerHtml = '';
      var i;

      if (image) {
        image.src = PepperLib.Utils.getMapSrc();
      }

      if (markers) {
        if (hasDestination && DATA.MAP_COORDS && DATA.MAP_COORDS.you_are_here) {
          markerHtml += PepperLib.Utils.buildMarker(DATA.MAP_COORDS.you_are_here.x, DATA.MAP_COORDS.you_are_here.y, 'marker-here');
        }
        for (i = 0; i < coords.length; i++) {
          markerHtml += PepperLib.Utils.buildMarker(coords[i].x, coords[i].y, 'marker-dest');
        }
        markers.innerHTML = markerHtml;
      }

      if (hint) {
        hint.textContent = '';
      }

      if (badge) {
        if (hasDestination) {
          badge.innerHTML = '<h2>' + PepperLib.i18n.t('shelves.shelf_label') + ' ' + activeShelf + '</h2>' +
            '<div class="shelves-map-badge-legend">' +
            '<small><i class="shelves-map-badge-dot shelves-map-badge-dot--here"></i>' + PepperLib.i18n.t('nav.you_are_here') + '</small>' +
            '<small><i class="shelves-map-badge-dot shelves-map-badge-dot--dest"></i>' + PepperLib.i18n.t('shelves.go_here') + '</small></div>';
          removeClass(badge, 'hidden');
        } else {
          badge.innerHTML = '';
          addClass(badge, 'hidden');
        }
      }

      removeClass(actions, 'hidden');
      if (guideButton) {
        guideButton.disabled = !hasDestination;
      }
      if (doneButton) {
        doneButton.disabled = !hasDestination;
      }
    }

    function renderShelfList() {
      var list = filteredShelves();
      var container = byId('shelves-list');
      var meta = byId('shelves-search-meta');
      var html = '';
      var i;
      var j;
      var shelf;
      var visibleTopics;
      var expanded;
      var buttons;
      var topicButtons;

      if (!container) {
        return;
      }

      if (!searchTerm) {
        meta.textContent = PepperLib.i18n.t('shelves.search_meta_default');
      } else if (!list.length) {
        meta.textContent = PepperLib.i18n.t('shelves.search_empty');
      } else {
        meta.textContent = list.length + ' ' + PepperLib.i18n.t('shelves.search_results');
      }

      if (!list.length) {
        container.innerHTML = '<div class="shelves-empty">' + PepperLib.i18n.t('shelves.search_empty') + '</div>';
        renderMap();
        return;
      }

      for (i = 0; i < list.length; i++) {
        shelf = list[i];
        visibleTopics = searchTerm ? shelf.topics : shelf.allTopics;
        expanded = searchTerm ? shelf.topics.length > 0 : activeShelf === shelf.shelf;

        html += '<article class="shelf-item' + (activeShelf === shelf.shelf ? ' active' : '') + '" data-shelf="' + shelf.shelf + '">';
        html += '<button class="shelf-item-header" data-shelf-toggle="' + shelf.shelf + '">';
        html += '<div class="shelf-item-num">' + shelf.shelf + '.</div>';
        html += '<div class="shelf-item-info">';
        html += '<div class="shelf-item-title">' + PepperLib.i18n.t('shelves.shelf_label') + '</div>';
        html += '<div class="shelf-item-subtitle">' + visibleTopics.length + ' ' + PepperLib.i18n.t('shelves.topics_count') + '</div>';
        html += '</div>';
        html += '<span class="shelf-item-cta" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg></span>';
        html += '</button>';

        if (expanded) {
          html += '<div class="shelf-item-body">';
          html += '<p class="shelf-item-helper">' + PepperLib.i18n.t('shelves.tap_topic') + '</p>';
          html += '<div class="shelf-topic-list">';
          for (j = 0; j < visibleTopics.length; j++) {
            html += '<button class="shelf-topic-tag' + (activeTopic === visibleTopics[j] ? ' is-active' : '') + '" data-shelf-topic="' + shelf.shelf + '" data-topic="' + escapeHtml(visibleTopics[j]) + '">' + escapeHtml(getShelfTopicLabel(visibleTopics[j])) + '</button>';
          }
          html += '</div>';
          html += '</div>';
        }

        html += '</article>';
      }

      container.innerHTML = html;

      buttons = container.querySelectorAll('[data-shelf-toggle]');
      for (i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function () {
          var shelfNumber = this.getAttribute('data-shelf-toggle');
          if (activeShelf === shelfNumber && !searchTerm) {
            activeShelf = null;
            activeTopic = null;
          } else {
            activeShelf = shelfNumber;
            activeTopic = null;
            PepperLib.Analytics.count('shelves', 'shelf_' + shelfNumber);
            PepperLib.Utils.setLastAction(PepperLib.i18n.t('shelves.shelf_label') + ' ' + shelfNumber, 'shelf_' + shelfNumber, 'shelves');
          }
          renderShelfList();
        };
      }

      topicButtons = container.querySelectorAll('[data-shelf-topic]');
      for (i = 0; i < topicButtons.length; i++) {
        topicButtons[i].onclick = function () {
          activeShelf = this.getAttribute('data-shelf-topic');
          activeTopic = this.getAttribute('data-topic');
          PepperLib.Utils.setLastAction(activeTopic + ' · ' + PepperLib.i18n.t('shelves.shelf_label') + ' ' + activeShelf, 'shelf_' + activeShelf, 'shelves');
          renderShelfList();
          PepperLib.Analytics.log('shelf_topic_selected', {
            shelf: activeShelf,
            topic: activeTopic
          });
        };
      }

      renderMap();
    }

    PepperLib.State.registerScreen('shelves', {
      init: function () {
        buildShelfIndex();

        byId('shelves-search').onkeyup = function () {
          searchTerm = this.value || '';
          activeShelf = null;
          activeTopic = null;
          renderShelfList();
        };

        byId('btn-shelves-guide-me').onclick = function () {
          if (!activeShelf || !activeTopic) {
            return;
          }
          PepperLib.Analytics.insertBuscarLibro(activeShelf, activeTopic, 'Llevame');
          if (!window.PepperRosNavigation) {
            console.error('[NAV ERROR] PepperRosNavigation no disponible (shelves).');
            return;
          }
          cancelArrivalPoll();
          navActive = true;
          PepperLib.Inactivity.stop();
          navStartTime = Date.now();
          window.PepperRosNavigation.setCurrentPlaceLocal('base', null, null);
          startNavClearLoop();
          window.PepperRosNavigation.navigateGraphToDestination(
            'shelf_' + activeShelf,
            function onSuccess() {
              navArrivalPoll = pollUntilArrived('shelf_' + activeShelf,
                function onArrived() {
                  PepperLib.Inactivity.reset();
                  PepperLib.State.go(PepperLib.SCREENS.FEEDBACK, {}, { pushHistory: false });
                },
                function onGiveUp() {
                  navActive = false;
                  startNavClearLoop();
                  PepperLib.Inactivity.reset();
                  console.error('[NAV ERROR] Robot no llego a shelf_' + activeShelf);
                }
              );
            },
            function onError(err) {
              cancelArrivalPoll();
              navActive = false;
              startNavClearLoop();
              PepperLib.Inactivity.reset();
              console.error('[NAV ERROR] navigateGraphToDestination [shelf_' + activeShelf + ']:', err);
            }
          );
        };

        byId('btn-shelves-done').onclick = function () {
          if (!activeShelf || !activeTopic) {
            return;
          }
          PepperLib.Analytics.insertBuscarLibro(activeShelf, activeTopic, 'Listo');
          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK, {}, { pushHistory: false });
        };
      },

      onEnter: function () {
        PepperLib.Inactivity.reset();
        buildShelfIndex();
        searchTerm = '';
        activeShelf = null;
        activeTopic = null;
        byId('shelves-search').value = '';
        PepperLib.Utils.setLastAction(PepperLib.i18n.t('shelves.screen_title'), 'shelves', 'shelves');
        renderShelfList();
      },

      onLanguageChange: function () {
        renderShelfList();
      },

      onExit: function () {
      }
    });
  })();

  (function registerBooksScreen() {
    var currentAction = null;

    function buildOptions() {
      var container = byId('books-options');
      if (!container) {
        return;
      }

      container.innerHTML =
        '<div class="books-shell">' +
        '<section class="books-hero">' +
        '<span class="books-hero-eyebrow" data-i18n="books.hero_eyebrow">' + PepperLib.i18n.t('books.hero_eyebrow') + '</span>' +
        '<h2 class="books-hero-title" data-i18n="books.hero_title">' + PepperLib.i18n.t('books.hero_title') + '</h2>' +
        '<p class="books-hero-copy" data-i18n="books.hero_copy">' + PepperLib.i18n.t('books.hero_copy') + '</p>' +
        '</section>' +
        '<div class="books-card-grid">' +
        '<button class="books-card books-card--borrow" data-action="borrow">' +
        '<div class="books-card-icon"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><polyline points="8 12 12 8 16 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg></div>' +
        '<div class="books-card-copy"><span class="books-card-label">' + PepperLib.i18n.t('books.borrow') + '</span><span class="books-card-desc">' + PepperLib.i18n.t('books.borrow_desc') + '</span></div>' +
        '<span class="books-card-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13"></path><path d="M13 7l5 5-5 5"></path></svg></span>' +
        '<span class="books-card-footer"><span>' + PepperLib.i18n.t('books.tap_continue') + '</span><em>01</em></span>' +
        '</button>' +
        '<button class="books-card books-card--return" data-action="return">' +
        '<div class="books-card-icon"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><polyline points="16 12 12 16 8 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg></div>' +
        '<div class="books-card-copy"><span class="books-card-label">' + PepperLib.i18n.t('books.return') + '</span><span class="books-card-desc">' + PepperLib.i18n.t('books.return_desc') + '</span></div>' +
        '<span class="books-card-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13"></path><path d="M13 7l5 5-5 5"></path></svg></span>' +
        '<span class="books-card-footer"><span>' + PepperLib.i18n.t('books.tap_continue') + '</span><em>02</em></span>' +
        '</button>' +
        '</div>' +
        '</div>';

      var cards = container.querySelectorAll('.books-card');
      var i;
      for (i = 0; i < cards.length; i++) {
        cards[i].onclick = function () {
          currentAction = this.getAttribute('data-action');
          PepperLib.Analytics.count('books', currentAction);
          renderDetail(currentAction);
        };
      }
    }

    function renderDetail(action) {
      var detail = byId('books-detail');
      var isBorrow = action === 'borrow';
      var titleKey = isBorrow ? 'books.borrow_title' : 'books.return_title';
      var msgKey = isBorrow ? 'books.borrow_message' : 'books.return_message';
      var actionLabel = PepperLib.i18n.t(isBorrow ? 'books.borrow' : 'books.return');
      var stepPrefix = isBorrow ? 'books.borrow_step_' : 'books.return_step_';

      addClass(byId('books-options'), 'hidden');
      removeClass(detail, 'hidden');

      PepperLib.Utils.setLastAction(PepperLib.i18n.t('books.screen_title') + ' — ' + actionLabel, action, 'books');

      detail.innerHTML =
        '<article class="books-detail-panel books-detail-panel--' + action + '">' +
        '<button class="books-detail-close" id="btn-books-close" aria-label="Cerrar">×</button>' +
        '<div class="books-detail-icon books-detail-icon--' + action + '"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' + (isBorrow ? '<polyline points="8 12 12 8 16 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line>' : '<polyline points="16 12 12 16 8 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line>') + '</svg></div>' +
        '<div class="books-detail-copy"><span class="books-detail-eyebrow">' + PepperLib.i18n.t('books.detail_eyebrow') + '</span><h2 class="books-detail-title">' + PepperLib.i18n.t(titleKey) + '</h2><p class="books-detail-message">' + PepperLib.i18n.t(msgKey) + '</p></div>' +
        '<div class="books-detail-steps">' +
        '<div class="books-detail-step"><span class="books-detail-step-num">01</span><strong>' + PepperLib.i18n.t(stepPrefix + '1_title') + '</strong><span>' + PepperLib.i18n.t(stepPrefix + '1_desc') + '</span></div>' +
        '<div class="books-detail-step"><span class="books-detail-step-num">02</span><strong>' + PepperLib.i18n.t(stepPrefix + '2_title') + '</strong><span>' + PepperLib.i18n.t(stepPrefix + '2_desc') + '</span></div>' +
        '<div class="books-detail-step"><span class="books-detail-step-num">03</span><strong>' + PepperLib.i18n.t(stepPrefix + '3_title') + '</strong><span>' + PepperLib.i18n.t(stepPrefix + '3_desc') + '</span></div>' +
        '</div>' +
        '<div class="books-detail-actions">' +
        '<button class="btn btn--secondary" id="btn-books-listo">' + PepperLib.i18n.t('nav.done') + '</button>' +
        '<button class="btn btn--primary" id="btn-books-llevame">' + PepperLib.i18n.t('books.go_reception') + '</button>' +
        '</div>' +
        '</article>';

      byId('btn-books-close').onclick = function () {
        resetBooks();
      };

      byId('btn-books-llevame').onclick = function () {
        var typeLabel = currentAction === 'borrow' ? 'Prestamo' : 'Devolucion';
        PepperLib.Analytics.insertServiciosLibros(typeLabel, 'Llevame');
        PepperLib.State.go(PepperLib.SCREENS.NAVIGATION_GUIDE, {
          destination: 'reception'
        });
      };

      byId('btn-books-listo').onclick = function () {
        var typeLabel = currentAction === 'borrow' ? 'Prestamo' : 'Devolucion';
        PepperLib.Analytics.insertServiciosLibros(typeLabel, 'Listo');
        PepperLib.State.go(PepperLib.SCREENS.MENU, {}, { pushHistory: false });
      };
    }

    function resetBooks() {
      currentAction = null;
      removeClass(byId('books-options'), 'hidden');
      addClass(byId('books-detail'), 'hidden');
      byId('books-detail').innerHTML = '';
    }

    PepperLib.State.registerScreen('books', {
      init: function () {},

      onEnter: function () {
        PepperLib.Inactivity.reset();
        buildOptions();
        resetBooks();
        PepperLib.Utils.setLastAction(PepperLib.i18n.t('books.screen_title'), 'books', 'books');
      },

      onLanguageChange: function () {
        if (currentAction) {
          renderDetail(currentAction);
        } else {
          buildOptions();
        }
      },

      onExit: function () {
        resetBooks();
      }
    });
  })();

  (function registerInfoScreen() {
    var activeTab = 'hours';
    var openFaq = {};
    var newsState = {
      items: [],
      page: 0,
      loading: false,
      error: '',
      hasMore: true
    };

    function normalizeNewsImageUrl(imageUrl) {
      if (!imageUrl) {
        return '';
      }
      if (imageUrl.charAt(0) === '/') {
        return 'https://www.uniandes.edu.co' + imageUrl;
      }
      return imageUrl;
    }

    function extractNewsCards(rawHtml) {
      var parser;
      var doc;
      var articles;
      var i;
      var article;
      var titleElement;
      var dateElement;
      var typeElement;
      var summaryElement;
      var linkElement;
      var imageElement;
      var imageUrl;
      var articleUrl;
      var items = [];
      var title;

      if (!window.DOMParser) {
        return [];
      }

      parser = new DOMParser();
      doc = parser.parseFromString(rawHtml, 'text/html');
      articles = doc.querySelectorAll('.card-container');

      for (i = 0; i < articles.length; i++) {
        article = articles[i];
        titleElement = article.querySelector('.ss3-cardTitle-sm-500');
        dateElement = article.querySelector('.ss3-cardDate-400');
        typeElement = article.querySelector('.ss3-tag-md-400');
        summaryElement = article.querySelector('p');
        linkElement = article.querySelector('a[href]');
        imageElement = article.querySelector('img');
        title = titleElement ? titleElement.textContent.replace(/^\s+|\s+$/g, '') : '';

        if (!title) {
          continue;
        }

        imageUrl = imageElement ? (imageElement.getAttribute('src') || imageElement.getAttribute('data-src') || '') : '';
        articleUrl = linkElement ? (linkElement.getAttribute('href') || '') : '';

        if (articleUrl && articleUrl.charAt(0) === '/') {
          articleUrl = 'https://www.uniandes.edu.co' + articleUrl;
        }

        items.push({
          id: 'news-' + i + '-' + title,
          title: title,
          contentType: typeElement ? typeElement.textContent.replace(/^\s+|\s+$/g, '') : '',
          publishedAt: dateElement ? dateElement.textContent.replace(/^\s+|\s+$/g, '') : '',
          imageUrl: normalizeNewsImageUrl(imageUrl),
          articleUrl: articleUrl,
          summary: summaryElement ? summaryElement.textContent.replace(/^\s+|\s+$/g, '') : ''
        });
      }

      return items;
    }

    function renderHours() {
      var today = PepperLib.Utils.getBogotaNow().getDay();
      var todayIndex = today === 0 ? 6 : today - 1;
      var schedule = DATA.HOURS ? DATA.HOURS.schedule : [];
      var todaySchedule = schedule[todayIndex];
      var todayTime = todaySchedule.closedKey ? PepperLib.i18n.t(todaySchedule.closedKey) : todaySchedule.time;
      var html = '';
      var i;
      var day;
      var time;

      html += '<section class="hours-panel">';
      html += '<div class="hours-today">';
      html += '<div class="hours-today-label" data-i18n="info.today">' + PepperLib.i18n.t('info.today') + '</div>';
      html += '<div class="hours-today-value">' + todayTime + '</div>';
      html += '</div>';
      html += '<div class="hours-week">';

      for (i = 0; i < schedule.length; i++) {
        day = schedule[i];
        time = day.closedKey ? PepperLib.i18n.t(day.closedKey) : day.time;
        html += '<div class="hours-day' + (i === todayIndex ? ' today' : '') + '">';
        html += '<span class="hours-day-name" data-i18n="' + day.dayKey + '">' + PepperLib.i18n.t(day.dayKey) + '</span>';
        html += '<span class="hours-day-time">' + time + '</span>';
        html += '</div>';
      }

      html += '</div>';
      html += '</section>';
      return html;
    }

    function renderNews() {
      var leadStory = newsState.items.length ? newsState.items[0] : null;
      var secondary = newsState.items.length > 1 ? newsState.items.slice(1) : [];
      var html = '';
      var i;
      var item;

      html += '<section class="news-panel"><div class="news-stage">';
      html += '<header class="news-stage-header">';
      html += '<div class="news-stage-copy"><div class="news-stage-kicker">Portal Uniandes</div><h3>' + PepperLib.i18n.t('info.news_title') + '</h3><p>' + PepperLib.i18n.t('info.news_copy') + '</p></div>';
      html += '</header>';

      if (newsState.loading && !newsState.items.length) {
        html += '<div class="news-loading-state">Cargando las noticias, por favor espera...</div>';
      }

      if (newsState.error) {
        html += '<div class="news-error-state"><p>' + escapeHtml(newsState.error) + '</p><button class="btn btn--secondary news-inline-btn" id="btn-news-retry">Intentar de nuevo</button></div>';
      }

      if (leadStory) {
        html += '<article class="news-feature">';
        if (leadStory.imageUrl) {
          html += '<img class="news-feature-image" src="' + escapeHtml(leadStory.imageUrl) + '" alt="' + escapeHtml(leadStory.title) + '" />';
        } else {
          html += '<div class="news-feature-image news-feature-image--placeholder">Sin imagen</div>';
        }
        html += '<div class="news-feature-body">';
        if (leadStory.contentType || leadStory.publishedAt) {
          html += '<div class="news-card-meta news-card-meta--feature">';
          if (leadStory.contentType) {
            html += '<span class="news-card-tag">' + escapeHtml(leadStory.contentType) + '</span>';
          }
          if (leadStory.publishedAt) {
            html += '<span class="news-card-date">' + escapeHtml(leadStory.publishedAt) + '</span>';
          }
          html += '</div>';
        }
        html += '<h4 class="news-feature-title">' + escapeHtml(leadStory.title) + '</h4>';
        if (leadStory.summary) {
          html += '<p class="news-feature-summary">' + escapeHtml(leadStory.summary) + '</p>';
        }
        html += '</div></article>';

        if (secondary.length) {
          html += '<div class="news-grid">';
          for (i = 0; i < secondary.length; i++) {
            item = secondary[i];
            html += '<article class="news-card">';
            if (item.imageUrl) {
              html += '<img class="news-card-image" src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.title) + '" />';
            } else {
              html += '<div class="news-card-image news-card-image--placeholder">Sin imagen</div>';
            }
            html += '<div class="news-card-body">';
            if (item.contentType || item.publishedAt) {
              html += '<div class="news-card-meta">';
              if (item.contentType) {
                html += '<span class="news-card-tag">' + escapeHtml(item.contentType) + '</span>';
              }
              if (item.publishedAt) {
                html += '<span class="news-card-date">' + escapeHtml(item.publishedAt) + '</span>';
              }
              html += '</div>';
            }
            html += '<h5 class="news-card-title">' + escapeHtml(item.title) + '</h5>';
            if (item.summary) {
              html += '<p class="news-card-summary">' + escapeHtml(item.summary) + '</p>';
            }
            html += '</div></article>';
          }
          html += '</div>';
        }

        html += '<div class="news-feed-actions">';
        if (newsState.hasMore) {
          html += '<button class="btn btn--primary news-load-more" id="btn-news-load-more">' + (newsState.loading ? 'Cargando...' : 'Cargar mas noticias') + '</button>';
        } else {
          html += '<span class="news-feed-end">No hay mas noticias por cargar.</span>';
        }
        html += '</div>';
      }

      if (!newsState.loading && !newsState.error && !leadStory) {
        html += '<div class="news-empty-state">No se encontraron noticias.</div>';
      }

      html += '</div></section>';
      return html;
    }

    function renderFaq() {
      var introCopy = PepperLib.State.language === 'en' ? 'Tap a common question to see the answer on screen.' : 'Toca una pregunta comun para ver la respuesta en pantalla.';
      var html = '<section class="faq-panel"><div class="faq-panel-header"><h3>' + PepperLib.i18n.t('info.faq') + '</h3><p>' + introCopy + '</p></div><div class="faq-list">';
      var faqs = DATA.FAQS || [];
      var i;
      var faq;
      var question;
      var answer;

      for (i = 0; i < faqs.length; i++) {
        faq = faqs[i];
        question = faq.q[PepperLib.State.language] || faq.q.es;
        answer = faq.a[PepperLib.State.language] || faq.a.es;
        html += '<article class="faq-item' + (openFaq[i] ? ' open' : '') + '" data-faq="' + i + '">';
        html += '<button class="faq-question" data-faq-toggle="' + i + '">';
        html += '<span>' + escapeHtml(question) + '</span>';
        html += '<svg class="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        html += '</button>';
        html += '<div class="faq-answer">' + escapeHtml(answer) + '</div>';
        html += '</article>';
      }

      html += '</div></section>';
      return html;
    }

    function bindInfoActions() {
      var faqButtons = document.querySelectorAll('[data-faq-toggle]');
      var i;

      for (i = 0; i < faqButtons.length; i++) {
        faqButtons[i].onclick = function () {
          var index = this.getAttribute('data-faq-toggle');
          openFaq[index] = !openFaq[index];
          PepperLib.Analytics.count('info_faq', 'faq_' + index);
          renderTab('faq');
        };
      }

      if (byId('btn-news-retry')) {
        byId('btn-news-retry').onclick = function () {
          loadNews(newsState.page || 0, newsState.page > 0);
        };
      }

      if (byId('btn-news-load-more')) {
        byId('btn-news-load-more').onclick = function () {
          if (!newsState.loading) {
            loadNews(newsState.page + 1, true);
          }
        };
      }
    }

    function renderTab(tab) {
      var tabs = document.querySelectorAll('.info-tab');
      var content = byId('info-content');
      var i;

      activeTab = tab;

      for (i = 0; i < tabs.length; i++) {
        toggleClass(tabs[i], 'active', tabs[i].getAttribute('data-tab') === tab);
      }

      if (tab === 'hours') {
        content.innerHTML = renderHours();
      } else if (tab === 'news') {
        content.innerHTML = renderNews();
      } else {
        content.innerHTML = renderFaq();
      }

      PepperLib.i18n.applyToDOM();
      bindInfoActions();
    }

    function loadNews(pageToLoad, append) {
      var targetUrl = NEWS_LINK + (pageToLoad > 0 ? '?page=' + pageToLoad : '');

      if (newsState.loading) {
        return;
      }

      newsState.loading = true;
      newsState.error = '';
      if (activeTab === 'news') {
        renderTab('news');
      }

      xhrRequest('GET', NEWS_PROXY + encodeURIComponent(targetUrl), {}, null, function (text) {
        var parsed = extractNewsCards(text);
        var existingLookup = {};
        var merged = [];
        var i;
        var key;

        newsState.loading = false;
        newsState.page = pageToLoad;

        if (!append) {
          newsState.items = parsed;
        } else {
          for (i = 0; i < newsState.items.length; i++) {
            key = newsState.items[i].articleUrl || newsState.items[i].title;
            existingLookup[key] = true;
            merged.push(newsState.items[i]);
          }
          for (i = 0; i < parsed.length; i++) {
            key = parsed[i].articleUrl || parsed[i].title;
            if (!existingLookup[key]) {
              existingLookup[key] = true;
              merged.push(parsed[i]);
            }
          }
          newsState.items = merged;
        }

        newsState.hasMore = parsed.length > 0;

        if (activeTab === 'news') {
          renderTab('news');
        }
      }, function () {
        newsState.loading = false;
        newsState.error = 'No se pudieron cargar las noticias en este momento.';
        if (activeTab === 'news') {
          renderTab('news');
        }
      });
    }

    PepperLib.State.registerScreen('info', {
      init: function () {
        var tabs = document.querySelectorAll('.info-tab');
        var i;

        for (i = 0; i < tabs.length; i++) {
          tabs[i].onclick = function () {
            var tab = this.getAttribute('data-tab');
            PepperLib.Analytics.count('info', 'tab_' + tab);
            PepperLib.Analytics.insertInformacion((DATA.TAB_SERVICE_MAP && DATA.TAB_SERVICE_MAP[tab]) || tab);
            PepperLib.Utils.setLastAction(PepperLib.i18n.t('info.screen_title') + ' - ' + PepperLib.i18n.t('info.' + tab), 'tab_' + tab, 'info');
            renderTab(tab);
            if (tab === 'news' && !newsState.items.length && !newsState.loading) {
              loadNews(0, false);
            }
          };
        }
      },

      onEnter: function () {
        PepperLib.Inactivity.reset();
        activeTab = 'hours';
        openFaq = {};
        PepperLib.Utils.setLastAction(PepperLib.i18n.t('info.screen_title'), 'info', 'info');
        renderTab('hours');
      },

      onExit: function () {
      }
    });
  })();

  (function registerEventsScreen() {
    var activities = [];
    var activeActivity = null;
    var currentQuestion = 0;
    var score = 0;
    var answered = false;
    var selectedAnswer = null;
    var triviaStartedAt = 0;
    var wordsearchSelection = [];
    var wordsearchFound = {};
    var wordsearchFoundCells = {};
    var memoryDeck = [];
    var memorySelected = [];
    var memoryMatched = {};
    var memoryAttempts = 0;
    var memoryLocked = false;
    var GAME_RENDERERS = {
      trivia: startTriviaActivity,
      wordsearch: startWordSearchActivity,
      memory: startMemoryActivity
    };

    function getLangText(value) {
      if (!value) {
        return '';
      }
      return value[PepperLib.State.language] || value.es || '';
    }

    function reverseText(value) {
      return String(value || '').split('').reverse().join('');
    }

    function cleanAnswer(value) {
      return stripAccents(String(value || '')).toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    function getActivityKindKey(item) {
      return item && item.type === 'trivia' ? 'events.badge_trivia' : 'events.badge_game';
    }

    function resetWordSearch() {
      wordsearchSelection = [];
      wordsearchFound = {};
      wordsearchFoundCells = {};
    }

    function resetMemory() {
      memoryDeck = [];
      memorySelected = [];
      memoryMatched = {};
      memoryAttempts = 0;
      memoryLocked = false;
    }

    function shuffleItems(items) {
      var shuffled = items.slice(0);
      var i;
      var j;
      var temp;
      for (i = shuffled.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }
      return shuffled;
    }

    function buildMemoryDeck() {
      var pairs = activeActivity && activeActivity.content ? activeActivity.content.pairs || [] : [];
      var cards = [];
      var i;
      for (i = 0; i < pairs.length; i++) {
        cards.push({
          id: 'author-' + i,
          pair: String(i),
          kind: 'author',
          label: pairs[i].author
        });
        cards.push({
          id: 'work-' + i,
          pair: String(i),
          kind: 'work',
          label: getLangText(pairs[i].work)
        });
      }
      memoryDeck = shuffleItems(cards);
    }

    function pad2(value) {
      return String(value < 10 ? '0' + value : value);
    }

    function formatElapsedTime(milliseconds) {
      var totalSeconds = Math.max(0, Math.floor((milliseconds || 0) / 1000));
      var minutes = Math.floor(totalSeconds / 60);
      var seconds = totalSeconds % 60;
      return minutes + ':' + pad2(seconds);
    }

    function loadActivities(callback) {
      if (activities.length) {
        callback();
        return;
      }

      xhrJson('GET', DATA.ACTIVITIES_URL, {}, null, function (response) {
        activities = response && response.activities && response.activities.length ? response.activities : FALLBACK_ACTIVITIES;
        callback();
      }, function () {
        activities = FALLBACK_ACTIVITIES;
        callback();
      });
    }

    function renderLibrary() {
      var intro = byId('events-intro');
      var question = byId('events-question');
      var result = byId('events-result');
      var eventsContainer = intro ? intro.parentNode : null;
      var html = '';
      var i;
      var item;
      var badgeKey;
      var stateKey;
      var cardClass;

      html += '<section class="events-library">';
      html += '<div class="events-library-head"><span class="events-library-kicker" data-i18n="events.library_arcade">' + PepperLib.i18n.t('events.library_arcade') + '</span><h2 data-i18n="events.select_activity">' + PepperLib.i18n.t('events.select_activity') + '</h2><p class="events-library-copy" data-i18n="events.library_copy">' + PepperLib.i18n.t('events.library_copy') + '</p></div>';
      html += '<div class="events-activity-grid">';

      for (i = 0; i < activities.length; i++) {
        item = activities[i];
        badgeKey = getActivityKindKey(item);
        stateKey = item.enabled ? 'events.available_now' : 'events.coming_soon';
        cardClass = 'events-activity-card events-activity-card--' + escapeHtml(item.type || 'activity') + ' events-activity-card--' + escapeHtml(item.id || 'activity');
        if (!item.enabled) {
          cardClass += ' is-disabled';
        }
        html += '<article class="' + cardClass + '">';
        html += '<div class="events-activity-top"><span class="events-activity-kind">' + PepperLib.i18n.t(badgeKey) + '</span><span class="events-activity-state">' + PepperLib.i18n.t(stateKey) + '</span></div>';
        html += '<h3>' + escapeHtml(getLangText(item.title)) + '</h3>';
        html += '<p>' + escapeHtml(getLangText(item.description)) + '</p>';
        if (item.enabled) {
          html += '<button class="btn btn--primary events-activity-btn" data-activity="' + item.id + '">' + escapeHtml(getLangText(item.cta)) + '</button>';
        }
        html += '</article>';
      }

      html += '</div></section>';

      intro.innerHTML = html;
      removeClass(eventsContainer, 'events-container--trivia-result');
      removeClass(intro, 'hidden');
      addClass(question, 'hidden');
      addClass(result, 'hidden');

      var buttons = intro.querySelectorAll('[data-activity]');
      for (i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function () {
          startActivity(this.getAttribute('data-activity'));
        };
      }
    }

    function isWordSearchComplete() {
      var words = activeActivity && activeActivity.content ? activeActivity.content.words || [] : [];
      var i;
      for (i = 0; i < words.length; i++) {
        if (!wordsearchFound[cleanAnswer(words[i].answer)]) {
          return false;
        }
      }
      return words.length > 0;
    }

    function isCellFound(row, col) {
      var word;
      var cells;
      var i;
      for (word in wordsearchFoundCells) {
        if (wordsearchFoundCells.hasOwnProperty(word)) {
          cells = wordsearchFoundCells[word];
          for (i = 0; i < cells.length; i++) {
            if (cells[i].row === row && cells[i].col === col) {
              return true;
            }
          }
        }
      }
      return false;
    }

    function isCellSelected(row, col) {
      var i;
      for (i = 0; i < wordsearchSelection.length; i++) {
        if (wordsearchSelection[i].row === row && wordsearchSelection[i].col === col) {
          return true;
        }
      }
      return false;
    }

    function isAdjacentToLast(row, col) {
      var last;
      if (!wordsearchSelection.length) {
        return true;
      }
      last = wordsearchSelection[wordsearchSelection.length - 1];
      return Math.abs(last.row - row) <= 1 && Math.abs(last.col - col) <= 1;
    }

    function getSelectedWord() {
      var value = '';
      var i;
      for (i = 0; i < wordsearchSelection.length; i++) {
        value += wordsearchSelection[i].letter;
      }
      return cleanAnswer(value);
    }

    function findSelectedWord() {
      var words = activeActivity && activeActivity.content ? activeActivity.content.words || [] : [];
      var selected = getSelectedWord();
      var reversed = reverseText(selected);
      var answer;
      var i;
      for (i = 0; i < words.length; i++) {
        answer = cleanAnswer(words[i].answer);
        if (!wordsearchFound[answer] && (selected === answer || reversed === answer)) {
          return answer;
        }
      }
      return '';
    }

    function bindWordSearch() {
      var container = byId('events-question');
      var cells = container.querySelectorAll('[data-word-cell]');
      var clearButton = byId('btn-wordsearch-clear');
      var i;

      for (i = 0; i < cells.length; i++) {
        cells[i].onclick = function () {
          var row = parseInt(this.getAttribute('data-row'), 10);
          var col = parseInt(this.getAttribute('data-col'), 10);
          var letter = this.getAttribute('data-letter');
          var foundAnswer;

          PepperLib.Inactivity.reset();

          if (isCellSelected(row, col) || !isAdjacentToLast(row, col)) {
            wordsearchSelection = [];
          }

          wordsearchSelection.push({ row: row, col: col, letter: letter });
          foundAnswer = findSelectedWord();

          if (foundAnswer) {
            wordsearchFound[foundAnswer] = true;
            wordsearchFoundCells[foundAnswer] = wordsearchSelection.slice(0);
            wordsearchSelection = [];
            PepperLib.Analytics.log('wordsearch_word_found', {
              activity: activeActivity.id,
              word: foundAnswer
            });
          }

          if (isWordSearchComplete()) {
            renderWordSearchResult();
            return;
          }

          renderWordSearch();
        };
      }

      if (clearButton) {
        clearButton.onclick = function () {
          wordsearchSelection = [];
          renderWordSearch();
        };
      }
    }

    function renderWordSearch() {
      var container = byId('events-question');
      var intro = byId('events-intro');
      var result = byId('events-result');
      var content = activeActivity.content || {};
      var grid = content.grid || [];
      var words = content.words || [];
      var foundCount = 0;
      var html = '';
      var row;
      var col;
      var letter;
      var answer;
      var cellClass;
      var i;

      addClass(intro, 'hidden');
      addClass(result, 'hidden');

      for (i = 0; i < words.length; i++) {
        if (wordsearchFound[cleanAnswer(words[i].answer)]) {
          foundCount += 1;
        }
      }

      html += '<article class="wordsearch-card">';
      html += '<div class="wordsearch-header">';
      html += '<div><span class="events-library-kicker">' + PepperLib.i18n.t('events.library_arcade') + '</span><h3>' + escapeHtml(getLangText(activeActivity.title)) + '</h3><p>' + PepperLib.i18n.t('events.wordsearch_hint') + '</p></div>';
      html += '<div class="wordsearch-progress"><span>' + PepperLib.i18n.t('events.wordsearch_progress') + '</span><strong>' + foundCount + '/' + words.length + '</strong></div>';
      html += '</div>';
      html += '<div class="wordsearch-layout">';
      html += '<div class="wordsearch-grid" style="width:' + (grid[0] ? grid[0].length * 48 : 0) + 'px">';

      for (row = 0; row < grid.length; row++) {
        for (col = 0; col < grid[row].length; col++) {
          letter = grid[row].charAt(col);
          cellClass = 'wordsearch-cell';
          if (isCellFound(row, col)) {
            cellClass += ' is-found';
          }
          if (isCellSelected(row, col)) {
            cellClass += ' is-selected';
          }
          html += '<button class="' + cellClass + '" data-word-cell="1" data-row="' + row + '" data-col="' + col + '" data-letter="' + escapeHtml(letter) + '">' + escapeHtml(letter) + '</button>';
        }
      }

      html += '</div>';
      html += '<aside class="wordsearch-side">';
      html += '<div class="wordsearch-words">';
      for (i = 0; i < words.length; i++) {
        answer = cleanAnswer(words[i].answer);
        html += '<span class="wordsearch-word' + (wordsearchFound[answer] ? ' is-found' : '') + '">' + escapeHtml(getLangText(words[i].label)) + '</span>';
      }
      html += '</div>';
      html += '<button class="btn btn--secondary wordsearch-clear" id="btn-wordsearch-clear">' + PepperLib.i18n.t('events.wordsearch_clear') + '</button>';
      html += '</aside>';
      html += '</div>';
      html += '</article>';

      container.innerHTML = html;
      removeClass(container, 'hidden');
      bindWordSearch();
    }

    function renderWordSearchResult() {
      var result = byId('events-result');
      var question = byId('events-question');
      var words = activeActivity && activeActivity.content ? activeActivity.content.words || [] : [];

      addClass(question, 'hidden');
      removeClass(result, 'hidden');

      PepperLib.Analytics.log('wordsearch_completed', {
        activity: activeActivity.id,
        total: words.length
      });

      result.innerHTML =
        '<article class="events-result-card">' +
        '<span class="events-result-kicker">' + escapeHtml(getLangText(activeActivity.title)) + '</span>' +
        '<div class="events-result-score">' + words.length + '/' + words.length + '</div>' +
        '<div class="events-result-label">' + PepperLib.i18n.t('events.wordsearch_done') + '</div>' +
        '<div class="events-result-actions">' +
        '<button class="btn btn--primary" id="btn-trivia-replay">' + PepperLib.i18n.t('events.play_again') + '</button>' +
        '<button class="btn btn--secondary" id="btn-trivia-menu">' + PepperLib.i18n.t('events.back_menu') + '</button>' +
        '</div>' +
        '</article>';

      byId('btn-trivia-replay').onclick = function () {
        startActivity(activeActivity.id);
      };

      byId('btn-trivia-menu').onclick = function () {
        activeActivity = null;
        renderLibrary();
      };
    }

    function isMemoryCardSelected(cardId) {
      var i;
      for (i = 0; i < memorySelected.length; i++) {
        if (memorySelected[i].id === cardId) {
          return true;
        }
      }
      return false;
    }

    function getMemoryFoundCount() {
      var count = 0;
      var key;
      for (key in memoryMatched) {
        if (memoryMatched.hasOwnProperty(key) && memoryMatched[key]) {
          count += 1;
        }
      }
      return count;
    }

    function isMemoryComplete() {
      var pairs = activeActivity && activeActivity.content ? activeActivity.content.pairs || [] : [];
      return pairs.length > 0 && getMemoryFoundCount() >= pairs.length;
    }

    function bindMemoryCards() {
      var container = byId('events-question');
      var cards = container.querySelectorAll('[data-memory-card]');
      var i;

      for (i = 0; i < cards.length; i++) {
        cards[i].onclick = function () {
          var cardId = this.getAttribute('data-memory-card');
          var pairId = this.getAttribute('data-pair');
          var kind = this.getAttribute('data-kind');
          var selectedCard = {
            id: cardId,
            pair: pairId,
            kind: kind
          };

          PepperLib.Inactivity.reset();

          if (memoryLocked || memoryMatched[pairId] || isMemoryCardSelected(cardId)) {
            return;
          }

          memorySelected.push(selectedCard);

          if (memorySelected.length < 2) {
            renderMemory();
            return;
          }

          memoryAttempts += 1;
          if (memorySelected[0].pair === memorySelected[1].pair && memorySelected[0].kind !== memorySelected[1].kind) {
            memoryMatched[pairId] = true;
            memorySelected = [];
            PepperLib.Analytics.log('memory_pair_found', {
              activity: activeActivity.id,
              pair: pairId
            });
            if (isMemoryComplete()) {
              renderMemoryResult();
              return;
            }
            renderMemory();
            return;
          }

          memoryLocked = true;
          renderMemory();
          setTimeout(function () {
            if (!activeActivity || activeActivity.type !== 'memory') {
              return;
            }
            memorySelected = [];
            memoryLocked = false;
            renderMemory();
          }, 700);
        };
      }
    }

    function renderMemory() {
      var container = byId('events-question');
      var intro = byId('events-intro');
      var result = byId('events-result');
      var pairs = activeActivity && activeActivity.content ? activeActivity.content.pairs || [] : [];
      var foundCount = getMemoryFoundCount();
      var html = '';
      var i;
      var card;
      var cardClass;
      var kindLabel;

      addClass(intro, 'hidden');
      addClass(result, 'hidden');

      html += '<article class="memory-card">';
      html += '<div class="memory-header">';
      html += '<div><span class="events-library-kicker">' + PepperLib.i18n.t('events.library_arcade') + '</span><h3>' + escapeHtml(getLangText(activeActivity.title)) + '</h3><p>' + PepperLib.i18n.t('events.memory_hint') + '</p></div>';
      html += '<div class="memory-stats"><div><span>' + PepperLib.i18n.t('events.memory_progress') + '</span><strong>' + foundCount + '/' + pairs.length + '</strong></div><div><span>' + PepperLib.i18n.t('events.memory_attempts') + '</span><strong>' + memoryAttempts + '</strong></div></div>';
      html += '</div>';
      html += '<div class="memory-grid">';

      for (i = 0; i < memoryDeck.length; i++) {
        card = memoryDeck[i];
        cardClass = 'memory-tile';
        if (memoryMatched[card.pair]) {
          cardClass += ' is-matched';
        }
        if (isMemoryCardSelected(card.id)) {
          cardClass += ' is-selected';
        }
        kindLabel = card.kind === 'author' ? PepperLib.i18n.t('events.memory_author') : PepperLib.i18n.t('events.memory_work');
        html += '<button class="' + cardClass + '" data-memory-card="' + escapeHtml(card.id) + '" data-pair="' + escapeHtml(card.pair) + '" data-kind="' + escapeHtml(card.kind) + '">';
        html += '<span class="memory-kind">' + kindLabel + '</span>';
        html += '<span class="memory-label">' + escapeHtml(card.label) + '</span>';
        html += '</button>';
      }

      html += '</div>';
      html += '</article>';

      container.innerHTML = html;
      removeClass(container, 'hidden');
      bindMemoryCards();
    }

    function renderMemoryResult() {
      var result = byId('events-result');
      var question = byId('events-question');
      var pairs = activeActivity && activeActivity.content ? activeActivity.content.pairs || [] : [];

      addClass(question, 'hidden');
      removeClass(result, 'hidden');

      PepperLib.Analytics.log('memory_completed', {
        activity: activeActivity.id,
        attempts: memoryAttempts,
        total: pairs.length
      });

      result.innerHTML =
        '<article class="events-result-card">' +
        '<span class="events-result-kicker">' + escapeHtml(getLangText(activeActivity.title)) + '</span>' +
        '<div class="events-result-score">' + pairs.length + '/' + pairs.length + '</div>' +
        '<div class="events-result-label">' + PepperLib.i18n.t('events.memory_done') + '</div>' +
        '<div class="events-result-actions">' +
        '<button class="btn btn--primary" id="btn-trivia-replay">' + PepperLib.i18n.t('events.play_again') + '</button>' +
        '<button class="btn btn--secondary" id="btn-trivia-menu">' + PepperLib.i18n.t('events.back_menu') + '</button>' +
        '</div>' +
        '</article>';

      byId('btn-trivia-replay').onclick = function () {
        startActivity(activeActivity.id);
      };

      byId('btn-trivia-menu').onclick = function () {
        activeActivity = null;
        renderLibrary();
      };
    }

    function renderQuestion() {
      var container = byId('events-question');
      var intro = byId('events-intro');
      var result = byId('events-result');
      var eventsContainer = container ? container.parentNode : null;
      var questions = activeActivity.content.questions;
      var question = questions[currentQuestion];
      var options = question.options[PepperLib.State.language] || question.options.es;
      var html = '';
      var i;
      var letter;
      var displayScore = score * 10;

      addClass(intro, 'hidden');
      addClass(result, 'hidden');
      removeClass(eventsContainer, 'events-container--trivia-result');

      html += '<article class="events-question-card">';
      html += '<div class="events-question-topbar"><div><span class="events-progress-label">' + PepperLib.i18n.t('events.question') + ' <strong>' + String(currentQuestion + 1).replace(/^(\d)$/, '0$1') + '</strong> ' + PepperLib.i18n.t('events.of') + ' ' + String(questions.length).replace(/^(\d)$/, '0$1') + '</span></div><div class="events-progress-score"><span>' + PepperLib.i18n.t('events.score') + '</span><strong id="trivia-score-value">' + displayScore + '</strong></div></div>';
      html += '<div class="events-progress-segments">';
      for (i = 0; i < questions.length; i++) {
        html += '<span class="events-progress-segment' + (i <= currentQuestion ? ' is-active' : '') + '"></span>';
      }
      html += '</div>';
      html += '<div class="events-question-body">';
      html += '<span class="events-question-kicker">' + PepperLib.i18n.t('events.question') + '</span>';
      html += '<h3 class="events-question-text">' + escapeHtml(getLangText(question.question)) + '</h3>';
      html += '<div class="events-option-list">';

      for (i = 0; i < options.length; i++) {
        letter = String.fromCharCode(65 + i);
        html += '<button class="events-option-btn" data-answer-index="' + i + '"><span class="events-option-letter">' + letter + '</span><span class="events-option-copy">' + escapeHtml(options[i]) + '</span><span class="events-option-check">&#10003;</span></button>';
      }

      html += '</div>';
      html += '<div class="events-question-footer"><button class="btn btn--primary events-next-btn" id="btn-trivia-next" disabled="disabled">' + PepperLib.i18n.t('events.next') + ' ➔</button></div>';
      html += '</div></article>';

      container.innerHTML = html;
      removeClass(container, 'hidden');
      answered = false;
      selectedAnswer = null;

      var answerButtons = container.querySelectorAll('[data-answer-index]');
      var nextButton = byId('btn-trivia-next');
      var scoreValue = byId('trivia-score-value');
      for (i = 0; i < answerButtons.length; i++) {
        answerButtons[i].onclick = function () {
          var selected = parseInt(this.getAttribute('data-answer-index'), 10);
          var buttons = container.querySelectorAll('[data-answer-index]');
          var j;

          if (answered) {
            return;
          }

          answered = true;
          selectedAnswer = selected;

          for (j = 0; j < buttons.length; j++) {
            buttons[j].disabled = true;
            if (parseInt(buttons[j].getAttribute('data-answer-index'), 10) === question.correct) {
              addClass(buttons[j], 'correct');
            }
          }

          if (selected === question.correct) {
            addClass(this, 'correct');
            score += 1;
            if (scoreValue) {
              scoreValue.textContent = String(score * 10);
            }
          } else {
            addClass(this, 'wrong');
          }

          PepperLib.Analytics.log('trivia_answer', {
            activity: activeActivity.id,
            question: currentQuestion,
            selected: selected,
            correct: question.correct,
            isCorrect: selected === question.correct
          });

          if (nextButton) {
            nextButton.disabled = false;
          }
        };
      }

      if (nextButton) {
        nextButton.onclick = function () {
          if (!answered) {
            return;
          }
          currentQuestion += 1;
          if (currentQuestion < questions.length) {
            renderQuestion();
          } else {
            PepperLib.Analytics.log('trivia_completed', {
              activity: activeActivity.id,
              score: score,
              total: questions.length
            });
            renderResult();
          }
        };
      }
    }

    function renderResult() {
      var result = byId('events-result');
      var question = byId('events-question');
      var eventsContainer = result ? result.parentNode : null;
      var total = activeActivity.content.questions.length;
      var incorrect = total - score;
      var elapsed = triviaStartedAt ? formatElapsedTime(new Date().getTime() - triviaStartedAt) : '0:00';
      var percentage;
      var messageKey;
      var copyKey;
      var replayKey;
      var ringClass;
      var retryIcon;

      addClass(question, 'hidden');
      addClass(eventsContainer, 'events-container--trivia-result');
      removeClass(result, 'hidden');

      percentage = activeActivity && activeActivity.content && total ? Math.round((score / total) * 100) : 0;
      if (percentage >= 80) {
        messageKey = 'events.result_great';
        copyKey = 'events.result_copy_great';
        replayKey = 'events.play_again';
        ringClass = ' is-great';
      } else if (percentage >= 50) {
        messageKey = 'events.result_good';
        copyKey = 'events.result_copy_great';
        replayKey = 'events.play_again';
        ringClass = ' is-good';
      } else {
        messageKey = 'events.result_ok';
        copyKey = 'events.result_copy_ok';
        replayKey = 'events.try_again';
        ringClass = ' is-low';
      }

      retryIcon = '<svg class="events-result-btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.6 9.4a7 7 0 1 0 .3 5.1"></path><path d="M18.6 4.8v4.6h-4.6"></path></svg>';
      result.innerHTML =
        '<article class="events-result-card events-result-card--trivia">' +
        '<div class="events-result-layout">' +
        '<div class="events-result-orbit' + ringClass + '"><span class="events-result-orbit-kicker">Tu puntaje</span><div><strong>' + score + '</strong><span>/' + total + '</span></div></div>' +
        '<div class="events-result-summary">' +
        '<h2>' + PepperLib.i18n.t(messageKey) + '</h2>' +
        '<p>' + PepperLib.i18n.t(copyKey) + '</p>' +
        '<div class="events-result-rule"></div>' +
        '<div class="events-result-stats">' +
        '<div><span>' + PepperLib.i18n.t('events.result_correct') + '</span><strong class="is-correct">' + pad2(score) + '</strong></div>' +
        '<div><span>' + PepperLib.i18n.t('events.result_incorrect') + '</span><strong class="is-incorrect">' + pad2(incorrect) + '</strong></div>' +
        '<div><span>' + PepperLib.i18n.t('events.result_time') + '</span><strong>' + elapsed + '</strong></div>' +
        '</div>' +
        '<div class="events-result-actions">' +
        '<button class="btn btn--primary events-result-replay" id="btn-trivia-replay">' + PepperLib.i18n.t(replayKey) + retryIcon + '</button>' +
        '<button class="btn btn--secondary events-result-menu" id="btn-trivia-menu">' + PepperLib.i18n.t('events.back_menu') + '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</article>';

      byId('btn-trivia-replay').onclick = function () {
        startActivity(activeActivity.id);
      };

      byId('btn-trivia-menu').onclick = function () {
        activeActivity = null;
        currentQuestion = 0;
        score = 0;
        answered = false;
        selectedAnswer = null;
        triviaStartedAt = 0;
        renderLibrary();
      };
    }

    function startActivity(activityId) {
      var i;
      var renderer;

      activeActivity = null;
      for (i = 0; i < activities.length; i++) {
        if (activities[i].id === activityId) {
          activeActivity = activities[i];
          break;
        }
      }

      if (!activeActivity || !activeActivity.enabled) {
        return;
      }

      currentQuestion = 0;
      score = 0;
      answered = false;
      selectedAnswer = null;
      resetWordSearch();
      resetMemory();
      renderer = GAME_RENDERERS[activeActivity.type];
      if (!renderer) {
        return;
      }
      PepperLib.Analytics.count('events', activeActivity.type + '_started');
      PepperLib.Analytics.insertEventos(getLangText(activeActivity.title));
      PepperLib.Utils.setLastAction(PepperLib.i18n.t('events.screen_title') + ' - ' + activityId, activityId, 'events');
      renderer();
    }

    function startTriviaActivity() {
      triviaStartedAt = new Date().getTime();
      renderQuestion();
    }

    function startWordSearchActivity() {
      renderWordSearch();
    }

    function startMemoryActivity() {
      resetMemory();
      buildMemoryDeck();
      renderMemory();
    }

    PepperLib.State.registerScreen('events', {
      init: function () {
      },

      onEnter: function () {
        PepperLib.Inactivity.reset();
        PepperLib.Utils.setLastAction(PepperLib.i18n.t('events.screen_title'), 'events', 'events');
        activeActivity = null;
        currentQuestion = 0;
        score = 0;
        answered = false;
        selectedAnswer = null;
        resetWordSearch();
        resetMemory();
        loadActivities(renderLibrary);
      },

      onExit: function () {
      },

      onLanguageChange: function () {
        if (!activeActivity) {
          renderLibrary();
          return;
        }
        if (activeActivity.type === 'wordsearch') {
          renderWordSearch();
        } else if (activeActivity.type === 'memory') {
          buildMemoryDeck();
          renderMemory();
        } else if (activeActivity.type === 'trivia') {
          renderQuestion();
        }
      }
    });
  })();

  (function registerFeedbackScreen() {
    var autoReturnTimer = null;
    var ratingMap = DATA.RATING_MAP || {
      excelente: 'Excelente',
      bueno: 'Bueno',
      regular: 'Regular',
      malo: 'Malo',
      pesimo: 'Pesimo'
    };

    function clearAutoReturn() {
      clearTimeout(autoReturnTimer);
      autoReturnTimer = null;
    }

    function initiateReturn() {
      cancelArrivalPoll();
      navActive = true;
      PepperLib.Inactivity.stop();
      var blackOverlay = byId('black-screen-overlay');
      if (blackOverlay) addClass(blackOverlay, 'active');

      clearAutoReturn();
      startNavClearLoop();

      function endAndReturn() {
        clearAutoReturn();
        navActive = false;
        startNavClearLoop();
        PepperLib.Inactivity.reset();
        if (blackOverlay) removeClass(blackOverlay, 'active');
        PepperLib.State.endSession();
        PepperLib.State.go(PepperLib.SCREENS.IDLE, {}, { pushHistory: false });
      }

      function onReturnError(errorString) {
        clearAutoReturn();
        navActive = false;
        startNavClearLoop();
        PepperLib.Inactivity.reset();
        if (blackOverlay) removeClass(blackOverlay, 'active');
        console.error('[NAV ERROR] navigateToBase:', errorString);
        PepperLib.State.endSession();
        PepperLib.State.go(PepperLib.SCREENS.IDLE, {}, { pushHistory: false });
      }

      if (window.PepperRosNavigation) {
        try {
          autoReturnTimer = setTimeout(endAndReturn, 120000);
          window.PepperRosNavigation.rotateInPlace(180, function () {
            window.PepperRosNavigation.navigateGraphClient('base', true, endAndReturn, onReturnError, null);
          }, onReturnError);
        } catch (e) {
          navActive = false;
          startNavClearLoop();
          PepperLib.Inactivity.reset();
          console.error('[NAV ERROR] navigateToBase exception:', e);
          autoReturnTimer = setTimeout(endAndReturn, 5000);
        }
      } else {
        autoReturnTimer = setTimeout(endAndReturn, 5000);
      }
    }

    function prepareFeedbackImages() {
      var images = document.querySelectorAll('.feedback-icon-image');
      var i;

      for (i = 0; i < images.length; i++) {
        (function (image) {
          var rating = image.getAttribute('data-rating-image');
          var button = image.parentNode;
          var emoji = button ? button.querySelector('.feedback-emoji') : null;

          image.onload = function () {
            removeClass(image, 'hidden');
            if (emoji) {
              addClass(emoji, 'hidden');
            }
          };

          image.onerror = function () {
            addClass(image, 'hidden');
            if (emoji) {
              removeClass(emoji, 'hidden');
            }
          };

          image.src = PepperLib.Utils.getFeedbackImagePath(rating);
        })(images[i]);
      }
    }

    PepperLib.State.registerScreen('feedback', {
      init: function () {
        var buttons = document.querySelectorAll('.feedback-btn');
        var i;

        prepareFeedbackImages();

        for (i = 0; i < buttons.length; i++) {
          buttons[i].onclick = function () {
            byId('screen-feedback').setAttribute('data-selected-rating', this.getAttribute('data-rating'));
            addClass(document.querySelector('.feedback-options'), 'hidden');
            removeClass(byId('feedback-comment-section'), 'hidden');
            clearAutoReturn();
            autoReturnTimer = setTimeout(function () {
              addClass(byId('feedback-comment-section'), 'hidden');
              removeClass(byId('feedback-thanks'), 'hidden');
              initiateReturn();
            }, 3000);
          };
        }

        byId('btn-feedback-send').onclick = function () {
          var rating = byId('screen-feedback').getAttribute('data-selected-rating');
          var comment = byId('feedback-comment-input').value.replace(/^\s+|\s+$/g, '');
          var scoreLabel = ratingMap[rating] || rating;

          PepperLib.Analytics.count('feedback', rating);
          PepperLib.Analytics.insertFeedback(rating);
          PepperLib.Analytics.insertCalidadServicio(scoreLabel, comment);

          addClass(byId('feedback-comment-section'), 'hidden');
          removeClass(byId('feedback-thanks'), 'hidden');

          initiateReturn();
        };
      },

      onEnter: function () {
        PepperLib.Inactivity.stop();
        clearAutoReturn();
        prepareFeedbackImages();
        removeClass(document.querySelector('.feedback-options'), 'hidden');
        addClass(byId('feedback-comment-section'), 'hidden');
        addClass(byId('feedback-thanks'), 'hidden');
        byId('screen-feedback').removeAttribute('data-selected-rating');
        byId('feedback-comment-input').value = '';
        autoReturnTimer = setTimeout(function () {
          initiateReturn();
        }, 30000);
      },

      onExit: function () {
        clearAutoReturn();
      }
    });
  })();

  function bindTopBar() {
    byId('btn-back').onclick = function () {
      PepperLib.State.back();
      PepperLib.Inactivity.reset();
    };

    byId('btn-lang-toggle').onclick = function () {
      PepperLib.State.setLanguage(PepperLib.State.language === 'es' ? 'en' : 'es');
      PepperLib.Inactivity.reset();
    };

    byId('btn-help').onclick = function () {
      removeClass(byId('help-overlay'), 'hidden');
      PepperRobot.callLibrarian();
      PepperLib.Analytics.log('help_requested', {});
      PepperLib.Help.sendEmail(function () {
        PepperLib.Analytics.log('help_email_sent', PepperLib.Help.buildEmailPayload());
      }, function () {
        PepperLib.Analytics.log('help_email_failed', {
          reason: 'request_failed'
        });
      });
      PepperLib.Inactivity.reset();
    };

    byId('btn-help-dismiss').onclick = function () {
      addClass(byId('help-overlay'), 'hidden');
      PepperLib.Inactivity.reset();
    };
  }

  function bindGlobalActivity() {
    var reset = function () {
      PepperLib.Inactivity.reset();
    };

    document.addEventListener('touchstart', reset);
    document.addEventListener('touchend', reset);
    document.addEventListener('click', reset);
    document.addEventListener('mousedown', reset);
    document.addEventListener('mouseup', reset);
    document.addEventListener('keydown', reset);
    document.addEventListener('keyup', reset);
    document.addEventListener('input', reset);
    document.addEventListener('change', reset);
    document.addEventListener('focus', reset, true);
    window.addEventListener('robot:presence', function () {
      if (PepperLib.State.current === PepperLib.SCREENS.IDLE) {
        PepperLib.State.go(PepperLib.SCREENS.GREETING, {}, { pushHistory: false });
      }
    });
  }

  var rosNavClearInterval = null;
  var navStartTime = null;
  var navArrivalPoll = null;
  var navActive = false;

  function cancelArrivalPoll() {
    if (navArrivalPoll) {
      clearInterval(navArrivalPoll);
      navArrivalPoll = null;
    }
  }

  function startNavClearLoop() {
    if (rosNavClearInterval) { return; }
    rosNavClearInterval = setInterval(function () {
      if (window.PepperRosNavigation) {
        window.PepperRosNavigation.clearCostmaps(null, null);
        if (!navActive) {
          window.PepperRosNavigation.standPosture(null, null);
        }
      }
    }, 6000);
  }

  function stopNavClearLoop() {
    if (rosNavClearInterval) {
      clearInterval(rosNavClearInterval);
      rosNavClearInterval = null;
    }
  }

  var DEST_GRAPH_MAP = {
    'coordination':                  'coordinacion',
    'sterilization_space':           'sterilization_room',
    'material_maintenance_workshop': 'materials_workshop '
  };

  function resolveGraphDest(destId) {
    return DEST_GRAPH_MAP[destId] || destId;
  }

  function pollUntilArrived(graphDestName, onArrived, onGiveUp) {
    var deadline = Date.now() + 60000;
    var interval = setInterval(function () {
      var pose = window.PepperRosNavigation && window.PepperRosNavigation.getLastAmclPose
        ? window.PepperRosNavigation.getLastAmclPose() : null;
      var graph = window.PepperRosNavigation && window.PepperRosNavigation.getClientGraph
        ? window.PepperRosNavigation.getClientGraph() : null;
      var destPlace = null;
      var i;

      if (!pose || !graph) {
        if (Date.now() >= deadline) {
          clearInterval(interval);
          navArrivalPoll = null;
          if (onGiveUp) { onGiveUp(); }
        }
        return;
      }

      for (i = 0; i < graph.places.length; i += 1) {
        if (graph.places[i].name === graphDestName) {
          destPlace = graph.places[i];
          break;
        }
      }

      if (!destPlace) {
        clearInterval(interval);
        navArrivalPoll = null;
        if (onArrived) { onArrived(); }
        return;
      }

      var dx = Math.abs(pose.position.x - Number(destPlace.x));
      var dy = Math.abs(pose.position.y - Number(destPlace.y));

      if (dx <= 1.5 && dy <= 1.5) {
        clearInterval(interval);
        navArrivalPoll = null;
        if (onArrived) { onArrived(); }
        return;
      }

      if (Date.now() >= deadline) {
        clearInterval(interval);
        navArrivalPoll = null;
        console.error('[NAV ERROR] Timeout esperando llegada a ' + graphDestName +
          ' pos=(' + pose.position.x.toFixed(2) + ',' + pose.position.y.toFixed(2) + ')');
        if (onGiveUp) { onGiveUp(); }
      }
    }, 500);
    return interval;
  }

  (function interceptNavErrors() {
    var origError = console.error;
    console.error = function () {
      origError.apply(console, arguments);
      var msg = Array.prototype.slice.call(arguments).join(' ');
      if (msg.indexOf('[NAV ERROR]') === -1) { return; }
      var logger = document.getElementById('ros-logger');
      if (!logger) { return; }
      var line = document.createElement('div');
      var now = new Date();
      line.className = 'ros-log-line';
      line.textContent = '[' + now.toLocaleTimeString() + '] ' + msg;
      logger.appendChild(line);
      while (logger.childNodes.length > 12) {
        logger.removeChild(logger.firstChild);
      }
      logger.style.display = 'block';
    };
  })();

  function boot() {
    var name;
    var screens = PepperLib.State.screens;

    PepperLib.State.setLanguage('es');
    bindTopBar();
    bindGlobalActivity();

    for (name in screens) {
      if (screens.hasOwnProperty(name) && typeof screens[name].init === 'function') {
        screens[name].init();
      }
    }

    PepperLib.i18n.applyToDOM();
    PepperRobot.init();

    if (window.PepperRosNavigation) {
      if (window.NavigationUtilitiesData) {
        window.NavigationUtilitiesData.reconnectBeforeCommand = false;
        window.NavigationUtilitiesData.rosbridgeUrl = 'ws://192.168.0.208:9090';
        window.NavigationUtilitiesData.prepareBeforeNavigate = false;
      }
      window.PepperRosNavigation.configure(window.NavigationUtilitiesData || {});
      window.PepperRosNavigation.loadGraphFromUrl('./assets/data/navigation-graph.json',
        null,
        function (err) { console.error('[NAV ERROR] Graph file load:', err); }
      );
      window.PepperRosNavigation.connect(null, function (rosInstance) {
        window.PepperRosNavigation.disableSecurity(null, null);
        if (rosInstance && window.ROSLIB) {
          try {
            var motionSvc = new window.ROSLIB.Service({
              ros: rosInstance,
              name: '/robot_toolkit/motion_tools_srv',
              serviceType: 'robot_toolkit_msgs/motion_tools_srv'
            });
            motionSvc.callService(
              new window.ROSLIB.ServiceRequest({ data: { command: 'enable_all' } }),
              null,
              function (err) { console.error('[NAV ERROR] motion_tools_srv:', err); }
            );
            var navToolsSvc = new window.ROSLIB.Service({
              ros: rosInstance,
              name: '/robot_toolkit/navigation_tools_srv',
              serviceType: 'robot_toolkit_msgs/navigation_tools_srv'
            });
            navToolsSvc.callService(
              new window.ROSLIB.ServiceRequest({
                data: {
                  command: 'custom',
                  tf_enable: true, tf_frequency: 50.0,
                  odom_enable: true, odom_frequency: 50.0,
                  laser_enable: true, laser_frequency: 10.0,
                  cmd_vel_enable: true, security_timer: 5.0,
                  move_base_enable: true,
                  goal_enable: false, robot_pose_suscriber_enable: false,
                  path_enable: false, path_frequency: 0.0,
                  robot_pose_publisher_enable: false, robot_pose_publisher_frequency: 0.0,
                  result_enable: false, depth_to_laser_enable: false,
                  depth_to_laser_parameters: {
                    resolution: 1, scan_time: 1.0,
                    range_min: 0.45, range_max: 10.0, scan_height: 120
                  },
                  free_zone_enable: false
                }
              }),
              null,
              function (err) { console.error('[NAV ERROR] navigation_tools_srv:', err); }
            );
            var miscSvc = new window.ROSLIB.Service({
              ros: rosInstance,
              name: '/robot_toolkit/misc_tools_srv',
              serviceType: 'robot_toolkit_msgs/misc_tools_srv'
            });
            miscSvc.callService(
              new window.ROSLIB.ServiceRequest({ data: { command: 'enable_all' } }),
              null,
              function (err) { console.error('[NAV ERROR] misc_tools_srv:', err); }
            );

            window.PepperRosNavigation.moveRelativeWithPyToolkit = function (x, y, onSuccess, onError) {
              try {
                var svc = new window.ROSLIB.Service({
                  ros: rosInstance,
                  name: '/pytoolkit/ALMotion/move_relative_srv',
                  serviceType: 'robot_toolkit_msgs/navigate_to_srv'
                });
                svc.callService(
                  new window.ROSLIB.ServiceRequest({
                    data: {
                      x_coordinate: Number(x) || 0,
                      y_coordinate: Number(y) || 0
                    }
                  }),
                  function (response) { if (onSuccess) { onSuccess(response || {}); } },
                  function (err) {
                    console.error('[NAV ERROR] move_relative_srv:', err);
                    if (onError) { onError(err); }
                  }
                );
              } catch (e) {
                console.error('[NAV ERROR] move_relative_srv exception:', e);
                if (onError) { onError(e); }
              }
            };
          } catch (e) {
            console.error('[NAV ERROR] robot_toolkit services exception:', e);
          }
        }
        startNavClearLoop();
        if (window.PepperRobot && typeof window.PepperRobot.showTabletWebview === 'function') {
          window.PepperRobot.showTabletWebview('http://192.168.0.230:8000/index.html');
        }
        window.PepperRosNavigation.startPoseTracking(
          function (pose) {},
          function (err) { console.error('[NAV ERROR] AMCL:', err); }
        );
        window.PepperRosNavigation.setBasePlaceLocal('base', null, function (err) {
          console.error('[NAV ERROR] setBasePlaceLocal:', err);
        });
      }, function (err) {
        console.error('[NAV ERROR] ROS connect:', err);
      });
    } else {
      console.error('[NAV ERROR] PepperRosNavigation no esta cargado.');
    }

    PepperLib.State.go(PepperLib.SCREENS.IDLE, {}, { pushHistory: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
