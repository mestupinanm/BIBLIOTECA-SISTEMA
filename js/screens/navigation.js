/* ============================================
   NAVIGATION DESTINATION PICKER
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var CATEGORIES = [
    {
      id: 'rooms',
      titleKey: 'nav.cat.rooms',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>',
      items: [
        { id: 'room_251', nameKey: 'dest.room_251' },
        { id: 'room_254', nameKey: 'dest.room_254' },
        { id: 'room_255a', nameKey: 'dest.room_255a' },
        { id: 'room_255b', nameKey: 'dest.room_255b' },
        { id: 'room_255c', nameKey: 'dest.room_255c' },
        { id: 'room_255d', nameKey: 'dest.room_255d' },
        { id: 'room_257', nameKey: 'dest.room_257' },
        { id: 'room_ml253', nameKey: 'dest.room_ml253' }
      ]
    },
    {
      id: 'services',
      titleKey: 'nav.cat.services',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
      items: [
        { id: 'reception', nameKey: 'dest.reception' },
        { id: 'reference', nameKey: 'dest.reference' },
        { id: 'restroom_m', nameKey: 'dest.restroom_m' },
        { id: 'restroom_f', nameKey: 'dest.restroom_f' },
        { id: 'book_lift', nameKey: 'dest.book_lift' },
        { id: 'equipment_workshop', nameKey: 'dest.equipment_workshop' }
      ]
    },
    {
      id: 'access',
      titleKey: 'nav.cat.access',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
      items: [
        { id: 'entry_exit', nameKey: 'dest.entry_exit' },
        { id: 'elevator', nameKey: 'dest.elevator' },
        { id: 'stairs_main', nameKey: 'dest.stairs_main' },
        { id: 'stairs_emergency', nameKey: 'dest.stairs_emergency' }
      ]
    },
    {
      id: 'collections',
      titleKey: 'nav.cat.collections',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
      items: [
        { id: 'col_engineering', nameKey: 'dest.col_engineering' },
        { id: 'col_sciences', nameKey: 'dest.col_sciences' },
        { id: 'col_humanities', nameKey: 'dest.col_humanities' },
        { id: 'col_social', nameKey: 'dest.col_social' },
        { id: 'col_arts', nameKey: 'dest.col_arts' }
      ]
    }
  ];

  function buildCategories() {
    var container = document.getElementById('nav-categories');
    if (!container) return;

    var html = '';
    for (var c = 0; c < CATEGORIES.length; c++) {
      var cat = CATEGORIES[c];
      html += '<div class="nav-category" data-cat="' + cat.id + '">';
      html += '  <button class="nav-category-header">';
      html += '    ' + cat.icon;
      html += '    <span data-i18n="' + cat.titleKey + '">' + PepperLib.i18n.t(cat.titleKey) + '</span>';
      html += '    <svg class="nav-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      html += '  </button>';
      html += '  <div class="nav-category-items">';

      for (var i = 0; i < cat.items.length; i++) {
        var item = cat.items[i];
        html += '    <button class="nav-item" data-dest="' + item.id + '">';
        html += '      <span class="nav-item-name" data-i18n="' + item.nameKey + '">' + PepperLib.i18n.t(item.nameKey) + '</span>';
        html += '      <svg class="nav-item-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        html += '    </button>';
      }

      html += '  </div>';
      html += '</div>';
    }

    container.innerHTML = html;

    // Category toggle
    var headers = container.querySelectorAll('.nav-category-header');
    for (var h = 0; h < headers.length; h++) {
      headers[h].addEventListener('click', function () {
        var cat = this.parentElement;
        cat.classList.toggle('open');
      });
    }

    // Destination click
    var items = container.querySelectorAll('.nav-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', function () {
        var destId = this.getAttribute('data-dest');
        PepperLib.Analytics.log('destination_request', { destination: destId });
        PepperLib.State.go(PepperLib.SCREENS.NAVIGATION_GUIDE, { destination: destId });
      });
    }
  }

  PepperLib.State.registerScreen('navigation', {
    init: function () {
      buildCategories();
    },

    onEnter: function () {
      PepperLib.Inactivity.reset();
      // Collapse all categories on enter
      var cats = document.querySelectorAll('.nav-category');
      for (var i = 0; i < cats.length; i++) {
        cats[i].classList.remove('open');
      }
      PepperLib.i18n.applyToDOM();
    },

    onExit: function () {}
  });

  // Expose categories for other modules
  PepperLib.NavCategories = CATEGORIES;
})();
