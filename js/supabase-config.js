/* ============================================
   SUPABASE CONFIGURATION
   ============================================
   SETUP INSTRUCTIONS (one-time, in Supabase dashboard):

   1. Go to https://supabase.com → New project → "biblioteca-tesis"
   2. SQL Editor → run the SQL below once:

      CREATE TABLE usage_counters (
        category     TEXT        NOT NULL,
        item         TEXT        NOT NULL,
        count        INTEGER     NOT NULL DEFAULT 0,
        last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (category, item)
      );

      ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "anon_read"   ON usage_counters FOR SELECT USING (true);
      CREATE POLICY "anon_insert" ON usage_counters FOR INSERT WITH CHECK (true);
      CREATE POLICY "anon_update" ON usage_counters FOR UPDATE USING (true);

      CREATE OR REPLACE FUNCTION increment_counter(p_category TEXT, p_item TEXT)
      RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
        INSERT INTO usage_counters (category, item, count, last_updated)
        VALUES (p_category, p_item, 1, NOW())
        ON CONFLICT (category, item)
        DO UPDATE SET count = usage_counters.count + 1, last_updated = NOW();
      $$;

   3. Settings → API → copy Project URL and anon public key into the variables below.
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var SUPABASE_URL  = 'https://pzfbafvkaxpvmdnrvoee.supabase.co';
  var SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZmJhZnZrYXhwdm1kbnJ2b2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjEyODYsImV4cCI6MjA5MTI5NzI4Nn0.gX4dX7bKD8p_V5y1TktKEU_LVGmMHmwQdJfWf5VAPjE';

  try {
    if (
      typeof supabase !== 'undefined' &&
      SUPABASE_URL.indexOf('YOUR') === -1
    ) {
      PepperLib.SupabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) {
    console.warn('Supabase init failed:', e);
  }
})();
