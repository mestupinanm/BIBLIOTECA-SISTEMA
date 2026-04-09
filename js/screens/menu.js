/* ============================================
   MAIN MENU SCREEN
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  PepperLib.State.registerScreen('menu', {
    init: function () {
      var cards = document.querySelectorAll('.menu-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function () {
          var target = this.getAttribute('data-target');
          if (target) {
            PepperLib.State.go(target);
          }
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
