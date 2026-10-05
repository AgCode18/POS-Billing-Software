'use client';
import { useEffect, useState } from 'react';
import { IndianRupee, Printer, Receipt as ReceiptIcon } from 'lucide-react';
import { api, fmtDate, invNo, money } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Empty, ErrorText, Modal, Page, PageHeader, StatCard } from '@/components/ui';
import Receipt from '@/components/Receipt';

export default function Invoices() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [sum, setSum] = useState({ count: 0, total: 0 });
  const [view, setView] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api('/invoices'), api('/invoices/summary')])
      .then(([l, s]) => { setList(l); setSum(s); })
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <>
      <PageHeader title="Invoices" subtitle="View and reprint your previous invoices." />
      <Page>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total Invoices" value={sum.count} icon={ReceiptIcon} />
          <StatCard label="Total Sales" value={money(sum.total)} icon={IndianRupee} />
        </div>
        <ErrorText>{err}</ErrorText>

        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="font-bold">Invoice History</h2>
            <p className="text-sm text-gray-500">All generated invoices.</p>
          </div>
          {list.length === 0 ? (
            <Empty icon={ReceiptIcon} title="No invoices yet" text="Generate your first invoice from the dashboard." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr><th className="th">Invoice</th><th className="th">Date</th><th className="th">Items</th><th className="th">Payment</th><th className="th">Total</th><th className="th" /></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((i) => (
                    <tr key={i.id}>
                      <td className="td font-semibold">{invNo(i.invoiceNo)}</td>
                      <td className="td text-gray-600">{fmtDate(i.createdAt)}</td>
                      <td className="td">{i.items.reduce((a, x) => a + x.qty, 0)}</td>
                      <td className="td">{i.paymentMode}</td>
                      <td className="td font-semibold">{money(i.total)}</td>
                      <td className="td text-right"><button className="btn-light btn-sm" onClick={() => setView(i)}><Printer size={14} /> Reprint</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Page>

      {view && (
        <Modal title={invNo(view.invoiceNo)} onClose={() => setView(null)} wide>
          <Receipt invoice={view} shop={user} />
          <button className="btn w-full mt-6" onClick={() => window.print()}><Printer size={16} /> Print</button>
        </Modal>
      )}
    </>
  );
}
