/* ============================================
   IDLE SCREEN
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var clockInterval = null;

  function updateClock() {
    var el = document.getElementById('idle-clock');
    if (!el) return;
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    var minStr = minutes < 10 ? '0' + minutes : '' + minutes;
    el.textContent = hours + ':' + minStr + ' ' + ampm;
  }

  PepperLib.State.registerScreen('idle', {
    init: function () {
      var screen = document.getElementById('screen-idle');
      if (screen) {
        screen.addEventListener('click', function () {
          PepperLib.State.go(PepperLib.SCREENS.GREETING);
        });
      }
    },

    onEnter: function () {
      PepperLib.Inactivity.stop();
      updateClock();
      clockInterval = setInterval(updateClock, 10000);
    },

    onExit: function () {
      if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
      }
    }
  });
})();
