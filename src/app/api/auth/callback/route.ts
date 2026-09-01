import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createServerSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session?.user) {
      const user = data.session.user;
      const metadata = user.user_metadata || {};
      const fullName =
        metadata.full_name ||
        metadata.name ||
        user.email?.split('@')[0] ||
        'Lion Athlete';
      const avatarUrl = metadata.avatar_url || metadata.picture || null;

      // Upsert profile in PostgreSQL database with Google name & picture
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, faculty, department, level, role')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (existingProfile) {
          // Update profile with latest Google name & avatar if not set
          await supabase
            .from('profiles')
            .update({
              email: user.email!,
              full_name: fullName,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('auth_user_id', user.id);
        } else {
          // Insert new profile
          await supabase.from('profiles').insert({
            auth_user_id: user.id,
            email: user.email!,
            full_name: fullName,
            avatar_url: avatarUrl,
            faculty: '',
            department: '',
            level: '100',
            role: 'member',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (dbErr) {
        console.error('Database profile sync error:', dbErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('OAuth session exchange error:', error?.message);
  }

  // If no server code is present, redirect to client-side callback to extract hash fragment (#access_token=...)
  return NextResponse.redirect(`${origin}/auth/callback`);
}
