/* ============================================================
   DASHBOARD — Nova Library Analytics
   Requires: window.LibraryData (data.js) · D3 v7
   ============================================================ */
(function () {
  'use strict';

  /* ── PALETA ─────────────────────────────────────────────── */
  var C = {
    blue:    '#1B2A4A',
    amber:   '#C8973A',
    green:   '#3D6B4F',
    red:     '#B85450',
    darkRed: '#7A3030',
    blue2:   '#2D4E8A',
    warmBrn: '#8B7A50',
    grey:    '#9E9E9E',
  };

  var SAT_COLORS = {
    Excelente: C.blue,
    Bueno:     C.green,
    Regular:   C.amber,
    Malo:      C.red,
    Pésimo:    C.darkRed,
  };

  var SAT_EMOJIS = {
    Excelente: '😄',
    Bueno:     '😊',
    Regular:   '😐',
    Malo:      '😟',
    Pésimo:    '😫',
  };

  var SAT_CIRCLE_BG = {
    Excelente: '#EDD9A3',
    Bueno:     '#A8C4AF',
    Regular:   '#C4BEB6',
    Malo:      '#D4A8A4',
    Pésimo:    '#B89090',
  };

  /* ── ETIQUETAS DESTINOS ─────────────────────────────────── */
  var DEST_MAP = {
    reception:           'Recepción',
    elevator:            'Ascensor',
    stairs_up:           'Escaleras subida',
    stairs_down:         'Escaleras bajada',
    stairs_emergency:    'Escaleras emergencia',
    restroom_m:          'Baño hombres',
    restroom_f:          'Baño mujeres',
    restroom_accessible: 'Baño accesible',
    entry:               'Entrada',
    exit:                'Salida',
    book_lift:           'Subidor de libros',
    coordination:        'Coordinación',
    room_251: 'Sala 251',  room_252c: 'Sala 252C',
    room_254: 'Sala 254',  room_255:  'Sala 255',
    room_255a:'Sala 255A', room_255b: 'Sala 255B',
    room_255c:'Sala 255C', room_255d: 'Sala 255D',
    room_256: 'Sala 256',  room_257:  'Sala 257',
    room_259a:'Sala 259A', room_259g: 'Sala 259G',
  };
  for (var _i = 1; _i <= 22; _i++) {
    DEST_MAP['shelf_' + String(_i).padStart(2, '0')] = 'Estantería ' + _i;
  }

  /* ── CATEGORÍAS ─────────────────────────────────────────── */
  var CAT_MAP = {
    navigation: '¿A dónde voy?', navegacion: '¿A dónde voy?', nav: '¿A dónde voy?',
    book_search: 'Buscar libro', buscar_libro: 'Buscar libro', shelves: 'Buscar libro',
    book_services: 'Servicios de libros', servicios_libros: 'Servicios de libros',
    books: 'Servicios de libros', services: 'Servicios de libros',
    information: 'Información', informacion: 'Información', info: 'Información',
    events: 'Eventos', eventos: 'Eventos',
  };

  var CAT_ORDER = [
    { label: '¿A dónde voy?',      color: C.blue    },
    { label: 'Buscar libro',        color: C.blue2   },
    { label: 'Servicios de libros', color: C.amber   },
    { label: 'Información',         color: C.warmBrn },
    { label: 'Eventos',             color: C.grey    },
  ];

  function catColor(label) {
    var e = CAT_ORDER.find(function (x) { return x.label === label; });
    return e ? e.color : C.grey;
  }

  /* ── DÍAS ───────────────────────────────────────────────── */
  var DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  /* ── INFORMACIÓN / ACTIVIDADES MAP ─────────────────────── */
  var INFO_MAP = {
    horarios: 'Horarios', hours: 'Horarios',
    noticias: 'Noticias', news: 'Noticias',
    faq: 'Preguntas frecuentes', faqs: 'Preguntas frecuentes',
    preguntas_frecuentes: 'Preguntas frecuentes',
    preguntas: 'Preguntas frecuentes',
  };

  var ACT_MAP = {
    trivia: 'Trivia',
    sopa_de_letras: 'Sopa de letras', wordsearch: 'Sopa de letras', word_search: 'Sopa de letras',
    memoria: 'Memoria', memory: 'Memoria',
  };

  /* ── SUPABASE ───────────────────────────────────────────── */
  var SB_URL, SB_KEY, SB_HDR;

  function initSB() {
    var sb = window.LibraryData.SUPABASE;
    SB_URL = sb.url;
    SB_KEY = sb.key;
    SB_HDR = {
      apikey: SB_KEY,
      Authorization: 'Bearer ' + SB_KEY,
      'Content-Type': 'application/json',
    };
  }

  function sbGet(table, qs) {
    var url = SB_URL + '/rest/v1/' + table + '?' + qs + '&limit=50000';
    return fetch(url, { headers: SB_HDR })
      .then(function (r) {
        if (!r.ok) { console.warn('[dash]', table, r.status); return []; }
        return r.json();
      })
      .catch(function (e) {
        console.warn('[dash] error', table, e);
        return [];
      });
  }

  /* ── UTILS ──────────────────────────────────────────────── */
  function countBy(arr, fn) {
    return arr.reduce(function (acc, x) {
      var k = typeof fn === 'function' ? fn(x) : x[fn];
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }

  function normKey(map, raw) {
    if (!raw) return raw;
    var k = String(raw).toLowerCase().replace(/ /g, '_');
    return map[k] || map[String(raw)] || raw;
  }

  function normSat(p) {
    if (typeof p === 'number') {
      return ({ 5: 'Excelente', 4: 'Bueno', 3: 'Regular', 2: 'Malo', 1: 'Pésimo' }[p]) || 'Regular';
    }
    var s = String(p || '').toLowerCase();
    if (/excelente|excellent/.test(s)) return 'Excelente';
    if (/bueno|good|bien/.test(s))     return 'Bueno';
    if (/regular|average/.test(s))     return 'Regular';
    if (/malo|bad|poor/.test(s))       return 'Malo';
    if (/p[eé]simo|terrible|worst/.test(s)) return 'Pésimo';
    return 'Regular';
  }

  function relTime(str) {
    if (!str) return '';
    var d = new Date(str), now = new Date();
    var h = (now - d) / 3600000;
    if (h < 1)   return 'hace menos de 1 h';
    if (h < 24)  return 'hace ' + Math.floor(h) + ' h';
    var days = h / 24;
    if (days < 2) return 'ayer';
    if (days < 7) return 'hace ' + Math.floor(days) + ' días';
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

  function dayKey(d) { return d.toISOString().slice(0, 10); }

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* Returns array of {date, v} for the last `days` calendar days */
  function dailySeries(records, dateField, days) {
    days = days || 30;
    var now = new Date(), series = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      series.push({ date: dayKey(d), v: 0 });
    }
    var idx = {};
    series.forEach(function (s) { idx[s.date] = s; });
    records.forEach(function (r) {
      var k = new Date(r[dateField]).toISOString().slice(0, 10);
      if (idx[k]) idx[k].v++;
    });
    return series;
  }

  /* Returns % weekly change, or null if insufficient data */
  function weekChange(series) {
    var n = series.length;
    if (n < 14) return null;
    var prev = series.slice(n - 14, n - 7).reduce(function (s, d) { return s + d.v; }, 0);
    var curr = series.slice(n - 7).reduce(function (s, d) { return s + d.v; }, 0);
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  }

  /* ── TOOLTIP ────────────────────────────────────────────── */
  var TT = document.getElementById('tooltip');
  function showTT(html, e) { TT.innerHTML = html; TT.style.display = 'block'; moveTT(e); }
  function moveTT(e) { TT.style.left = (e.pageX + 14) + 'px'; TT.style.top = (e.pageY - 30) + 'px'; }
  function hideTT() { TT.style.display = 'none'; }

  /* ── SKELETONS ──────────────────────────────────────────── */
  var SKEL_TARGETS = [
    ['kpi-list', 4], ['destinos-bars', 7], ['uso-cards', 3],
    ['uso-stack', 1], ['satisfaccion-wrap', 3], ['actividad-chart', 3],
    ['temas-bars', 5], ['ests-bars', 5], ['svc-libros', 2],
    ['info-bars', 3], ['act-bars', 3], ['comments-list', 3],
  ];

  function showSkeletons() {
    SKEL_TARGETS.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      var html = '';
      for (var i = 0; i < pair[1]; i++) {
        html += '<div class="skeleton skel-line" style="width:' + (88 - i * 9) + '%"></div>';
      }
      el.innerHTML = html;
    });
    document.getElementById('embudo-summary').textContent = '';
    document.getElementById('embudo-bar').innerHTML = '';
    document.getElementById('embudo-legend').innerHTML = '';
    document.getElementById('uso-legend').innerHTML = '';
  }

  function noData(id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = '<p class="no-data">Sin datos aún</p>';
  }

  /* ── KPI SPARKLINES ─────────────────────────────────────── */
  function renderKPIs(sesD, navD, libD, satD, satRaw) {
    var positive = satRaw.filter(function (r) { return ['Excelente', 'Bueno'].indexOf(normSat(r.puntuacion)) > -1; }).length;
    var satTotal = satRaw.length;
    var satPct   = satTotal > 0 ? Math.round(positive / satTotal * 100) : 0;

    var kpis = [
      { label: 'Sesiones',           series: sesD, val: fmt(sesD.reduce(function (s, d) { return s + d.v; }, 0)),  color: C.blue  },
      { label: 'Navegaciones',        series: navD, val: fmt(navD.reduce(function (s, d) { return s + d.v; }, 0)),  color: C.blue  },
      { label: 'Búsquedas de libros', series: libD, val: fmt(libD.reduce(function (s, d) { return s + d.v; }, 0)),  color: C.blue  },
      { label: 'Satisfacción',        series: satD, val: satPct + '%',                                              color: C.amber },
    ];

    var el = document.getElementById('kpi-list');
    el.innerHTML = '';

    kpis.forEach(function (k) {
      var chg = weekChange(k.series);
      var badgeClass, badgeTxt;
      if (chg === null) {
        badgeClass = 'kpi-badge neutral'; badgeTxt = '—';
      } else if (chg >= 0) {
        badgeClass = 'kpi-badge'; badgeTxt = '▲ ' + chg.toFixed(0) + '%';
      } else {
        badgeClass = 'kpi-badge down'; badgeTxt = '▼ ' + Math.abs(chg).toFixed(0) + '%';
      }
      var sparkId = 'spark-' + k.label.replace(/\s+/g, '-');
      var row = document.createElement('div');
      row.className = 'kpi-row';
      row.innerHTML =
        '<span class="kpi-label">' + k.label + '</span>' +
        '<svg class="kpi-spark" id="' + sparkId + '"></svg>' +
        '<span class="kpi-value">' + k.val + '</span>' +
        '<span class="' + badgeClass + '">' + badgeTxt + '</span>';
      el.appendChild(row);
    });

    requestAnimationFrame(function () {
      kpis.forEach(function (k) {
        drawSparkline('spark-' + k.label.replace(/\s+/g, '-'), k.series, k.color);
      });
    });
  }

  function drawSparkline(id, series, color) {
    var svgEl = document.getElementById(id);
    if (!svgEl) return;
    var W = svgEl.getBoundingClientRect().width || 180;
    var H = 40, ml = 2, mr = 2, mt = 4, mb = 4;
    var iW = W - ml - mr, iH = H - mt - mb;

    var svg = d3.select('#' + id).attr('viewBox', '0 0 ' + W + ' ' + H);
    svg.selectAll('*').remove();

    var xS = d3.scaleLinear().domain([0, series.length - 1]).range([0, iW]);
    var maxV = d3.max(series, function (d) { return d.v; }) || 1;
    var yS = d3.scaleLinear().domain([0, maxV]).range([iH, 0]);

    var area = d3.area()
      .x(function (d, i) { return ml + xS(i); })
      .y0(mt + iH).y1(function (d) { return mt + yS(d.v); })
      .curve(d3.curveCatmullRom.alpha(0.5));
    var line = d3.line()
      .x(function (d, i) { return ml + xS(i); })
      .y(function (d) { return mt + yS(d.v); })
      .curve(d3.curveCatmullRom.alpha(0.5));

    svg.append('path').datum(series).attr('d', area).attr('fill', color).attr('opacity', 0.12);
    svg.append('path').datum(series).attr('d', line).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5);
  }

  /* ── USO POR TIPO ───────────────────────────────────────── */
  function renderUsoPorTipo(ig) {
    var total = ig.length;
    if (!total) { noData('uso-cards'); noData('uso-stack'); return; }

    var raw = countBy(ig, function (r) { return CAT_MAP[r.categoria] || r.categoria || '—'; });

    /* merge any unmapped to their display label */
    var totals = {};
    Object.keys(raw).forEach(function (k) {
      var lbl = CAT_MAP[k] || k;
      totals[lbl] = (totals[lbl] || 0) + raw[k];
    });

    var sorted = Object.keys(totals)
      .map(function (lbl) { return { label: lbl, count: totals[lbl] }; })
      .sort(function (a, b) { return b.count - a.count; });

    /* 3 cards */
    var cardsEl = document.getElementById('uso-cards');
    cardsEl.innerHTML = '';
    sorted.slice(0, 3).forEach(function (d) {
      var pct = Math.round(d.count / total * 100);
      var col = catColor(d.label);
      var div = document.createElement('div');
      div.className = 'uso-card';
      div.innerHTML =
        '<div class="uso-card-lbl">' + d.label + '</div>' +
        '<div class="uso-card-pct" style="color:' + col + '">' + pct + '%</div>' +
        '<div class="uso-card-uses">' + fmt(d.count) + ' usos</div>' +
        '<div class="uso-card-track"><div class="uso-card-fill" style="width:' + pct + '%;background:' + col + '"></div></div>';
      cardsEl.appendChild(div);
    });

    /* stacked bar top-5 */
    var stackEl = document.getElementById('uso-stack');
    stackEl.innerHTML = '';
    var bar = document.createElement('div');
    bar.className = 'uso-stack-bar';
    sorted.slice(0, 5).forEach(function (d) {
      var pct = (d.count / total * 100).toFixed(2);
      var col = catColor(d.label);
      var seg = document.createElement('div');
      seg.className = 'uso-stack-seg';
      seg.style.cssText = 'width:' + pct + '%;background:' + col;
      (function (label, count, p) {
        seg.addEventListener('mouseover', function (e) { showTT('<b>' + label + '</b><br>' + fmt(count) + ' usos · ' + Math.round(p) + '%', e); });
        seg.addEventListener('mousemove', moveTT);
        seg.addEventListener('mouseout', hideTT);
      }(d.label, d.count, pct));
      bar.appendChild(seg);
    });
    stackEl.appendChild(bar);

    /* legend */
    var legendEl = document.getElementById('uso-legend');
    legendEl.innerHTML = sorted.slice(0, 5).map(function (d) {
      var pct = Math.round(d.count / total * 100);
      return '<span class="leg-item"><span class="leg-dot" style="background:' + catColor(d.label) + '"></span>' + d.label + ' · ' + pct + '%</span>';
    }).join('');
  }

  /* ── EMBUDO ─────────────────────────────────────────────── */
  function renderEmbudo(ig, nav) {
    var total     = ig.length;
    var eligieron = nav.length;
    var llevame   = nav.filter(function (r) { return /llevame/i.test(r.eleccion || ''); }).length;
    var listo     = nav.filter(function (r) { return /listo/i.test(r.eleccion || '');   }).length;

    var pctElig  = total     > 0 ? Math.round(eligieron / total     * 100) : 0;
    var pctLlev  = eligieron > 0 ? Math.round(llevame   / eligieron * 100) : 0;
    var pctList  = eligieron > 0 ? Math.round(listo     / eligieron * 100) : 0;

    document.getElementById('embudo-summary').textContent =
      fmt(total) + ' sesiones · ' + fmt(eligieron) + ' eligieron un destino (' + pctElig + '%)';

    var barEl = document.getElementById('embudo-bar');
    if (!eligieron) { barEl.innerHTML = '<p class="no-data">Sin datos aún</p>'; return; }

    barEl.innerHTML =
      '<div class="stacked-bar">' +
        '<div class="stacked-seg" style="width:' + pctLlev + '%;background:' + C.blue + '" id="ef-llev">' + (llevame > 0 ? fmt(llevame) : '') + '</div>' +
        '<div class="stacked-seg" style="width:' + pctList + '%;background:' + C.amber + '" id="ef-list">' + (listo > 0 ? fmt(listo) : '') + '</div>' +
      '</div>';

    var segL = document.getElementById('ef-llev');
    var segS = document.getElementById('ef-list');
    if (segL) {
      segL.addEventListener('mouseover', function (e) { showTT('<b>Llévame</b><br>' + fmt(llevame) + ' · ' + pctLlev + '%', e); });
      segL.addEventListener('mousemove', moveTT); segL.addEventListener('mouseout', hideTT);
    }
    if (segS) {
      segS.addEventListener('mouseover', function (e) { showTT('<b>Listo (solo mapa)</b><br>' + fmt(listo) + ' · ' + pctList + '%', e); });
      segS.addEventListener('mousemove', moveTT); segS.addEventListener('mouseout', hideTT);
    }

    document.getElementById('embudo-legend').innerHTML =
      '<span class="leg-item"><span class="leg-dot" style="background:' + C.blue + '"></span>Llévame · ' + pctLlev + '% — Nova guió</span>' +
      '<span class="leg-item"><span class="leg-dot" style="background:' + C.amber + '"></span>Listo · ' + pctList + '% — solo mapa</span>';
  }

  /* ── SATISFACCIÓN DONUT ─────────────────────────────────── */
  function renderSatisfaccion(cal) {
    var wrap = document.getElementById('satisfaccion-wrap');
    if (!cal.length) { wrap.innerHTML = '<p class="no-data">Sin datos aún</p>'; return; }

    var buckets = { Excelente: 0, Bueno: 0, Regular: 0, Malo: 0, Pésimo: 0 };
    cal.forEach(function (r) { var k = normSat(r.puntuacion); if (k in buckets) buckets[k]++; });

    var total    = cal.length;
    var positive = buckets.Excelente + buckets.Bueno;
    var pctPos   = Math.round(positive / total * 100);

    var data = Object.keys(buckets)
      .filter(function (k) { return buckets[k] > 0; })
      .map(function (k) { return { label: k, count: buckets[k], pct: Math.round(buckets[k] / total * 100) }; });

    wrap.innerHTML = '<svg id="donut-svg" style="flex-shrink:0"></svg><div class="donut-legend" id="donut-leg"></div>';

    var R = 70, r = Math.round(R * 0.62), SZ = 156;
    var svg = d3.select('#donut-svg').attr('width', SZ).attr('height', SZ).attr('viewBox', '0 0 ' + SZ + ' ' + SZ);
    var g   = svg.append('g').attr('transform', 'translate(' + SZ / 2 + ',' + SZ / 2 + ')');

    var pie = d3.pie().value(function (d) { return d.count; }).sort(null);
    var arc = d3.arc().innerRadius(r).outerRadius(R);

    g.selectAll('path').data(pie(data)).enter().append('path')
      .attr('d', arc)
      .attr('fill', function (d) { return SAT_COLORS[d.data.label]; })
      .attr('stroke', '#fff').attr('stroke-width', 2)
      .on('mouseover', function (ev, d) { showTT('<b>' + d.data.label + '</b><br>' + d.data.count + ' · ' + d.data.pct + '%', ev); })
      .on('mousemove', moveTT).on('mouseout', hideTT);

    g.append('text').attr('text-anchor', 'middle').attr('y', -4)
      .attr('dominant-baseline', 'auto')
      .attr('font-size', 22).attr('font-weight', 700).attr('fill', C.blue)
      .text(pctPos + '%');
    g.append('text').attr('text-anchor', 'middle').attr('y', 15)
      .attr('dominant-baseline', 'auto')
      .attr('font-size', 11).attr('fill', '#888')
      .text('positivo');

    document.getElementById('donut-leg').innerHTML = data.map(function (d) {
      return '<div class="donut-leg-item">' +
        '<span class="donut-leg-dot" style="background:' + SAT_COLORS[d.label] + '"></span>' +
        '<span style="color:#1B2A4A;font-weight:500">' + d.label + '</span>' +
        '<span style="color:#888">' + d.pct + '%</span>' +
        '</div>';
    }).join('');
  }

  /* ── DESTINOS ───────────────────────────────────────────── */
  function renderDestinos(nav) {
    var el = document.getElementById('destinos-bars');
    if (!nav.length) { el.innerHTML = '<p class="no-data">Sin datos aún</p>'; return; }

    var agg = {};
    nav.forEach(function (r) {
      var k = r.destino || 'unknown';
      if (!agg[k]) agg[k] = { L: 0, S: 0 };
      if (/llevame/i.test(r.eleccion || ''))    agg[k].L++;
      else if (/listo/i.test(r.eleccion || '')) agg[k].S++;
    });

    var rows = Object.keys(agg).map(function (k) {
      return { key: k, label: DEST_MAP[k] || k, L: agg[k].L, S: agg[k].S, total: agg[k].L + agg[k].S };
    }).sort(function (a, b) { return b.total - a.total; }).slice(0, 7);

    var maxT = d3.max(rows, function (d) { return d.total; }) || 1;

    el.innerHTML = rows.map(function (d) {
      var wL   = (d.L / maxT * 100).toFixed(2);
      var wS   = (d.S / maxT * 100).toFixed(2);
      var pctL = d.total > 0 ? Math.round(d.L / d.total * 100) : 0;
      return '<div class="dest-row">' +
        '<span class="dest-label">' + d.label + '</span>' +
        '<div class="dest-bar-outer">' +
          '<div class="dest-seg" style="width:' + wL + '%;background:' + C.blue + '" ' +
            'data-tip="<b>' + d.label + '</b><br>Llévame: ' + d.L + '"></div>' +
          '<div class="dest-seg" style="width:' + wS + '%;background:' + C.amber + '" ' +
            'data-tip="<b>' + d.label + '</b><br>Listo: ' + d.S + '"></div>' +
        '</div>' +
        '<div class="dest-meta">' +
          '<span class="dest-total">' + d.total + '</span>' +
          '<span class="dest-pct">' + pctL + '%</span>' +
        '</div>' +
      '</div>';
    }).join('');

    el.querySelectorAll('[data-tip]').forEach(function (seg) {
      seg.addEventListener('mouseover', function (e) { showTT(seg.dataset.tip, e); });
      seg.addEventListener('mousemove', moveTT);
      seg.addEventListener('mouseout', hideTT);
    });
  }

  /* ── ACTIVIDAD POR DÍA ──────────────────────────────────── */
  function renderActividadDia(ig) {
    var el = document.getElementById('actividad-chart');
    el.innerHTML = '';
    if (!ig.length) { el.innerHTML = '<p class="no-data">Sin datos aún</p>'; return; }

    var counts = [0, 0, 0, 0, 0, 0, 0];
    ig.forEach(function (r) { counts[new Date(r.created_at).getDay()]++; });

    /* show Mon–Sat always; include Sun only when it has data */
    var indices = [1, 2, 3, 4, 5, 6];
    if (counts[0] > 0) indices.unshift(0);
    var data = indices.map(function (i) { return { day: DAY_NAMES[i], v: counts[i] }; });

    if (data.every(function (d) { return d.v === 0; })) {
      el.innerHTML = '<p class="no-data">Sin datos aún</p>'; return;
    }

    var maxV = d3.max(data, function (d) { return d.v; }) || 1;
    var mt = 30, mr = 24, mb = 40, ml = 24;
    var H  = 220;
    var W  = (el.clientWidth || el.parentElement.clientWidth || 900);
    var iW = W - ml - mr, iH = H - mt - mb;

    var svg = d3.select('#actividad-chart').append('svg')
      .attr('width', '100%').attr('height', H)
      .attr('viewBox', '0 0 ' + W + ' ' + H);

    var g = svg.append('g').attr('transform', 'translate(' + ml + ',' + mt + ')');

    var x = d3.scaleBand().domain(data.map(function (d) { return d.day; })).range([0, iW]).padding(0.35);
    var y = d3.scaleLinear().domain([0, maxV * 1.18]).range([iH, 0]);

    g.selectAll('rect').data(data).enter().append('rect')
      .attr('x', function (d) { return x(d.day); })
      .attr('y', function (d) { return y(d.v); })
      .attr('width', x.bandwidth())
      .attr('height', function (d) { return iH - y(d.v); })
      .attr('fill', function (d) { return d.v === maxV ? C.amber : C.blue; })
      .attr('rx', 3)
      .on('mouseover', function (ev, d) { showTT('<b>' + d.day + '</b><br>' + fmt(d.v) + ' interacciones', ev); })
      .on('mousemove', moveTT).on('mouseout', hideTT);

    g.selectAll('.vl').data(data).enter().append('text').attr('class', 'vl')
      .attr('x', function (d) { return x(d.day) + x.bandwidth() / 2; })
      .attr('y', function (d) { return y(d.v) - 7; })
      .attr('text-anchor', 'middle').attr('font-size', 13).attr('font-weight', 700).attr('fill', C.blue)
      .text(function (d) { return d.v ? fmt(d.v) : ''; });

    g.selectAll('.xl').data(data).enter().append('text').attr('class', 'xl')
      .attr('x', function (d) { return x(d.day) + x.bandwidth() / 2; })
      .attr('y', iH + 22)
      .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#777')
      .text(function (d) { return d.day; });
  }

  /* ── BARRAS SIMPLES (helper) ────────────────────────────── */
  function renderSimpleBars(elId, items, color) {
    var el = document.getElementById(elId);
    if (!items || !items.length) { el.innerHTML = '<p class="no-data">Sin datos aún</p>'; return; }
    var maxV = items[0].v || 1;
    el.innerHTML = items.map(function (it) {
      var pct = (it.v / maxV * 100).toFixed(1);
      return '<div class="simple-bar-row">' +
        '<div class="simple-bar-head">' +
          '<span class="simple-bar-label">' + it.label + '</span>' +
          '<span class="simple-bar-value">' + fmt(it.v) + '</span>' +
        '</div>' +
        '<div class="simple-bar-track">' +
          '<div class="simple-bar-fill" style="width:' + pct + '%;background:' + color + '"></div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── TEMAS ──────────────────────────────────────────────── */
  function renderTemas(lib) {
    var counts = countBy(lib.filter(function (r) { return r.tema; }), 'tema');
    var items  = Object.keys(counts).map(function (k) { return { label: k, v: counts[k] }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
    renderSimpleBars('temas-bars', items, C.blue);
  }

  /* ── ESTANTERÍAS ────────────────────────────────────────── */
  function renderEstanterias(lib) {
    var counts = countBy(lib.filter(function (r) { return r.numero_estanteria; }), 'numero_estanteria');
    var items  = Object.keys(counts).map(function (k) { return { label: 'Estantería ' + k, v: counts[k] }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
    renderSimpleBars('ests-bars', items, C.amber);
  }

  /* ── SERVICIOS LIBROS ───────────────────────────────────── */
  function renderServiciosLibros(svc) {
    var el = document.getElementById('svc-libros');
    if (!svc.length) { el.innerHTML = '<p class="no-data">Sin datos aún</p>'; return; }

    var byTipo = {};
    svc.forEach(function (r) {
      var t = String(r.tipo || '').toLowerCase();
      var name;
      if (/presta|borrow|loan/.test(t))   name = 'Préstamo';
      else if (/devol|return/.test(t)) name = 'Devolución';
      else name = r.tipo || 'Otro';
      if (!byTipo[name]) byTipo[name] = { L: 0, S: 0 };
      if (/llevame/i.test(r.eleccion || ''))    byTipo[name].L++;
      else if (/listo/i.test(r.eleccion || '')) byTipo[name].S++;
    });

    el.innerHTML = ['Préstamo', 'Devolución'].map(function (name) {
      var d     = byTipo[name] || { L: 0, S: 0 };
      var total = d.L + d.S;
      var pL    = total > 0 ? Math.round(d.L / total * 100) : 0;
      var pS    = total > 0 ? Math.round(d.S / total * 100) : 0;
      var idL   = 'svc-' + name + '-L';
      var idS   = 'svc-' + name + '-S';
      return '<div class="svc-card">' +
        '<div class="svc-head"><span class="svc-name">' + name + '</span><span class="svc-total">' + fmt(total) + '</span></div>' +
        '<div class="svc-stacked">' +
          '<div class="svc-seg" id="' + idL + '" style="width:' + pL + '%;background:' + C.blue + '">' + (d.L > 0 ? fmt(d.L) : '') + '</div>' +
          '<div class="svc-seg" id="' + idS + '" style="width:' + pS + '%;background:' + C.amber + '">' + (d.S > 0 ? fmt(d.S) : '') + '</div>' +
        '</div>' +
        '<div class="svc-footer"><span>Llévame ' + pL + '%</span><span>Listo ' + pS + '%</span></div>' +
      '</div>';
    }).join('');

    /* tooltip events */
    ['Préstamo', 'Devolución'].forEach(function (name) {
      var d   = byTipo[name] || { L: 0, S: 0 };
      var elL = document.getElementById('svc-' + name + '-L');
      var elS = document.getElementById('svc-' + name + '-S');
      if (elL) {
        elL.addEventListener('mouseover', function (e) { showTT('Llévame: ' + fmt(d.L), e); });
        elL.addEventListener('mousemove', moveTT); elL.addEventListener('mouseout', hideTT);
      }
      if (elS) {
        elS.addEventListener('mouseover', function (e) { showTT('Listo: ' + fmt(d.S), e); });
        elS.addEventListener('mousemove', moveTT); elS.addEventListener('mouseout', hideTT);
      }
    });
  }

  /* ── INFO TABS ──────────────────────────────────────────── */
  function renderInfoTabs(info) {
    var counts = countBy(info.filter(function (r) { return r.servicio; }), function (r) { return normKey(INFO_MAP, r.servicio); });
    var items  = Object.keys(counts).map(function (k) { return { label: k, v: counts[k] }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
    renderSimpleBars('info-bars', items, C.blue);
  }

  /* ── ACTIVIDADES ────────────────────────────────────────── */
  function renderActividades(evt) {
    var counts = countBy(evt.filter(function (r) { return r.actividad; }), function (r) { return normKey(ACT_MAP, r.actividad); });
    var items  = Object.keys(counts).map(function (k) { return { label: k, v: counts[k] }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
    renderSimpleBars('act-bars', items, C.amber);
  }

  /* ── COMENTARIOS ────────────────────────────────────────── */
  function renderComentarios(cal) {
    var el    = document.getElementById('comments-list');
    var items = cal.filter(function (r) { return r.comentarios && r.comentarios.trim(); })
      .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); })
      .slice(0, 5);
    if (!items.length) { el.innerHTML = '<p class="no-data">Aún no hay comentarios registrados.</p>'; return; }
    el.innerHTML = items.map(function (r) {
      var cat   = normSat(r.puntuacion);
      var emoji = SAT_EMOJIS[cat] || '😐';
      var bg    = SAT_CIRCLE_BG[cat] || '#C4BEB6';
      return '<div class="comment-item">' +
        '<span class="comment-emoji" style="background:' + bg + '">' + emoji + '</span>' +
        '<div class="comment-body">' +
          '<p class="comment-text">"' + r.comentarios.trim() + '"</p>' +
          '<span class="comment-time">' + relTime(r.created_at) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── CARGA PRINCIPAL ────────────────────────────────────── */
  function load() {
    var btn = document.getElementById('btn-refresh');
    btn.disabled = true;
    btn.textContent = '⟳ Cargando…';
    showSkeletons();

    Promise.all([
      sbGet('interacciones_generales', 'select=id,categoria,created_at'),
      sbGet('navegacion',              'select=id,id_general,destino,eleccion,created_at'),
      sbGet('buscar_libro',            'select=id,id_general,numero_estanteria,tema,eleccion,created_at'),
      sbGet('servicios_libros',        'select=id,tipo,eleccion'),
      sbGet('informacion',             'select=id,servicio'),
      sbGet('eventos',                 'select=id,actividad'),
      sbGet('calidad_servicio',        'select=id,puntuacion,comentarios,created_at&order=created_at.desc'),
    ]).then(function (results) {
      var ig  = results[0];
      var nav = results[1];
      var lib = results[2];
      var svc = results[3];
      var inf = results[4];
      var evt = results[5];
      var cal = results[6];

      /* sparkline series */
      var sesD = dailySeries(ig,  'created_at', 30);
      var navD = dailySeries(nav, 'created_at', 30);
      var libD = dailySeries(lib, 'created_at', 30);

      /* satisfaction daily: % positive per day */
      var satBase = dailySeries(cal, 'created_at', 30);
      var satCnts = {};
      cal.forEach(function (r) {
        var k = new Date(r.created_at).toISOString().slice(0, 10);
        if (!satCnts[k]) satCnts[k] = { tot: 0, pos: 0 };
        satCnts[k].tot++;
        if (['Excelente', 'Bueno'].indexOf(normSat(r.puntuacion)) > -1) satCnts[k].pos++;
      });
      var satD = satBase.map(function (d) {
        var c = satCnts[d.date];
        return { date: d.date, v: c && c.tot > 0 ? c.pos / c.tot * 100 : 0 };
      });

      /* render all */
      renderKPIs(sesD, navD, libD, satD, cal);
      renderUsoPorTipo(ig);
      renderEmbudo(ig, nav);
      renderSatisfaccion(cal);
      renderDestinos(nav);

      /* vertical bar needs the container to be in DOM first */
      requestAnimationFrame(function () { renderActividadDia(ig); });

      renderTemas(lib);
      renderEstanterias(lib);
      renderServiciosLibros(svc);
      renderInfoTabs(inf);
      renderActividades(evt);
      renderComentarios(cal);

      btn.disabled = false;
      btn.textContent = '↻ Actualizar datos';
    }).catch(function (err) {
      console.error('[dash] load error', err);
      btn.disabled = false;
      btn.textContent = '↻ Actualizar datos';
    });
  }

  /* ── INIT ───────────────────────────────────────────────── */
  window.addEventListener('load', function () {
    initSB();
    load();
    document.getElementById('btn-refresh').addEventListener('click', load);
  });

}());
