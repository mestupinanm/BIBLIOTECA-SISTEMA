/* ============================================
   NAVIGATION GUIDE - Full map with two markers
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var MAP_COORDS = {
    you_are_here:         { x: 48, y: 9  },
    reception:            { x: 48, y: 9  },
    elevator:             { x: 46, y: 9  },
    stairs_main:          { x: 50, y: 9  },
    stairs_emergency:     { x: 26, y: 9  },
    entry_exit:           { x: 46, y: 9  },
    book_lift:            { x: 43, y: 9  },
    equipment_workshop:   { x: 3,  y: 35 },
    reference:            { x: 48, y: 9  },
    restroom_m:           { x: 5,  y: 50 },
    restroom_f:           { x: 5,  y: 58 },
    room_251:             { x: 3,  y: 65 },
    room_ml253:           { x: 3,  y: 83 },
    room_254:             { x: 93, y: 60 },
    room_255a:            { x: 58, y: 74 },
    room_255b:            { x: 51, y: 74 },
    room_255c:            { x: 44, y: 74 },
    room_255d:            { x: 39, y: 74 },
    room_257:             { x: 96, y: 22 },
    shelf_01:             { x: 9,  y: 35 },
    shelf_02:             { x: 15, y: 35 },
    shelf_03:             { x: 21, y: 35 },
    shelf_04:             { x: 27, y: 35 },
    shelf_05:             { x: 33, y: 35 },
    shelf_06:             { x: 9,  y: 58 },
    shelf_07:             { x: 15, y: 58 },
    shelf_08:             { x: 21, y: 58 },
    shelf_09:             { x: 27, y: 58 },
    shelf_10:             { x: 33, y: 58 },
    shelf_11:             { x: 39, y: 45 },
    shelf_12:             { x: 54, y: 30 },
    shelf_13:             { x: 61, y: 30 },
    shelf_14:             { x: 67, y: 30 },
    shelf_15:             { x: 73, y: 30 },
    shelf_16:             { x: 79, y: 30 },
    shelf_17:             { x: 54, y: 55 },
    shelf_18:             { x: 61, y: 55 },
    shelf_19:             { x: 67, y: 55 },
    shelf_20:             { x: 73, y: 55 },
    shelf_21:             { x: 79, y: 55 },
    shelf_22:             { x: 85, y: 55 }
  };

  // Map each destination to its navigation category for analytics
  var NAV_CATEGORIES = {
    room_251: 'rooms', room_254: 'rooms', room_255a: 'rooms',
    room_255b: 'rooms', room_255c: 'rooms', room_255d: 'rooms',
    room_257: 'rooms', room_ml253: 'rooms',
    reception: 'services', reference: 'services',
    restroom_m: 'services', restroom_f: 'services',
    book_lift: 'services', equipment_workshop: 'services',
    entry_exit: 'access', elevator: 'access',
    stairs_main: 'access', stairs_emergency: 'access'
  };

  var currentDestination = null;

  function getMapSrc(lang) {
    return lang === 'en'
      ? 'assets/imagenes/INGLES.png'
      : 'assets/imagenes/ESPAÑOL.png';
  }

  function buildMarkerHTML(x, y, type) {
    // Uses CSS classes defined in style.css: .map-marker-core, .map-marker-pulse
    // Color is set via currentColor from .marker-here (green) or .marker-dest (gold)
    var cls = type || 'marker-dest';
    return '<div class="map-marker ' + cls + '" style="left:' + x + '%;top:' + y + '%;">' +
      '<div class="map-marker-core"></div>' +
      '<div class="map-marker-pulse"></div>' +
      '<div class="map-marker-pulse map-marker-pulse--delayed"></div>' +
      '</div>';
  }

  function getDestinationLabel(destId) {
    return PepperLib.i18n.t('dest.' + destId);
  }

  function renderGuide(destId) {
    var lang = PepperLib.State.language;
    var destEl = document.getElementById('guide-destination');
    var imgEl = document.getElementById('guide-map-img');
    var markersEl = document.getElementById('guide-map-markers');

    if (destEl) {
      destEl.textContent = getDestinationLabel(destId);
    }

    if (imgEl) {
      imgEl.src = getMapSrc(lang);
    }

    if (markersEl) {
      var here = MAP_COORDS.you_are_here;
      var dest = MAP_COORDS[destId];
      var html = '';

      if (here) {
        html += buildMarkerHTML(here.x, here.y, 'marker-here');
      }
      if (dest && (dest.x !== here.x || dest.y !== here.y)) {
        html += buildMarkerHTML(dest.x, dest.y, 'marker-dest');
      }

      markersEl.innerHTML = html;
    }
  }

  PepperLib.State.registerScreen('navigation-guide', {
    init: function () {
      var btnGuide = document.getElementById('btn-guide-me');
      var btnDone = document.getElementById('btn-guide-done');

      if (btnGuide) {
        btnGuide.addEventListener('click', function () {
          if (currentDestination) {
            PepperLib.Robot.navigateTo(currentDestination);
          }
        });
      }

      if (btnDone) {
        btnDone.addEventListener('click', function () {
          // Count this destination interaction in Supabase
          if (currentDestination) {
            var cat = NAV_CATEGORIES[currentDestination] || 'other';
            PepperLib.Analytics.count('navigation', currentDestination);
            PepperLib.Analytics.count('navigation_category', cat);
          }
          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK);
        });
      }
    },

    onEnter: function (params) {
      PepperLib.Inactivity.reset();
      if (params && params.destination) {
        currentDestination = params.destination;
        renderGuide(currentDestination);
        // Track last action for help email + feedback context
        PepperLib.LastAction = getDestinationLabel(currentDestination);
        PepperLib.LastActionItem = currentDestination;
        PepperLib.LastActionCategory = NAV_CATEGORIES[currentDestination] || 'navigation';
      }
    },

    onExit: function () {
      currentDestination = null;
    }
  });

  PepperLib.MapCoords = MAP_COORDS;
  PepperLib.MapSrc = getMapSrc;
  PepperLib.BuildMarker = buildMarkerHTML;
  PepperLib.NavigationGuide = {
    getCurrentDestination: function () {
      return currentDestination;
    },
    getCurrentDestinationLabel: function () {
      return currentDestination ? getDestinationLabel(currentDestination) : null;
    }
  };
})();
