import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';
import { parseAuthHandoff, parseNativeCallback, POST_SIGNIN_RETURN_KEY, type HandoffTokens } from './authHandoff';

// Social sign-in only works on hosted origins: Lovable's OAuth proxy serves
// the /~oauth routes there, not inside the native app bundle. The native
// WebView hands off to the hosted sign-in bridge and receives the session
// tokens back through the URL hash (see authHandoff.ts).
export const HOSTED_ORIGIN = 'https://burnandshed.com';

export type SocialProvider = 'google' | 'apple';

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/** Send the native app WebView to the hosted sign-in bridge. */
export const startNativeSocialSignIn = async (provider: SocialProvider): Promise<void> => {
  await Browser.open({ url: `${HOSTED_ORIGIN}/auth/native?provider=${provider}` });
};

const restoreHandoffSession = async (tokens: HandoffTokens): Promise<boolean> => {
  localStorage.setItem(POST_SIGNIN_RETURN_KEY, '1');
  try {
    const { data, error } = await supabase.auth.setSession(tokens);
    if (!error && data.session) return true;
  } catch {
    // Invalid or expired return: leave the account signed out.
  }
  localStorage.removeItem(POST_SIGNIN_RETURN_KEY);
  return false;
};

/** Listen before rendering, including a return that cold-launches the app. */
export const initNativeAuthLinks = async (): Promise<void> => {
  if (!isNativeApp()) return;
  const complete = async (url: string) => {
    const tokens = parseNativeCallback(url);
    if (!tokens) return;
    const ok = await restoreHandoffSession(tokens);
    try { await Browser.close(); } catch { /* Already closed by iOS. */ }
    if (ok) window.location.replace('/');
  };
  await App.addListener('appUrlOpen', ({ url }) => { void complete(url); });
  const launch = await App.getLaunchUrl();
  if (launch?.url) await complete(launch.url);
};

/** Complete a social sign-in that ran on the hosted site: the app reloads at
 * its own origin with the tokens in the URL hash, sets the session, then
 * clears the URL so the normal signed-in routing takes over. */
export const handleAuthHandoff = async (): Promise<void> => {
  const tokens = parseAuthHandoff(window.location.hash);
  if (!tokens) return;
  await restoreHandoffSession(tokens);
  history.replaceState(null, '', window.location.pathname + window.location.search);
};
