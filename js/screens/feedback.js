/* ============================================
   FEEDBACK SCREEN - Satisfaction rating
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var autoReturnTimer = null;

  PepperLib.State.registerScreen('feedback', {
    init: function () {
      var buttons = document.querySelectorAll('.feedback-btn');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
          var rating = this.getAttribute('data-rating');
          PepperLib.Analytics.count('feedback', rating);
          PepperLib.Analytics.insertFeedback(rating);
          PepperLib.Analytics.log('feedback', { rating: rating });

          // Hide options, show thanks
          var options = document.querySelector('.feedback-options');
          var thanks = document.getElementById('feedback-thanks');
          if (options) options.classList.add('hidden');
          if (thanks) thanks.classList.remove('hidden');

          // Auto return to idle after 3 seconds
          autoReturnTimer = setTimeout(function () {
            PepperLib.State.endSession();
            PepperLib.State.go(PepperLib.SCREENS.IDLE);
          }, 3000);
        });
      }
    },

    onEnter: function () {
      PepperLib.Inactivity.stop();
      // Reset UI
      var options = document.querySelector('.feedback-options');
      var thanks = document.getElementById('feedback-thanks');
      if (options) options.classList.remove('hidden');
      if (thanks) thanks.classList.add('hidden');
    },

    onExit: function () {
      if (autoReturnTimer) {
        clearTimeout(autoReturnTimer);
        autoReturnTimer = null;
      }
    }
  });
})();
