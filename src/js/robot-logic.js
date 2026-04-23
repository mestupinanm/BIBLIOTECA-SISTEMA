(function () {
  'use strict';

  window.PepperRobot = window.PepperRobot || {};

  function dispatchPresence() {
    if (typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('robot:presence'));
      return;
    }

    if (document.createEvent) {
      var eventObject = document.createEvent('Event');
      eventObject.initEvent('robot:presence', true, true);
      window.dispatchEvent(eventObject);
    }
  }

  var Robot = {
    session: null,
    initialized: false,

    init: function () {
      var session;

      if (this.initialized) {
        return;
      }

      this.initialized = true;

      if (typeof window.QiSession === 'undefined') {
        console.log('[Robot] QiSession no disponible. Modo desarrollo.');
        return;
      }

      try {
        session = new QiSession();
        this.session = session;
        this.subscribePeopleDetection();
      } catch (error) {
        try {
          QiSession(function (connectedSession) {
            Robot.session = connectedSession;
            Robot.subscribePeopleDetection();
          }, function () {
            console.log('[Robot] No fue posible conectar con Pepper.');
          });
        } catch (fallbackError) {
          console.log('[Robot] QiSession no inicializable en este entorno.');
        }
      }
    },

    getService: function (serviceName, onSuccess, onError) {
      if (!this.session || !this.session.service) {
        if (onError) {
          onError();
        }
        return;
      }

      try {
        this.session.service(serviceName).then(function (service) {
          if (onSuccess) {
            onSuccess(service);
          }
        }, function (error) {
          if (onError) {
            onError(error);
          }
        });
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    },

    subscribePeopleDetection: function () {
      this.getService('ALMemory', function (memory) {
        try {
          memory.subscriber('PeoplePerception/PeopleDetected').then(function (subscriber) {
            subscriber.signal.connect(function () {
              dispatchPresence();
            });
          }, function (error) {
            console.log('[Robot] No fue posible suscribirse a PeoplePerception.', error);
          });
        } catch (error) {
          console.log('[Robot] Error al suscribirse a PeoplePerception.', error);
        }
      });
    },

    callLibrarian: function () {
      this.getService('ALMemory', function (memory) {
        try {
          memory.raiseEvent('PepperLibrary/HelpRequested', true);
        } catch (error) {
          console.log('[Robot] Error llamando al bibliotecario.', error);
        }
      });
    },

    navigateTo: function (destinationId) {
      if (!this.session) {
        console.log('[Robot] Navegacion simulada hacia:', destinationId);
        return;
      }

      this.getService('ALMemory', function (memory) {
        try {
          memory.raiseEvent('PepperLibrary/NavigateTo', destinationId);
        } catch (error) {
          console.log('[Robot] Error enviando navegacion.', error);
        }
      });
    },

    speak: function (text) {
      if (!this.session) {
        console.log('[Robot] Habla simulada:', text);
        return;
      }

      this.getService('ALTextToSpeech', function (tts) {
        try {
          tts.say(text);
        } catch (error) {
          console.log('[Robot] Error en TTS.', error);
        }
      });
    }
  };

  window.PepperRobot = Robot;
})();
