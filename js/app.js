/* ============================================
   APP - Main boot module
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  /* --- Inactivity Timer --- */
  PepperLib.Inactivity = {
    timer: null,
    TIMEOUT_MS: 120000, // 2 minutes

    reset: function () {
      clearTimeout(this.timer);
      if (PepperLib.State.current !== PepperLib.SCREENS.IDLE &&
          PepperLib.State.current !== PepperLib.SCREENS.GREETING) {
        this.timer = setTimeout(function () {
          PepperLib.Inactivity.onTimeout();
        }, this.TIMEOUT_MS);
      }
    },

    onTimeout: function () {
      // Go to feedback if in a service screen, otherwise go to idle
      if (PepperLib.State.current !== PepperLib.SCREENS.IDLE &&
          PepperLib.State.current !== PepperLib.SCREENS.GREETING &&
          PepperLib.State.current !== PepperLib.SCREENS.FEEDBACK) {
        PepperLib.State.go(PepperLib.SCREENS.FEEDBACK);
      } else {
        PepperLib.State.endSession();
        PepperLib.State.go(PepperLib.SCREENS.IDLE);
      }
    },

    stop: function () {
      clearTimeout(this.timer);
    }
  };

  /* --- NAOqi Robot Interface --- */
  PepperLib.Robot = {
    session: null,

    init: function () {
      if (typeof QiSession !== 'undefined') {
        try {
          QiSession(function (session) {
            PepperLib.Robot.session = session;
            PepperLib.Robot.subscribePeopleDetection();
          }, function () {
            console.log('[Robot] QiSession connection failed, running in dev mode');
          });
        } catch (e) {
          console.log('[Robot] QiSession not available, running in dev mode');
        }
      } else {
        console.log('[Robot] No QiSession, running in dev mode');
      }
    },

    subscribePeopleDetection: function () {
      if (!this.session) return;
      try {
        this.session.service('ALMemory').then(function (memory) {
          memory.subscriber('PeoplePerception/PeopleDetected').then(function (sub) {
            sub.signal.connect(function () {
              if (PepperLib.State.current === PepperLib.SCREENS.IDLE) {
                PepperLib.State.go(PepperLib.SCREENS.GREETING);
              }
            });
          });
        });
      } catch (e) {
        console.log('[Robot] People detection subscription failed:', e);
      }
    },

    callLibrarian: function () {
      PepperLib.Analytics.log('help_requested', {});
      if (!this.session) return;
      try {
        this.session.service('ALMemory').then(function (memory) {
          memory.raiseEvent('PepperLibrary/HelpRequested', true);
        });
      } catch (e) {
        console.log('[Robot] callLibrarian failed:', e);
      }
    },

    navigateTo: function (destinationId) {
      PepperLib.Analytics.log('robot_navigate', { destination: destinationId });
      if (!this.session) {
        console.log('[Robot] Would navigate to:', destinationId);
        return;
      }
      try {
        this.session.service('ALMemory').then(function (memory) {
          memory.raiseEvent('PepperLibrary/NavigateTo', destinationId);
        });
      } catch (e) {
        console.log('[Robot] navigateTo failed:', e);
      }
    },

    speak: function (text) {
      if (!this.session) {
        console.log('[Robot] Would say:', text);
        return;
      }
      try {
        this.session.service('ALTextToSpeech').then(function (tts) {
          tts.say(text);
        });
      } catch (e) {
        console.log('[Robot] speak failed:', e);
      }
    }
  };

  /* --- Boot --- */
  function boot() {
    // Initialize all registered screens
    var screens = PepperLib.State.screens;
    for (var name in screens) {
      if (screens.hasOwnProperty(name) && typeof screens[name].init === 'function') {
        screens[name].init();
      }
    }

    // Top bar: back button
    var btnBack = document.getElementById('btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', function () {
        PepperLib.State.back();
        PepperLib.Inactivity.reset();
      });
    }

    // Top bar: language toggle
    var btnLang = document.getElementById('btn-lang-toggle');
    if (btnLang) {
      btnLang.addEventListener('click', function () {
        var newLang = PepperLib.State.language === 'es' ? 'en' : 'es';
        PepperLib.State.setLanguage(newLang);
        PepperLib.Inactivity.reset();
      });
    }

    // Top bar: help button
    var btnHelp = document.getElementById('btn-help');
    if (btnHelp) {
      btnHelp.addEventListener('click', function () {
        var helpOverlay = document.getElementById('help-overlay');
        if (helpOverlay) {
          helpOverlay.classList.remove('hidden');
          PepperLib.Robot.callLibrarian();
        }
        PepperLib.Inactivity.reset();
      });
    }

    // Help overlay: dismiss button
    var btnHelpDismiss = document.getElementById('btn-help-dismiss');
    if (btnHelpDismiss) {
      btnHelpDismiss.addEventListener('click', function () {
        var helpOverlay = document.getElementById('help-overlay');
        if (helpOverlay) {
          helpOverlay.classList.add('hidden');
        }
        PepperLib.Inactivity.reset();
      });
    }

    // Global inactivity reset on any touch/click
    document.addEventListener('touchstart', function () {
      PepperLib.Inactivity.reset();
    });
    document.addEventListener('click', function () {
      PepperLib.Inactivity.reset();
    });

    // Apply initial translations
    PepperLib.i18n.applyToDOM();

    // Try to connect to robot
    PepperLib.Robot.init();

    // Start on idle
    PepperLib.State.go(PepperLib.SCREENS.IDLE);
  }

  // Boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
