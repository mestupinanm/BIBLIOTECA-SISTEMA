/* ============================================
   ANALYTICS - Interaction Logging
   Writes counters to Supabase (usage_counters table).
   Falls back to localStorage when offline.
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  PepperLib.Analytics = {
    buffer: [],
    STORAGE_KEY: 'pepper_analytics',

    /* ----------------------------------------------------------
       count(category, item)
       Atomically increments a counter in Supabase.
       Primary analytics entry point for all screens.
    ---------------------------------------------------------- */
    count: function (category, item) {
      // Local fallback entry
      this.buffer.push({
        timestamp: new Date().toISOString(),
        session:   PepperLib.State && PepperLib.State.session ? PepperLib.State.session.id : null,
        type:      'counter',
        category:  category,
        item:      item,
        language:  PepperLib.State ? PepperLib.State.language : 'es'
      });

      // Supabase increment (atomic, avoids race conditions)
      try {
        if (PepperLib.SupabaseClient) {
          PepperLib.SupabaseClient
            .rpc('increment_counter', { p_category: category, p_item: item })
            .then(function (result) {
              if (result.error) {
                console.warn('Supabase counter error:', result.error.message);
              }
            });
        }
      } catch (e) {
        // Supabase unavailable — counter stays in local buffer
      }
    },

    /* ----------------------------------------------------------
       log(eventType, data)
       Kept for backwards compatibility with existing screen code.
       Maps well-known event types to counter calls automatically.
    ---------------------------------------------------------- */
    log: function (eventType, data) {
      data = data || {};

      // Map legacy events to Supabase counters
      if (eventType === 'book_service' && data.action) {
        this.count('books', data.action);
      } else if (eventType === 'destination_request' && data.destination) {
        this.count('navigation', data.destination);
      } else if (eventType === 'shelf_selected' && data.shelf) {
        this.count('shelves', 'shelf_' + data.shelf);
      } else if (eventType === 'info_tab' && data.tab) {
        this.count('info', 'tab_' + data.tab);
      } else if (eventType === 'faq_opened' && (data.index !== undefined)) {
        this.count('info_faq', 'faq_' + data.index);
      } else if (eventType === 'feedback' && data.rating) {
        this.count('feedback', data.rating);
      } else if (eventType === 'trivia_completed' && data.activity) {
        this.count('events', 'trivia_completed');
      }

      // Also store raw event locally for session summary
      this.buffer.push({
        timestamp: new Date().toISOString(),
        session:   PepperLib.State && PepperLib.State.session ? PepperLib.State.session.id : null,
        type:      eventType,
        data:      data,
        language:  PepperLib.State ? PepperLib.State.language : 'es'
      });
    },

    /* ----------------------------------------------------------
       insertFeedback(rating)
       Inserts one row into session_feedback in Supabase so each
       session's rating can be associated with the last action
       (e.g. "great" after navigating to Sala 254).
    ---------------------------------------------------------- */
    insertFeedback: function (rating) {
      var row = {
        session_id:   PepperLib.State && PepperLib.State.session ? PepperLib.State.session.id : null,
        rating:       rating,
        action_label: PepperLib.LastAction       || null,
        action_item:  PepperLib.LastActionItem   || null,
        action_cat:   PepperLib.LastActionCategory || null,
        language:     PepperLib.State ? PepperLib.State.language : 'es'
      };
      try {
        if (PepperLib.SupabaseClient) {
          PepperLib.SupabaseClient
            .from('session_feedback')
            .insert(row)
            .then(function (result) {
              if (result.error) {
                console.warn('Supabase feedback insert error:', result.error.message);
              }
            });
        }
      } catch (e) {
        // Supabase unavailable — still stored in local buffer via log()
      }
    },

    /* ----------------------------------------------------------
       flush — persist buffer to localStorage
    ---------------------------------------------------------- */
    flush: function () {
      if (this.buffer.length === 0) return;
      try {
        var existing = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        existing = existing.concat(this.buffer);
        if (existing.length > 500) existing = existing.slice(existing.length - 500);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
      } catch (e) {}
      this.buffer = [];
    },

    getAll: function () {
      try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]'); } catch (e) { return []; }
    },

    clear: function () {
      try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) {}
      this.buffer = [];
    }
  };
})();
