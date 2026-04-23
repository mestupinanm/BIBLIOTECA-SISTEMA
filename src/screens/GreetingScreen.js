/* ============================================
   GREETING SCREEN - Language selection
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  PepperLib.State.registerScreen('greeting', {
    init: function () {
      var buttons = document.querySelectorAll('.greeting-lang-btn');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
          var lang = this.getAttribute('data-lang');
          PepperLib.State.setLanguage(lang);
          PepperLib.State.startSession();
          PepperLib.State.go(PepperLib.SCREENS.MENU);
        });
      }
    },

    onEnter: function () {
      PepperLib.Inactivity.stop();
      // Speak greeting only at reception (voice allowed there)
      PepperLib.Robot.speak('Hola! Bienvenido a la biblioteca.');
    },

    onExit: function () {}
  });
})();
