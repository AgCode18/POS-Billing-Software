'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ErrorText, Field, Page, PageHeader } from '@/components/ui';
import LogoPicker from '@/components/LogoPicker';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    if (user && !f)
      setF({
        businessName: user.businessName || '', ownerName: user.ownerName || '', phone: user.phone || '',
        address: user.address || '', gstin: user.gstin || '', logoUrl: user.logoUrl || null,
        paperSize: user.paperSize || '80mm', receiptFooter: user.receiptFooter || '',
      });
  }, [user, f]);

  if (!f) return null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try { setUser(await api('/settings', { method: 'PATCH', body: f })); setMsg('Settings saved'); }
    catch (e) { setErr(e.message); }
  };

  const changePw = async (e) => {
    e.preventDefault(); setPwMsg('');
    try { await api('/settings/password', { method: 'PATCH', body: pw }); setPw({ currentPassword: '', newPassword: '' }); setPwMsg('Password updated'); }
    catch (e) { setPwMsg(e.message); }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Shop and printer settings." />
      <Page>
        <form onSubmit={save} className="card p-6 space-y-5 max-w-3xl">
          <h2 className="font-bold">Shop details</h2>
          <LogoPicker value={f.logoUrl} onChange={(v) => setF({ ...f, logoUrl: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shop name"><input className="input" value={f.businessName} onChange={set('businessName')} required /></Field>
            <Field label="Owner name"><input className="input" value={f.ownerName} onChange={set('ownerName')} /></Field>
            <Field label="Phone"><input className="input" value={f.phone} onChange={set('phone')} /></Field>
            <Field label="GSTIN"><input className="input" value={f.gstin} onChange={set('gstin')} /></Field>
          </div>
          <Field label="Address"><input className="input" value={f.address} onChange={set('address')} /></Field>

          <h2 className="font-bold pt-2">Printer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Paper size">
              <select className="input" value={f.paperSize} onChange={set('paperSize')}>
                <option value="58mm">Thermal 58mm</option>
                <option value="80mm">Thermal 80mm</option>
                <option value="A4">A4</option>
              </select>
            </Field>
            <Field label="Receipt footer"><input className="input" placeholder="Thank you! Visit again." value={f.receiptFooter} onChange={set('receiptFooter')} /></Field>
          </div>
          <ErrorText>{err}</ErrorText>
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          <button className="btn">Save settings</button>
        </form>

        <form onSubmit={changePw} className="card p-6 space-y-4 max-w-3xl">
          <h2 className="font-bold">Change password</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current password"><input type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></Field>
            <Field label="New password"><input type="password" className="input" minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></Field>
          </div>
          {pwMsg && <p className="text-sm text-gray-600">{pwMsg}</p>}
          <button className="btn">Update password</button>
        </form>
      </Page>
    </>
  );
}
