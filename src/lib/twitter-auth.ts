/**
 * Twitter/X OAuth 2.0 PKCE Authentication Library
 *
 * Handles the full OAuth flow:
 * - Authorization URL generation with PKCE
 * - Code exchange for tokens
 * - Token refresh
 * - Posting tweets & liking tweets on behalf of the user
 */

import crypto from "crypto";

// ─── Config ──────────────────────────────────────────────────
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;

const TWITTER_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const TWITTER_USERS_ME_URL = "https://api.twitter.com/2/users/me";
const TWITTER_TWEETS_URL = "https://api.twitter.com/2/tweets";

// OAuth 2.0 scopes — tweet.write and like.write for auto-posting
const SCOPES = [
  "tweet.read",
  "tweet.write",
  "like.write",
  "users.read",
  "offline.access",
].join(" ");

// ─── PKCE Helpers ────────────────────────────────────────────

/**
 * Generate a cryptographically random code verifier (43-128 chars)
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generate a code challenge from the verifier using S256
 */
export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

// ─── Authorization ───────────────────────────────────────────

/**
 * Build the Twitter OAuth 2.0 authorization URL
 */
export function getAuthorizationUrl(
  redirectUri: string,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${TWITTER_AUTH_URL}?${params.toString()}`;
}

// ─── Token Exchange ──────────────────────────────────────────

export interface TwitterTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Exchange authorization code for access + refresh tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TwitterTokens> {
  const basicAuth = Buffer.from(
    `${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token exchange failed:", errorText);
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<TwitterTokens> {
  const basicAuth = Buffer.from(
    `${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token refresh failed:", errorText);
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}

// ─── User Profile ────────────────────────────────────────────

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

/**
 * Fetch the authenticated user's profile
 */
export async function getAuthenticatedUser(
  accessToken: string
): Promise<TwitterUser> {
  const response = await fetch(
    `${TWITTER_USERS_ME_URL}?user.fields=profile_image_url`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

// ─── Tweet Actions ───────────────────────────────────────────

export interface PostTweetResult {
  id: string;
  text: string;
}

/**
 * Post a tweet on behalf of the authenticated user
 */
export async function postTweet(
  accessToken: string,
  text: string
): Promise<PostTweetResult> {
  const response = await fetch(TWITTER_TWEETS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Tweet post failed:", errorText);
    throw new Error(`Failed to post tweet: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Like a tweet on behalf of the authenticated user
 */
export async function likeTweet(
  accessToken: string,
  userId: string,
  tweetId: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}/likes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tweet_id: tweetId }),
    }
  );

  if (!response.ok) {
    console.error("Like failed:", await response.text());
    return false;
  }

  return true;
}

// ─── Token Management ────────────────────────────────────────

/**
 * Get a valid access token for a user, refreshing if expired
 */
export async function getValidAccessToken(user: {
  x_access_token: string;
  x_refresh_token: string;
  token_expires_at: string;
}): Promise<{ accessToken: string; refreshed: boolean; newTokens?: TwitterTokens }> {
  const expiresAt = new Date(user.token_expires_at);
  const now = new Date();

  // Refresh if token expires within 5 minutes
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const newTokens = await refreshAccessToken(user.x_refresh_token);
    return {
      accessToken: newTokens.access_token,
      refreshed: true,
      newTokens,
    };
  }

  return {
    accessToken: user.x_access_token,
    refreshed: false,
  };
}
