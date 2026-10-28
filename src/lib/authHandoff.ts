// Pure helpers for the native social sign-in handoff. No imports, so it stays
// testable in isolation.

/** Hash parameter names that carry session tokens back into the app. */
export const HANDOFF_ACCESS_PARAM = 'bs_at';
export const HANDOFF_REFRESH_PARAM = 'bs_rt';

export interface HandoffTokens {
  access_token: string;
  refresh_token: string;
}

/** Parse `#a=1&b=2` style URL hash params without URLSearchParams, which
 * decodes "+" as a space and could corrupt tokens. */
export const parseHashParams = (hash: string): Record<string, string> => {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const pair of raw.split('&')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const key = pair.slice(0, eq);
    try {
      out[key] = decodeURIComponent(pair.slice(eq + 1));
    } catch {
      out[key] = pair.slice(eq + 1);
    }
  }
  return out;
};

/** Read handoff tokens from a URL hash, or null when none are present. */
export const parseAuthHandoff = (hash: string): HandoffTokens | null => {
  const params = parseHashParams(hash);
  const access_token = params[HANDOFF_ACCESS_PARAM];
  const refresh_token = params[HANDOFF_REFRESH_PARAM];
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
};

/** Origin the native app WebView loads its bundle from, per platform.
 * Empty string on plain web browsers, which must not be redirected there. */
export const appOriginForUserAgent = (userAgent: string): string => {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'capacitor://localhost/';
  if (/Android/i.test(userAgent)) return 'https://localhost/';
  return '';
};

/** URL that returns a hosted sign-in result into the native app shell, or
 * null on platforms where no app origin exists. */
export const buildHandoffUrl = (userAgent: string, tokens: HandoffTokens): string | null => {
  const origin = appOriginForUserAgent(userAgent);
  if (!origin) return null;
  const hash = `${HANDOFF_ACCESS_PARAM}=${encodeURIComponent(tokens.access_token)}&${HANDOFF_REFRESH_PARAM}=${encodeURIComponent(tokens.refresh_token)}`;
  return `${origin}#${hash}`;
};
