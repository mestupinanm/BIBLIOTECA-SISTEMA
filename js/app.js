/* ============================================
   APP - Main boot module
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  // Human-readable label of the last thing the user did.
  // Set by each screen so the help email can say "Mi última petición fue: Sala 254"
  PepperLib.LastAction = null;
  // Machine-readable keys for the last action (used by session_feedback in Supabase)
  PepperLib.LastActionItem = null;     // e.g. 'room_254', 'shelf_06', 'borrow'
  PepperLib.LastActionCategory = null; // e.g. 'rooms', 'shelves', 'books', 'info'

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

  PepperLib.Help = {
    getLocationLabel: function () {
      var screen = PepperLib.State.current;
      var titleMap = {
        'menu': 'menu.title',
        'navigation': 'nav.screen_title',
        'navigation-guide': 'nav.directions',
        'shelves': 'shelves.screen_title',
        'books': 'books.screen_title',
        'info': 'info.screen_title',
        'events': 'events.screen_title',
        'feedback': 'feedback.title'
      };

      if (screen === PepperLib.SCREENS.NAVIGATION_GUIDE && PepperLib.NavigationGuide) {
        return PepperLib.NavigationGuide.getCurrentDestinationLabel() || PepperLib.i18n.t(titleMap[screen]);
      }

      if (screen === PepperLib.SCREENS.SHELVES && PepperLib.ShelvesContext) {
        return PepperLib.ShelvesContext.getActiveShelfLabel() || PepperLib.i18n.t(titleMap[screen]);
      }

      return PepperLib.i18n.t(titleMap[screen] || 'menu.title');
    },

    buildEmailPayload: function () {
      var config = PepperLib.HelpConfig || {};
      var recipient  = config.recipient  || 'm.estupinanm@uniandes.edu.co';
      var senderName = config.senderName || 'Nova';
      // Use the specific last action (e.g. "Sala 254") when available,
      // fall back to the generic screen label.
      var lastAction = PepperLib.LastAction || this.getLocationLabel() || 'No registrada';
      var message = 'Soy ' + senderName + ' y necesito ayuda. Mi \u00FAltima petici\u00F3n fue: ' + lastAction + '.';

      return {
        recipient:  recipient,
        lastAction: lastAction,
        message:    message
      };
    },

    sendEmail: function () {
      var config = PepperLib.HelpConfig || {};
      var payload = this.buildEmailPayload();
      var provider = config.provider || 'emailjs';
      var formsubmitConfig = config.formsubmit || {};
      var emailJsConfig = config.emailjs || {};

      if (typeof fetch === 'undefined') {
        return Promise.reject(new Error('help_email_fetch_unavailable'));
      }

      if (provider === 'formsubmit') {
        return fetch((formsubmitConfig.endpointBase || 'https://formsubmit.co/ajax/') + encodeURIComponent(payload.recipient), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name:     config.senderName || 'Nova',
            subject:  'Nova necesita ayuda — ' + (payload.lastAction || ''),
            message:  payload.message,
            _captcha: 'false',
            _template: 'box'
          })
        }).then(function (response) {
          if (!response.ok) {
            throw new Error('help_email_request_failed');
          }
          return response.json();
        });
      }

      if (provider !== 'emailjs') {
        return Promise.reject(new Error('help_email_provider_unavailable'));
      }

      if (!emailJsConfig.serviceId || emailJsConfig.serviceId.indexOf('YOUR_') === 0 ||
          !emailJsConfig.templateId || emailJsConfig.templateId.indexOf('YOUR_') === 0 ||
          !emailJsConfig.publicKey || emailJsConfig.publicKey.indexOf('YOUR_') === 0) {
        return Promise.reject(new Error('help_email_not_configured'));
      }

      return fetch(emailJsConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: emailJsConfig.serviceId,
          template_id: emailJsConfig.templateId,
          user_id: emailJsConfig.publicKey,
          template_params: {
            to_email: payload.recipient,
            message: payload.message,
            location: payload.location,
            sender_name: config.senderName || 'Nova'
          }
        })
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('help_email_request_failed');
        }
        return response.text();
      });
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
        PepperLib.Help.sendEmail()
          .then(function () {
            PepperLib.Analytics.log('help_email_sent', PepperLib.Help.buildEmailPayload());
          })
          .catch(function (error) {
            PepperLib.Analytics.log('help_email_failed', {
              reason: error && error.message ? error.message : 'unknown'
            });
          });
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
