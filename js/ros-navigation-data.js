(function () {
  'use strict';

  var appDestinations = {
    reception: { place: 'reception', graph: 1 },
    reference: { place: 'reference', graph: 1 },
    restroom_m: { place: 'restroom_m', graph: 1 },
    restroom_f: { place: 'restroom_f', graph: 1 },
    book_lift: { place: 'book_lift', graph: 1 },
    equipment_workshop: { place: 'equipment_workshop', graph: 1 },
    entry_exit: { place: 'entry_exit', graph: 1 },
    elevator: { place: 'elevator', graph: 1 },
    stairs_main: { place: 'stairs_main', graph: 1 },
    stairs_emergency: { place: 'stairs_emergency', graph: 1 },
    room_251: { place: 'room_251', graph: 1 },
    room_254: { place: 'room_254', graph: 1 },
    room_255a: { place: 'room_255a', graph: 1 },
    room_255b: { place: 'room_255b', graph: 1 },
    room_255c: { place: 'room_255c', graph: 1 },
    room_255d: { place: 'room_255d', graph: 1 },
    room_257: { place: 'room_257', graph: 1 },
    room_ml253: { place: 'room_ml253', graph: 1 }
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
