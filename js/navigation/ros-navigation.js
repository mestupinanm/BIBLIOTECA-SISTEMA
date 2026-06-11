(function () {
  'use strict';

  var Navigation = {};
  var config = window.NavigationUtilitiesData || {};
  var ros = null;
  var status = 'disconnected';
  var connectedUrl = '';
  var pendingConnectCallbacks = [];
  var feedbackSubscriptions = {};
  var poseTopic = null;
  var lastAmclPose = null;
  var currentPlace = '';
  var moveBaseClient = null;
  var activeGoal = null;

  function getServices() {
    return config.services || {};
  }

  function getTopics() {
    return config.topics || {};
  }

  function getDefaultGraph() {
    return typeof config.defaultGraph === 'number' ? config.defaultGraph : 1;
  }

  function canUseLocalStorage() {
    try {
      return !!window.localStorage;
    } catch (error) {
      return false;
    }
  }

  function getStoredUrl() {
    var key = config.rosbridgeStorageKey;

    if (!key || !canUseLocalStorage()) {
      return '';
    }

    return window.localStorage.getItem(key) || '';
  }

  function getQueryUrl() {
    var match;

    if (!window.location || !window.location.search) {
      return '';
    }

    match = window.location.search.match(/[?&]rosbridge=([^&]+)/);
    if (!match || !match[1]) {
      return '';
    }

    return decodeURIComponent(match[1]);
  }

  function getRosbridgeUrl() {
    return getQueryUrl() || getStoredUrl() || config.rosbridgeUrl || 'ws://127.0.0.1:9090';
  }

  function getBasePlaceName() {
    var key = config.basePlaceStorageKey;

    if (!key || !canUseLocalStorage()) {
      return '';
    }

    return window.localStorage.getItem(key) || '';
  }

  function setBasePlaceName(placeName) {
    var key = config.basePlaceStorageKey;

    if (!key || !canUseLocalStorage()) {
      return;
    }

    window.localStorage.setItem(key, placeName || '');
  }

  function buildNavigationToolsRequest() {
    return {
      data: {
        command: 'custom',
        tf_enable: true,
        tf_frequency: 50.0,
        odom_enable: true,
        odom_frequency: 50.0,
        laser_enable: true,
        laser_frequency: 10.0,
        cmd_vel_enable: true,
        security_timer: 5.0,
        move_base_enable: true,
        goal_enable: false,
        robot_pose_suscriber_enable: false,
        path_enable: false,
        path_frequency: 0.0,
        robot_pose_publisher_enable: false,
        robot_pose_publisher_frequency: 0.0,
        result_enable: false,
        depth_to_laser_enable: false,
        depth_to_laser_parameters: {
          resolution: 1,
          scan_time: 1.0,
          range_min: 0.45,
          range_max: 10.0,
          scan_height: 120
        },
        free_zone_enable: false
      }
    };
  }

  function clonePlaces() {
    var places = [];
    var source = config.testPlaces || [];
    var i;

    if (config.includeDemoPlaces === false) {
      return places;
    }

    for (i = 0; i < source.length; i += 1) {
      places.push({
        name: source[i].name,
        x: Number(source[i].x) || 0,
        y: Number(source[i].y) || 0,
        theta: Number(source[i].theta) || 0,
        known: source[i].known !== false
      });
    }

    return places;
  }

  function cloneEdges() {
    var edges = [];
    var source = config.testEdges || [];
    var i;

    if (config.includeDemoPlaces === false) {
      return edges;
    }

    for (i = 0; i < source.length; i += 1) {
      edges.push([source[i][0], source[i][1]]);
    }

    return edges;
  }

  function loadLocalGraph() {
    var key = config.graphStorageKey;
    var raw;

    if (!key || !canUseLocalStorage()) {
      return { places: [], edges: [] };
    }

    raw = window.localStorage.getItem(key);
    if (!raw) {
      return { places: [], edges: [], edgeMeta: {} };
    }

    try {
      raw = JSON.parse(raw);
      raw.places = raw.places || [];
      raw.edges = raw.edges || [];
      raw.edgeMeta = raw.edgeMeta || {};
      return raw;
    } catch (error) {
      return { places: [], edges: [], edgeMeta: {} };
    }
  }

  function saveLocalGraph(localGraph) {
    var key = config.graphStorageKey;

    if (!key || !canUseLocalStorage()) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(localGraph));
  }

  function getGraph() {
    var graph = {
      places: clonePlaces(),
      edges: cloneEdges(),
      edgeMeta: {}
    };
    var localGraph = loadLocalGraph();
    var placeByName = {};
    var i;

    for (i = 0; i < graph.places.length; i += 1) {
      placeByName[graph.places[i].name] = graph.places[i];
    }

    for (i = 0; i < localGraph.places.length; i += 1) {
      placeByName[localGraph.places[i].name] = localGraph.places[i];
    }

    graph.places = [];
    for (i in placeByName) {
      if (placeByName.hasOwnProperty(i)) {
        graph.places.push(placeByName[i]);
      }
    }

    for (i = 0; i < localGraph.edges.length; i += 1) {
      graph.edges.push(localGraph.edges[i]);
    }
    var staticEdgeMeta = config.defaultGraphData && config.defaultGraphData.graph ? (config.defaultGraphData.graph.edgeMeta || {}) : {};
    var localEdgeMeta = localGraph.edgeMeta || {};
    var k;
    graph.edgeMeta = {};
    for (k in localEdgeMeta) {
      if (localEdgeMeta.hasOwnProperty(k)) {
        graph.edgeMeta[k] = localEdgeMeta[k];
      }
    }
    for (k in staticEdgeMeta) {
      if (staticEdgeMeta.hasOwnProperty(k)) {
        graph.edgeMeta[k] = staticEdgeMeta[k];
      }
    }

    return graph;
  }

  function edgeKey(from, to) {
    return from + '->' + to;
  }

  function getEdgeMeta(from, to) {
    var graph = getGraph();
    var direct = graph.edgeMeta[edgeKey(from, to)];
    var reverse = graph.edgeMeta[edgeKey(to, from)];
    var meta;

    if (direct) {
      if (from === 'base' && !direct.advanceMeters) {
        direct = { advanceMeters: 0.4, turnDegrees: direct.turnDegrees || 0, actionOrder: direct.actionOrder || 'advance-turn', invertOnReturn: direct.invertOnReturn !== false };
      }
      return direct;
    }

    if (reverse && reverse.invertOnReturn) {
      meta = {};
      meta.advanceMeters = Number(reverse.advanceMeters) || 0;
      meta.turnDegrees = -(Number(reverse.turnDegrees) || 0);
      meta.actionOrder = 'navigate-turn-advance';
      meta.invertOnReturn = true;
      return meta;
    }

    if (from === 'base') {
      return { advanceMeters: 0.4, turnDegrees: 0, actionOrder: 'advance-turn', invertOnReturn: true };
    }

    return { advanceMeters: 0, turnDegrees: 0, actionOrder: 'advance-turn', invertOnReturn: true };
  }

  function findPlace(name) {
    var graph = getGraph();
    var i;
    var stripped;

    for (i = 0; i < graph.places.length; i += 1) {
      if (graph.places[i].name === name) {
        return graph.places[i];
      }
    }

    // shelf_01 → shelf_1: strip leading zeros from numeric suffix
    stripped = name.replace(/^([a-z_]+?)0*(\d+)$/, '$1$2');
    if (stripped !== name) {
      for (i = 0; i < graph.places.length; i += 1) {
        if (graph.places[i].name === stripped) {
          return graph.places[i];
        }
      }
    }

    return null;
  }

  function shortestRoute(source, target) {
    var graph = getGraph();
    var queue = [[source]];
    var visited = {};
    var i;
    var path;
    var node;
    var next;

    visited[source] = true;

    while (queue.length) {
      path = queue.shift();
      node = path[path.length - 1];
      if (node === target) {
        return path;
      }

      for (i = 0; i < graph.edges.length; i += 1) {
        next = null;
        if (graph.edges[i][0] === node) {
          next = graph.edges[i][1];
        } else if (graph.edges[i][1] === node) {
          next = graph.edges[i][0];
        }

        if (next && !visited[next]) {
          visited[next] = true;
          queue.push(path.concat([next]));
        }
      }
    }

    return [target];
  }

  function thetaToQuaternion(theta) {
    var yaw = Number(theta) || 0;

    if (Math.abs(yaw) > 6.283185307179586) {
      yaw = yaw * Math.PI / 180;
    }

    return {
      x: 0,
      y: 0,
      z: Math.sin(yaw / 2),
      w: Math.cos(yaw / 2)
    };
  }

  function quaternionToTheta(orientation) {
    var z = orientation && typeof orientation.z === 'number' ? orientation.z : 0;
    var w = orientation && typeof orientation.w === 'number' ? orientation.w : 1;

    return Math.round((Math.atan2(2 * w * z, 1 - 2 * z * z) * 180 / Math.PI) * 100) / 100;
  }

  function poseYawRadians(pose) {
    var orientation = pose && pose.orientation ? pose.orientation : {};
    var z = typeof orientation.z === 'number' ? orientation.z : 0;
    var w = typeof orientation.w === 'number' ? orientation.w : 1;

    return Math.atan2(2 * w * z, 1 - 2 * z * z);
  }

  function ensureMoveBaseClient() {
    if (!moveBaseClient) {
      moveBaseClient = new window.ROSLIB.ActionClient({
        ros: ros,
        serverName: '/move_base',
        actionName: 'move_base_msgs/MoveBaseAction'
      });
    }

    return moveBaseClient;
  }

  function notifyConnectQueue(error) {
    var callbacks = pendingConnectCallbacks.slice(0);
    var i;

    pendingConnectCallbacks = [];
    for (i = 0; i < callbacks.length; i += 1) {
      if (error && callbacks[i].onError) {
        callbacks[i].onError(error);
      } else if (!error && callbacks[i].onSuccess) {
        callbacks[i].onSuccess(ros);
      }
    }
  }

  function normalizeError(error) {
    if (!error) {
      return 'Error desconocido';
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error.message) {
      return error.message;
    }
    return String(error);
  }

  function callNamedService(serviceConfig, request, onSuccess, onError) {
    var service;
    var serviceRequest;

    if (!serviceConfig || !serviceConfig.name || !serviceConfig.type) {
      if (onError) {
        onError('Servicio ROS no configurado.');
      }
      return;
    }

    if (!ros || status !== 'connected') {
      if (onError) {
        onError('ROSBridge no esta conectado.');
      }
      return;
    }

    try {
      service = new window.ROSLIB.Service({
        ros: ros,
        name: serviceConfig.name,
        serviceType: serviceConfig.type
      });
      serviceRequest = new window.ROSLIB.ServiceRequest(request || {});
      service.callService(serviceRequest, function (response) {
        if (onSuccess) {
          onSuccess(response || {});
        }
      }, function (error) {
        if (onError) {
          onError(serviceConfig.name + ' [' + serviceConfig.type + ']: ' + normalizeError(error));
        }
      });
    } catch (error) {
      if (onError) {
        onError(normalizeError(error));
      }
    }
  }

  Navigation.configure = function (newConfig) {
    var key;

    if (!newConfig) {
      return;
    }

    for (key in newConfig) {
      if (newConfig.hasOwnProperty(key)) {
        config[key] = newConfig[key];
      }
    }
  };

  Navigation.getRosbridgeUrl = getRosbridgeUrl;

  Navigation.setRosbridgeUrl = function (url) {
    var key = config.rosbridgeStorageKey;

    config.rosbridgeUrl = url;
    if (key && canUseLocalStorage()) {
      window.localStorage.setItem(key, url);
    }
  };

  Navigation.connect = function (url, onSuccess, onError) {
    var targetUrl = url || getRosbridgeUrl();
    var activeRos;

    if (!window.ROSLIB || !window.ROSLIB.Ros) {
      if (onError) {
        onError('ROSLIB no esta disponible en esta pagina.');
      }
      return;
    }

    if (status === 'connected' && connectedUrl === targetUrl && ros) {
      if (onSuccess) {
        onSuccess(ros);
      }
      return;
    }

    if (status === 'connecting') {
      pendingConnectCallbacks.push({ onSuccess: onSuccess, onError: onError });
      return;
    }

    Navigation.disconnect();
    status = 'connecting';
    connectedUrl = targetUrl;
    pendingConnectCallbacks.push({ onSuccess: onSuccess, onError: onError });

    try {
      activeRos = new window.ROSLIB.Ros({ url: targetUrl });
      ros = activeRos;
      activeRos.on('connection', function () {
        if (ros !== activeRos) {
          return;
        }
        status = 'connected';
        notifyConnectQueue();
      });
      activeRos.on('error', function (error) {
        if (ros !== activeRos) {
          return;
        }
        status = 'error';
        notifyConnectQueue(normalizeError(error));
      });
      activeRos.on('close', function () {
        if (ros !== activeRos) {
          return;
        }
        status = 'disconnected';
      });
    } catch (error) {
      status = 'error';
      notifyConnectQueue(normalizeError(error));
    }
  };

  Navigation.disconnect = function () {
    var name;

    for (name in feedbackSubscriptions) {
      if (feedbackSubscriptions.hasOwnProperty(name) && feedbackSubscriptions[name].unsubscribe) {
        feedbackSubscriptions[name].unsubscribe();
      }
    }
    feedbackSubscriptions = {};
    if (poseTopic && poseTopic.unsubscribe) {
      poseTopic.unsubscribe();
    }
    poseTopic = null;
    lastAmclPose = null;
    moveBaseClient = null;
    activeGoal = null;

    if (ros && ros.close) {
      try {
        ros.close();
      } catch (error) {
        console.log('[ROS Navigation] Error cerrando ROSBridge.', error);
      }
    }

    ros = null;
    status = 'disconnected';
  };

  Navigation.isConnected = function () {
    return status === 'connected' && !!ros;
  };

  Navigation.getStatus = function () {
    return {
      status: status,
      url: connectedUrl || getRosbridgeUrl()
    };
  };

  Navigation.resolveDestination = function (destinationId) {
    var destinations = config.appDestinations || {};
    var match = destinations[destinationId];

    if (match && match.place) {
      return {
        id: destinationId,
        place: match.place,
        graph: typeof match.graph === 'number' ? match.graph : getDefaultGraph()
      };
    }

    return {
      id: destinationId,
      place: destinationId,
      graph: getDefaultGraph()
    };
  };

  Navigation.goToPlace = function (placeName, graph, onSuccess, onError) {
    callNamedService(getServices().goToPlace, {
      name: placeName,
      graph: typeof graph === 'number' ? graph : getDefaultGraph()
    }, onSuccess, onError);
  };

  Navigation.setCurrentPlace = function (placeName, onSuccess, onError) {
    callNamedService(getServices().setCurrentPlace, {
      name: placeName
    }, onSuccess, onError);
  };

  Navigation.stop = function (onSuccess, onError) {
    callNamedService(getServices().stop, {}, onSuccess, onError);
  };

  Navigation.spin = function (degrees, onSuccess, onError) {
    callNamedService(getServices().spin, {
      degrees: Number(degrees) || 0
    }, onSuccess, onError);
  };

  Navigation.startPoseTracking = function (onPose, onError) {
    var topicConfig = getTopics().amclPose;

    if (!ros || status !== 'connected') {
      if (onError) {
        onError('ROSBridge no esta conectado.');
      }
      return;
    }

    if (poseTopic && poseTopic.unsubscribe) {
      poseTopic.unsubscribe();
    }

    poseTopic = new window.ROSLIB.Topic({
      ros: ros,
      name: topicConfig.name,
      messageType: topicConfig.type
    });

    poseTopic.subscribe(function (message) {
      var pose = message && message.pose && message.pose.pose ? message.pose.pose : null;

      if (!pose) {
        return;
      }

      lastAmclPose = pose;
      if (onPose) {
        onPose(pose);
      }
    });
  };

  Navigation.getLastAmclPose = function () {
    return lastAmclPose;
  };

  Navigation.getClientGraph = function () {
    return getGraph();
  };

  Navigation.getBasePlace = getBasePlaceName;

  Navigation.setBasePlaceLocal = function (placeName, onSuccess, onError) {
    if (!findPlace(placeName)) {
      if (onError) {
        onError('El punto no existe en el grafo JS: ' + placeName);
      }
      return;
    }

    setBasePlaceName(placeName);
    if (onSuccess) {
      onSuccess({ answer: 'approved', basePlace: placeName });
    }
  };

  Navigation.setCurrentPlaceLocal = function (placeName, onSuccess, onError) {
    if (!findPlace(placeName)) {
      if (onError) {
        onError('El punto no existe en el grafo JS: ' + placeName);
      }
      return;
    }

    currentPlace = placeName;
    if (onSuccess) {
      onSuccess({ answer: 'approved', currentPlace: currentPlace });
    }
  };

  Navigation.addCurrentPlaceLocal = function (placeName, persist, edges, onSuccess, onError, edgeOptions) {
    var localGraph;
    var pose = lastAmclPose;
    var place;
    var i;

    if (!pose) {
      if (onError) {
        onError('Todavia no hay /amcl_pose. Espera unos segundos despues de conectar.');
      }
      return;
    }

    localGraph = loadLocalGraph();
    localGraph.edgeMeta = localGraph.edgeMeta || {};
    place = {
      name: placeName,
      x: Math.round(pose.position.x * 100) / 100,
      y: Math.round(pose.position.y * 100) / 100,
      theta: quaternionToTheta(pose.orientation),
      known: true
    };

    for (i = localGraph.places.length - 1; i >= 0; i -= 1) {
      if (localGraph.places[i].name === placeName) {
        localGraph.places.splice(i, 1);
      }
    }

    localGraph.places.push(place);
    for (i = 0; i < edges.length; i += 1) {
      if (edges[i]) {
        localGraph.edges.push([placeName, edges[i]]);
        localGraph.edgeMeta[edgeKey(edges[i], placeName)] = {
          advanceMeters: edgeOptions && typeof edgeOptions.advanceMeters === 'number' ? edgeOptions.advanceMeters : 0,
          turnDegrees: edgeOptions && typeof edgeOptions.turnDegrees === 'number' ? edgeOptions.turnDegrees : 0,
          actionOrder: 'advance-turn',
          invertOnReturn: !edgeOptions || edgeOptions.invertOnReturn !== false
        };
      }
    }

    if (persist) {
      saveLocalGraph(localGraph);
    }

    if (onSuccess) {
      onSuccess({ answer: 'approved', place: place, edges: edges, edgeOptions: edgeOptions || {} });
    }
  };

  Navigation.cancelMoveBase = function (onSuccess) {
    if (activeGoal && activeGoal.cancel) {
      activeGoal.cancel();
    }
    activeGoal = null;
    if (onSuccess) {
      onSuccess({ answer: 'cancelled' });
    }
  };

  Navigation.sendMoveBasePlace = function (placeName, onSuccess, onError, onFeedback) {
    var place = findPlace(placeName);
    var attempt = 0;
    var ARRIVAL_THRESHOLD = 1.0;

    if (!place) {
      if (onError) {
        onError('El punto no existe en el grafo JS: ' + placeName);
      }
      return;
    }

    if (!ros || status !== 'connected') {
      if (onError) {
        onError('ROSBridge no esta conectado.');
      }
      return;
    }

    function computeTheta() {
      if (lastAmclPose) {
        var dx = Number(place.x) - lastAmclPose.position.x;
        var dy = Number(place.y) - lastAmclPose.position.y;
        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
          return Math.atan2(dy, dx);
        }
        return poseYawRadians(lastAmclPose);
      }
      return Number(place.theta) || 0;
    }

    function sendAttempt() {
      var goal = new window.ROSLIB.Goal({
        actionClient: ensureMoveBaseClient(),
        goalMessage: {
          target_pose: {
            header: { frame_id: 'map' },
            pose: {
              position: {
                x: Number(place.x) || 0,
                y: Number(place.y) || 0,
                z: 0
              },
              orientation: thetaToQuaternion(computeTheta())
            }
          }
        }
      });

      activeGoal = goal;
      goal.on('feedback', function (feedback) {
        if (onFeedback) {
          onFeedback(feedback, place);
        }
      });
      goal.on('result', function (result) {
        var pose = lastAmclPose;
        var dx, dy, dist;

        attempt += 1;

        if (!pose) {
          console.warn('[NAV] move_base terminó pero no hay pose AMCL. Reintentando (intento ' + attempt + ')...');
          sendAttempt();
          return;
        }

        dx = Number(place.x) - pose.position.x;
        dy = Number(place.y) - pose.position.y;
        dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > ARRIVAL_THRESHOLD) {
          console.warn('[NAV] move_base terminó a ' + dist.toFixed(2) + 'm de ' + placeName + '. Reintentando (intento ' + attempt + ')...');
          sendAttempt();
          return;
        }

        if (onSuccess) {
          onSuccess(result || {}, place);
        }
      });
      goal.send();
    }

    sendAttempt();
  };

  Navigation.rotateInPlace = function (degrees, onSuccess, onError) {
    var pose = lastAmclPose;
    var yaw;
    var goal;

    if (!pose) {
      if (onError) {
        onError('Todavia no hay /amcl_pose para calcular el giro.');
      }
      return;
    }

    yaw = poseYawRadians(pose) - ((Number(degrees) || 0) * Math.PI / 180);
    goal = new window.ROSLIB.Goal({
      actionClient: ensureMoveBaseClient(),
      goalMessage: {
        target_pose: {
          header: {
            frame_id: 'map'
          },
          pose: {
            position: {
              x: pose.position.x,
              y: pose.position.y,
              z: 0
            },
            orientation: thetaToQuaternion(yaw)
          }
        }
      }
    });

    activeGoal = goal;
    goal.on('result', function (result) {
      if (onSuccess) {
        onSuccess(result || {});
      }
    });
    goal.send();
  };

  Navigation.advanceInPlace = function (meters, onSuccess, onError) {
    var pose = lastAmclPose;
    var yaw;
    var goal;

    if (!pose) {
      if (onError) {
        onError('Todavia no hay /amcl_pose para calcular avance.');
      }
      return;
    }

    if (!ros || status !== 'connected') {
      if (onError) {
        onError('ROSBridge no esta conectado.');
      }
      return;
    }

    yaw = poseYawRadians(pose);

    goal = new window.ROSLIB.Goal({
      actionClient: ensureMoveBaseClient(),
      goalMessage: {
        target_pose: {
          header: { frame_id: 'map' },
          pose: {
            position: {
              x: pose.position.x + (Number(meters) || 0) * Math.cos(yaw),
              y: pose.position.y + (Number(meters) || 0) * Math.sin(yaw),
              z: 0
            },
            orientation: { x: 0, y: 0, z: pose.orientation.z, w: pose.orientation.w }
          }
        }
      }
    });

    activeGoal = goal;
    goal.on('result', function (result) {
      if (onSuccess) {
        onSuccess(result || {});
      }
    });
    goal.send();
  };

  Navigation.navigateGraphClient = function (targetPlace, useGraph, onSuccess, onError, onStep) {
    var route = useGraph && currentPlace ? shortestRoute(currentPlace, targetPlace) : [targetPlace];
    var index = 0;
    var next = function () {
      if (index >= route.length) {
        if (onSuccess) {
          onSuccess({ answer: 'approved', route: route });
        }
        return;
      }

      var fromPlace = currentPlace;
      var toPlace = route[index];

      if (fromPlace === toPlace) {
        index += 1;
        next();
        return;
      }

      var meta = fromPlace ? getEdgeMeta(fromPlace, toPlace) : { advanceMeters: 0, turnDegrees: 0, actionOrder: 'advance-turn' };
      var finishStep = function () {
        currentPlace = toPlace;
        index += 1;
        next();
      };
      var sendGoal = function (afterGoal) {
        Navigation.sendMoveBasePlace(toPlace, function () {
          currentPlace = toPlace;
          afterGoal();
        }, onError, function (feedback, place) {
          if (onStep) {
            onStep(feedback, place, route, index);
          }
        });
      };
      var rotateThen = function (afterRotate) {
        if (meta.turnDegrees) {
          if (onStep) {
            onStep({ turnDegrees: meta.turnDegrees }, { name: toPlace }, route, index);
          }
          Navigation.rotateInPlace(meta.turnDegrees, afterRotate, function (err) {
            console.warn('[NAV] giro fallido, continuando sin girar:', err);
            afterRotate();
          });
          return;
        }

        afterRotate();
      };
      var advanceThen = function (afterAdvance) {
        var meters = (fromPlace === 'base') ? 0.4 : (meta.advanceMeters || 0);
        if (meters) {
          if (onStep) {
            onStep({ advanceMeters: meters }, { name: toPlace }, route, index);
          }
          Navigation.advanceInPlace(meters, afterAdvance, function (err) {
            console.warn('[NAV] advance fallido, continuando sin avanzar:', err);
            afterAdvance();
          });
          return;
        }

        afterAdvance();
      };

      if (meta.actionOrder === 'navigate-turn-advance') {
        sendGoal(function () {
          rotateThen(function () {
            advanceThen(finishStep);
          });
        });
        return;
      }

      if (meta.actionOrder === 'turn-navigate-advance') {
        rotateThen(function () {
          sendGoal(function () {
            advanceThen(finishStep);
          });
        });
        return;
      }

      advanceThen(function () {
        rotateThen(function () {
          sendGoal(finishStep);
        });
      });
    };

    next();
  };

  Navigation.navigateToBase = function (onSuccess, onError, onStep) {
    var basePlace = getBasePlaceName();

    if (!basePlace) {
      if (onError) {
        onError('No hay base definida todavia.');
      }
      return;
    }

    if (onStep) {
      onStep({ turnDegrees: 180, returnPreparation: true }, { name: currentPlace || '' }, [], 0);
    }
    Navigation.rotateInPlace(180, function (prepareResponse) {
      Navigation.navigateGraphClient(basePlace, true, function (response) {
        response.returnPreparation = prepareResponse || {};
        if (onStep) {
          onStep({ turnDegrees: 180, finalAlignment: true }, { name: basePlace }, response.route || [], (response.route || []).length);
        }
        Navigation.rotateInPlace(180, function (alignResponse) {
          response.finalAlignment = alignResponse || {};
          if (onSuccess) {
            onSuccess(response);
          }
        }, onError);
      }, onError, onStep);
    }, onError);
  };

  Navigation.exportGraph = function () {
    return {
      version: 2,
      createdAt: new Date().toISOString(),
      basePlace: getBasePlaceName(),
      graph: getGraph()
    };
  };

  Navigation.importGraph = function (payload, onSuccess, onError) {
    var graph = payload && payload.graph ? payload.graph : payload;
    var localGraph;

    if (!graph || !graph.places || !graph.edges) {
      if (onError) {
        onError('JSON de grafo invalido. Debe tener places y edges.');
      }
      return;
    }

    localGraph = {
      places: graph.places,
      edges: graph.edges,
      edgeMeta: graph.edgeMeta || {}
    };
    saveLocalGraph(localGraph);

    if (payload && payload.basePlace) {
      setBasePlaceName(payload.basePlace);
    }

    if (onSuccess) {
      onSuccess({ answer: 'approved', importedPlaces: localGraph.places.length, importedEdges: localGraph.edges.length, basePlace: getBasePlaceName() });
    }
  };

  Navigation.clearLocalGraph = function (onSuccess) {
    if (config.graphStorageKey && canUseLocalStorage()) {
      window.localStorage.removeItem(config.graphStorageKey);
    }
    if (config.basePlaceStorageKey && canUseLocalStorage()) {
      window.localStorage.removeItem(config.basePlaceStorageKey);
    }
    currentPlace = '';
    if (onSuccess) {
      onSuccess({ answer: 'approved' });
    }
  };

  Navigation.deletePlaceLocal = function (placeName, onSuccess, onError) {
    var localGraph = loadLocalGraph();
    var found = false;
    var i;
    var key;

    for (i = localGraph.places.length - 1; i >= 0; i -= 1) {
      if (localGraph.places[i].name === placeName) {
        localGraph.places.splice(i, 1);
        found = true;
      }
    }

    for (i = localGraph.edges.length - 1; i >= 0; i -= 1) {
      if (localGraph.edges[i][0] === placeName || localGraph.edges[i][1] === placeName) {
        localGraph.edges.splice(i, 1);
      }
    }

    localGraph.edgeMeta = localGraph.edgeMeta || {};
    for (key in localGraph.edgeMeta) {
      if (localGraph.edgeMeta.hasOwnProperty(key) && (key.indexOf(placeName + '->') === 0 || key.indexOf('->' + placeName) !== -1)) {
        delete localGraph.edgeMeta[key];
      }
    }

    if (!found && findPlace(placeName)) {
      if (onError) {
        onError('Ese punto viene del dataset base y no se puede borrar localmente.');
      }
      return;
    }

    if (!found) {
      if (onError) {
        onError('El punto no existe en el grafo local: ' + placeName);
      }
      return;
    }

    saveLocalGraph(localGraph);
    if (getBasePlaceName() === placeName) {
      setBasePlaceName('');
    }
    if (currentPlace === placeName) {
      currentPlace = '';
    }

    if (onSuccess) {
      onSuccess({ answer: 'approved', deleted: placeName });
    }
  };

  Navigation.moveRelativeWithPyToolkit = function (x, y, onSuccess, onError) {
    callNamedService(getServices().pyToolkitMoveRelative, {
      x_coordinate: Number(x) || 0,
      y_coordinate: Number(y) || 0
    }, onSuccess, onError);
  };

  Navigation.callPyToolkitMoveRelativeRaw = function (request, onSuccess, onError) {
    callNamedService(getServices().pyToolkitMoveRelative, request || {}, onSuccess, onError);
  };

  Navigation.prepareNavigation = function (onSuccess, onError) {
    callNamedService(getServices().navigationTools, buildNavigationToolsRequest(), function (navigationResponse) {
      Navigation.enableMotionTools(function (motionResponse) {
        Navigation.enableMiscTools(function (miscResponse) {
          if (onSuccess) {
            onSuccess({
              navigation: navigationResponse,
              motion: motionResponse,
              misc: miscResponse
            });
          }
        }, onError);
      }, onError);
    }, onError);
  };

  Navigation.enableMotionTools = function (onSuccess, onError) {
    callNamedService(getServices().motionTools, {
      command: 'enable_all'
    }, onSuccess, onError);
  };

  Navigation.enableMiscTools = function (onSuccess, onError) {
    callNamedService(getServices().miscTools, {
      data: {
        command: 'enable_all'
      }
    }, onSuccess, onError);
  };

  Navigation.listServices = function (onSuccess, onError) {
    callNamedService(getServices().rosapiServices, {}, onSuccess, onError);
  };

  Navigation.listNodes = function (onSuccess, onError) {
    callNamedService(getServices().rosapiNodes, {}, onSuccess, onError);
  };

  Navigation.getServiceRequestDetails = function (serviceType, onSuccess, onError) {
    callNamedService(getServices().rosapiServiceRequestDetails, {
      type: serviceType
    }, onSuccess, onError);
  };

  Navigation.checkNavigationServices = function (onSuccess, onError) {
    Navigation.listServices(function (response) {
      var services = response.services || [];
      var required = [
        '/navigation_utilities/add_place_srv',
        '/navigation_utilities/set_current_place_srv',
        '/navigation_utilities/go_to_place_srv'
      ];
      var optional = [
        '/robot_toolkit/navigation_tools_srv',
        '/pytoolkit/ALMotion/move_relative_srv',
        '/pytoolkit/ALNavigation/navigate_to_srv',
        '/navigation_utilities/get_absolute_position_srv',
        '/navigation_utilities/robot_stop_srv'
      ];
      var expected = required.concat(optional);
      var missing = [];
      var missingRequired = [];
      var missingOptional = [];
      var interestingWords = ['navigation', 'robot_toolkit', 'pytoolkit', 'move_base', 'static_map', 'amcl', 'map', 'launch', 'biblio'];
      var interestingServices = [];
      var i;
      var j;

      for (i = 0; i < expected.length; i += 1) {
        if (services.indexOf(expected[i]) === -1) {
          missing.push(expected[i]);
        }
      }

      for (i = 0; i < required.length; i += 1) {
        if (services.indexOf(required[i]) === -1) {
          missingRequired.push(required[i]);
        }
      }

      for (i = 0; i < optional.length; i += 1) {
        if (services.indexOf(optional[i]) === -1) {
          missingOptional.push(optional[i]);
        }
      }

      for (i = 0; i < services.length; i += 1) {
        for (j = 0; j < interestingWords.length; j += 1) {
          if (services[i].indexOf(interestingWords[j]) !== -1) {
            interestingServices.push(services[i]);
            break;
          }
        }
      }

      Navigation.listNodes(function (nodeResponse) {
        var nodes = nodeResponse.nodes || [];
        var interestingNodes = [];

        for (i = 0; i < nodes.length; i += 1) {
          for (j = 0; j < interestingWords.length; j += 1) {
            if (nodes[i].indexOf(interestingWords[j]) !== -1) {
              interestingNodes.push(nodes[i]);
              break;
            }
          }
        }

        Navigation.getServiceRequestDetails('robot_toolkit_msgs/navigate_to_srv', function (details) {
          if (onSuccess) {
            onSuccess({
              services: services,
              nodes: nodes,
              expected: expected,
              required: required,
              optional: optional,
              missing: missing,
              missingRequired: missingRequired,
              missingOptional: missingOptional,
              interestingServices: interestingServices,
              interestingNodes: interestingNodes,
              pytoolkitNavigateToRequest: details
            });
          }
        }, function () {
          if (onSuccess) {
            onSuccess({
              services: services,
              nodes: nodes,
              expected: expected,
              required: required,
              optional: optional,
              missing: missing,
              missingRequired: missingRequired,
              missingOptional: missingOptional,
              interestingServices: interestingServices,
              interestingNodes: interestingNodes,
              pytoolkitNavigateToRequest: null
            });
          }
        });
      }, function () {
        if (onSuccess) {
          onSuccess({
            services: services,
            nodes: [],
            expected: expected,
            required: required,
            optional: optional,
            missing: missing,
            missingRequired: missingRequired,
            missingOptional: missingOptional,
            interestingServices: interestingServices,
            interestingNodes: [],
            pytoolkitNavigateToRequest: null
          });
        }
      });
    }, onError);
  };

  Navigation.navigateToDestination = function (destinationId, onSuccess, onError) {
    var destination = Navigation.resolveDestination(destinationId);
    var sendDestination = function () {
      Navigation.goToPlace(destination.place, destination.graph, function (response) {
        if (onSuccess) {
          onSuccess(response, destination);
        }
      }, onError);
    };

    Navigation.connect(getRosbridgeUrl(), function () {
      if (config.prepareBeforeNavigate) {
        Navigation.prepareNavigation(function () {
          sendDestination();
        }, function (error) {
          console.log('[ROS Navigation] No fue posible preparar navegacion antes del destino.', error);
          sendDestination();
        });
        return;
      }

      sendDestination();
    }, onError);
  };

  Navigation.loadGraphFromUrl = function (url, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) { return; }
      if (xhr.status === 200 || xhr.status === 0) {
        try {
          var data = JSON.parse(xhr.responseText);
          Navigation.importGraph(data, onSuccess, onError);
        } catch (e) {
          if (onError) { onError('JSON parse error: ' + e.message); }
        }
      } else {
        if (onError) { onError('HTTP ' + xhr.status); }
      }
    };
    xhr.send();
  };

  Navigation.navigateGraphToDestination = function (destinationId, onSuccess, onError, onStep) {
    var destination = Navigation.resolveDestination(destinationId);

    function proceed() {
      if (!currentPlace) {
        currentPlace = getBasePlaceName() || 'base';
      }
      if (!findPlace(destination.place)) {
        if (onError) {
          onError('Destino no encontrado en el grafo: ' + destination.place + '. Verifica que navigation-graph.json este desplegado.');
        }
        return;
      }
      var sendDestination = function () {
        Navigation.setMoveArmsEnabled(false, false, null, null);
        Navigation.navigateGraphClient(destination.place, true, function (response) {
          Navigation.setMoveArmsEnabled(true, true, null, null);
          Navigation.setBreathEnabled('Arms', true, null, null);
          if (onSuccess) {
            onSuccess(response, destination);
          }
        }, function (err) {
          Navigation.setMoveArmsEnabled(true, true, null, null);
          Navigation.setBreathEnabled('Arms', true, null, null);
          if (onError) { onError(err); }
        }, onStep);
      };

      Navigation.connect(getRosbridgeUrl(), function () {
        if (config.prepareBeforeNavigate) {
          Navigation.prepareNavigation(function () {
            sendDestination();
          }, function (error) {
            console.log('[ROS Navigation] No fue posible preparar navegacion antes del grafo.', error);
            sendDestination();
          });
          return;
        }

        sendDestination();
      }, onError);
    }

    var graph = getGraph();
    if (graph.places.length === 0) {
      if (config.defaultGraphData) {
        Navigation.importGraph(config.defaultGraphData, function () {
          proceed();
        }, function () {
          proceed();
        });
        return;
      }
      if (config.graphFileUrl) {
        Navigation.loadGraphFromUrl(config.graphFileUrl, function () {
          proceed();
        }, function (loadError) {
          console.log('[ROS Navigation] No se pudo cargar el grafo desde archivo.', loadError);
          proceed();
        });
        return;
      }
    }

    proceed();
  };

  Navigation.clearCostmaps = function (onSuccess, onError) {
    if (!ros || status !== 'connected') {
      return;
    }
    var svc = new window.ROSLIB.Service({
      ros: ros,
      name: '/move_base/clear_costmaps',
      serviceType: 'std_srvs/Empty'
    });
    svc.callService(new window.ROSLIB.ServiceRequest({}), function () {
      if (onSuccess) { onSuccess(); }
    }, function (err) {
      if (onError) { onError(err); }
    });
  };

  Navigation.standPosture = function (onSuccess, onError) {
    if (!ros || status !== 'connected') {
      return;
    }
    var svc = new window.ROSLIB.Service({
      ros: ros,
      name: '/pytoolkit/ALRobotPosture/go_to_posture_srv',
      serviceType: 'robot_toolkit_msgs/go_to_posture_srv'
    });
    svc.callService(new window.ROSLIB.ServiceRequest({ posture: 'stand' }), function () {
      if (onSuccess) { onSuccess(); }
    }, function (err) {
      if (onError) { onError(err); }
    });
  };

  Navigation.setMoveArmsEnabled = function (lArm, rArm, onSuccess, onError) {
    if (!ros || status !== 'connected') {
      return;
    }
    var svc = new window.ROSLIB.Service({
      ros: ros,
      name: '/pytoolkit/ALMotion/set_move_arms_enabled_srv',
      serviceType: 'robot_toolkit_msgs/set_move_arms_enabled_srv'
    });
    svc.callService(new window.ROSLIB.ServiceRequest({ LArm: !!lArm, RArm: !!rArm }), function () {
      if (onSuccess) { onSuccess(); }
    }, function (err) {
      if (onError) { onError(err); }
    });
  };

  Navigation.setBreathEnabled = function (part, enabled, onSuccess, onError) {
    if (!ros || status !== 'connected') { return; }
    var svc = new window.ROSLIB.Service({
      ros: ros,
      name: '/pytoolkit/ALMotion/toggle_breathing_srv',
      serviceType: 'robot_toolkit_msgs/set_open_close_hand_srv'
    });
    svc.callService(new window.ROSLIB.ServiceRequest({
      hand: part,
      state: enabled ? 'True' : 'False'
    }), function () {
      if (onSuccess) { onSuccess(); }
    }, function (err) {
      if (onError) { onError(err); }
    });
  };

  Navigation.setVolume = function (level, onSuccess, onError) {
    if (!ros || status !== 'connected') { return; }
    var svc = new window.ROSLIB.Service({
      ros: ros,
      name: '/pytoolkit/ALAudioDevice/set_output_volume_srv',
      serviceType: 'robot_toolkit_msgs/set_output_volume_srv'
    });
    svc.callService(new window.ROSLIB.ServiceRequest({ volume: level }), function () {
      if (onSuccess) { onSuccess(); }
    }, function (err) {
      if (onError) { onError(err); }
    });
  };

  Navigation.disableSecurity = function (onSuccess, onError) {
    if (!ros || status !== 'connected') {
      return;
    }
    var svc = new window.ROSLIB.Service({
      ros: ros,
      name: '/pytoolkit/ALMotion/enable_security_srv',
      serviceType: 'robot_toolkit_msgs/battery_service_srv'
    });
    svc.callService(new window.ROSLIB.ServiceRequest({}), function () {
      if (onSuccess) { onSuccess(); }
    }, function (err) {
      if (onError) { onError(err); }
    });
  };

  Navigation.showTabletWebview = function (url, onSuccess, onError) {
    callNamedService(config.services && config.services.tabletWebview,
      { data: url }, onSuccess, onError);
  };

  Navigation.publishSpeech = function (text, animated) {
    if (!ros || status !== 'connected') { return; }
    var lang = (window.PepperLib && window.PepperLib.State && window.PepperLib.State.language === 'en') ? 'English' : 'Spanish';
    var topic = new window.ROSLIB.Topic({
      ros: ros,
      name: '/speech',
      messageType: 'robot_toolkit_msgs/speech_msg'
    });
    topic.publish(new window.ROSLIB.Message({
      language: lang,
      text: text,
      animated: animated !== false
    }));
  };

  Navigation.publishAnimation = function (name) {
    if (!ros || status !== 'connected') { return; }
    var topic = new window.ROSLIB.Topic({
      ros: ros,
      name: '/animations',
      messageType: 'robot_toolkit_msgs/animation_msg'
    });
    topic.publish(new window.ROSLIB.Message({
      family: 'animations',
      animation_name: name
    }));
  };

  window.PepperRosNavigation = Navigation;
})();
