const DEFAULT_AUTH_NEXT = "/dashboard";

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function getAuthRedirectTo(next = DEFAULT_AUTH_NEXT) {
  const configuredOrigin = process.env.NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN;
  const origin =
    configuredOrigin && configuredOrigin.length > 0
      ? trimTrailingSlash(configuredOrigin)
      : window.location.origin;

  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
