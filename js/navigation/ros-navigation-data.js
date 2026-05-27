(function () {
  'use strict';

  var appDestinations = {
    reception: { place: 'reception', graph: 1 },
    coordination: { place: 'coordination', graph: 1 },
    restroom_m: { place: 'restroom_m', graph: 1 },
    restroom_f: { place: 'restroom_f', graph: 1 },
    restroom_accessible: { place: 'restroom_accessible', graph: 1 },
    book_lift: { place: 'book_lift', graph: 1 },
    material_maintenance_workshop: { place: 'material_maintenance_workshop', graph: 1 },
    sterilization_space: { place: 'sterilization_space', graph: 1 },
    entry: { place: 'entry', graph: 1 },
    exit: { place: 'exit', graph: 1 },
    elevator: { place: 'elevator', graph: 1 },
    stairs_up: { place: 'stairs_up', graph: 1 },
    stairs_down: { place: 'stairs_down', graph: 1 },
    stairs_emergency: { place: 'stairs_emergency', graph: 1 },
    room_251: { place: 'room_251', graph: 1 },
    room_252c: { place: 'room_252c', graph: 1 },
    room_254: { place: 'room_254', graph: 1 },
    room_255: { place: 'room_255', graph: 1 },
    room_255a: { place: 'room_255a', graph: 1 },
    room_255b: { place: 'room_255b', graph: 1 },
    room_255c: { place: 'room_255c', graph: 1 },
    room_255d: { place: 'room_255d', graph: 1 },
    room_256: { place: 'room_256', graph: 1 },
    room_257: { place: 'room_257', graph: 1 },
    room_259a: { place: 'room_259a', graph: 1 },
    room_259g: { place: 'room_259g', graph: 1 }
  };

  var i;
  var shelfId;

  for (i = 1; i <= 22; i += 1) {
    shelfId = i < 10 ? 'shelf_0' + i : 'shelf_' + i;
    appDestinations[shelfId] = { place: shelfId, graph: 1 };
  }

  window.NavigationUtilitiesData = {
    rosbridgeUrl: '',
    rosbridgeStorageKey: 'pepperLibraryRosbridgeUrl',
    graphStorageKey: 'pepperLibraryNavigationGraph',
    basePlaceStorageKey: 'pepperLibraryBasePlace',
    graphFileUrl: './assets/data/navigation-graph.json',
    defaultGraphData: {
      version: 2,
      createdAt: '2026-05-27T15:29:47.799Z',
      basePlace: 'base',
      graph: {
        places: [
          { name: 'base', x: -2.42, y: 0.9, theta: 133.83, known: true },
          { name: 'inicio_pasillo_izquierdo', x: -8.81, y: 1.38, theta: -178.7, known: true },
          { name: 'final_pasillo_izquierdo', x: -8.81, y: -9.7, theta: -91.6, known: true },
          { name: 'room_255d', x: -4.04, y: -9.86, theta: 2.7, known: true },
          { name: 'room_255c', x: -1.79, y: -9.81, theta: 2.1, known: true },
          { name: 'room_255b', x: 0.7, y: -9.77, theta: 2.56, known: true },
          { name: 'room_255a', x: 2.88, y: -9.7, theta: 1.96, known: true },
          { name: 'restroom_m', x: 17.56, y: 1.49, theta: 1.11, known: true },
          { name: 'room_259g', x: 17.56, y: 1.49, theta: 1.11, known: true },
          { name: 'room_259a', x: 20.24, y: 1.58, theta: 1.15, known: true },
          { name: 'room_254', x: 20.24, y: 1.58, theta: 1.15, known: true },
          { name: 'room_255', x: 20.24, y: 1.58, theta: 1.15, known: true },
          { name: 'room_256', x: 20.24, y: 1.58, theta: 1.15, known: true },
          { name: 'room_257', x: 20.24, y: 1.58, theta: 1.15, known: true },
          { name: 'coordinacion', x: 20.24, y: 1.58, theta: 1.15, known: true },
          { name: 'room_252c', x: -10.64, y: -9.97, theta: -179.42, known: true },
          { name: 'book_lift', x: -6.09, y: 1.32, theta: -178.69, known: true },
          { name: 'sterilization_room', x: -9.91, y: -10.12, theta: 179.87, known: true },
          { name: 'exit', x: 3.4, y: 1.55, theta: -0.67, known: true },
          { name: 'elevator', x: 3.4, y: 1.55, theta: -0.67, known: true },
          { name: 'shelf_13', x: -9.93, y: 1.33, theta: 178.79, known: true },
          { name: 'shelf_14', x: -11.41, y: 1.38, theta: 179.19, known: true },
          { name: 'shelf_15', x: -12.83, y: 1.29, theta: -179.56, known: true },
          { name: 'shelf_16', x: -14.16, y: 1.27, theta: 179.2, known: true },
          { name: 'shelf_17', x: -15.73, y: 1.32, theta: 178.53, known: true },
          { name: 'shelf_12', x: 9.89, y: 1.33, theta: 2.69, known: true },
          { name: 'shelf_11', x: 11.19, y: 1.33, theta: 0.7, known: true },
          { name: 'shelf_10', x: 12.66, y: 1.27, theta: 2.6, known: true },
          { name: 'shelf_9', x: 14.14, y: 1.47, theta: 2.01, known: true },
          { name: 'shelf_8', x: 15.57, y: 1.43, theta: 0.6, known: true },
          { name: 'shelf_7', x: 17.02, y: 1.46, theta: 1.58, known: true },
          { name: 'shelf_6', x: 20.85, y: 1.59, theta: 0, known: true },
          { name: 'shelf_5', x: 20.85, y: 1.59, theta: 0, known: true },
          { name: 'shelf_4', x: 20.85, y: 1.59, theta: 0, known: true },
          { name: 'shelf_3', x: 20.85, y: 1.59, theta: 0, known: true },
          { name: 'shelf_2', x: 20.85, y: 1.59, theta: 0, known: true },
          { name: 'shelf_1', x: 20.85, y: 1.59, theta: 0, known: true },
          { name: 'shelf_18', x: -15.75, y: 1.31, theta: 176.08, known: true },
          { name: 'shelf_19', x: -15.75, y: 1.31, theta: 176.08, known: true },
          { name: 'shelf_20', x: -15.75, y: 1.31, theta: 176.08, known: true },
          { name: 'shelf_21', x: -15.75, y: 1.31, theta: 176.08, known: true },
          { name: 'shelf_22', x: -15.75, y: 1.31, theta: 176.08, known: true },
          { name: 'restroom_f', x: -15.75, y: 1.31, theta: 176.08, known: true },
          { name: 'materials_workshop ', x: -15.75, y: 1.31, theta: 176.08, known: true },
          { name: 'restroom_d', x: -15.75, y: 1.31, theta: 176.08, known: true }
        ],
        edges: [
          ['inicio_pasillo_izquierdo', 'base'],
          ['final_pasillo_izquierdo', 'inicio_pasillo_izquierdo'],
          ['room_255d', 'final_pasillo_izquierdo'],
          ['room_255c', 'final_pasillo_izquierdo'],
          ['room_255b', 'final_pasillo_izquierdo'],
          ['room_255a', 'final_pasillo_izquierdo'],
          ['restroom_m', 'base'],
          ['room_259g', 'base'],
          ['room_259a', 'base'],
          ['room_254', 'base'],
          ['room_255', 'base'],
          ['room_256', 'base'],
          ['room_257', 'base'],
          ['coordinacion', 'base'],
          ['room_252c', 'final_pasillo_izquierdo'],
          ['book_lift', 'base'],
          ['sterilization_room', 'final_pasillo_izquierdo'],
          ['exit', 'base'],
          ['elevator', 'base'],
          ['shelf_13', 'base'],
          ['shelf_14', 'base'],
          ['shelf_15', 'base'],
          ['shelf_16', 'base'],
          ['shelf_17', 'base'],
          ['shelf_12', 'base'],
          ['shelf_11', 'base'],
          ['shelf_10', 'base'],
          ['shelf_9', 'base'],
          ['shelf_8', 'base'],
          ['shelf_7', 'base'],
          ['shelf_6', 'base'],
          ['shelf_5', 'base'],
          ['shelf_4', 'base'],
          ['shelf_3', 'base'],
          ['shelf_2', 'base'],
          ['shelf_1', 'base'],
          ['shelf_17', 'base'],
          ['shelf_18', 'base'],
          ['shelf_19', 'base'],
          ['shelf_20', 'base'],
          ['shelf_21', 'base'],
          ['shelf_22', 'base'],
          ['restroom_f', 'base'],
          ['materials_workshop ', 'base'],
          ['restroom_d', 'base']
        ],
        edgeMeta: {
          'base->inicio_pasillo_izquierdo': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'inicio_pasillo_izquierdo->final_pasillo_izquierdo': { advanceMeters: 0, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'final_pasillo_izquierdo->room_255d': { advanceMeters: 0, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'final_pasillo_izquierdo->room_255c': { advanceMeters: 0, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'final_pasillo_izquierdo->room_255b': { advanceMeters: 0, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'final_pasillo_izquierdo->room_255a': { advanceMeters: 0, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->restroom_m': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->room_259g': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->room_259a': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->room_254': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->room_255': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->room_256': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->room_257': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->coordinacion': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'final_pasillo_izquierdo->room_252c': { advanceMeters: 0, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->book_lift': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'final_pasillo_izquierdo->sterilization_room': { advanceMeters: 0, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->exit': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->elevator': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_13': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_14': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_15': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_16': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_17': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_12': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_11': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_10': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_9': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_8': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_7': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_6': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_5': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_4': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_3': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_2': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_1': { advanceMeters: 0.4, turnDegrees: 90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_18': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_19': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_20': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_21': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->shelf_22': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->restroom_f': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->materials_workshop ': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true },
          'base->restroom_d': { advanceMeters: 0.4, turnDegrees: -90, actionOrder: 'advance-turn', invertOnReturn: true }
        }
      }
    },
    includeDemoPlaces: false,
    defaultGraph: 1,
    reconnectBeforeCommand: true,
    prepareBeforeNavigate: true,
    services: {
      navigationTools: {
        name: '/robot_toolkit/navigation_tools_srv',
        type: 'robot_toolkit_msgs/navigation_tools_srv'
      },
      motionTools: {
        name: '/robot_toolkit/motion_tools_srv',
        type: 'robot_toolkit_msgs/motion_tools_srv'
      },
      miscTools: {
        name: '/robot_toolkit/misc_tools_srv',
        type: 'robot_toolkit_msgs/misc_tools_srv'
      },
      rosapiServices: {
        name: '/rosapi/services',
        type: 'rosapi/Services'
      },
      rosapiNodes: {
        name: '/rosapi/nodes',
        type: 'rosapi/Nodes'
      },
      rosapiServiceRequestDetails: {
        name: '/rosapi/service_request_details',
        type: 'rosapi/ServiceRequestDetails'
      },
      pyToolkitMoveRelative: {
        name: '/pytoolkit/ALMotion/move_relative_srv',
        type: 'robot_toolkit_msgs/navigate_to_srv'
      },
      pyToolkitNavigateTo: {
        name: '/pytoolkit/ALNavigation/navigate_to_srv',
        type: 'robot_toolkit_msgs/navigate_to_srv'
      },
      goToPlace: {
        name: '/navigation_utilities/go_to_place_srv',
        type: 'navigation_msgs/go_to_place_srv'
      },
      setCurrentPlace: {
        name: '/navigation_utilities/set_current_place_srv',
        type: 'navigation_msgs/set_current_place_srv'
      },
      stop: {
        name: '/navigation_utilities/robot_stop_srv',
        type: 'navigation_msgs/robot_stop_srv'
      },
      spin: {
        name: '/navigation_utilities/spin_srv',
        type: 'navigation_msgs/spin_srv'
      },
      goToRelativePoint: {
        name: '/navigation_utilities/go_to_relative_point_srv',
        type: 'navigation_msgs/go_to_relative_point_srv'
      },
      addPlace: {
        name: '/navigation_utilities/add_place_srv',
        type: 'navigation_msgs/add_place_srv'
      },
      addPlaceWithCoordinates: {
        name: '/navigation_utilities/add_place_with_coordinates_srv',
        type: 'navigation_msgs/add_place_with_coordinates_srv'
      },
      getAbsolutePosition: {
        name: '/navigation_utilities/get_absolute_position_srv',
        type: 'navigation_msgs/get_absolute_position_srv'
      },
      getRouteGuidance: {
        name: '/navigation_utilities/get_route_guidance_srv',
        type: 'navigation_msgs/get_route_guidance_srv'
      },
      tabletWebview: {
        name: '/pytoolkit/ALTabletService/show_web_view_srv',
        type: 'robot_toolkit_msgs/tablet_service_srv'
      }
    },
    topics: {
      amclPose: {
        name: '/amcl_pose',
        type: 'geometry_msgs/PoseWithCovarianceStamped'
      },
      simpleFeedback: {
        name: '/navigation_utilities/simple_feedback',
        type: 'navigation_msgs/simple_feedback_msg'
      },
      completeFeedback: {
        name: '/navigation_utilities/complete_feedback',
        type: 'move_base_msgs/MoveBaseFeedback'
      }
    },
    appDestinations: appDestinations,
    testPlaces: [],
    testEdges: []
  };
})();
