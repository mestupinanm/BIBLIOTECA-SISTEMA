/* ============================================
   FEEDBACK SCREEN - Satisfaction rating
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var autoReturnTimer = null;

  var RATING_MAP = {
    'excelente': 'Excelente',
    'bueno':     'Bueno',
    'regular':   'Regular',
    'malo':      'Malo',
    'pesimo':    'Pésimo'
  };

  PepperLib.State.registerScreen('feedback', {
    init: function () {
      var container = document.querySelector('.feedback-container');
      if (!container) return;

      container.addEventListener('click', function (e) {
        // Paso 1: click en botón de rating
        var ratingBtn = e.target.closest('.feedback-btn');
        if (ratingBtn) {
          var rating = ratingBtn.getAttribute('data-rating');
          container.setAttribute('data-selected-rating', rating);

          var optionsEl = document.querySelector('.feedback-options');
          var commentEl = document.getElementById('feedback-comment-section');
          if (optionsEl) optionsEl.classList.add('hidden');
          if (commentEl) commentEl.classList.remove('hidden');
          return;
        }

        // Paso 2: click en botón Enviar
        var sendBtn = e.target.closest('#btn-feedback-send');
        if (sendBtn) {
          var selectedRating = container.getAttribute('data-selected-rating');
          var commentInput = document.getElementById('feedback-comment-input');
          var comentario = commentInput ? commentInput.value.trim() : '';
          var puntuacion = RATING_MAP[selectedRating] || selectedRating;

          // Analytics existentes (compatibilidad histórica)
          PepperLib.Analytics.count('feedback', selectedRating);
          PepperLib.Analytics.insertFeedback(selectedRating);
          PepperLib.Analytics.log('feedback', { rating: selectedRating });
          // Nueva tabla
          PepperLib.Analytics.insertCalidadServicio(puntuacion, comentario);

          var commentSection = document.getElementById('feedback-comment-section');
          var thanksEl = document.getElementById('feedback-thanks');
          if (commentSection) commentSection.classList.add('hidden');
          if (thanksEl) thanksEl.classList.remove('hidden');

          autoReturnTimer = setTimeout(function () {
            PepperLib.State.endSession();
            PepperLib.State.go(PepperLib.SCREENS.IDLE);
          }, 3000);
        }
      });
    },

    onEnter: function () {
      PepperLib.Inactivity.stop();
      var optionsEl = document.querySelector('.feedback-options');
      var commentEl = document.getElementById('feedback-comment-section');
      var thanksEl  = document.getElementById('feedback-thanks');
      var container = document.querySelector('.feedback-container');
      var commentInput = document.getElementById('feedback-comment-input');

      if (optionsEl)    optionsEl.classList.remove('hidden');
      if (commentEl)    commentEl.classList.add('hidden');
      if (thanksEl)     thanksEl.classList.add('hidden');
      if (container)    container.removeAttribute('data-selected-rating');
      if (commentInput) commentInput.value = '';
    },

    onExit: function () {
      if (autoReturnTimer) {
        clearTimeout(autoReturnTimer);
        autoReturnTimer = null;
      }
    }
  });
})();
