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

      if (window.PepperRosNavigation && window.LibraryData && window.LibraryData.ROS_NAVIGATION) {
        window.PepperRosNavigation.configure(window.LibraryData.ROS_NAVIGATION);
      }

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

    navigateTo: function (destinationId, callbacks) {
      callbacks = callbacks || {};

      if (window.PepperRosNavigation && window.LibraryData && window.LibraryData.ROS_NAVIGATION) {
        window.PepperRosNavigation.configure(window.LibraryData.ROS_NAVIGATION);
        window.PepperRosNavigation.navigateToDestination(destinationId, function (response, destination) {
          console.log('[Robot] Navegacion ROS enviada:', destination.place, response);
          if (callbacks.onSuccess) {
            callbacks.onSuccess(response, destination);
          }
        }, function (error) {
          console.log('[Robot] Navegacion ROS no disponible:', error);
          if (callbacks.onFallback) {
            callbacks.onFallback(error);
          }
          Robot.navigateToWithMemory(destinationId, callbacks);
        });
        return;
      }

      this.navigateToWithMemory(destinationId, callbacks);
    },

    navigateToWithMemory: function (destinationId, callbacks) {
      callbacks = callbacks || {};

      if (!this.session) {
        console.log('[Robot] Navegacion simulada hacia:', destinationId);
        if (callbacks.onSimulated) {
          callbacks.onSimulated(destinationId);
        }
        return;
      }

      this.getService('ALMemory', function (memory) {
        try {
          memory.raiseEvent('PepperLibrary/NavigateTo', destinationId);
          if (callbacks.onSuccess) {
            callbacks.onSuccess({}, { place: destinationId, transport: 'ALMemory' });
          }
        } catch (error) {
          console.log('[Robot] Error enviando navegacion.', error);
          if (callbacks.onError) {
            callbacks.onError(error);
          }
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
