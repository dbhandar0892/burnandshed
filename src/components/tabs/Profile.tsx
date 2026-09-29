import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, FileText, LifeBuoy, LogOut, RotateCcw, Shield, Trash2, UserRound } from 'lucide-react';
import { navigate } from '@/lib/nav';

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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ''));
  }, [user]);

  const signIn = async () => {
    const result = await lovable.auth.signInWithOAuth('apple', { redirect_uri: window.location.origin });
    if (result.error) toast.error('Sign in failed. Please try again.');
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
            <p className="text-sm text-muted-foreground">{user.email ?? 'Signed in with Apple'}</p>
            <div className="flex gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={60} />
              <Button onClick={saveName}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Your profile</h2>
            <p className="text-sm text-muted-foreground">Sign in to keep your subscription with you across devices.</p>
            <Button onClick={signIn} className="w-full"> Sign in with Apple</Button>
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
