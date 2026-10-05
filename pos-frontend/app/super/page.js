'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IndianRupee, Receipt, Store, Users } from 'lucide-react';
import { api, money } from '@/lib/api';
import { Avatar, Badge, ErrorText, Page, PageHeader, StatCard } from '@/components/ui';

export default function Overview() {
  const [ov, setOv] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api('/super/overview'), api('/super/admins')])
      .then(([o, a]) => { setOv(o); setAdmins(a); })
      .catch((e) => setErr(e.message));
  }, []);

  const rows = admins
    .map((a) => {
      const s = ov?.perAdmin.find((x) => x.adminId === a.id);
      const bills = s ? (typeof s._count === 'number' ? s._count : s._count?._all || 0) : 0;
      return { ...a, bills, revenue: Number(s?._sum?.total || 0) };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <>
      <PageHeader title="Overview" subtitle="Monitor all shops using the software." />
      <Page>
        <ErrorText>{err}</ErrorText>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Admins" value={ov?.admins ?? 0} icon={Users} />
          <StatCard label="Total Invoices" value={ov?.invoices ?? 0} icon={Receipt} />
          <StatCard label="Total Revenue" value={money(ov?.revenue)} icon={IndianRupee} />
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="font-bold">Shop performance</h2>
            <p className="text-sm text-gray-500">Ranked by revenue.</p>
          </div>
          {rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              <Store className="mx-auto mb-3 text-gray-400" />
              No admins yet. <Link href="/super/admins" className="font-semibold text-black underline">Create the first one</Link>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr><th className="th">Shop</th><th className="th">Invoices</th><th className="th">Revenue</th><th className="th">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="td">
                        <Link href={`/super/admins/${r.id}`} className="flex items-center gap-3">
                          <Avatar name={r.businessName} src={r.logoUrl} />
                          <div><p className="font-semibold">{r.businessName}</p><p className="text-xs text-gray-500">{r.email}</p></div>
                        </Link>
                      </td>
                      <td className="td">{r.bills}</td>
                      <td className="td font-semibold">{money(r.revenue)}</td>
                      <td className="td"><Badge on={r.isActive}>{r.isActive ? 'Active' : 'Disabled'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Page>
    </>
  );
}
