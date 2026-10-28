import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  appOriginForUserAgent,
  buildHandoffUrl,
  parseHashParams,
} from '@/lib/authHandoff';

// Hosted bridge for social sign-in in the native app. The native WebView
// cannot run the /~oauth flow itself, so it opens /auth/native here, the
// managed OAuth completes on the hosted origin, and /auth/native-bridge
// returns the session tokens to the app via its own origin URL.

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-3 p-6 text-center">
    {children}
  </div>
);

export const NativeAuthStart = () => {
  const [params] = useSearchParams();
  const provider: 'google' | 'apple' = params.get('provider') === 'apple' ? 'apple' : 'google';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    lovable.auth
      .signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth/native-bridge` })
      .then(result => {
        if (alive && result.error) setFailed(true);
      }).catch(() => { if (alive) setFailed(true); });
    return () => {
      alive = false;
    };
  }, [provider]);

  if (failed) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Sign in could not start. Please try again from the app.</p>
        <Link to="/" className="text-sm underline">Back to Burn & Shed</Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm text-muted-foreground">Connecting to {provider === 'apple' ? 'Apple' : 'Google'}…</p>
    </Shell>
  );
};

export const NativeAuthBridge = () => {
  const [state, setState] = useState<'wait' | 'signed' | 'error' | 'return'>('wait');
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    // Independent deadline: a stalled session request must not spin forever.
    const deadline = setTimeout(() => { if (alive) setState('error'); }, 15000);
    const finish = (tokens: { access_token: string; refresh_token: string }) => {
      if (!alive) return;
      clearTimeout(deadline);
      const target = buildHandoffUrl(navigator.userAgent, tokens);
      history.replaceState(null, '', window.location.pathname + window.location.search);
      if (!target) { setState('signed'); return; }
      setReturnUrl(target);
      setState('return');
      // Safari needs a registered custom scheme, not capacitor://localhost.
      window.location.href = target;
    };
    const params = parseHashParams(window.location.hash);
    const poll = async () => {
      if (!alive) return;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!alive) return;
        if (error) { clearTimeout(deadline); setState('error'); return; }
        if (data.session) { finish(data.session); return; }
        pollTimer = setTimeout(() => { void poll(); }, 400);
      } catch {
        if (alive) { clearTimeout(deadline); setState('error'); }
      }
    };
    // Pass fresh OAuth tokens directly back; the app validates and persists
    // them. Waiting for Safari's own session hydration can deadlock here.
    if (params.access_token && params.refresh_token) {
      finish({ access_token: params.access_token, refresh_token: params.refresh_token });
    } else { void poll(); }

    return () => {
      alive = false;
      clearTimeout(deadline);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  if (state === 'return' && returnUrl) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Your sign-in is ready.</p>
        <Button asChild><a href={returnUrl} rel="noreferrer">Return to Burn &amp; Shed</a></Button>
      </Shell>
    );
  }

  if (state === 'signed') {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Signed in. You can return to the app.</p>
      </Shell>
    );
  }

  if (state === 'error') {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Sign in took too long. Please try again from the app.</p>
        <Link to="/" className="text-sm underline">Back to Burn & Shed</Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm text-muted-foreground">Finishing sign in…</p>
    </Shell>
  );
};
