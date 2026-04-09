/* ============================================
   ANALYTICS - Interaction Logging
   Writes to Firebase Firestore when available,
   falls back to localStorage.
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  PepperLib.Analytics = {
    buffer: [],
    STORAGE_KEY: 'pepper_analytics',
    COLLECTION:  'kiosk_events',

    log: function (eventType, data) {
      var entry = {
        timestamp: new Date().toISOString(),
        session:   PepperLib.State && PepperLib.State.session ? PepperLib.State.session.id : null,
        type:      eventType,
        data:      data || {},
        language:  PepperLib.State ? PepperLib.State.language : 'es',
        kiosk:     'biblioteca-scien-ing'
      };
      this.buffer.push(entry);

      // Write immediately to Firestore if available
      this._writeToFirestore(entry);
    },

    _writeToFirestore: function (entry) {
      try {
        if (PepperLib.FirebaseDB) {
          PepperLib.FirebaseDB
            .collection(this.COLLECTION)
            .add(entry)
            .catch(function () {
              // Silently ignore — will remain in buffer for localStorage flush
            });
        }
      } catch (e) {
        // Firestore unavailable
      }
    },

    flush: function () {
      if (this.buffer.length === 0) return;

      // Always flush to localStorage as persistent local backup
      try {
        var existing = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        existing = existing.concat(this.buffer);
        // Keep only last 500 events in localStorage to avoid overflow
        if (existing.length > 500) existing = existing.slice(existing.length - 500);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
      } catch (e) {
        // localStorage may be unavailable on Pepper
      }

      this.buffer = [];
    },

    getAll: function () {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },

    getSummary: function () {
      var events = this.getAll();
      var summary = {
        totalSessions: 0,
        totalEvents:   events.length,
        destinationCounts: {},
        serviceCounts:     {},
        feedbackCounts:    { bad: 0, ok: 0, great: 0 },
        languageCounts:    { es: 0, en: 0 },
        hourlyDistribution: {}
      };

      var sessionIds = {};
      for (var i = 0; i < events.length; i++) {
        var ev = events[i];

        if (ev.session && !sessionIds[ev.session]) {
          sessionIds[ev.session] = true;
          summary.totalSessions++;
        }
        if (ev.type === 'destination_request' && ev.data && ev.data.destination) {
          var dest = ev.data.destination;
          summary.destinationCounts[dest] = (summary.destinationCounts[dest] || 0) + 1;
        }
        if (ev.type === 'screen_view' && ev.data && ev.data.screen) {
          var sc = ev.data.screen;
          summary.serviceCounts[sc] = (summary.serviceCounts[sc] || 0) + 1;
        }
        if (ev.type === 'feedback' && ev.data && ev.data.rating) {
          var r = ev.data.rating;
          if (summary.feedbackCounts.hasOwnProperty(r)) summary.feedbackCounts[r]++;
        }
        if (ev.language && summary.languageCounts.hasOwnProperty(ev.language)) {
          summary.languageCounts[ev.language]++;
        }
        if (ev.timestamp) {
          var hr = new Date(ev.timestamp).getHours();
          summary.hourlyDistribution[hr] = (summary.hourlyDistribution[hr] || 0) + 1;
        }
      }
      return summary;
    },

    clear: function () {
      try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) {}
      this.buffer = [];
    }
  };
})();
