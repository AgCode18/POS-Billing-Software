'use client';
import { useEffect, useState } from 'react';
import { Minus, Plus, Printer, Trash2 } from 'lucide-react';
import { api, money } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ErrorText, Modal } from './ui';
import Receipt from './Receipt';

export default function InvoiceModal({ products, cart, setCart, onClose, onDone }) {
  const { user } = useAuth();
  const [discount, setDiscount] = useState('');
  const [mode, setMode] = useState('CASH');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [invoice, setInvoice] = useState(null);

  const items = products.filter((p) => cart[p.id]).map((p) => ({ p, qty: cart[p.id] }));
  const sub = items.reduce((a, i) => a + i.qty * Number(i.p.price), 0);
  const tax = items.reduce((a, i) => a + (i.qty * Number(i.p.price) * Number(i.p.taxRate || 0)) / 100, 0);
  const total = Math.max(sub + tax - Number(discount || 0), 0);

  useEffect(() => { if (!invoice && items.length === 0) onClose(); });

  const setQty = (p, q) =>
    setCart((c) => {
      const n = { ...c };
      if (q <= 0) delete n[p.id]; else n[p.id] = Math.min(q, p.stock);
      return n;
    });

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const inv = await api('/invoices', {
        method: 'POST',
        body: { items: items.map((i) => ({ productId: i.p.id, qty: i.qty })), discount: Number(discount || 0), paymentMode: mode },
      });
      setInvoice(inv);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  if (invoice)
    return (
      <Modal title="Invoice created" onClose={onDone} wide>
        <Receipt invoice={invoice} shop={user} />
        <div className="flex gap-3 mt-6">
          <button className="btn flex-1" onClick={() => window.print()}><Printer size={16} /> Print</button>
          <button className="btn-light flex-1" onClick={onDone}>Done</button>
        </div>
      </Modal>
    );

  return (
    <Modal title="Create invoice" onClose={onClose} wide>
      <div className="space-y-3">
        {items.map(({ p, qty }) => (
          <div key={p.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.name}</p>
              <p className="text-xs text-gray-500">{money(p.price)} · {p.stock} in stock</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-light btn-sm !px-2" onClick={() => setQty(p, qty - 1)}><Minus size={14} /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="btn-light btn-sm !px-2" onClick={() => setQty(p, qty + 1)} disabled={qty >= p.stock}><Plus size={14} /></button>
            </div>
            <p className="w-24 text-right font-semibold">{money(qty * Number(p.price))}</p>
            <button onClick={() => setQty(p, 0)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <label className="label">Discount (₹)</label>
          <input type="number" min="0" className="input" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div>
          <label className="label">Payment</label>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 h-12">
            {['CASH', 'UPI', 'CARD'].map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-lg text-xs font-semibold ${mode === m ? 'bg-black text-white' : 'text-gray-600'}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm space-y-1">
        <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{money(sub)}</span></div>
        {tax > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{money(tax)}</span></div>}
        {Number(discount) > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-{money(discount)}</span></div>}
        <div className="flex justify-between text-base font-bold pt-1"><span>Total</span><span>{money(total)}</span></div>
      </div>

      <div className="mt-3"><ErrorText>{err}</ErrorText></div>
      <button className="btn w-full mt-4" disabled={busy} onClick={submit}>{busy ? 'Generating…' : 'Generate Invoice'}</button>
    </Modal>
  );
}
