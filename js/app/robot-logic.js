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
        window.PepperRosNavigation.navigateGraphToDestination(destinationId, function (response) {
          console.log('[Robot] Navegacion por grafo enviada:', destinationId, response);
          if (callbacks.onSuccess) {
            callbacks.onSuccess(response, { place: destinationId });
          }
        }, function (error) {
          console.log('[Robot] Navegacion por grafo no disponible:', error);
          if (callbacks.onError) {
            callbacks.onError(error);
          }
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
    },

    speakAndWait: function (text, onDone, hasAnimation) {
      var words = text.split(/\s+/).length;
      var duration = Math.max(2000, words * 300);

      if (window.PepperRosNavigation && window.PepperRosNavigation.publishSpeech) {
        window.PepperRosNavigation.publishSpeech(text, true);
        setTimeout(onDone || function () {}, duration);
        return;
      }

      if (!this.session) {
        setTimeout(onDone || function () {}, duration);
        return;
      }

      this.getService('ALTextToSpeech', function (tts) {
        try {
          tts.say(text).then(function () {
            if (onDone) { onDone(); }
          }, function () {
            if (onDone) { onDone(); }
          });
        } catch (error) {
          if (onDone) { setTimeout(onDone, 500); }
        }
      });
    },

    setVolume: function (level) {
      if (window.PepperRosNavigation && window.PepperRosNavigation.setVolume) {
        window.PepperRosNavigation.setVolume(level, null, null);
        return;
      }
      this.getService('ALAudioDevice', function (audio) {
        try {
          audio.setOutputVolume(level);
        } catch (error) {
          console.log('[Robot] Error al establecer volumen.', error);
        }
      });
    },

    animate: function (anim) {
      if (!anim) { return; }
      if (window.PepperRosNavigation && window.PepperRosNavigation.publishAnimation) {
        window.PepperRosNavigation.publishAnimation(anim);
        return;
      }
      var fullPath = 'animations/' + anim;
      this.getService('ALBehaviorManager', function (bm) {
        try {
          bm.runBehavior(fullPath);
        } catch (error) {
          console.log('[Robot] Error ejecutando animación.', error);
        }
      });
    },

    showTabletWebview: function (url) {
      if (window.PepperRosNavigation) {
        window.PepperRosNavigation.showTabletWebview(url, null, null);
        return;
      }

      this.getService('ALTabletService', function (tablet) {
        try {
          tablet.showWebview(url);
        } catch (error) {
          console.log('[Robot] Error mostrando webview en tablet.', error);
        }
      });
    }
  };

  window.PepperRobot = Robot;
})();
