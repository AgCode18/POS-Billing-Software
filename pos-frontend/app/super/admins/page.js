'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, KeyRound, Plus, RefreshCw, Users } from 'lucide-react';
import { api, genPassword } from '@/lib/api';
import { Avatar, Badge, Empty, ErrorText, Field, Modal, Page, PageHeader } from '@/components/ui';
import LogoPicker from '@/components/LogoPicker';

const blank = () => ({ businessName: '', ownerName: '', email: '', password: genPassword(), phone: '', address: '', gstin: '', logoUrl: null });

export default function Admins() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(null);
  const [created, setCreated] = useState(null);
  const [reset, setReset] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setList(await api('/super/admins')); } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      await api('/super/admins', { method: 'POST', body: form });
      setCreated({ email: form.email, password: form.password, name: form.businessName });
      setForm(null); load();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const toggle = async (a) => { await api(`/super/admins/${a.id}`, { method: 'PATCH', body: { isActive: !a.isActive } }); load(); };

  const doReset = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await api(`/super/admins/${reset.id}`, { method: 'PATCH', body: { password: reset.password } });
      setCreated({ email: reset.email, password: reset.password, name: reset.name });
      setReset(null);
    } catch (e) { setErr(e.message); }
  };

  const copy = (c) => navigator.clipboard.writeText(`Login: ${location.origin}/login\nEmail: ${c.email}\nPassword: ${c.password}`);

  return (
    <>
      <PageHeader title="Admins" subtitle="Create shop accounts and manage their access."
        action={<button className="btn" onClick={() => { setErr(''); setForm(blank()); }}><Plus size={18} /> Add Admin</button>} />
      <Page>
        <ErrorText>{!form && !reset && err}</ErrorText>
        <div className="card overflow-hidden">
          {list.length === 0 ? (
            <Empty icon={Users} title="No admins yet" text="Create a shop account and share the login with the shop owner." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr><th className="th">Shop</th><th className="th">Invoices</th><th className="th">Products</th><th className="th">Status</th><th className="th text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((a) => (
                    <tr key={a.id}>
                      <td className="td">
                        <Link href={`/super/admins/${a.id}`} className="flex items-center gap-3">
                          <Avatar name={a.businessName} src={a.logoUrl} />
                          <div><p className="font-semibold">{a.businessName}</p><p className="text-xs text-gray-500">{a.email}</p></div>
                        </Link>
                      </td>
                      <td className="td">{a._count.invoices}</td>
                      <td className="td">{a._count.products}</td>
                      <td className="td"><Badge on={a.isActive}>{a.isActive ? 'Active' : 'Disabled'}</Badge></td>
                      <td className="td">
                        <div className="flex justify-end gap-2">
                          <button className="btn-light btn-sm" onClick={() => { setErr(''); setReset({ id: a.id, email: a.email, name: a.businessName, password: genPassword() }); }}><KeyRound size={14} /> Reset</button>
                          <button className="btn-light btn-sm" onClick={() => toggle(a)}>{a.isActive ? 'Disable' : 'Enable'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Page>

      {form && (
        <Modal title="Add Admin" wide onClose={() => setForm(null)}>
          <form onSubmit={create} className="space-y-4">
            <LogoPicker value={form.logoUrl} onChange={(v) => setForm({ ...form, logoUrl: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name *"><input className="input" required value={form.businessName} onChange={set('businessName')} /></Field>
              <Field label="Owner name"><input className="input" value={form.ownerName} onChange={set('ownerName')} /></Field>
              <Field label="Login email *"><input type="email" className="input" required value={form.email} onChange={set('email')} /></Field>
              <Field label="Password *">
                <div className="flex gap-2">
                  <input className="input font-mono" required minLength={6} value={form.password} onChange={set('password')} />
                  <button type="button" className="btn-light !px-3 h-12" onClick={() => setForm({ ...form, password: genPassword() })}><RefreshCw size={16} /></button>
                </div>
              </Field>
              <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
              <Field label="GSTIN"><input className="input" value={form.gstin} onChange={set('gstin')} /></Field>
            </div>
            <Field label="Address"><input className="input" value={form.address} onChange={set('address')} /></Field>
            <ErrorText>{err}</ErrorText>
            <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Create Admin'}</button>
          </form>
        </Modal>
      )}

      {reset && (
        <Modal title={`Reset password – ${reset.name}`} onClose={() => setReset(null)}>
          <form onSubmit={doReset} className="space-y-4">
            <Field label="New password">
              <div className="flex gap-2">
                <input className="input font-mono" required minLength={6} value={reset.password} onChange={(e) => setReset({ ...reset, password: e.target.value })} />
                <button type="button" className="btn-light !px-3 h-12" onClick={() => setReset({ ...reset, password: genPassword() })}><RefreshCw size={16} /></button>
              </div>
            </Field>
            <ErrorText>{err}</ErrorText>
            <button className="btn w-full">Update password</button>
          </form>
        </Modal>
      )}

      {created && (
        <Modal title="Share these credentials" onClose={() => setCreated(null)}>
          <p className="text-sm text-gray-500 mb-4">Give this to the owner of <b>{created.name}</b>. The password is not shown again.</p>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm space-y-1">
            <p>Email: {created.email}</p>
            <p>Password: {created.password}</p>
          </div>
          <button className="btn w-full mt-5" onClick={() => copy(created)}><Copy size={16} /> Copy login details</button>
        </Modal>
      )}
    </>
  );
}
