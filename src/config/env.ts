function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.local.example to .env.local and set it.`,
    );
  }

  return value;
}

export const env = {
  // Static process.env.NEXT_PUBLIC_* access is required for Next.js inlining.
  apiUrl: requirePublicEnv(
    "NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_API_URL,
  ),
  /** Public Google OAuth Web client ID only — never a client secret */
  googleClientId: requirePublicEnv(
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  ),
} as const;
