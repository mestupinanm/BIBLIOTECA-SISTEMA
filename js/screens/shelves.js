/* ============================================
   SHELF SEARCH SCREEN
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var SHELF_TOPICS = [
    { topics: ['SIMULACION', 'ARQUITECTURA DE SOFTWARE'], shelf: '01', coordKey: 'shelf_01' },
    { topics: ['REDES Y CONECTIVIDAD', 'INTELIGENCIA ARTIFICIAL'], shelf: '01', coordKey: 'shelf_01' },
    { topics: ['SISTEMAS OPERATIVOS', 'BASES DE DATOS'], shelf: '02', coordKey: 'shelf_02' },
    { topics: ['SEGURIDAD INFORMATICA', 'INTELIGENCIA ARTIFICIAL', 'DISENO MULTIMEDIA'], shelf: '02', coordKey: 'shelf_02' },
    { topics: ['LENGUAJES DE PROGRAMACION', 'SISTEMAS OPERATIVOS'], shelf: '02', coordKey: 'shelf_02' },
    { topics: ['METODOLOGIA CIENTIFICA', 'FILOSOFIA DE LA CIENCIA'], shelf: '02', coordKey: 'shelf_02' },
    { topics: ['MATEMATICAS - ENSENANZA', 'MATEMATICAS - FUNDAMENTOS'], shelf: '03', coordKey: 'shelf_03' },
    { topics: ['MATEMATICAS - HISTORIA', 'LOGICA MATEMATICA'], shelf: '03', coordKey: 'shelf_03' },
    { topics: ['CIENCIA Y TECNOLOGIA - HISTORIA', 'MATEMATICAS'], shelf: '03', coordKey: 'shelf_03' },
    { topics: ['ALGEBRA', 'ALGEBRA LINEAL'], shelf: '03', coordKey: 'shelf_03' },
    { topics: ['TOPOLOGIA', 'CALCULO'], shelf: '04', coordKey: 'shelf_04' },
    { topics: ['CALCULO', 'PRE-CALCULO'], shelf: '04', coordKey: 'shelf_04' },
    { topics: ['ALGEBRA LINEAL', 'TEORIA DE LOS NUMEROS', 'TOPOLOGIA'], shelf: '04', coordKey: 'shelf_04' },
    { topics: ['CALCULO', 'ECUACIONES DIFERENCIALES'], shelf: '04', coordKey: 'shelf_04' },
    { topics: ['GEOMETRIA', 'PROBABILIDAD'], shelf: '05', coordKey: 'shelf_05' },
    { topics: ['PROBABILIDAD', 'TEORIA DEL JUEGO'], shelf: '05', coordKey: 'shelf_05' },
    { topics: ['CALCULO VECTORIAL', 'ANALISIS DE GEOMETRIA'], shelf: '05', coordKey: 'shelf_05' },
    { topics: ['TEORIA DEL JUEGO', 'ANALISIS NUMERICO', 'PROBABILIDAD'], shelf: '05', coordKey: 'shelf_05' },
    { topics: ['ESTADISTICA', 'ANALISIS MULTIVARIABLE'], shelf: '06', coordKey: 'shelf_06' },
    { topics: ['OPTIMIZACION', 'ASTRONOMIA'], shelf: '07', coordKey: 'shelf_07' },
    { topics: ['FISICA'], shelf: '08', coordKey: 'shelf_08' },
    { topics: ['FISICA - BIOGRAFIAS', 'RELATIVIDAD', 'TEORIA CUANTICA'], shelf: '08', coordKey: 'shelf_08' },
    { topics: ['COSMOLOGIA', 'TOPOGRAFIA', 'FISICA - FUNDAMENTOS'], shelf: '08', coordKey: 'shelf_08' },
    { topics: ['TEORIA CUANTICA', 'ELECTROMAGNETISMO'], shelf: '08', coordKey: 'shelf_08' },
    { topics: ['MECANICA ESTADISTICA', 'FISICA TERMODINAMICA', 'ELECTROMAGNETISMO'], shelf: '09', coordKey: 'shelf_09' },
    { topics: ['ELECTRODINAMICA', 'FISICA NUCLEAR'], shelf: '09', coordKey: 'shelf_09' },
    { topics: ['MECANICA DE FLUIDOS', 'OPTICA'], shelf: '09', coordKey: 'shelf_09' },
    { topics: ['MODELOS NUCLEARES', 'QUIMICA GENERAL'], shelf: '09', coordKey: 'shelf_09' },
    { topics: ['ANALISIS QUIMICO', 'QUIMICA INORGANICA'], shelf: '10', coordKey: 'shelf_10' },
    { topics: ['QUIMICA ORGANICA'], shelf: '10', coordKey: 'shelf_10' },
    { topics: ['FISICOQUIMICA', 'QUIMICA TERMODINAMICA'], shelf: '10', coordKey: 'shelf_10' },
    { topics: ['MACROMOLECULAS', 'MINERALES', 'GEOLOGIA'], shelf: '10', coordKey: 'shelf_10' },
    { topics: ['ANTROPOLOGIA BIOLOGICA', 'BIOLOGIA'], shelf: '11', coordKey: 'shelf_11' },
    { topics: ['BIOESTADISTICA'], shelf: '11', coordKey: 'shelf_11' },
    { topics: ['METEOROLOGIA', 'GEOQUIMICA'], shelf: '11', coordKey: 'shelf_11' },
    { topics: ['BIOQUIMICA', 'ECOLOGIA'], shelf: '11', coordKey: 'shelf_11' },
    { topics: ['MICROBIOLOGIA', 'BOTANICA'], shelf: '12', coordKey: 'shelf_12' },
    { topics: ['FITOPATOLOGIA'], shelf: '12', coordKey: 'shelf_12' },
    { topics: ['BIOLOGIA MOLECULAR', 'GENETICA', 'MICROBIOLOGIA'], shelf: '12', coordKey: 'shelf_12' },
    { topics: ['MICOLOGIA', 'ZOOLOGIA', 'INVERTEBRADOS'], shelf: '12', coordKey: 'shelf_12' },
    { topics: ['DIBUJO EN INGENIERIA', 'HISTORIA DE LA TECNOLOGIA', 'INGENIERIA BIOMEDICA'], shelf: '13', coordKey: 'shelf_13' },
    { topics: ['MEDICINA SOCIAL', 'ANATOMIA', 'HISTOLOGIA'], shelf: '13', coordKey: 'shelf_13' },
    { topics: ['INSECTOS', 'MAMIFEROS', 'AVES'], shelf: '13', coordKey: 'shelf_13' },
    { topics: ['FISIOLOGIA MEDICA', 'NEUROCIENCIA', 'MEDICINA FORENSE'], shelf: '13', coordKey: 'shelf_13' },
    { topics: ['PATOLOGIA', 'INMUNOLOGIA', 'HEMATOLOGIA'], shelf: '14', coordKey: 'shelf_14' },
    { topics: ['NEUROLOGIA', 'PSICOLOGIA CLINICA'], shelf: '14', coordKey: 'shelf_14' },
    { topics: ['FARMACOLOGIA', 'SALUD PUBLICA', 'MICROBIOLOGIA MEDICA'], shelf: '14', coordKey: 'shelf_14' },
    { topics: ['PSIQUIATRIA', 'ENFERMEDADES INFECCIOSAS', 'PEDIATRIA'], shelf: '14', coordKey: 'shelf_14' },
    { topics: ['MATERIALES', 'MECANICA APLICADA'], shelf: '15', coordKey: 'shelf_15' },
    { topics: ['MECANICA DE MATERIALES', 'COMPOSICION DE MATERIALES'], shelf: '15', coordKey: 'shelf_15' },
    { topics: ['INGENIERIA', 'DISENO DE INGENIERIA', 'INGENIERIA MECANICA'], shelf: '15', coordKey: 'shelf_15' },
    { topics: ['INGENIERIA DE POLIMEROS', 'NANOTECNOLOGIA', 'INGENIERIA ELECTRICA'], shelf: '15', coordKey: 'shelf_15' },
    { topics: ['TELECOMUNICACIONES', 'MICROELECTRONICA'], shelf: '16', coordKey: 'shelf_16' },
    { topics: ['ELECTRONICA', 'COMUNICACION DIGITAL'], shelf: '16', coordKey: 'shelf_16' },
    { topics: ['CIRCUITOS ELECTRICOS', 'PROCESAMIENTO DE SENALES'], shelf: '16', coordKey: 'shelf_16' },
    { topics: ['DISENO DIGITAL', 'TERMODINAMICA'], shelf: '16', coordKey: 'shelf_16' },
    { topics: ['INGENIERIA CIVIL', 'MECANICA DE SUELOS'], shelf: '17', coordKey: 'shelf_17' },
    { topics: ['INGENIERIA DE CARRETERAS', 'DISENO DE ESTRUCTURAS'], shelf: '17', coordKey: 'shelf_17' },
    { topics: ['INGENIERIA MECANICA', 'INGENIERIA DE PETROLEOS', 'INGENIERIA HIDRAULICA'], shelf: '17', coordKey: 'shelf_17' },
    { topics: ['INGENIERIA HIDRAULICA', 'INGENIERIA AMBIENTAL'], shelf: '17', coordKey: 'shelf_17' },
    { topics: ['INGENIERIA DEL AGUA', 'GESTION DE RESIDUOS'], shelf: '18', coordKey: 'shelf_18' },
    { topics: ['INGENIERIA AMBIENTAL', 'INGENIERIA AUTOMOTRIZ', 'SISTEMAS DE CONTROL Y ROBOTICA'], shelf: '19', coordKey: 'shelf_19' },
    { topics: ['AGRICULTURA', 'ZOOTECNIA', 'GASTRONOMIA'], shelf: '19', coordKey: 'shelf_19' },
    { topics: ['GASTRONOMIA', 'CONTABILIDAD', 'ADMINISTRACION'], shelf: '20', coordKey: 'shelf_20' },
    { topics: ['TOMA DE DECISIONES', 'GERENCIA DE PROYECTOS', 'ADMINISTRACION DE OPERACIONES'], shelf: '20', coordKey: 'shelf_20' },
    { topics: ['MERCADEO', 'INGENIERIA QUIMICA', 'PROCESOS QUIMICOS'], shelf: '21', coordKey: 'shelf_21' },
    { topics: ['QUIMICA INDUSTRIAL', 'TECNOLOGIA DE ALIMENTOS', 'PETROLEO'], shelf: '21', coordKey: 'shelf_21' },
    { topics: ['PLASTICOS', 'POLIMEROS', 'METALURGIA'], shelf: '22', coordKey: 'shelf_22' },
    { topics: ['MANUFACTURA', 'CONSTRUCCION Y ACABADOS', 'LIBROS DE GRAN FORMATO'], shelf: '22', coordKey: 'shelf_22' }
  ];

  var SHELF_NUMBERS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
  var SHELVES = {};
  var activeShelf = null;
  var activeTopic = null;
  var searchTerm = '';

  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildShelfIndex() {
    for (var i = 0; i < SHELF_TOPICS.length; i++) {
      var entry = SHELF_TOPICS[i];
      if (!SHELVES[entry.shelf]) {
        SHELVES[entry.shelf] = {
          shelf: entry.shelf,
          coordKey: entry.coordKey,
          topics: []
        };
      }
      for (var t = 0; t < entry.topics.length; t++) {
        if (SHELVES[entry.shelf].topics.indexOf(entry.topics[t]) === -1) {
          SHELVES[entry.shelf].topics.push(entry.topics[t]);
        }
      }
    }
  }

  function getFilteredShelves() {
    var list = [];
    var query = normalize(searchTerm);

    for (var i = 0; i < SHELF_NUMBERS.length; i++) {
      var num = SHELF_NUMBERS[i];
      var shelf = SHELVES[num];
      var topics = [];

      if (!shelf) continue;

      if (!query) {
        topics = shelf.topics.slice();
      } else {
        for (var t = 0; t < shelf.topics.length; t++) {
          if (normalize(shelf.topics[t]).indexOf(query) !== -1) {
            topics.push(shelf.topics[t]);
          }
        }
      }

      if (!query || topics.length) {
        list.push({
          shelf: num,
          coordKey: shelf.coordKey,
          topics: topics,
          allTopics: shelf.topics
        });
      }
    }

    return list;
  }

  function updateSearchMeta(resultCount) {
    var meta = document.getElementById('shelves-search-meta');
    if (!meta) return;

    if (!searchTerm) {
      meta.textContent = PepperLib.i18n.t('shelves.search_meta_default');
      return;
    }

    if (!resultCount) {
      meta.textContent = PepperLib.i18n.t('shelves.search_empty');
      return;
    }

    meta.textContent = resultCount + ' ' + PepperLib.i18n.t('shelves.search_results');
  }

  function renderList() {
    var listEl = document.getElementById('shelves-list');
    if (!listEl) return;

    var filtered = getFilteredShelves();
    var html = '';

    updateSearchMeta(filtered.length);

    if (!filtered.length) {
      listEl.innerHTML = '<div class="shelves-empty">' + PepperLib.i18n.t('shelves.search_empty') + '</div>';
      return;
    }

    for (var i = 0; i < filtered.length; i++) {
      var shelf = filtered[i];
      var isActive = shelf.shelf === activeShelf;
      var isExpanded = searchTerm ? visibleTopicsForSearch(shelf).length > 0 : isActive;
      var visibleTopics = searchTerm ? shelf.topics : shelf.allTopics;

      html += '<article class="shelf-item' + (isActive ? ' active' : '') + '" data-shelf="' + shelf.shelf + '">';
      html += '  <button class="shelf-item-header" data-shelf-toggle="' + shelf.shelf + '">';
      html += '    <div class="shelf-item-num">' + shelf.shelf + '.</div>';
      html += '    <div class="shelf-item-info">';
      html += '      <div class="shelf-item-title">' + PepperLib.i18n.t('shelves.shelf_label') + '</div>';
      html += '      <div class="shelf-item-subtitle">' + visibleTopics.length + ' ' + PepperLib.i18n.t('shelves.topics_count') + '</div>';
      html += '    </div>';
      html += '    <span class="shelf-item-cta">' + PepperLib.i18n.t(isExpanded ? 'shelves.hide_topics' : 'shelves.view_topics') + '</span>';
      html += '  </button>';

      if (isExpanded) {
        html += '<div class="shelf-item-body">';
        html += '  <p class="shelf-item-helper">' + PepperLib.i18n.t('shelves.tap_topic') + '</p>';
        html += '  <div class="shelf-topic-list">';
        for (var j = 0; j < visibleTopics.length; j++) {
          html += '    <button class="shelf-topic-tag' + (activeTopic === visibleTopics[j] ? ' is-active' : '') + '" data-topic="' + escapeHtml(visibleTopics[j]) + '" data-shelf-topic="' + shelf.shelf + '">' + escapeHtml(visibleTopics[j]) + '</button>';
        }
        html += '  </div>';
        html += '</div>';
      }

      html += '</article>';
    }

    listEl.innerHTML = html;

    var toggles = listEl.querySelectorAll('[data-shelf-toggle]');
    for (var k = 0; k < toggles.length; k++) {
      toggles[k].addEventListener('click', function () {
        selectShelf(this.getAttribute('data-shelf-toggle'));
      });
    }

    var topicBtns = listEl.querySelectorAll('[data-shelf-topic]');
    for (var m = 0; m < topicBtns.length; m++) {
      topicBtns[m].addEventListener('click', function () {
        focusTopic(this.getAttribute('data-shelf-topic'), this.getAttribute('data-topic'));
        PepperLib.Analytics.log('shelf_topic_selected', {
          shelf: this.getAttribute('data-shelf-topic'),
          topic: this.getAttribute('data-topic')
        });
      });
    }
  }

  function visibleTopicsForSearch(shelf) {
    return searchTerm ? shelf.topics : shelf.allTopics;
  }

  function updateMapForShelf(shelfNum, topicName) {
    var data = SHELVES[shelfNum];
    var markersEl = document.getElementById('shelves-map-markers');
    var mapImg = document.getElementById('shelves-map-img');
    var hintEl = document.getElementById('shelves-map-hint');
    var actionsEl = document.getElementById('shelves-info-actions');
    var coord = data ? PepperLib.MapCoords[data.coordKey] : null;

    if (mapImg) {
      mapImg.src = PepperLib.MapSrc(PepperLib.State.language);
    }

    if (markersEl) {
      markersEl.innerHTML = coord ? PepperLib.BuildMarker(coord.x, coord.y, 'marker-dest') : '';
    }

    if (hintEl) {
      hintEl.textContent = shelfNum
        ? (topicName ? topicName + ' · ' : '') + PepperLib.i18n.t('shelves.shelf_label') + ' ' + shelfNum
        : PepperLib.i18n.t('shelves.tap_topic');
    }

    if (actionsEl) {
      actionsEl.classList.toggle('hidden', !shelfNum);
    }
  }

  function selectShelf(shelfNum) {
    activeShelf = activeShelf === shelfNum ? null : shelfNum;
    if (!activeShelf) {
      activeTopic = null;
    }
    renderList();
    updateMapForShelf(activeShelf, activeTopic);

    if (activeShelf) {
      PepperLib.Analytics.count('shelves', 'shelf_' + activeShelf);
    PepperLib.LastAction = (PepperLib.State.language === 'en' ? 'Shelf ' : 'Estanter\u00EDa ') + activeShelf;
    PepperLib.LastActionItem = 'shelf_' + activeShelf;
    PepperLib.LastActionCategory = 'shelves';
    }
  }

  function focusTopic(shelfNum, topicName) {
    activeShelf = shelfNum;
    activeTopic = topicName;
    renderList();
    updateMapForShelf(activeShelf, activeTopic);
  }

  function bindSearch() {
    var input = document.getElementById('shelves-search');
    if (!input) return;

    input.addEventListener('input', function () {
      searchTerm = this.value || '';
      var filtered = getFilteredShelves();
      if (searchTerm && filtered.length) {
        activeShelf = filtered[0].shelf;
        activeTopic = filtered[0].topics[0] || null;
      } else if (!searchTerm) {
        activeShelf = '01';
        activeTopic = null;
      }
      renderList();
      if (activeShelf && filtered.some(function (item) { return item.shelf === activeShelf; })) {
        updateMapForShelf(activeShelf, activeTopic);
      } else if (!activeShelf) {
        updateMapForShelf(null);
      }
    });
  }

  PepperLib.State.registerScreen('shelves', {
    init: function () {
      buildShelfIndex();
      bindSearch();

      var btnGuide = document.getElementById('btn-shelves-guide-me');
      var btnDone = document.getElementById('btn-shelves-done');

      if (btnGuide) {
        btnGuide.addEventListener('click', function () {
          if (activeShelf) {
            PepperLib.Robot.navigateTo('shelf_' + activeShelf);
          }
        });
      }

      if (btnDone) {
        btnDone.addEventListener('click', function () {
          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK);
        });
      }
    },

    onEnter: function () {
      PepperLib.Inactivity.reset();
      activeShelf = '01';
      activeTopic = null;
      searchTerm = '';

      var input = document.getElementById('shelves-search');
      if (input) {
        input.value = '';
      }

      updateMapForShelf(null);
      renderList();
      PepperLib.i18n.applyToDOM();
    },

    onExit: function () {
      activeShelf = null;
      activeTopic = null;
    }
  });

  PepperLib.ShelvesContext = {
    getActiveShelf: function () {
      return activeShelf;
    },
    getActiveShelfLabel: function () {
      return activeShelf ? (activeTopic ? activeTopic + ' · ' : '') + PepperLib.i18n.t('shelves.shelf_label') + ' ' + activeShelf : null;
    }
  };
})();
