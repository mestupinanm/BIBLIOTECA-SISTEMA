(function () {
  'use strict';

  var Navigation = {};
  var config = window.NavigationUtilitiesData || {};
  var ros = null;
  var status = 'disconnected';
  var connectedUrl = '';
  var pendingConnectCallbacks = [];
  var feedbackSubscriptions = {};

  function getServices() {
    return config.services || {};
  }

  function getTopics() {
    return config.topics || {};
  }

  function getDefaultGraph() {
    return typeof config.defaultGraph === 'number' ? config.defaultGraph : 1;
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
          onError(normalizeError(error));
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

  Navigation.connect = function (url, onSuccess, onError) {
    var targetUrl = url || config.rosbridgeUrl || 'ws://127.0.0.1:9090';
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
      url: connectedUrl || config.rosbridgeUrl || ''
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

  Navigation.goToRelativePoint = function (x, y, theta, onSuccess, onError) {
    callNamedService(getServices().goToRelativePoint, {
      x: Number(x) || 0,
      y: Number(y) || 0,
      theta: Number(theta) || 0
    }, onSuccess, onError);
  };

  Navigation.navigateToDestination = function (destinationId, onSuccess, onError) {
    var destination = Navigation.resolveDestination(destinationId);

    Navigation.connect(config.rosbridgeUrl, function () {
      Navigation.goToPlace(destination.place, destination.graph, function (response) {
        if (onSuccess) {
          onSuccess(response, destination);
        }
      }, onError);
    }, onError);
  };

  Navigation.subscribeFeedback = function (kind, onMessage, onError) {
    var topics = getTopics();
    var topicConfig = topics[kind || 'simpleFeedback'];
    var topic;

    if (!topicConfig || !topicConfig.name || !topicConfig.type) {
      if (onError) {
        onError('Topico ROS no configurado.');
      }
      return;
    }

    if (!ros || status !== 'connected') {
      if (onError) {
        onError('ROSBridge no esta conectado.');
      }
      return;
    }

    if (feedbackSubscriptions[topicConfig.name]) {
      feedbackSubscriptions[topicConfig.name].unsubscribe();
    }

    topic = new window.ROSLIB.Topic({
      ros: ros,
      name: topicConfig.name,
      messageType: topicConfig.type
    });

    topic.subscribe(function (message) {
      if (onMessage) {
        onMessage(message || {});
      }
    });
    feedbackSubscriptions[topicConfig.name] = topic;
  };

  window.PepperRosNavigation = Navigation;
})();
