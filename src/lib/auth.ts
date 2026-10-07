import { createClient } from '@/lib/supabase/server';

export function getAuthContext() {
  const supabase = createClient();
  return supabase.auth.getUser().then(async ({ data: { user }, error }) => {
    if (error || !user) return { supabase, user: null, profile: null };
    const { data: profile } = await supabase.from('profiles')
      .select('id,name,email,avatar,role,active_mode,seller_status,created_at')
      .eq('id', user.id).single();
    return { supabase, user, profile };
  });
}
