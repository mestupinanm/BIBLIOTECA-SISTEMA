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
    var request = new XMLHttpRequest();
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
      if (request.readyState !== 4) {
        return;
      }

      if (request.status >= 200 && request.status < 300) {
        if (onSuccess) {
          onSuccess(request.responseText, request);
        }
        return;
      }

      if (onError) {
        onError(request);
      }
    };

    request.onerror = function () {
      if (onError) {
        onError(request);
      }
    };

    request.send(body || null);
  }

  function xhrJson(method, url, headers, bodyObject, onSuccess, onError) {
    var requestHeaders = headers || {};
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    xhrRequest(method, url, requestHeaders, bodyObject ? JSON.stringify(bodyObject) : null, function (text, request) {
      var payload = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch (error) {
        payload = null;
      }
      if (onSuccess) {
        onSuccess(payload, request);
      }
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
      this.language = lang || 'es';
      byId('lang-label').textContent = this.language === 'es' ? 'EN' : 'ES';
      PepperLib.i18n.applyToDOM();
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
      return this.getAssetPath('imagenes/feedback-' + rating + '.png');
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

    function getShortLabel(destinationId) {
      return getDestinationLabel(destinationId).replace(/^Sala\s+/i, '').replace(/^Room\s+/i, '');
    }

    function renderGuide(destinationId) {
      var destinationEl = byId('guide-destination');
      var roomCodeEl = byId('guide-room-code');
      var mapImage = byId('guide-map-img');
      var markers = byId('guide-map-markers');
      var here = DATA.MAP_COORDS ? DATA.MAP_COORDS.you_are_here : null;
      var dest = DATA.MAP_COORDS ? DATA.MAP_COORDS[destinationId] : null;
      var html = '';

      if (destinationEl) {
        destinationEl.textContent = getDestinationLabel(destinationId);
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
          html += PepperLib.Utils.buildMarker(dest.x, dest.y, 'marker-dest');
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

          function runScriptThenNavigate() {
            executeScript(PRE_NAV_SCRIPT, function () {
              addClass(byId('pre-nav-overlay'), 'hidden');
              showNavigationNotice(PepperLib.State.language === 'en' ? 'Sending destination to Pepper...' : 'Enviando destino a Pepper...');
              PepperRobot.navigateTo(currentDestination, {
                onSuccess: function () {
                  showNavigationNotice(PepperLib.State.language === 'en' ? 'Destination sent to Pepper.' : 'Destino enviado a Pepper.');
                },
                onFallback: function () {
                  showNavigationNotice(PepperLib.State.language === 'en' ? 'ROSBridge unavailable. Trying local robot event.' : 'ROSBridge no disponible. Intentando evento local del robot.');
                },
                onSimulated: function () {
                  showNavigationNotice(PepperLib.State.language === 'en' ? 'Development mode: route shown on screen.' : 'Modo desarrollo: ruta mostrada en pantalla.');
                },
                onError: function () {
                  showNavigationNotice(PepperLib.State.language === 'en' ? 'Navigation command could not be sent.' : 'No se pudo enviar la navegacion.');
                }
              });
            });
          }

          if (window.PepperRosNavigation && window.PepperRosNavigation.getRosbridgeUrl()) {
            window.PepperRosNavigation.connect(
              window.PepperRosNavigation.getRosbridgeUrl(),
              runScriptThenNavigate,
              runScriptThenNavigate
            );
          } else {
            runScriptThenNavigate();
          }
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
      var i;
      var j;
      var entry;

      shelfIndex = {};

      for (i = 0; i < topics.length; i++) {
        entry = topics[i];
        if (!shelfIndex[entry.shelf]) {
          shelfIndex[entry.shelf] = {
            shelf: entry.shelf,
            coordKey: entry.coordKey,
            topics: []
          };
        }

        for (j = 0; j < entry.topics.length; j++) {
          if (shelfIndex[entry.shelf].topics.indexOf(entry.topics[j]) === -1) {
            shelfIndex[entry.shelf].topics.push(entry.topics[j]);
          }
        }
      }
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
            if (normalizeText(shelf.topics[j]).indexOf(query) !== -1) {
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
      var coord = shelf && DATA.MAP_COORDS ? DATA.MAP_COORDS[shelf.coordKey] : null;
      var hint = byId('shelves-map-hint');
      var actions = byId('shelves-info-actions');
      var markers = byId('shelves-map-markers');
      var image = byId('shelves-map-img');
      var label;

      if (image) {
        image.src = PepperLib.Utils.getMapSrc();
      }

      if (markers) {
        markers.innerHTML = coord ? PepperLib.Utils.buildMarker(coord.x, coord.y, 'marker-dest') : '';
      }

      if (hint) {
        label = activeShelf ? ((activeTopic ? activeTopic + ' · ' : '') + PepperLib.i18n.t('shelves.shelf_label') + ' ' + activeShelf) : PepperLib.i18n.t('shelves.select_hint');
        hint.textContent = label;
      }

      toggleClass(actions, 'hidden', !activeShelf);
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
        html += '<span class="shelf-item-cta">' + PepperLib.i18n.t(expanded ? 'shelves.hide_topics' : 'shelves.view_topics') + '</span>';
        html += '</button>';

        if (expanded) {
          html += '<div class="shelf-item-body">';
          html += '<p class="shelf-item-helper">' + PepperLib.i18n.t('shelves.tap_topic') + '</p>';
          html += '<div class="shelf-topic-list">';
          for (j = 0; j < visibleTopics.length; j++) {
            html += '<button class="shelf-topic-tag' + (activeTopic === visibleTopics[j] ? ' is-active' : '') + '" data-shelf-topic="' + shelf.shelf + '" data-topic="' + escapeHtml(visibleTopics[j]) + '">' + escapeHtml(visibleTopics[j]) + '</button>';
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
          if (searchTerm) {
            var list = filteredShelves();
            if (list.length) {
              activeShelf = list[0].shelf;
              activeTopic = list[0].topics.length ? list[0].topics[0] : null;
            } else {
              activeShelf = null;
              activeTopic = null;
            }
          }
          renderShelfList();
        };

        byId('btn-shelves-guide-me').onclick = function () {
          if (!activeShelf) {
            return;
          }
          PepperLib.Analytics.insertBuscarLibro(activeShelf, activeTopic, 'Llevame');
          PepperRobot.navigateTo('shelf_' + activeShelf);
        };

        byId('btn-shelves-done').onclick = function () {
          if (activeShelf) {
            PepperLib.Analytics.insertBuscarLibro(activeShelf, activeTopic, 'Listo');
          }
          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK, {}, { pushHistory: false });
        };
      },

      onEnter: function () {
        PepperLib.Inactivity.reset();
        buildShelfIndex();
        searchTerm = '';
        activeShelf = '01';
        activeTopic = null;
        byId('shelves-search').value = '';
        PepperLib.Utils.setLastAction(PepperLib.i18n.t('shelves.screen_title'), 'shelves', 'shelves');
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
        '</button>' +
        '<button class="books-card books-card--return" data-action="return">' +
        '<div class="books-card-icon"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><polyline points="16 12 12 16 8 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg></div>' +
        '<div class="books-card-copy"><span class="books-card-label">' + PepperLib.i18n.t('books.return') + '</span><span class="books-card-desc">' + PepperLib.i18n.t('books.return_desc') + '</span></div>' +
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

      addClass(byId('books-options'), 'hidden');
      removeClass(detail, 'hidden');

      PepperLib.Utils.setLastAction(PepperLib.i18n.t('books.screen_title') + ' — ' + actionLabel, action, 'books');

      detail.innerHTML =
        '<article class="books-detail-panel books-detail-panel--' + action + '">' +
        '<div class="books-detail-icon books-detail-icon--' + action + '"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' + (isBorrow ? '<polyline points="8 12 12 8 16 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line>' : '<polyline points="16 12 12 16 8 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line>') + '</svg></div>' +
        '<div class="books-detail-copy"><h2 class="books-detail-title">' + PepperLib.i18n.t(titleKey) + '</h2><p class="books-detail-message">' + PepperLib.i18n.t(msgKey) + '</p></div>' +
        '<div class="books-detail-actions">' +
        '<button class="btn btn--primary" id="btn-books-llevame">' + PepperLib.i18n.t('nav.guide_me') + '</button>' +
        '<button class="btn btn--secondary" id="btn-books-listo">' + PepperLib.i18n.t('nav.done') + '</button>' +
        '</div>' +
        '</article>';

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

    function getLangText(value) {
      if (!value) {
        return '';
      }
      return value[PepperLib.State.language] || value.es || '';
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
      var html = '';
      var i;
      var item;
      var badgeKey;
      var stateKey;

      html += '<section class="events-library">';
      html += '<div class="events-library-head"><span class="events-library-kicker" data-i18n="events.screen_title">' + PepperLib.i18n.t('events.screen_title') + '</span><h2 data-i18n="events.select_activity">' + PepperLib.i18n.t('events.select_activity') + '</h2><p class="events-library-copy">' + PepperLib.i18n.t('menu.events.desc') + '</p></div>';
      html += '<div class="events-activity-grid">';

      for (i = 0; i < activities.length; i++) {
        item = activities[i];
        badgeKey = item.type === 'game' ? 'events.badge_game' : 'events.badge_trivia';
        stateKey = item.enabled ? 'events.available_now' : 'events.coming_soon';
        html += '<article class="events-activity-card' + (item.enabled ? '' : ' is-disabled') + '">';
        html += '<div class="events-activity-top"><span class="events-activity-kind">' + PepperLib.i18n.t(badgeKey) + '</span><span class="events-activity-state">' + PepperLib.i18n.t(stateKey) + '</span></div>';
        html += '<h3>' + escapeHtml(getLangText(item.title)) + '</h3>';
        html += '<p>' + escapeHtml(getLangText(item.description)) + '</p>';
        html += '<button class="btn ' + (item.enabled ? 'btn--primary' : 'btn--secondary') + ' events-activity-btn" data-activity="' + item.id + '"' + (item.enabled ? '' : ' disabled="disabled"') + '>' + escapeHtml(getLangText(item.cta)) + '</button>';
        html += '</article>';
      }

      html += '</div></section>';

      intro.innerHTML = html;
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

    function renderQuestion() {
      var container = byId('events-question');
      var intro = byId('events-intro');
      var result = byId('events-result');
      var questions = activeActivity.content.questions;
      var question = questions[currentQuestion];
      var options = question.options[PepperLib.State.language] || question.options.es;
      var html = '';
      var i;

      addClass(intro, 'hidden');
      addClass(result, 'hidden');

      html += '<article class="events-question-card">';
      html += '<div class="events-question-header"><span class="events-progress-label">' + PepperLib.i18n.t('events.question') + ' ' + (currentQuestion + 1) + ' ' + PepperLib.i18n.t('events.of') + ' ' + questions.length + '</span><span class="events-progress-score">' + PepperLib.i18n.t('events.score') + ': ' + score + '</span></div>';
      html += '<div class="events-progress-bar"><div class="events-progress-fill" style="width:' + (((currentQuestion + 1) / questions.length) * 100) + '%"></div></div>';
      html += '<h3 class="events-question-text">' + escapeHtml(getLangText(question.question)) + '</h3>';
      html += '<div class="events-option-list">';

      for (i = 0; i < options.length; i++) {
        html += '<button class="events-option-btn" data-answer-index="' + i + '">' + escapeHtml(options[i]) + '</button>';
      }

      html += '</div></article>';

      container.innerHTML = html;
      removeClass(container, 'hidden');
      answered = false;
      selectedAnswer = null;

      var answerButtons = container.querySelectorAll('[data-answer-index]');
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

          setTimeout(function () {
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
          }, 1300);
        };
      }
    }

    function renderResult() {
      var result = byId('events-result');
      var question = byId('events-question');
      var percentage;
      var messageKey;

      addClass(question, 'hidden');
      removeClass(result, 'hidden');

      percentage = activeActivity && activeActivity.content && activeActivity.content.questions.length ? Math.round((score / activeActivity.content.questions.length) * 100) : 0;
      if (percentage >= 80) {
        messageKey = 'events.result_great';
      } else if (percentage >= 50) {
        messageKey = 'events.result_good';
      } else {
        messageKey = 'events.result_ok';
      }

      result.innerHTML =
        '<article class="events-result-card">' +
        '<span class="events-result-kicker">' + escapeHtml(getLangText(activeActivity.title)) + '</span>' +
        '<div class="events-result-score">' + score + '/' + activeActivity.content.questions.length + '</div>' +
        '<div class="events-result-label">' + PepperLib.i18n.t(messageKey) + '</div>' +
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
        currentQuestion = 0;
        score = 0;
        answered = false;
        selectedAnswer = null;
        renderLibrary();
      };
    }

    function startActivity(activityId) {
      var i;

      for (i = 0; i < activities.length; i++) {
        if (activities[i].id === activityId) {
          activeActivity = activities[i];
          break;
        }
      }

      if (!activeActivity) {
        return;
      }

      currentQuestion = 0;
      score = 0;
      answered = false;
      selectedAnswer = null;
      PepperLib.Analytics.count('events', 'trivia_started');
      PepperLib.Analytics.insertEventos(getLangText(activeActivity.title));
      PepperLib.Utils.setLastAction(PepperLib.i18n.t('events.screen_title') + ' - ' + activityId, activityId, 'events');
      renderQuestion();
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
        loadActivities(renderLibrary);
      },

      onExit: function () {
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

    function initiateReturn(delay) {
      if (window.PepperRosNavigation) {
        window.PepperRosNavigation.navigateToBase(null, null, null);
      }
      clearAutoReturn();
      autoReturnTimer = setTimeout(function () {
        PepperLib.State.endSession();
        PepperLib.State.go(PepperLib.SCREENS.IDLE, {}, { pushHistory: false });
      }, delay || 8000);
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
              initiateReturn(8000);
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

          initiateReturn(3000);
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
          initiateReturn(8000);
        }, 25000);
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
    PepperLib.State.go(PepperLib.SCREENS.IDLE, {}, { pushHistory: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
