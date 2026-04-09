/* ============================================
   STATE MACHINE - Screen transitions
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var SCREENS = {
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

  // Screens that show the top bar
  var TOPBAR_SCREENS = ['menu', 'navigation', 'navigation-guide', 'shelves', 'books', 'info', 'events', 'feedback'];

  // Screen titles (i18n keys)
  var SCREEN_TITLES = {
    'menu': 'menu.title',
    'navigation': 'nav.screen_title',
    'navigation-guide': 'nav.directions',
    'shelves': 'shelves.screen_title',
    'books': 'books.screen_title',
    'info': 'info.screen_title',
    'events': 'events.screen_title',
    'feedback': 'feedback.title'
  };

  PepperLib.SCREENS = SCREENS;

  PepperLib.State = {
    current: null,
    history: [],
    language: 'es',
    session: null,
    screens: {},

    registerScreen: function (name, handler) {
      this.screens[name] = handler;
    },

    go: function (screenName, params) {
      if (screenName === this.current) return;

      var oldScreen = this.screens[this.current];
      var newScreen = this.screens[screenName];

      // Call onExit on current screen
      if (oldScreen && typeof oldScreen.onExit === 'function') {
        oldScreen.onExit();
      }

      // Push to history (don't push idle or greeting)
      if (this.current && this.current !== SCREENS.IDLE && this.current !== SCREENS.GREETING) {
        this.history.push(this.current);
      }

      // Hide old screen element
      var oldEl = document.getElementById('screen-' + this.current);
      if (oldEl) {
        oldEl.classList.remove('active');
        oldEl.classList.remove('with-topbar');
      }

      // Update current
      this.current = screenName;

      // Show/hide topbar
      var topbar = document.getElementById('topbar');
      var showTopbar = TOPBAR_SCREENS.indexOf(screenName) !== -1;
      if (topbar) {
        if (showTopbar) {
          topbar.classList.remove('hidden');
        } else {
          topbar.classList.add('hidden');
        }
      }

      // Show/hide back button (hidden on menu)
      var btnBack = document.getElementById('btn-back');
      if (btnBack) {
        if (screenName === SCREENS.MENU || screenName === SCREENS.FEEDBACK) {
          btnBack.style.visibility = 'hidden';
        } else {
          btnBack.style.visibility = 'visible';
        }
      }

      // Update screen title
      var titleEl = document.getElementById('screen-title');
      if (titleEl && SCREEN_TITLES[screenName]) {
        titleEl.textContent = PepperLib.i18n.t(SCREEN_TITLES[screenName]);
      }

      // Show new screen element
      var newEl = document.getElementById('screen-' + screenName);
      if (newEl) {
        if (showTopbar) {
          newEl.classList.add('with-topbar');
        }
        newEl.classList.add('active');
      }

      // Apply translations
      PepperLib.i18n.applyToDOM();

      // Call onEnter on new screen
      if (newScreen && typeof newScreen.onEnter === 'function') {
        newScreen.onEnter(params);
      }

      // Log screen view
      PepperLib.Analytics.log('screen_view', { screen: screenName, params: params });
    },

    back: function () {
      if (this.history.length > 0) {
        var prev = this.history.pop();
        // Don't push to history when going back
        var oldScreen = this.screens[this.current];
        if (oldScreen && typeof oldScreen.onExit === 'function') {
          oldScreen.onExit();
        }

        var oldEl = document.getElementById('screen-' + this.current);
        if (oldEl) {
          oldEl.classList.remove('active');
          oldEl.classList.remove('with-topbar');
        }

        this.current = prev;

        var topbar = document.getElementById('topbar');
        var showTopbar = TOPBAR_SCREENS.indexOf(prev) !== -1;
        if (topbar) {
          if (showTopbar) {
            topbar.classList.remove('hidden');
          } else {
            topbar.classList.add('hidden');
          }
        }

        var btnBack = document.getElementById('btn-back');
        if (btnBack) {
          if (prev === SCREENS.MENU || prev === SCREENS.FEEDBACK) {
            btnBack.style.visibility = 'hidden';
          } else {
            btnBack.style.visibility = 'visible';
          }
        }

        var titleEl = document.getElementById('screen-title');
        if (titleEl && SCREEN_TITLES[prev]) {
          titleEl.textContent = PepperLib.i18n.t(SCREEN_TITLES[prev]);
        }

        var newEl = document.getElementById('screen-' + prev);
        if (newEl) {
          if (showTopbar) {
            newEl.classList.add('with-topbar');
          }
          newEl.classList.add('active');
        }

        PepperLib.i18n.applyToDOM();

        var newScreen = this.screens[prev];
        if (newScreen && typeof newScreen.onEnter === 'function') {
          newScreen.onEnter();
        }
      } else {
        this.go(SCREENS.MENU);
      }
    },

    startSession: function () {
      this.session = {
        id: 'S' + Date.now() + Math.random().toString(36).substr(2, 4),
        startTime: new Date().toISOString(),
        language: this.language,
        screensVisited: [],
        destinationsRequested: []
      };
      PepperLib.Analytics.log('session_start', {});
    },

    endSession: function () {
      if (this.session) {
        PepperLib.Analytics.log('session_end', {
          duration: Date.now() - new Date(this.session.startTime).getTime()
        });
        PepperLib.Analytics.flush();
        this.session = null;
      }
      this.history = [];
    },

    setLanguage: function (lang) {
      this.language = lang;
      var langLabel = document.getElementById('lang-label');
      if (langLabel) {
        langLabel.textContent = lang === 'es' ? 'EN' : 'ES';
      }
      PepperLib.i18n.applyToDOM();
      PepperLib.Analytics.log('language_change', { language: lang });
    }
  };
})();
