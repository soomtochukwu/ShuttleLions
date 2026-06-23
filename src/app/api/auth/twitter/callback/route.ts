import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  getAuthenticatedUser,
} from "@/lib/twitter-auth";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

/**
 * GET /api/auth/twitter/callback
 * Handles the OAuth callback from Twitter.
 * Exchanges the code for tokens, fetches user profile,
 * upserts the user in DB, and sets a session cookie.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle user denying access
    if (error) {
      console.error("Twitter OAuth error:", error);
      return NextResponse.redirect(`${baseUrl}/?auth_error=denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=missing_params`);
    }

    // Retrieve PKCE verifier and state from cookies
    const cookieStore = await cookies();
    const storedState = cookieStore.get("twitter_oauth_state")?.value;
    const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

    // Validate state for CSRF protection
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=invalid_state`);
    }

    if (!codeVerifier) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=missing_verifier`);
    }

    // Exchange code for tokens
    const redirectUri = `${baseUrl}/api/auth/twitter/callback`;

    const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);

    // Fetch user profile
    const twitterUser = await getAuthenticatedUser(tokens.access_token);

    // Calculate token expiration
    const tokenExpiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    // Upsert user in database
    const { data: user, error: dbError } = await supabase
      .from("users")
      .upsert(
        {
          x_user_id: twitterUser.id,
          x_handle: twitterUser.username,
          x_name: twitterUser.name,
          x_avatar_url: twitterUser.profile_image_url || null,
          x_access_token: tokens.access_token,
          x_refresh_token: tokens.refresh_token,
          token_expires_at: tokenExpiresAt,
        },
        { onConflict: "x_user_id" },
      )
      .select("id")
      .single();

    if (dbError) {
      console.error("DB upsert error:", dbError);
      return NextResponse.redirect(`${baseUrl}/?auth_error=db_error`);
    }

    // Set session cookie with user ID and redirect to home
    const response = NextResponse.redirect(baseUrl);

    response.cookies.set("rizz_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Clean up OAuth cookies
    response.cookies.delete("twitter_code_verifier");
    response.cookies.delete("twitter_oauth_state");

    return response;
  } catch (err) {
    console.error("Twitter callback error:", err);
    return NextResponse.redirect(`${baseUrl}/?auth_error=callback_failed`);
  }
}
