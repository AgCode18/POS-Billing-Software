'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Boxes, IndianRupee, Package, Plus, Search, ShoppingCart } from 'lucide-react';
import { api, money } from '@/lib/api';
import { Empty, ErrorText, Page, PageHeader, StatCard } from '@/components/ui';
import InvoiceModal from '@/components/InvoiceModal';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalStock: 0, inventoryValue: 0 });
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [cart, setCart] = useState({});
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([api('/dashboard/stats'), api('/products')]);
      setStats(s); setProducts(p);
    } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [products, q]);
  const add = (p) => setCart((c) => ((c[p.id] || 0) >= p.stock ? c : { ...c, [p.id]: (c[p.id] || 0) + 1 }));

  const inCart = products.filter((p) => cart[p.id]);
  const count = inCart.reduce((a, p) => a + cart[p.id], 0);
  const subtotal = inCart.reduce((a, p) => a + cart[p.id] * Number(p.price), 0);

  const addBtn = <Link href="/products" className="btn"><Plus size={18} /> Add Product</Link>;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Manage products and create invoices." action={addBtn} />
      <Page>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Products" value={stats.totalProducts} icon={Package} />
          <StatCard label="Total Stock" value={stats.totalStock} icon={Boxes} />
          <StatCard label="Inventory Value" value={money(stats.inventoryValue)} icon={IndianRupee} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Products</h2>
            <p className="text-sm text-gray-500">Select a product to create an invoice.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-11" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <ErrorText>{err}</ErrorText>

        {filtered.length === 0 ? (
          <Empty dashed icon={Package}
            title="No products found"
            text={products.length ? 'Try a different search.' : 'Add your first product to start billing.'}
            action={!products.length && addBtn} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <button key={p.id} disabled={p.stock <= 0} onClick={() => add(p)}
                className="card p-4 text-left relative hover:border-black transition disabled:opacity-60 disabled:hover:border-gray-200">
                {cart[p.id] && (
                  <span className="absolute top-3 right-3 h-6 min-w-6 px-1.5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">{cart[p.id]}</span>
                )}
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3"><Package size={18} /></div>
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-lg font-bold mt-1">{money(p.price)}</p>
                <p className={`text-xs mt-1 ${p.stock <= p.lowStockAt ? 'text-red-600' : 'text-gray-500'}`}>
                  {p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}
                </p>
              </button>
            ))}
          </div>
        )}
      </Page>

      {count > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-[17rem] md:right-8 z-30">
          <div className="bg-black text-white rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-sm">
              <ShoppingCart size={18} />
              <span className="font-semibold">{count} item{count > 1 ? 's' : ''}</span>
              <span className="text-gray-300">· {money(subtotal)}</span>
            </div>
            <div className="flex gap-2">
              <button className="text-sm text-gray-300 hover:text-white px-3" onClick={() => setCart({})}>Clear</button>
              <button className="h-10 px-5 rounded-xl bg-white text-black text-sm font-semibold" onClick={() => setShow(true)}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {show && (
        <InvoiceModal products={products} cart={cart} setCart={setCart}
          onClose={() => setShow(false)}
          onDone={() => { setShow(false); setCart({}); load(); }} />
      )}
    </>
  );
}
