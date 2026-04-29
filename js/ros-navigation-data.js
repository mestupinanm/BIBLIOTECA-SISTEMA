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
    rosbridgeUrl: 'ws://127.0.0.1:9090',
    defaultGraph: 1,
    reconnectBeforeCommand: true,
    services: {
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
      }
    },
    topics: {
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
    testPlaces: [
      { name: 'house_door', x: 3.48, y: 1.45, theta: 270, known: true },
      { name: 'kitchen', x: 4.3, y: 1.45, theta: 0, known: true },
      { name: 'living_room', x: 1.86, y: 1.4, theta: 180, known: true },
      { name: 'dining', x: 3.75, y: 3.4, theta: 180, known: true },
      { name: 'bedroom', x: 3.7, y: 3.75, theta: 0, known: true },
      { name: 'init_gpsr', x: 2.35, y: 2.17, theta: 0.41, known: true },
      { name: 'gpsr_location', x: 4.3, y: 1.45, theta: 180, known: true },
      { name: 'hallway_dining', x: 3.77, y: 2.45, theta: 90, known: true },
      { name: 'hallway_door', x: 3.77, y: 2.45, theta: 270, known: true }
    ],
    testEdges: [
      ['house_door', 'kitchen'],
      ['house_door', 'living_room'],
      ['house_door', 'hallway_dining'],
      ['house_door', 'bedroom'],
      ['house_door', 'gpsr_location'],
      ['bedroom', 'dining'],
      ['init_gpsr', 'house_door'],
      ['gpsr_location', 'kitchen'],
      ['hallway_dining', 'dining'],
      ['hallway_door', 'house_door']
    ]
  };
})();
