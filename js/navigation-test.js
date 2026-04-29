(function () {
  'use strict';

  var data = window.NavigationUtilitiesData || {};
  var selectedPlace = data.testPlaces && data.testPlaces.length ? data.testPlaces[0].name : '';
  var els = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function log(message, detail) {
    var now = new Date();
    var line = '[' + now.toLocaleTimeString() + '] ' + message;

    if (detail) {
      try {
        line += '\n' + JSON.stringify(detail, null, 2);
      } catch (error) {
        line += '\n' + String(detail);
      }
    }

    els.log.textContent = line + '\n\n' + els.log.textContent;
  }

  function setStatus(label, state) {
    els.statusText.textContent = label;
    els.statusDot.className = 'status-dot' + (state ? ' ' + state : '');
  }

  function currentUrl() {
    return els.url.value || data.rosbridgeUrl || 'ws://127.0.0.1:9090';
  }

  function currentGraph() {
    return Number(els.graph.value) || data.defaultGraph || 1;
  }

  function requireConnection(action) {
    if (!window.PepperRosNavigation || !window.PepperRosNavigation.isConnected()) {
      log('Conecta ROSBridge antes de ejecutar este comando.');
      return false;
    }
    return !!action;
  }

  function renderPlaces() {
    var places = data.testPlaces || [];
    var html = '';
    var i;
    var place;

    for (i = 0; i < places.length; i += 1) {
      place = places[i];
      html += '<button class="place-button' + (place.name === selectedPlace ? ' active' : '') + '" data-place="' + place.name + '">';
      html += '<span class="place-name">' + place.name + '</span>';
      html += '<span class="place-meta">x ' + place.x + ' · y ' + place.y + ' · θ ' + place.theta + '</span>';
      html += '</button>';
    }

    els.places.innerHTML = html;
  }

  function bindPlaces() {
    els.places.onclick = function (event) {
      var target = event.target;

      while (target && target !== els.places && !target.getAttribute('data-place')) {
        target = target.parentNode;
      }

      if (!target || target === els.places) {
        return;
      }

      selectedPlace = target.getAttribute('data-place');
      renderPlaces();
      log('Destino seleccionado: ' + selectedPlace);
    };
  }

  function subscribeFeedback() {
    if (!requireConnection(true)) {
      return;
    }

    window.PepperRosNavigation.subscribeFeedback('simpleFeedback', function (message) {
      log('Feedback simple recibido.', message);
    }, function (error) {
      log('No se pudo suscribir al feedback simple: ' + error);
    });

    window.PepperRosNavigation.subscribeFeedback('completeFeedback', function (message) {
      log('Feedback completo recibido.', message);
    }, function (error) {
      log('No se pudo suscribir al feedback completo: ' + error);
    });
  }

  function bindCommands() {
    els.connect.onclick = function () {
      setStatus('Conectando...', '');
      window.PepperRosNavigation.configure(data);
      window.PepperRosNavigation.connect(currentUrl(), function () {
        setStatus('Conectado a ' + currentUrl(), 'connected');
        log('ROSBridge conectado.');
        subscribeFeedback();
      }, function (error) {
        setStatus('Error de conexion', 'error');
        log('No se pudo conectar ROSBridge: ' + error);
      });
    };

    els.disconnect.onclick = function () {
      window.PepperRosNavigation.disconnect();
      setStatus('Desconectado', '');
      log('ROSBridge desconectado.');
    };

    els.setCurrent.onclick = function () {
      if (!requireConnection(true)) {
        return;
      }
      window.PepperRosNavigation.setCurrentPlace(selectedPlace, function (response) {
        log('set_current_place_srv OK para ' + selectedPlace, response);
      }, function (error) {
        log('set_current_place_srv fallo: ' + error);
      });
    };

    els.goTo.onclick = function () {
      if (!requireConnection(true)) {
        return;
      }
      window.PepperRosNavigation.goToPlace(selectedPlace, currentGraph(), function (response) {
        log('go_to_place_srv OK para ' + selectedPlace, response);
      }, function (error) {
        log('go_to_place_srv fallo: ' + error);
      });
    };

    els.stop.onclick = function () {
      if (!requireConnection(true)) {
        return;
      }
      window.PepperRosNavigation.stop(function (response) {
        log('robot_stop_srv OK.', response);
      }, function (error) {
        log('robot_stop_srv fallo: ' + error);
      });
    };

    els.spin.onclick = function () {
      if (!requireConnection(true)) {
        return;
      }
      window.PepperRosNavigation.spin(Number(els.degrees.value) || 30, function (response) {
        log('spin_srv OK.', response);
      }, function (error) {
        log('spin_srv fallo: ' + error);
      });
    };
  }

  function boot() {
    els.url = byId('rosbridge-url');
    els.graph = byId('graph-value');
    els.degrees = byId('spin-degrees');
    els.statusText = byId('status-text');
    els.statusDot = byId('status-dot');
    els.places = byId('places-grid');
    els.log = byId('log');
    els.connect = byId('btn-connect');
    els.disconnect = byId('btn-disconnect');
    els.setCurrent = byId('btn-set-current');
    els.goTo = byId('btn-go-to');
    els.stop = byId('btn-stop');
    els.spin = byId('btn-spin');

    els.url.value = data.rosbridgeUrl || 'ws://127.0.0.1:9090';
    els.graph.value = data.defaultGraph || 1;
    renderPlaces();
    bindPlaces();
    bindCommands();
    setStatus('Desconectado', '');
    log('Pagina lista. Selecciona un lugar y conecta ROSBridge.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
