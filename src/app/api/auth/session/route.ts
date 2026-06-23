import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

/**
 * GET /api/auth/session
 * Returns the current authenticated user's profile from the session cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("rizz_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    // Fetch user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, x_user_id, x_handle, x_name, x_avatar_url")
      .eq("id", sessionId)
      .single();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

/**
 * DELETE /api/auth/session
 * Logs out the user by clearing the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("rizz_session");
  return response;
}
