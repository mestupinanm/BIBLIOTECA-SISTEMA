import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pzfbafvkaxpvmdnrvoee.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZmJhZnZrYXhwdm1kbnJ2b2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjEyODYsImV4cCI6MjA5MTI5NzI4Nn0.gX4dX7bKD8p_V5y1TktKEU_LVGmMHmwQdJfWf5VAPjE';

export const supabase =
  typeof window !== 'undefined' && SUPABASE_URL && !SUPABASE_URL.includes('YOUR')
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
