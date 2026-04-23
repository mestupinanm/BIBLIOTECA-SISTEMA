/* ============================================
   BOOKS SCREEN - Loan / Return workflow
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  // Track which action is currently shown in detail view
  var currentAction = null;

  function buildOptions() {
    var container = document.getElementById('books-options');
    if (!container) return;

    container.innerHTML =
      '<section class="books-hero">' +
      '  <span class="books-hero-eyebrow" data-i18n="books.hero_eyebrow">' + PepperLib.i18n.t('books.hero_eyebrow') + '</span>' +
      '  <h2 class="books-hero-title" data-i18n="books.hero_title">' + PepperLib.i18n.t('books.hero_title') + '</h2>' +
      '  <p class="books-hero-copy" data-i18n="books.hero_copy">' + PepperLib.i18n.t('books.hero_copy') + '</p>' +
      '</section>' +
      '<div class="books-card-grid">' +

      '  <button class="books-card books-card--borrow" data-action="borrow">' +
      '    <div class="books-card-icon">' +
      '      <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
      '        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' +
      '        <polyline points="8 12 12 8 16 12"></polyline>' +
      '        <line x1="12" y1="16" x2="12" y2="8"></line>' +
      '      </svg>' +
      '    </div>' +
      '    <div class="books-card-copy">' +
      '      <span class="books-card-label">' + PepperLib.i18n.t('books.borrow') + '</span>' +
      '      <span class="books-card-desc">' + PepperLib.i18n.t('books.borrow_desc') + '</span>' +
      '    </div>' +
      '  </button>' +

      '  <button class="books-card books-card--return" data-action="return">' +
      '    <div class="books-card-icon">' +
      '      <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
      '        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' +
      '        <polyline points="16 12 12 16 8 12"></polyline>' +
      '        <line x1="12" y1="8" x2="12" y2="16"></line>' +
      '      </svg>' +
      '    </div>' +
      '    <div class="books-card-copy">' +
      '      <span class="books-card-label">' + PepperLib.i18n.t('books.return') + '</span>' +
      '      <span class="books-card-desc">' + PepperLib.i18n.t('books.return_desc') + '</span>' +
      '    </div>' +
      '  </button>' +

      '</div>';

    var cards = container.querySelectorAll('.books-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        showDetail(action);
        // Analytics counter
        PepperLib.Analytics.count('books', action);
      });
    }
  }

  function showDetail(action) {
    currentAction = action;
    var optionsEl = document.getElementById('books-options');
    var detailEl  = document.getElementById('books-detail');
    var isBorrow  = action === 'borrow';
    var titleKey  = isBorrow ? 'books.borrow_title'   : 'books.return_title';
    var msgKey    = isBorrow ? 'books.borrow_message'  : 'books.return_message';
    // For LastAction email
    var actionLabel = PepperLib.i18n.t(isBorrow ? 'books.borrow' : 'books.return');
    PepperLib.LastAction = PepperLib.i18n.t('books.screen_title') + ' — ' + actionLabel;
    PepperLib.LastActionItem = action;
    PepperLib.LastActionCategory = 'books';

    if (!optionsEl || !detailEl) return;

    optionsEl.classList.add('hidden');
    detailEl.classList.remove('hidden');

    detailEl.innerHTML =
      '<article class="books-detail-panel books-detail-panel--' + action + '">' +
      '  <div class="books-detail-icon books-detail-icon--' + action + '">' +
      '    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
      '      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' +
      (isBorrow
        ? '      <polyline points="8 12 12 8 16 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line>'
        : '      <polyline points="16 12 12 16 8 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line>') +
      '    </svg>' +
      '  </div>' +
      '  <div class="books-detail-copy">' +
      '    <h2 class="books-detail-title">' + PepperLib.i18n.t(titleKey) + '</h2>' +
      '    <p class="books-detail-message">' + PepperLib.i18n.t(msgKey) + '</p>' +
      '  </div>' +
      '  <div class="books-detail-actions">' +
      '    <button class="btn btn--primary" id="btn-books-llevame">' + PepperLib.i18n.t('nav.guide_me') + '</button>' +
      '    <button class="btn btn--secondary" id="btn-books-listo">' + PepperLib.i18n.t('nav.done') + '</button>' +
      '  </div>' +
      '</article>';

    document.getElementById('btn-books-llevame').addEventListener('click', function () {
      var tipo = (currentAction === 'borrow') ? 'Préstamo' : 'Devolución';
      PepperLib.Analytics.insertServiciosLibros(tipo, 'Llévame');
      PepperLib.Analytics.count('books_reception', currentAction || action);
      PepperLib.State.go(PepperLib.SCREENS.NAVIGATION_GUIDE, { destination: 'reception' });
    });

    document.getElementById('btn-books-listo').addEventListener('click', function () {
      var tipo = (currentAction === 'borrow') ? 'Préstamo' : 'Devolución';
      PepperLib.Analytics.insertServiciosLibros(tipo, 'Listo');
      PepperLib.State.go(PepperLib.SCREENS.MENU);
    });
  }

  function resetToOptions() {
    currentAction = null;
    var optionsEl = document.getElementById('books-options');
    var detailEl  = document.getElementById('books-detail');
    if (optionsEl) optionsEl.classList.remove('hidden');
    if (detailEl) {
      detailEl.classList.add('hidden');
      detailEl.innerHTML = '';
    }
  }

  PepperLib.State.registerScreen('books', {
    init: function () {
      buildOptions();
    },
    onEnter: function () {
      PepperLib.Inactivity.reset();
      buildOptions();
      resetToOptions();
      PepperLib.LastAction = PepperLib.i18n.t('books.screen_title');
      PepperLib.i18n.applyToDOM();
    },
    onExit: function () {
      resetToOptions();
    }
  });
})();
