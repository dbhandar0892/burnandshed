import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, FileText, LifeBuoy, LogOut, RotateCcw, Shield, Trash2, UserRound } from 'lucide-react';
import { navigate } from '@/lib/nav';
import { startTrial, TRIAL_LENGTH_DAYS } from '@/lib/premium';
import { PENDING_TRIAL_KEY } from '@/components/tabs/PremiumScreen';

export const completePendingTrial = () => {
  if (localStorage.getItem(PENDING_TRIAL_KEY) !== '1') return;
  localStorage.removeItem(PENDING_TRIAL_KEY);
  startTrial();
  toast.success(`${TRIAL_LENGTH_DAYS}-day free trial started`);
  navigate('ritual');
};

const Row = ({ icon: Icon, label, onClick, danger }: { icon: typeof Shield; label: string; onClick: () => void; danger?: boolean }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/60 transition-colors ${danger ? 'text-destructive' : 'text-foreground'}`}>
    <Icon size={18} />
    <span className="flex-1 text-sm font-medium">{label}</span>
    <ChevronRight size={16} className="text-muted-foreground" />
  </button>
);

export const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Navigate to Rituals right after an actual sign-in (Apple, Google or
      // email). INITIAL_SESSION (returning to the page already signed in)
      // intentionally does not navigate, so profile actions stay reachable.
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          if (localStorage.getItem(PENDING_TRIAL_KEY) === '1') {
            completePendingTrial();
          } else {
            toast.success('Signed in');
            navigate('ritual');
          }
        }, 0);
      }
    });
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); if (data.user) completePendingTrial(); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ''));
  }, [user]);

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const signIn = async (provider: 'apple' | 'google') => {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) toast.error('Sign in failed. Please try again.');
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(em)) return toast.error('Please enter a valid email');
    setBusy(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success('Check your email for a reset link');
        setMode('signin');
      } else if (mode === 'signup') {
        if (password.length < 8) throw new Error('Password must be at least 8 characters');
        const { error } = await supabase.auth.signUp({ email: em, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success('Check your email to confirm your account');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: em, password });
        if (error && (error as { code?: string }).code === 'email_not_confirmed') {
          await supabase.auth.resend({ type: 'signup', email: em, options: { emailRedirectTo: window.location.origin } });
          toast('Please confirm your email first', { description: `We just sent a new confirmation link to ${em}. Tap it, then sign in. Check your spam folder too.`, duration: 8000 });
          return;
        }
        if (error) throw error;
        toast.success('Signed in');
      }
      setPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setBusy(false); }
  };

  const saveName = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: name.trim().slice(0, 60), email: user.email });
    error ? toast.error('Could not save name') : toast.success('Name saved');
  };

  const signOut = async () => { await supabase.auth.signOut(); toast.success('Signed out'); };

  const deleteAccount = async () => {
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) return toast.error('Could not delete account. Please contact support.');
    await supabase.auth.signOut();
    setConfirmDelete(false);
    toast.success('Your account has been deleted');
  };

  const restore = () => toast('Restore purchases will be available once App Store subscriptions are live.');

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <button onClick={() => navigate('burn')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-card rounded-2xl border border-border p-5 shadow-soft text-center space-y-3">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center text-primary">
          <UserRound size={30} />
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : user ? (
          <>
            <p className="text-sm text-muted-foreground">{user.email ?? 'Signed in'}</p>
            <div className="flex gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={60} />
              <Button onClick={saveName}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Your profile</h2>
            <p className="text-sm text-muted-foreground">Create an account to keep your subscription with you across devices.</p>
            <Button onClick={() => signIn('apple')} className="w-full"> Sign in with Apple</Button>
            <Button onClick={() => signIn('google')} variant="outline" className="w-full">Continue with Google</Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="flex-1 h-px bg-border" />or<span className="flex-1 h-px bg-border" /></div>
            <form onSubmit={submitEmail} className="space-y-2 text-left">
              <Input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" maxLength={255} required />
              {mode !== 'forgot' && (
                <Input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" maxLength={72} required />
              )}
              <Button type="submit" disabled={busy} className="w-full">
                {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
              </Button>
            </form>
            <div className="flex justify-between text-xs">
              {mode === 'signup' ? (
                <>
                  <button className="text-primary" onClick={() => setMode('signin')}>Sign in</button>
                  <button className="text-muted-foreground" onClick={() => setMode('forgot')}>Forgot password?</button>
                </>
              ) : mode === 'signin' ? (
                <>
                  <button className="text-primary" onClick={() => setMode('signup')}>Create account</button>
                  <button className="text-muted-foreground" onClick={() => setMode('forgot')}>Forgot password?</button>
                </>
              ) : (
                <button className="text-primary" onClick={() => setMode('signin')}>Back to sign in</button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-soft divide-y divide-border overflow-hidden">
        <Row icon={RotateCcw} label="Restore purchases" onClick={restore} />
        <Row icon={Shield} label="Privacy Policy" onClick={() => window.open('/privacy', '_blank')} />
        <Row icon={FileText} label="Terms of Use" onClick={() => window.open('/terms', '_blank')} />
        <Row icon={LifeBuoy} label="Contact support" onClick={() => (window.location.href = 'mailto:support@burnandshed.com')} />
      </div>

      {user && (
        <div className="bg-card rounded-2xl border border-border shadow-soft divide-y divide-border overflow-hidden">
          <Row icon={LogOut} label="Sign out" onClick={signOut} />
          <Row icon={Trash2} label="Delete account" onClick={() => setConfirmDelete(true)} danger />
        </div>
      )}

      {confirmDelete && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 space-y-3">
          <p className="text-sm">This permanently deletes your account and profile. Subscriptions must be cancelled separately in your Apple ID settings.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={deleteAccount}>Delete forever</Button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">Burn & Shed · © 2026</p>
    </div>
  );
};
