import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('LinkedIn OAuth session exchange error:', error.message);
  }

  // Return the user to an error page or home page
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`);
}
