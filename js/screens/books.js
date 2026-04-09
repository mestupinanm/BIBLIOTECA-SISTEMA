/* ============================================
   BOOKS SCREEN - Loan / Return workflow
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  function buildOptions() {
    var container = document.getElementById('books-options');
    if (!container) return;

    container.innerHTML =
      '<button class="books-card" data-action="borrow">' +
      '  <div class="books-card-icon">' +
      '    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
      '      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' +
      '      <polyline points="8 12 12 8 16 12"></polyline>' +
      '      <line x1="12" y1="16" x2="12" y2="8"></line>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="books-card-label" data-i18n="books.borrow">' + PepperLib.i18n.t('books.borrow') + '</span>' +
      '  <span style="font-size:16px;color:var(--color-text-secondary)" data-i18n="books.borrow_desc">' + PepperLib.i18n.t('books.borrow_desc') + '</span>' +
      '</button>' +
      '<button class="books-card" data-action="return">' +
      '  <div class="books-card-icon">' +
      '    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
      '      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' +
      '      <polyline points="16 12 12 16 8 12"></polyline>' +
      '      <line x1="12" y1="8" x2="12" y2="16"></line>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="books-card-label" data-i18n="books.return">' + PepperLib.i18n.t('books.return') + '</span>' +
      '  <span style="font-size:16px;color:var(--color-text-secondary)" data-i18n="books.return_desc">' + PepperLib.i18n.t('books.return_desc') + '</span>' +
      '</button>';

    // Click handlers
    var cards = container.querySelectorAll('.books-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        showDetail(action);
        PepperLib.Analytics.log('book_service', { action: action });
      });
    }
  }

  function showDetail(action) {
    var optionsEl = document.getElementById('books-options');
    var detailEl = document.getElementById('books-detail');
    if (!optionsEl || !detailEl) return;

    optionsEl.classList.add('hidden');
    detailEl.classList.remove('hidden');

    var titleKey = action === 'borrow' ? 'books.borrow_title' : 'books.return_title';
    var msgKey = action === 'borrow' ? 'books.borrow_message' : 'books.return_message';

    var iconSvg = action === 'borrow'
      ? '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><polyline points="8 12 12 8 16 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>'
      : '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><polyline points="16 12 12 16 8 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>';

    detailEl.innerHTML =
      '<div class="books-detail-icon">' + iconSvg + '</div>' +
      '<h2 class="books-detail-title" data-i18n="' + titleKey + '">' + PepperLib.i18n.t(titleKey) + '</h2>' +
      '<p class="books-detail-message" data-i18n="' + msgKey + '">' + PepperLib.i18n.t(msgKey) + '</p>' +
      '<div class="books-detail-actions">' +
      '  <button class="btn btn--primary" id="btn-books-reception" data-i18n="books.go_reception">' + PepperLib.i18n.t('books.go_reception') + '</button>' +
      '  <button class="btn btn--secondary" id="btn-books-back" data-i18n="books.back_options">' + PepperLib.i18n.t('books.back_options') + '</button>' +
      '</div>';

    // Go to reception
    var btnReception = document.getElementById('btn-books-reception');
    if (btnReception) {
      btnReception.addEventListener('click', function () {
        PepperLib.State.go(PepperLib.SCREENS.NAVIGATION_GUIDE, { destination: 'reception' });
      });
    }

    // Back to options
    var btnBack = document.getElementById('btn-books-back');
    if (btnBack) {
      btnBack.addEventListener('click', function () {
        resetToOptions();
      });
    }
  }

  function resetToOptions() {
    var optionsEl = document.getElementById('books-options');
    var detailEl = document.getElementById('books-detail');
    if (optionsEl) optionsEl.classList.remove('hidden');
    if (detailEl) detailEl.classList.add('hidden');
  }

  PepperLib.State.registerScreen('books', {
    init: function () {
      buildOptions();
    },

    onEnter: function () {
      PepperLib.Inactivity.reset();
      resetToOptions();
      PepperLib.i18n.applyToDOM();
    },

    onExit: function () {
      resetToOptions();
    }
  });
})();
