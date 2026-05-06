(function () {
  'use strict';

  var data = window.NavigationUtilitiesData || {};
  var selectedPlace = '';
  var els = {};
  var firstPoseLogged = false;
  var lastSetCurrentAt = 0;

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

  function writeDiagnosticsJson(payload) {
    if (!els.diagnosticsJson) {
      return;
    }

    try {
      els.diagnosticsJson.value = JSON.stringify(payload, null, 2);
    } catch (error) {
      els.diagnosticsJson.value = String(payload);
    }
  }

  function buildNextActions(missingRequired, missingOptional) {
    if (!missingRequired || !missingRequired.length) {
      return [
        'Los servicios core de navigation_utilities estan disponibles.',
        'Prueba Definir ubicacion actual y luego Navegar al punto.'
      ];
    }

    return [
      'ROSBridge responde, pero faltan servicios core /navigation_utilities.',
      'Corre o revisa el launch del robot que inicia NavigationUtilities.py o NavigationUtilitiesLocal.py.',
      'Si el launch ya corrio, probablemente se quedo esperando move_base, static_map o pytoolkit antes de registrar los servicios.',
      'Vuelve a presionar Diagnosticar servicios despues de iniciar Launch biblio nav.'
    ];
  }

  function parseJsonField(field, fallback) {
    if (!field || !field.value) {
      return fallback;
    }

    try {
      return JSON.parse(field.value);
    } catch (error) {
      log('JSON invalido: ' + error.message);
      return fallback;
    }
  }

  function bindSafeTap(element, handler) {
    var lastTouch = 0;

    element.ontouchend = function (event) {
      lastTouch = new Date().getTime();
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      handler();
      return false;
    };

    element.onclick = function () {
      if (new Date().getTime() - lastTouch < 700) {
        return false;
      }
      handler();
      return false;
    };
  }

  function runDiagnostics() {
    if (!requireConnection(true)) {
      writeDiagnosticsJson({
        ok: false,
        error: 'ROSBridge no conectado',
        rosbridgeUrl: currentUrl(),
        createdAt: new Date().toISOString()
      });
      return;
    }

    window.PepperRosNavigation.checkNavigationServices(function (result) {
      var payload = {
        ok: result.missingRequired.length === 0,
        rosbridgeUrl: currentUrl(),
        createdAt: new Date().toISOString(),
        expected: result.expected,
        required: result.required,
        optional: result.optional,
        missing: result.missing,
        missingRequired: result.missingRequired,
        missingOptional: result.missingOptional,
        navigationServices: result.interestingServices,
        navigationNodes: result.interestingNodes,
        pytoolkitNavigateToRequest: result.pytoolkitNavigateToRequest,
        serviceCount: result.services.length,
        nodeCount: result.nodes.length,
        nextActions: buildNextActions(result.missingRequired, result.missingOptional)
      };

      writeDiagnosticsJson(payload);
      log('Diagnostico de servicios ROS. Core faltantes: ' + (result.missingRequired.length ? result.missingRequired.join(', ') : 'ninguno'), {
        required: payload.required,
        optional: payload.optional,
        missingRequired: payload.missingRequired,
        missingOptional: payload.missingOptional,
        navigationServices: payload.navigationServices,
        navigationNodes: payload.navigationNodes,
        pytoolkitNavigateToRequest: payload.pytoolkitNavigateToRequest,
        nextActions: payload.nextActions
      });
    }, function (error) {
      writeDiagnosticsJson({
        ok: false,
        error: error,
        rosbridgeUrl: currentUrl(),
        createdAt: new Date().toISOString()
      });
      log('No se pudo consultar /rosapi/services: ' + error);
    });
  }

  function setStatus(label, state) {
    els.statusText.textContent = label;
    els.statusDot.className = 'status-dot' + (state ? ' ' + state : '');
  }

  function currentUrl() {
    return normalizeRosbridgeValue(els.url.value || data.rosbridgeUrl || '');
  }

  function normalizeRosbridgeValue(value) {
    var clean = value || '';

    clean = clean.replace(/^\s+|\s+$/g, '');
    if (!clean) {
      return '';
    }

    if (clean.indexOf('ws://') === 0 || clean.indexOf('wss://') === 0) {
      return clean;
    }

    clean = clean.replace(/^https?:\/\//, '');
    clean = clean.replace(/\/.*$/, '');
    clean = clean.replace(/:\d+$/, '');

    return 'ws://' + clean + ':9090';
  }

  function ipFromRosbridgeUrl(value) {
    var clean = value || '';

    clean = clean.replace(/^wss?:\/\//, '');
    clean = clean.replace(/:\d+.*$/, '');
    clean = clean.replace(/\/.*$/, '');
    if (clean === '127.0.0.1' || clean === 'localhost') {
      return '';
    }

    return clean;
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
    var graph = window.PepperRosNavigation && window.PepperRosNavigation.getClientGraph ? window.PepperRosNavigation.getClientGraph() : null;
    var places = graph ? graph.places : data.testPlaces || [];
    var basePlace = window.PepperRosNavigation && window.PepperRosNavigation.getBasePlace ? window.PepperRosNavigation.getBasePlace() : '';
    var html = '';
    var i;
    var place;
    var selectedStillExists = false;

    for (i = 0; i < places.length; i += 1) {
      if (places[i].name === selectedPlace) {
        selectedStillExists = true;
      }
    }

    if (!selectedStillExists) {
      selectedPlace = places.length ? places[0].name : '';
    }

    if (!places.length) {
      els.places.innerHTML = '<p class="empty-state">No hay puntos guardados. Conecta ROSBridge, escribe un nombre y presiona Guardar punto actual.</p>';
      return;
    }

    for (i = 0; i < places.length; i += 1) {
      place = places[i];
      html += '<button class="place-button' + (place.name === selectedPlace ? ' active' : '') + (place.name === basePlace ? ' base-place' : '') + '" data-place="' + place.name + '">';
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

  function selectedPlaceRequired() {
    if (!selectedPlace) {
      log('No hay punto seleccionado. Guarda o importa un punto primero.');
      return false;
    }
    return true;
  }

  function readEdgesField() {
    var edges = els.edges && els.edges.value ? els.edges.value.split(',') : [];
    var i;

    for (i = 0; i < edges.length; i += 1) {
      edges[i] = edges[i].replace(/^\s+|\s+$/g, '');
    }

    return edges;
  }

  function readEdgeOptions() {
    return {
      advanceMeters: Number((els.edgeAdvance && els.edgeAdvance.value ? els.edgeAdvance.value : '0').replace(',', '.')) || 0,
      turnDegrees: Number((els.edgeTurn && els.edgeTurn.value ? els.edgeTurn.value : '0').replace(',', '.')) || 0,
      invertOnReturn: true
    };
  }

  function generatedPlaceName() {
    var graph = window.PepperRosNavigation && window.PepperRosNavigation.getClientGraph ? window.PepperRosNavigation.getClientGraph() : { places: [] };
    var index = graph.places.length + 1;
    var exists = true;
    var i;

    while (exists) {
      exists = false;
      for (i = 0; i < graph.places.length; i += 1) {
        if (graph.places[i].name === 'punto_' + index) {
          exists = true;
          index += 1;
          break;
        }
      }
    }

    return 'punto_' + index;
  }

  function clearPlaceForm() {
    els.placeName.value = '';
    els.edges.value = selectedPlace || '';
    els.edgeAdvance.value = '0';
    els.edgeTurn.value = '0';
  }

  function bindCommands() {
    function connectToUrl(url) {
      setStatus('Conectando...', 'scanning');
      window.PepperRosNavigation.configure(data);
      window.PepperRosNavigation.setRosbridgeUrl(url);
      els.url.value = ipFromRosbridgeUrl(url);
      window.PepperRosNavigation.connect(url, function () {
        setStatus('Conectado a ' + url, 'connected');
        log('ROSBridge conectado.');
        window.PepperRosNavigation.startPoseTracking(function (pose) {
          if (!firstPoseLogged) {
            firstPoseLogged = true;
            log('AMCL pose recibido: x ' + Math.round(pose.position.x * 100) / 100 + ', y ' + Math.round(pose.position.y * 100) / 100);
          }
        }, function (error) {
          log('No se pudo escuchar /amcl_pose: ' + error);
        });
      }, function (error) {
        setStatus('Error de conexion', 'error');
        log('No se pudo conectar ROSBridge: ' + error);
      });
    }

    els.connect.onclick = function () {
      var url = currentUrl();

      if (!url) {
        setStatus('Falta IP del robot', 'error');
        log('Escribe la IP del robot. Ejemplo: 192.168.0.208');
        return;
      }

      connectToUrl(url);
    };

    els.disconnect.onclick = function () {
      window.PepperRosNavigation.disconnect();
      setStatus('Desconectado', '');
      log('ROSBridge desconectado.');
    };

    els.prepare.onclick = function () {
      if (!requireConnection(true)) {
        return;
      }
      window.PepperRosNavigation.prepareNavigation(function (response) {
        log('Parametros de navegacion enviados.', response);
        runDiagnostics();
      }, function (error) {
        log('No se pudieron enviar parametros de navegacion: ' + error);
      });
    };

    els.diagnostics.onclick = function () {
      runDiagnostics();
    };

    els.newPlace.onclick = function () {
      clearPlaceForm();
      log('Campos listos para guardar un nuevo punto.');
    };

    bindSafeTap(els.setCurrent, function () {
      if (!requireConnection(true)) {
        return;
      }
      if (!selectedPlaceRequired()) {
        return;
      }
      window.PepperRosNavigation.setCurrentPlaceLocal(selectedPlace, function (response) {
        lastSetCurrentAt = new Date().getTime();
        log('Punto actual definido en grafo JS: ' + selectedPlace, response);
      }, function (error) {
        log('No se pudo definir punto actual en grafo JS: ' + error);
      });
    });

    bindSafeTap(els.setBase, function () {
      var placeName = selectedPlace || els.placeName.value;

      if (!placeName) {
        log('Guarda o selecciona un punto antes de marcar la base.');
        return;
      }

      if (!selectedPlace) {
        if (!requireConnection(true)) {
          return;
        }
        window.PepperRosNavigation.addCurrentPlaceLocal(placeName, true, readEdgesField(), function () {
          selectedPlace = placeName;
          window.PepperRosNavigation.setBasePlaceLocal(placeName, function (response) {
            log('Punto guardado y definido como base: ' + placeName, response);
            renderPlaces();
          }, function (error) {
            log('No se pudo definir base: ' + error);
          });
        }, function (error) {
          log('No se pudo guardar punto para base: ' + error);
        }, readEdgeOptions());
        return;
      }

      window.PepperRosNavigation.setBasePlaceLocal(placeName, function (response) {
        selectedPlace = placeName;
        log('Base definida: ' + placeName, response);
        renderPlaces();
      }, function (error) {
        log('No se pudo definir base: ' + error);
      });
    });

    els.addPlace.onclick = function () {
      var edges = readEdgesField();
      var placeName = els.placeName.value || generatedPlaceName();

      if (!requireConnection(true)) {
        return;
      }

      window.PepperRosNavigation.addCurrentPlaceLocal(placeName, true, edges, function (response) {
        selectedPlace = response.place && response.place.name ? response.place.name : selectedPlace;
        log('Punto guardado: ' + selectedPlace + '. Ya puedes moverte y guardar el siguiente.', response);
        renderPlaces();
        clearPlaceForm();
      }, function (error) {
        log('No se pudo guardar punto actual en grafo JS: ' + error);
      }, readEdgeOptions());
    };

    els.position.onclick = function () {
      if (!requireConnection(true)) {
        return;
      }
      var pose = window.PepperRosNavigation.getLastAmclPose();

      if (!pose) {
        log('Todavia no hay /amcl_pose. Espera unos segundos despues de conectar.');
        return;
      }

      log('Ultima posicion AMCL.', {
        x: Math.round(pose.position.x * 100) / 100,
        y: Math.round(pose.position.y * 100) / 100,
        orientation: pose.orientation
      });
    };

    els.moveRelative.onclick = function () {
      var rawRequest;

      if (!requireConnection(true)) {
        return;
      }

      rawRequest = parseJsonField(els.movePayload, null);
      if (rawRequest) {
        window.PepperRosNavigation.callPyToolkitMoveRelativeRaw(rawRequest, function (response) {
          log('pytoolkit move_relative_srv OK con JSON manual.', response);
        }, function (error) {
          log('pytoolkit move_relative_srv fallo con JSON manual: ' + error);
        });
        return;
      }

      window.PepperRosNavigation.moveRelativeWithPyToolkit(els.relativeX.value.replace(',', '.'), els.relativeY.value.replace(',', '.'), function (response) {
        log('pytoolkit move_relative_srv OK.', response);
      }, function (error) {
        log('pytoolkit move_relative_srv fallo: ' + error);
      });
    };

    bindSafeTap(els.goTo, function () {
      if (!requireConnection(true)) {
        return;
      }
      if (new Date().getTime() - lastSetCurrentAt < 900) {
        log('Toque de navegar ignorado para evitar doble toque accidental despues de definir ubicacion.');
        return;
      }
      window.PepperRosNavigation.navigateGraphClient(selectedPlace, currentGraph() === 1, function (response) {
        log('Navegacion JS por move_base finalizada hacia ' + selectedPlace, response);
      }, function (error) {
        log('Navegacion JS por move_base fallo: ' + error);
      }, function (feedback, place, route, index) {
        if (feedback && typeof feedback.advanceMeters === 'number') {
          log('Avanzando ' + feedback.advanceMeters + ' m en la maniobra hacia ' + place.name + '.');
          return;
        }
        if (feedback && typeof feedback.turnDegrees === 'number') {
          log('Girando ' + feedback.turnDegrees + ' grados antes de navegar hacia ' + place.name + '.');
          return;
        }
        log('Moviendo hacia ' + place.name + ' (' + (index + 1) + '/' + route.length + ')');
      });
    });

    bindSafeTap(els.goBase, function () {
      if (!requireConnection(true)) {
        return;
      }
      window.PepperRosNavigation.navigateToBase(function (response) {
        log('Robot regreso a base.', response);
      }, function (error) {
        log('No se pudo volver a base: ' + error);
      }, function (feedback, place, route, index) {
        if (feedback && typeof feedback.advanceMeters === 'number') {
          log('Avanzando ' + feedback.advanceMeters + ' m en la maniobra de regreso via ' + place.name + '.');
          return;
        }
        if (feedback && typeof feedback.turnDegrees === 'number') {
          if (feedback.returnPreparation) {
            log('Girando 180 grados para iniciar regreso a base.');
            return;
          }
          if (feedback.finalAlignment) {
            log('Alineando en base con giro final de 180 grados.');
            return;
          }
          log('Girando ' + feedback.turnDegrees + ' grados antes de volver via ' + place.name + '.');
          return;
        }
        log('Volviendo a base via ' + place.name + ' (' + (index + 1) + '/' + route.length + ')');
      });
    });

    els.stop.onclick = function () {
      if (!requireConnection(true)) {
        return;
      }
      window.PepperRosNavigation.cancelMoveBase(function (response) {
        log('Goal de move_base cancelado.', response);
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

    els.exportGraph.onclick = function () {
      writeDiagnosticsJson(window.PepperRosNavigation.exportGraph());
      log('Grafo exportado al panel JSON.');
    };

    els.importGraph.onclick = function () {
      var payload = parseJsonField(els.diagnosticsJson, null);

      if (!payload) {
        return;
      }

      window.PepperRosNavigation.importGraph(payload, function (response) {
        log('Grafo importado.', response);
        selectedPlace = '';
        renderPlaces();
      }, function (error) {
        log('No se pudo importar grafo: ' + error);
      });
    };

    els.clearGraph.onclick = function () {
      window.PepperRosNavigation.clearLocalGraph(function () {
        selectedPlace = '';
        renderPlaces();
        writeDiagnosticsJson(window.PepperRosNavigation.exportGraph());
        log('Grafo local borrado. Listo para crear puntos desde cero.');
      });
    };

    els.deletePlace.onclick = function () {
      if (!selectedPlaceRequired()) {
        return;
      }

      window.PepperRosNavigation.deletePlaceLocal(selectedPlace, function (response) {
        log('Punto borrado: ' + selectedPlace, response);
        selectedPlace = '';
        renderPlaces();
        writeDiagnosticsJson(window.PepperRosNavigation.exportGraph());
      }, function (error) {
        log('No se pudo borrar punto: ' + error);
      });
    };
  }

  function boot() {
    els.url = byId('rosbridge-url');
    els.graph = byId('graph-value');
    els.degrees = byId('spin-degrees');
    els.relativeX = byId('relative-x');
    els.relativeY = byId('relative-y');
    els.movePayload = byId('move-payload');
    els.placeName = byId('place-name');
    els.edges = byId('place-edges');
    els.edgeAdvance = byId('edge-advance');
    els.edgeTurn = byId('edge-turn');
    els.persist = byId('place-persist');
    els.statusText = byId('status-text');
    els.statusDot = byId('status-dot');
    els.places = byId('places-grid');
    els.log = byId('log');
    els.diagnosticsJson = byId('diagnostics-json');
    els.connect = byId('btn-connect');
    els.disconnect = byId('btn-disconnect');
    els.prepare = byId('btn-prepare');
    els.diagnostics = byId('btn-diagnostics');
    els.newPlace = byId('btn-new-place');
    els.setCurrent = byId('btn-set-current');
    els.setBase = byId('btn-set-base');
    els.goTo = byId('btn-go-to');
    els.goBase = byId('btn-go-base');
    els.stop = byId('btn-stop');
    els.spin = byId('btn-spin');
    els.addPlace = byId('btn-add-place');
    els.position = byId('btn-position');
    els.moveRelative = byId('btn-move-relative');
    els.exportGraph = byId('btn-export-graph');
    els.importGraph = byId('btn-import-graph');
    els.clearGraph = byId('btn-clear-graph');
    els.deletePlace = byId('btn-delete-place');

    window.PepperRosNavigation.configure(data);
    els.url.value = ipFromRosbridgeUrl(window.PepperRosNavigation.getRosbridgeUrl());
    els.graph.value = data.defaultGraph || 1;
    els.movePayload.value = '{"x_coordinate":0.2,"y_coordinate":0}';
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
