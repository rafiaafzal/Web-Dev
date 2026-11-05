import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceRoleKey && process.env.NODE_ENV !== 'production') {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
}

export const adminClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || 'placeholder-service-key-for-build',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
