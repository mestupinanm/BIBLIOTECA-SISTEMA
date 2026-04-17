/* ============================================
   MAIN MENU SCREEN
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var MENU_CATEGORIES = {
    'navigation': '¿A dónde voy?',
    'shelves':    'Buscar libro',
    'books':      'Servicios de libro',
    'info':       'Información',
    'events':     'Eventos'
  };

  PepperLib.State.registerScreen('menu', {
    init: function () {
      var cards = document.querySelectorAll('.menu-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function () {
          var target = this.getAttribute('data-target');
          if (!target) return;
          var categoria = MENU_CATEGORIES[target] || target;
          PepperLib.Analytics.insertGeneralInteraction(categoria, function () {
            PepperLib.State.go(target);
          });
        });
      }
    },

    onEnter: function () {
      PepperLib.Inactivity.reset();
      // Clear history so back from menu doesn't go to greeting
      PepperLib.State.history = [];
    },

    onExit: function () {}
  });
})();
