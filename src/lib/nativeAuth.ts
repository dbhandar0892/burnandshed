import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { parseAuthHandoff, POST_SIGNIN_RETURN_KEY } from './authHandoff';

// Social sign-in only works on hosted origins: Lovable's OAuth proxy serves
// the /~oauth routes there, not inside the native app bundle. The native
// WebView hands off to the hosted sign-in bridge and receives the session
// tokens back through the URL hash (see authHandoff.ts).
export const HOSTED_ORIGIN = 'https://burnandshed.com';

export type SocialProvider = 'google' | 'apple';

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/** Send the native app WebView to the hosted sign-in bridge. */
export const startNativeSocialSignIn = (provider: SocialProvider): void => {
  window.location.href = `${HOSTED_ORIGIN}/auth/native?provider=${provider}`;
};

/** Complete a social sign-in that ran on the hosted site: the app reloads at
 * its own origin with the tokens in the URL hash, sets the session, then
 * clears the URL so the normal signed-in routing takes over. */
export const handleAuthHandoff = async (): Promise<void> => {
  const tokens = parseAuthHandoff(window.location.hash);
  if (!tokens) return;
  let ok = false;
  try {
    await supabase.auth.setSession(tokens);
    ok = true;
  } catch {
    // Expired or invalid handoff: stay signed out; the user can sign in again.
  }
  history.replaceState(null, '', window.location.pathname + window.location.search);
  if (ok) localStorage.setItem(POST_SIGNIN_RETURN_KEY, '1');
};
