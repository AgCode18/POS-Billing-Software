'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ErrorText } from '@/components/ui';

export default function Login() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const home = (u) => (u.role === 'SUPER_ADMIN' ? '/super' : '/dashboard');
  useEffect(() => { if (!loading && user) router.replace(home(user)); }, [user, loading, router]);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { router.replace(home(await login(email, password))); }
    catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-black text-white flex items-center justify-center"><Store size={22} /></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Billing</h1>
            <p className="text-xs text-gray-500">POS System</p>
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@shop.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <ErrorText>{err}</ErrorText>
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
