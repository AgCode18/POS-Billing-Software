'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, IndianRupee, Package, Receipt as ReceiptIcon } from 'lucide-react';
import { actionLabel, api, fmtDate, invNo, money } from '@/lib/api';
import { Avatar, Badge, Empty, ErrorText, Modal, Page, PageHeader, StatCard } from '@/components/ui';
import Receipt from '@/components/Receipt';

export default function AdminDetail() {
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stat, setStat] = useState({ bills: 0, revenue: 0 });
  const [view, setView] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api('/super/admins'), api(`/super/admins/${id}/invoices`), api(`/super/activity?adminId=${id}`), api('/super/overview')])
      .then(([admins, inv, act, ov]) => {
        setAdmin(admins.find((a) => a.id === Number(id)) || null);
        setInvoices(inv); setLogs(act.slice(0, 15));
        const s = ov.perAdmin.find((x) => x.adminId === Number(id));
        setStat({ bills: s ? (typeof s._count === 'number' ? s._count : s._count?._all || 0) : 0, revenue: Number(s?._sum?.total || 0) });
      })
      .catch((e) => setErr(e.message));
  }, [id]);

  if (!admin) return <PageHeader title="Admin" subtitle={err || 'Loading…'} />;

  return (
    <>
      <PageHeader title={admin.businessName} subtitle={admin.email}
        action={<Link href="/super/admins" className="btn-light"><ArrowLeft size={16} /> Back</Link>} />
      <Page>
        <ErrorText>{err}</ErrorText>
        <div className="card p-6 flex flex-wrap items-center gap-4">
          <Avatar name={admin.businessName} src={admin.logoUrl} />
          <div className="flex-1 min-w-0 text-sm text-gray-600">
            <p>{[admin.ownerName, admin.phone].filter(Boolean).join(' · ') || '—'}</p>
            <p>{admin.address || 'No address'}{admin.gstin ? ` · GSTIN ${admin.gstin}` : ''}</p>
          </div>
          <Badge on={admin.isActive}>{admin.isActive ? 'Active' : 'Disabled'}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Invoices" value={stat.bills} icon={ReceiptIcon} />
          <StatCard label="Total Revenue" value={money(stat.revenue)} icon={IndianRupee} />
          <StatCard label="Products" value={admin._count.products} icon={Package} />
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200"><h2 className="font-bold">Recent invoices</h2></div>
          {invoices.length === 0 ? <Empty icon={ReceiptIcon} title="No invoices yet" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200"><tr><th className="th">Invoice</th><th className="th">Date</th><th className="th">Items</th><th className="th">Payment</th><th className="th">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((i) => (
                    <tr key={i.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setView(i)}>
                      <td className="td font-semibold">{invNo(i.invoiceNo)}</td>
                      <td className="td text-gray-600">{fmtDate(i.createdAt)}</td>
                      <td className="td">{i.items.reduce((a, x) => a + x.qty, 0)}</td>
                      <td className="td">{i.paymentMode}</td>
                      <td className="td font-semibold">{money(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200"><h2 className="font-bold">Recent activity</h2></div>
          <ul className="divide-y divide-gray-100">
            {logs.map((l) => (
              <li key={l.id} className="td flex justify-between gap-4"><span>{actionLabel(l)}</span><span className="text-gray-500">{fmtDate(l.createdAt)}</span></li>
            ))}
            {logs.length === 0 && <li className="td text-gray-500">No activity yet.</li>}
          </ul>
        </div>
      </Page>

      {view && (
        <Modal title={invNo(view.invoiceNo)} onClose={() => setView(null)} wide>
          <Receipt invoice={view} shop={admin} />
        </Modal>
      )}
    </>
  );
}
