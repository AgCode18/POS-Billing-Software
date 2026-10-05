'use client';
import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { actionLabel, api, fmtDate } from '@/lib/api';
import { Empty, ErrorText, Page, PageHeader } from '@/components/ui';

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminId, setAdminId] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { api('/super/admins').then(setAdmins).catch((e) => setErr(e.message)); }, []);
  useEffect(() => {
    api(`/super/activity${adminId ? `?adminId=${adminId}` : ''}`).then(setLogs).catch((e) => setErr(e.message));
  }, [adminId]);

  return (
    <>
      <PageHeader title="Activity" subtitle="Everything admins do in the software." />
      <Page>
        <ErrorText>{err}</ErrorText>
        <select className="input sm:w-72" value={adminId} onChange={(e) => setAdminId(e.target.value)}>
          <option value="">All shops</option>
          {admins.map((a) => <option key={a.id} value={a.id}>{a.businessName}</option>)}
        </select>

        <div className="card overflow-hidden">
          {logs.length === 0 ? <Empty icon={Activity} title="No activity yet" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200"><tr><th className="th">When</th><th className="th">Shop</th><th className="th">Action</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="td text-gray-600 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                      <td className="td font-semibold">{l.admin?.businessName}</td>
                      <td className="td">{actionLabel(l)}</td>
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
