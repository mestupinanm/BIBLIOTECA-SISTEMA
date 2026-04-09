/* ============================================
   SHELF SEARCH SCREEN — Accordion shelf view
   Shows 22 shelves; tap to expand and see topics.
   Map highlights the selected shelf with a marker.
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  /* ------------------------------------------------------------------
     TOPIC → SHELF DATA
     Each entry maps one topic row from the shelf catalog to a shelf.
  ------------------------------------------------------------------ */
  var SHELF_TOPICS = [
    // Shelf 01
    { topics: ['SIMULACIÓN', 'ARQUITECTURA DE SOFTWARE'],                                                shelf: '01', size: 'UNICA',   position: 'FRONTAL', coordKey: 'shelf_01' },
    { topics: ['REDES Y CONECTIVIDAD', 'INTELIGENCIA ARTIFICIAL'],                                      shelf: '01', size: 'UNICA',   position: 'TRASERA', coordKey: 'shelf_01' },
    // Shelf 02
    { topics: ['SISTEMAS OPERATIVOS', 'BASES DE DATOS'],                                                shelf: '02', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_02' },
    { topics: ['SEGURIDAD INFORMÁTICA', 'INTELIGENCIA ARTIFICIAL', 'DISEÑO MULTIMEDIA'],                shelf: '02', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_02' },
    { topics: ['LENGUAJES DE PROGRAMACIÓN', 'SISTEMAS OPERATIVOS'],                                     shelf: '02', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_02' },
    { topics: ['METODOLOGÍA CIENTÍFICA', 'FILOSOFÍA DE LA CIENCIA'],                                    shelf: '02', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_02' },
    // Shelf 03
    { topics: ['MATEMÁTICAS - ENSEÑANZA', 'MATEMÁTICAS - FUNDAMENTOS'],                                shelf: '03', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_03' },
    { topics: ['MATEMÁTICAS - HISTORIA', 'LÓGICA MATEMÁTICA'],                                         shelf: '03', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_03' },
    { topics: ['CIENCIA Y TECNOLOGÍA - HISTORIA', 'MATEMÁTICAS'],                                      shelf: '03', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_03' },
    { topics: ['ÁLGEBRA', 'ÁLGEBRA LINEAL'],                                                            shelf: '03', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_03' },
    // Shelf 04
    { topics: ['TOPOLOGÍA', 'CÁLCULO'],                                                                 shelf: '04', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_04' },
    { topics: ['CÁLCULO', 'PRE-CÁLCULO'],                                                               shelf: '04', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_04' },
    { topics: ['ÁLGEBRA LINEAL', 'TEORÍA DE LOS NÚMEROS', 'TOPOLOGÍA'],                                shelf: '04', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_04' },
    { topics: ['CÁLCULO', 'ECUACIONES DIFERENCIALES'],                                                  shelf: '04', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_04' },
    // Shelf 05
    { topics: ['GEOMETRÍA', 'PROBABILIDAD'],                                                            shelf: '05', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_05' },
    { topics: ['PROBABILIDAD', 'TEORÍA DEL JUEGO'],                                                     shelf: '05', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_05' },
    { topics: ['CÁLCULO VECTORIAL', 'ANÁLISIS DE GEOMETRÍA'],                                           shelf: '05', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_05' },
    { topics: ['TEORÍA DEL JUEGO', 'ANÁLISIS NUMÉRICO', 'PROBABILIDAD'],                               shelf: '05', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_05' },
    // Shelf 06
    { topics: ['ESTADÍSTICA', 'ANÁLISIS MULTIVARIABLE'],                                                shelf: '06', size: 'UNICA',   position: 'FRONTAL', coordKey: 'shelf_06' },
    // Shelf 07
    { topics: ['OPTIMIZACIÓN', 'ASTRONOMÍA'],                                                           shelf: '07', size: 'UNICA',   position: 'TRASERA', coordKey: 'shelf_07' },
    // Shelf 08
    { topics: ['FÍSICA'],                                                                               shelf: '08', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_08' },
    { topics: ['FÍSICA - BIOGRAFÍAS', 'RELATIVIDAD', 'TEORÍA CUÁNTICA'],                               shelf: '08', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_08' },
    { topics: ['COSMOLOGÍA', 'TOPOGRAFÍA', 'FÍSICA - FUNDAMENTOS'],                                    shelf: '08', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_08' },
    { topics: ['TEORÍA CUÁNTICA', 'ELECTROMAGNETISMO'],                                                 shelf: '08', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_08' },
    // Shelf 09
    { topics: ['MECÁNICA ESTADÍSTICA', 'FÍSICA TERMODINÁMICA', 'ELECTROMAGNETISMO'],                   shelf: '09', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_09' },
    { topics: ['ELECTRODINÁMICA', 'FÍSICA NUCLEAR'],                                                    shelf: '09', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_09' },
    { topics: ['MECÁNICA DE FLUIDOS', 'ÓPTICA'],                                                        shelf: '09', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_09' },
    { topics: ['MODELOS NUCLEARES', 'QUÍMICA GENERAL'],                                                 shelf: '09', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_09' },
    // Shelf 10
    { topics: ['ANÁLISIS QUÍMICO', 'QUÍMICA INORGÁNICA'],                                              shelf: '10', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_10' },
    { topics: ['QUÍMICA ORGÁNICA'],                                                                     shelf: '10', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_10' },
    { topics: ['FÍSICOQUÍMICA', 'QUÍMICA TERMODINÁMICA'],                                               shelf: '10', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_10' },
    { topics: ['MACROMOLÉCULAS', 'MINERALES', 'GEOLOGÍA'],                                             shelf: '10', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_10' },
    // Shelf 11
    { topics: ['ANTROPOLOGÍA BIOLÓGICA', 'BIOLOGÍA'],                                                   shelf: '11', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_11' },
    { topics: ['BIOESTADÍSTICA'],                                                                        shelf: '11', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_11' },
    { topics: ['METEOROLOGÍA', 'GEOQUÍMICA'],                                                           shelf: '11', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_11' },
    { topics: ['BIOQUÍMICA', 'ECOLOGÍA'],                                                               shelf: '11', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_11' },
    // Shelf 12
    { topics: ['MICROBIOLOGÍA', 'BOTÁNICA'],                                                            shelf: '12', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_12' },
    { topics: ['FITOPATOLOGÍA'],                                                                         shelf: '12', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_12' },
    { topics: ['BIOLOGÍA MOLECULAR', 'GENÉTICA', 'MICROBIOLOGÍA'],                                     shelf: '12', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_12' },
    { topics: ['MICOLOGÍA', 'ZOOLOGÍA', 'INVERTEBRADOS'],                                              shelf: '12', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_12' },
    // Shelf 13
    { topics: ['DIBUJO EN INGENIERÍA', 'HISTORIA DE LA TECNOLOGÍA', 'INGENIERÍA BIOMÉDICA'],           shelf: '13', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_13' },
    { topics: ['MEDICINA SOCIAL', 'ANATOMÍA', 'HISTOLOGÍA'],                                           shelf: '13', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_13' },
    { topics: ['INSECTOS', 'MAMÍFEROS', 'AVES'],                                                        shelf: '13', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_13' },
    { topics: ['FISIOLOGÍA MÉDICA', 'NEUROCIENCIA', 'MEDICINA FORENSE'],                               shelf: '13', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_13' },
    // Shelf 14
    { topics: ['PATOLOGÍA', 'INMUNOLOGÍA', 'HEMATOLOGÍA'],                                             shelf: '14', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_14' },
    { topics: ['NEUROLOGÍA', 'PSICOLOGÍA CLÍNICA'],                                                    shelf: '14', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_14' },
    { topics: ['FARMACOLOGÍA', 'SALUD PÚBLICA', 'MICROBIOLOGÍA MÉDICA'],                               shelf: '14', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_14' },
    { topics: ['PSIQUIATRÍA', 'ENFERMEDADES INFECCIOSAS', 'PEDIATRÍA'],                                shelf: '14', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_14' },
    // Shelf 15
    { topics: ['MATERIALES', 'MECÁNICA APLICADA'],                                                      shelf: '15', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_15' },
    { topics: ['MECÁNICA DE MATERIALES', 'COMPOSICIÓN DE MATERIALES'],                                  shelf: '15', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_15' },
    { topics: ['INGENIERÍA', 'DISEÑO DE INGENIERÍA', 'INGENIERÍA MECÁNICA'],                           shelf: '15', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_15' },
    { topics: ['INGENIERÍA DE POLÍMEROS', 'NANOTECNOLOGÍA', 'INGENIERÍA ELÉCTRICA'],                   shelf: '15', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_15' },
    // Shelf 16
    { topics: ['TELECOMUNICACIONES', 'MICROELECTRÓNICA'],                                               shelf: '16', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_16' },
    { topics: ['ELECTRÓNICA', 'COMUNICACIÓN DIGITAL'],                                                  shelf: '16', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_16' },
    { topics: ['CIRCUITOS ELÉCTRICOS', 'PROCESAMIENTO DE SEÑALES'],                                    shelf: '16', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_16' },
    { topics: ['DISEÑO DIGITAL', 'TERMODINÁMICA'],                                                      shelf: '16', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_16' },
    // Shelf 17
    { topics: ['INGENIERÍA CIVIL', 'MECÁNICA DE SUELOS'],                                              shelf: '17', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_17' },
    { topics: ['INGENIERÍA DE CARRETERAS', 'DISEÑO DE ESTRUCTURAS'],                                   shelf: '17', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_17' },
    { topics: ['INGENIERÍA MECÁNICA', 'INGENIERÍA DE PETRÓLEOS', 'INGENIERÍA HIDRÁULICA'],             shelf: '17', size: 'GRANDE',  position: 'FRONTAL', coordKey: 'shelf_17' },
    { topics: ['INGENIERÍA HIDRÁULICA', 'INGENIERÍA AMBIENTAL'],                                       shelf: '17', size: 'GRANDE',  position: 'TRASERA', coordKey: 'shelf_17' },
    // Shelf 18
    { topics: ['INGENIERÍA DEL AGUA', 'GESTIÓN DE RESIDUOS'],                                          shelf: '18', size: 'UNICA',   position: 'FRONTAL', coordKey: 'shelf_18' },
    // Shelf 19
    { topics: ['INGENIERÍA AMBIENTAL', 'INGENIERÍA AUTOMOTRIZ', 'SISTEMAS DE CONTROL Y ROBÓTICA'],     shelf: '19', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_19' },
    { topics: ['AGRICULTURA', 'ZOOTECNIA', 'GASTRONOMÍA'],                                             shelf: '19', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_19' },
    // Shelf 20
    { topics: ['GASTRONOMÍA', 'CONTABILIDAD', 'ADMINISTRACIÓN'],                                       shelf: '20', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_20' },
    { topics: ['TOMA DE DECISIONES', 'GERENCIA DE PROYECTOS', 'ADMINISTRACIÓN DE OPERACIONES'],        shelf: '20', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_20' },
    // Shelf 21
    { topics: ['MERCADEO', 'INGENIERÍA QUÍMICA', 'PROCESOS QUÍMICOS'],                                 shelf: '21', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_21' },
    { topics: ['QUÍMICA INDUSTRIAL', 'TECNOLOGÍA DE ALIMENTOS', 'PETRÓLEO'],                           shelf: '21', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_21' },
    // Shelf 22
    { topics: ['PLÁSTICOS', 'POLÍMEROS', 'METALURGIA'],                                                shelf: '22', size: 'PEQUEÑA', position: 'FRONTAL', coordKey: 'shelf_22' },
    { topics: ['MANUFACTURA', 'CONSTRUCCIÓN Y ACABADOS', 'LIBROS DE GRAN FORMATO'],                    shelf: '22', size: 'PEQUEÑA', position: 'TRASERA', coordKey: 'shelf_22' }
  ];

  /* ------------------------------------------------------------------
     GROUP BY SHELF NUMBER
  ------------------------------------------------------------------ */
  var SHELF_NUMBERS = ['01','02','03','04','05','06','07','08','09','10',
                       '11','12','13','14','15','16','17','18','19','20','21','22'];

  var SHELVES = {}; // { '01': { coordKey, allTopics: [] }, ... }

  for (var e = 0; e < SHELF_TOPICS.length; e++) {
    var entry = SHELF_TOPICS[e];
    if (!SHELVES[entry.shelf]) {
      SHELVES[entry.shelf] = {
        shelf: entry.shelf,
        coordKey: entry.coordKey,
        allTopics: []
      };
    }
    for (var t = 0; t < entry.topics.length; t++) {
      if (SHELVES[entry.shelf].allTopics.indexOf(entry.topics[t]) === -1) {
        SHELVES[entry.shelf].allTopics.push(entry.topics[t]);
      }
    }
  }

  /* ------------------------------------------------------------------
     STATE
  ------------------------------------------------------------------ */
  var activeShelf = null;

  /* ------------------------------------------------------------------
     RENDER ACCORDION LIST
  ------------------------------------------------------------------ */
  function renderList() {
    var listEl = document.getElementById('shelves-list');
    if (!listEl) return;

    var lang = PepperLib.State.language;
    var shelfLabel = lang === 'en' ? 'Shelf' : 'Estantería';

    var html = '';
    for (var i = 0; i < SHELF_NUMBERS.length; i++) {
      var num = SHELF_NUMBERS[i];
      var data = SHELVES[num];
      if (!data) continue;

      var isActive = (activeShelf === num);
      var primaryTopic = data.allTopics[0] || '';
      var extraCount = data.allTopics.length - 1;

      html += '<div class="shelf-item' + (isActive ? ' active' : '') + '" data-shelf="' + num + '">';

      // Header (always visible)
      html += '<button class="shelf-item-header">';
      html += '<div class="shelf-item-num">' + num + '</div>';
      html += '<div class="shelf-item-info">';
      html += '<div class="shelf-item-title">' + escapeHtml(primaryTopic) + '</div>';
      html += '<div class="shelf-item-subtitle">' + shelfLabel + ' ' + num;
      if (extraCount > 0) {
        html += ' &mdash; +' + extraCount + ' ' + (lang === 'en' ? 'more topics' : 'temas más');
      }
      html += '</div>';
      html += '</div>';
      html += '<svg class="shelf-item-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      html += '</button>';

      // Body (only shown when active)
      if (isActive) {
        html += '<div class="shelf-item-body">';
        for (var j = 0; j < data.allTopics.length; j++) {
          html += '<span class="shelf-topic-tag">' + escapeHtml(data.allTopics[j]) + '</span>';
        }
        html += '</div>';
      }

      html += '</div>';
    }

    listEl.innerHTML = html;

    // Attach click handlers to each shelf header
    var items = listEl.querySelectorAll('.shelf-item');
    for (var k = 0; k < items.length; k++) {
      (function (item) {
        var btn = item.querySelector('.shelf-item-header');
        if (btn) {
          btn.addEventListener('click', function () {
            var num = item.getAttribute('data-shelf');
            selectShelf(num);
          });
        }
      })(items[k]);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ------------------------------------------------------------------
     SELECT SHELF → highlight on map
  ------------------------------------------------------------------ */
  function selectShelf(shelfNum) {
    if (activeShelf === shelfNum) {
      // Tap again to collapse
      activeShelf = null;
      clearMap();
      renderList();
      return;
    }

    activeShelf = shelfNum;
    renderList();

    var data = SHELVES[shelfNum];
    if (!data) return;

    // Update map
    var lang = PepperLib.State.language;
    var mapImg = document.getElementById('shelves-map-img');
    if (mapImg) {
      mapImg.src = PepperLib.MapSrc(lang);
    }

    var markersEl = document.getElementById('shelves-map-markers');
    if (markersEl) {
      var coord = PepperLib.MapCoords[data.coordKey];
      if (coord) {
        markersEl.innerHTML = PepperLib.BuildMarker(coord.x, coord.y, 'marker-dest');
      }
    }

    // Show actions + update hint
    var hintEl = document.getElementById('shelves-map-hint');
    var actionsEl = document.getElementById('shelves-info-actions');
    var lang2 = PepperLib.State.language;
    if (hintEl) {
      hintEl.textContent = lang2 === 'en'
        ? 'Shelf ' + shelfNum
        : 'Estantería ' + shelfNum;
    }
    if (actionsEl) actionsEl.classList.remove('hidden');

    PepperLib.Analytics.log('shelf_selected', { shelf: shelfNum });
  }

  function clearMap() {
    var markersEl = document.getElementById('shelves-map-markers');
    if (markersEl) markersEl.innerHTML = '';

    var hintEl = document.getElementById('shelves-map-hint');
    if (hintEl) hintEl.textContent = PepperLib.i18n.t('shelves.select_hint');

    var actionsEl = document.getElementById('shelves-info-actions');
    if (actionsEl) actionsEl.classList.add('hidden');
  }

  /* ------------------------------------------------------------------
     REGISTER SCREEN
  ------------------------------------------------------------------ */
  PepperLib.State.registerScreen('shelves', {
    init: function () {
      var btnGuide = document.getElementById('btn-shelves-guide-me');
      if (btnGuide) {
        btnGuide.addEventListener('click', function () {
          if (activeShelf) {
            PepperLib.Robot.navigateTo('shelf_' + activeShelf);
          }
        });
      }

      var btnDone = document.getElementById('btn-shelves-done');
      if (btnDone) {
        btnDone.addEventListener('click', function () {
          PepperLib.State.go(PepperLib.SCREENS.FEEDBACK);
        });
      }
    },

    onEnter: function () {
      PepperLib.Inactivity.reset();
      activeShelf = null;
      clearMap();

      // Show map without marker
      var mapImg = document.getElementById('shelves-map-img');
      if (mapImg) {
        mapImg.src = PepperLib.MapSrc(PepperLib.State.language);
      }

      renderList();
      PepperLib.i18n.applyToDOM();
    },

    onExit: function () {
      activeShelf = null;
    }
  });
})();
