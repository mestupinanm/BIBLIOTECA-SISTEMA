/* ============================================
   NAVIGATION GUIDE - Full map with two markers:
   "You are here" (green) + destination (gold)
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  /* ------------------------------------------------------------------
     MAP COORDINATES
     Percentage positions (x%, y%) on the 1920x1080 map images.
     Adjust these values if a marker appears slightly off on-screen.
  ------------------------------------------------------------------ */
  var MAP_COORDS = {
    // Fixed "you are here" position (robot kiosk at reception/entrance)
    you_are_here:         { x: 48, y: 9  },

    // Rooms
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

    // Study rooms
    room_251:    { x: 3,  y: 65 },
    room_ml253:  { x: 3,  y: 83 },
    room_254:    { x: 93, y: 60 },
    room_255a:   { x: 58, y: 74 },
    room_255b:   { x: 51, y: 74 },
    room_255c:   { x: 44, y: 74 },
    room_255d:   { x: 39, y: 74 },
    room_257:    { x: 96, y: 22 },

    // Shelves — left bank
    shelf_01:  { x: 9,  y: 35 },
    shelf_02:  { x: 15, y: 35 },
    shelf_03:  { x: 21, y: 35 },
    shelf_04:  { x: 27, y: 35 },
    shelf_05:  { x: 33, y: 35 },
    shelf_06:  { x: 9,  y: 58 },
    shelf_07:  { x: 15, y: 58 },
    shelf_08:  { x: 21, y: 58 },
    shelf_09:  { x: 27, y: 58 },
    shelf_10:  { x: 33, y: 58 },
    shelf_11:  { x: 39, y: 45 },

    // Shelves — right bank
    shelf_12:  { x: 54, y: 30 },
    shelf_13:  { x: 61, y: 30 },
    shelf_14:  { x: 67, y: 30 },
    shelf_15:  { x: 73, y: 30 },
    shelf_16:  { x: 79, y: 30 },
    shelf_17:  { x: 54, y: 55 },
    shelf_18:  { x: 61, y: 55 },
    shelf_19:  { x: 67, y: 55 },
    shelf_20:  { x: 73, y: 55 },
    shelf_21:  { x: 79, y: 55 },
    shelf_22:  { x: 85, y: 55 }
  };

  /* ------------------------------------------------------------------
     HELPERS
  ------------------------------------------------------------------ */
  function getMapSrc(lang) {
    return lang === 'en'
      ? 'assets/imagenes/INGLES.png'
      : 'assets/imagenes/ESPAÑOL.png';
  }

  function buildMarkerHTML(x, y, type) {
    // type: 'marker-here' (green) or 'marker-dest' (gold)
    var cls = type || 'marker-dest';
    return '<div class="map-marker ' + cls + '" style="left:' + x + '%;top:' + y + '%;">' +
      '<div class="map-marker-ring"></div>' +
      '<div class="map-marker-ring map-marker-ring2"></div>' +
      '<div class="map-marker-ring map-marker-ring3"></div>' +
      '<div class="map-marker-dot"></div>' +
      '</div>';
  }

  function renderGuide(destId) {
    var lang = PepperLib.State.language;

    // Destination name
    var destEl = document.getElementById('guide-destination');
    if (destEl) {
      destEl.textContent = PepperLib.i18n.t('dest.' + destId);
    }

    // Map image (language-aware)
    var imgEl = document.getElementById('guide-map-img');
    if (imgEl) {
      imgEl.src = getMapSrc(lang);
    }

    // Two pulsing markers: you-are-here + destination
    var markersEl = document.getElementById('guide-map-markers');
    if (markersEl) {
      var html = '';
      // "You are here" — always at the kiosk/reception position
      var here = MAP_COORDS['you_are_here'];
      if (here) {
        html += buildMarkerHTML(here.x, here.y, 'marker-here');
      }
      // Destination marker
      var dest = MAP_COORDS[destId];
      if (dest) {
        // Only draw destination if it's a different spot from "here"
        if (dest.x !== here.x || dest.y !== here.y) {
          html += buildMarkerHTML(dest.x, dest.y, 'marker-dest');
        } else {
          // Same spot — just show "here" marker (destination is the reception)
          // already drawn above
        }
      }
      markersEl.innerHTML = html;
    }
  }

  var currentDestination = null;

  PepperLib.State.registerScreen('navigation-guide', {
    init: function () {
      var btnGuide = document.getElementById('btn-guide-me');
      if (btnGuide) {
        btnGuide.addEventListener('click', function () {
          if (currentDestination) {
            PepperLib.Robot.navigateTo(currentDestination);
          }
        });
      }

      var btnDone = document.getElementById('btn-guide-done');
      if (btnDone) {
        btnDone.addEventListener('click', function () {
          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK);
        });
      }
    },

    onEnter: function (params) {
      PepperLib.Inactivity.reset();
      if (params && params.destination) {
        currentDestination = params.destination;
        renderGuide(params.destination);
      }
    },

    onExit: function () {
      currentDestination = null;
    }
  });

  // Expose for shelves.js
  PepperLib.MapCoords    = MAP_COORDS;
  PepperLib.MapSrc       = getMapSrc;
  PepperLib.BuildMarker  = buildMarkerHTML;
})();
