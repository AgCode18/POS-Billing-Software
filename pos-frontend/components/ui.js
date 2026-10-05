'use client';
import { X } from 'lucide-react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-5 sm:py-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export const Page = ({ children }) => <div className="p-4 sm:p-8 space-y-6 pb-28">{children}</div>;

export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card p-5 sm:p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
        <Icon size={20} />
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, title, text, action, dashed }) {
  return (
    <div className={`${dashed ? 'border border-dashed border-gray-300 rounded-2xl' : ''} flex flex-col items-center text-center py-16 px-4`}>
      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 mb-4">
        <Icon size={22} />
      </div>
      <p className="font-semibold">{title}</p>
      {text && <p className="text-sm text-gray-500 mt-1">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`card w-full ${wide ? 'max-w-xl' : 'max-w-md'} max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export const Field = ({ label, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
  </div>
);

export const ErrorText = ({ children }) => (children ? <p className="text-sm text-red-600">{children}</p> : null);

export const Badge = ({ on, children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${on ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
    {children}
  </span>
);

export function Avatar({ name, src }) {
  return src ? (
    <img src={src} alt="" className="h-10 w-10 rounded-xl object-contain bg-gray-100 border border-gray-200" />
  ) : (
    <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}
