'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, Receipt, Settings, Users, Activity, Store, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const NAV = {
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/invoices', label: 'Invoices', icon: Receipt },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  SUPER_ADMIN: [
    { href: '/super', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/super/admins', label: 'Admins', icon: Users },
    { href: '/super/activity', label: 'Activity', icon: Activity },
  ],
};

export default function Shell({ role, children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== role) router.replace(user.role === 'SUPER_ADMIN' ? '/super' : '/dashboard');
  }, [user, loading, role, router]);

  useEffect(() => setOpen(false), [path]);

  if (loading || !user || user.role !== role) return <div className="min-h-screen bg-gray-50" />;

  const isSuper = role === 'SUPER_ADMIN';
  const title = isSuper ? 'Billing' : user.businessName || 'Billing';
  const sub = isSuper ? 'Super Admin' : 'POS System';

  const sidebar = (
    <>
      <div className="flex items-center gap-3 px-6 h-[76px] border-b border-gray-200">
        {!isSuper && user.logoUrl ? (
          <img src={user.logoUrl} alt="" className="h-10 w-10 rounded-xl object-contain" />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center"><Store size={20} /></div>
        )}
        <div className="min-w-0">
          <p className="font-bold leading-tight truncate">{title}</p>
          <p className="text-xs text-gray-500">{sub}</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {NAV[role].map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 h-11 px-4 rounded-xl text-sm font-medium transition ${active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">{isSuper ? 'Super Admin' : 'Billing Software'}</p>
          <p className="text-sm font-bold truncate">{user.email}</p>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-black">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}
      <div className="md:pl-64 min-h-screen">
        <div className="md:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-200">
          <button onClick={() => setOpen(!open)} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-bold">{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
