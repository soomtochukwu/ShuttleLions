import { NextResponse } from "next/server";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  getAuthorizationUrl,
} from "@/lib/twitter-auth";
import { cookies } from "next/headers";

/**
 * GET /api/auth/twitter
 * Initiates the Twitter OAuth 2.0 PKCE flow.
 * Generates verifier/state, stores them in cookies, and redirects to Twitter.
 */
export async function GET() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Determine redirect URI based on environment
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  // Remove trailing slash if present
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const redirectUri = `${baseUrl}/api/auth/twitter/callback`;

  // Build the authorization URL
  const authUrl = getAuthorizationUrl(redirectUri, state, codeChallenge);

  // Store PKCE verifier and state in httpOnly cookies
  const cookieStore = await cookies();
  cookieStore.set("twitter_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });
  cookieStore.set("twitter_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(authUrl);
}
