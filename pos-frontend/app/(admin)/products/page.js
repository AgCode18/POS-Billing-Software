'use client';
import { useCallback, useEffect, useState } from 'react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, money } from '@/lib/api';
import { Empty, ErrorText, Field, Modal, Page, PageHeader } from '@/components/ui';

const blank = { name: '', price: '', stock: '' };

function Fields({ form, setForm }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <>
      <Field label="Product Name"><input className="input" placeholder="e.g. Coca Cola" value={form.name} onChange={set('name')} required /></Field>
      <Field label="Price"><input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={set('price')} required /></Field>
      <Field label="Quantity"><input className="input" type="number" min="0" step="1" placeholder="0" value={form.stock} onChange={set('stock')} /></Field>
    </>
  );
}

export default function Products() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setList(await api('/products')); } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const body = (f) => ({ name: f.name.trim(), price: Number(f.price), stock: parseInt(f.stock || '0', 10) });

  const add = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await api('/products', { method: 'POST', body: body(form) }); setForm(blank); await load(); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const save = async (e) => {
    e.preventDefault(); setErr('');
    try { await api(`/products/${edit.id}`, { method: 'PATCH', body: body(edit) }); setEdit(null); load(); }
    catch (e) { setErr(e.message); }
  };

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await api(`/products/${p.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <PageHeader title="Products" subtitle="Add and manage your products." />
      <Page>
        <form onSubmit={add} className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center"><Plus size={18} /></div>
            <div>
              <h2 className="font-bold leading-tight">Add Product</h2>
              <p className="text-sm text-gray-500">Enter product details below.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4 items-end">
            <Fields form={form} setForm={setForm} />
            <button className="btn" disabled={busy}><Plus size={18} /> Add Product</button>
          </div>
          <div className="mt-3"><ErrorText>{err}</ErrorText></div>
        </form>

        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="font-bold">All Products</h2>
            <p className="text-sm text-gray-500">{list.length} product{list.length === 1 ? '' : 's'}</p>
          </div>
          {list.length === 0 ? (
            <Empty icon={Package} title="No products added yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr><th className="th">Product</th><th className="th">Price</th><th className="th">Stock</th><th className="th text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((p) => (
                    <tr key={p.id}>
                      <td className="td font-semibold">{p.name}</td>
                      <td className="td">{money(p.price)}</td>
                      <td className={`td ${p.stock <= p.lowStockAt ? 'text-red-600 font-semibold' : ''}`}>{p.stock}</td>
                      <td className="td">
                        <div className="flex justify-end gap-2">
                          <button className="btn-light btn-sm" onClick={() => setEdit({ id: p.id, name: p.name, price: String(p.price), stock: String(p.stock) })}><Pencil size={14} /> Edit</button>
                          <button className="btn-light btn-sm text-red-600" onClick={() => del(p)}><Trash2 size={14} /></button>
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

      {edit && (
        <Modal title="Edit product" onClose={() => setEdit(null)}>
          <form onSubmit={save} className="space-y-4">
            <Fields form={edit} setForm={setEdit} />
            <ErrorText>{err}</ErrorText>
            <button className="btn w-full">Save changes</button>
          </form>
        </Modal>
      )}
    </>
  );
}
