# Building an Auth System with Next.js + Supabase + Fitbit OAuth

## Introduction

One of the first critical features I tackled in building UCFitness was **user authentication**. To let users log in with their Fitbit accounts and access wearable device data, I needed to implement a proper OAuth 2.0 authorization flow.

In this article, I'll walk through how I combined **Next.js (App Router)** and **Supabase Auth** to implement Fitbit OAuth authentication, along with the lessons learned along the way.

## The Authentication Flow

UCFitness uses the following authentication sequence:

1. User clicks the "Sign in with Fitbit" button
2. Redirect to Fitbit's authorization page (OAuth 2.0 Authorization Code Grant)
3. User grants permission on their Fitbit account
4. Fitbit redirects back with an authorization code
5. Server-side exchange of the auth code for access and refresh tokens
6. User profile stored in Supabase Auth
7. Session established and user redirected to the app

## Why Supabase Auth?

Supabase Auth integrates tightly with **Row Level Security (RLS)**, enabling declarative database access control based on authentication state. This means:

- Policies that restrict users to their own data can be defined concisely
- Server-side auth checks are minimized
- JWT token management is delegated to Supabase

### Implementing a Custom OAuth Provider

Since Supabase doesn't have a built-in Fitbit provider, I built a **custom OAuth flow** using Next.js API Routes:

1. **Auth endpoint** (`/api/auth/fitbit`): Generates the Fitbit authorization URL with proper scopes and PKCE challenge
2. **Callback handler** (`/api/auth/callback`): Exchanges the authorization code for tokens and creates the Supabase session
3. **Token storage**: Access and refresh tokens stored encrypted in Supabase `user_metadata`

## Implementation Challenges

### PKCE (Proof Key for Code Exchange)

The Fitbit API supports **PKCE**, an OAuth 2.0 security extension that prevents authorization code interception. Implementation requires:

- Generating a `code_verifier` and `code_challenge` during the auth request
- Sending the `code_verifier` during the token exchange for verification

I used HTTPOnly cookies to securely persist the `code_verifier` across the redirect, ensuring it couldn't be accessed by client-side JavaScript.

### Automatic Token Refresh

Fitbit access tokens expire after **8 hours**. Requiring users to re-authenticate constantly isn't practical, so I implemented automatic refresh using the **refresh token**.

Next.js Middleware checks token validity before every API request. If the token is expired, it transparently refreshes it using the stored refresh token, updates Supabase, and continues the request — all invisible to the user.

### Scope Management

The Fitbit API requires specifying **scopes** for each data type. UCFitness requests:

- `activity` — Step counts, calories burned
- `heartrate` — Heart rate data
- `profile` — User profile information
- `sleep` — Sleep data (reserved for future features)

By requesting only the minimum necessary scopes, we reduce the permission footprint and build user trust.

## Security Considerations

Security was the top priority throughout the auth implementation:

- **Environment variables**: All secrets (Client ID, Client Secret) managed via environment variables, never hardcoded
- **CSRF protection**: The `state` parameter prevents cross-site request forgery attacks
- **Token encryption**: Tokens stored encrypted in the database
- **HTTPS enforcement**: All authentication traffic runs over HTTPS

## Conclusion

The combination of Next.js + Supabase + Fitbit OAuth provides a robust authentication foundation for personal projects. Supabase Auth's RLS integration is particularly powerful, consolidating authorization logic at the database layer and keeping application code clean.

That said, building a custom OAuth provider demands deep understanding of security concepts like PKCE and token lifecycle management. I strongly recommend thorough testing and careful review of the official documentation before shipping to production.
