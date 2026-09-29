import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(window.location.hash.includes('type=recovery'));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(e => { if (e === 'PASSWORD_RECOVERY') setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success('Password updated');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4 shadow-soft">
        <h1 className="text-xl font-semibold text-foreground">Set a new password</h1>
        {!ready && <p className="text-sm text-muted-foreground">Open this page from the reset link in your email.</p>}
        <Input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" maxLength={72} required />
        <Button type="submit" disabled={busy || !ready} className="w-full">Update password</Button>
      </form>
    </div>
  );
};

export default ResetPassword;
