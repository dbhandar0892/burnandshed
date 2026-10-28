import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
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
      });
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
  const [state, setState] = useState<'wait' | 'signed' | 'error'>('wait');

  useEffect(() => {
    let alive = true;

    // The OAuth return carries the session in the URL. Feed it to Supabase in
    // case automatic detection has not consumed it yet.
    const params = parseHashParams(window.location.hash);
    if (params.access_token && params.refresh_token) {
      void supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const started = Date.now();
    const poll = async () => {
      if (!alive) return;
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session) {
        alive = false;
        const target = buildHandoffUrl(navigator.userAgent, {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        if (!target) {
          // Plain web browser: nothing to hand back to.
          setState('signed');
          return;
        }
        window.location.href = target;
        return;
      }
      if (Date.now() - started > 15000) {
        setState('error');
        return;
      }
      setTimeout(poll, 400);
    };
    void poll();

    return () => {
      alive = false;
    };
  }, []);

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
