'use client';
import { ImagePlus, Trash2 } from 'lucide-react';
import { fileToLogo } from '@/lib/api';

export default function LogoPicker({ value, onChange }) {
  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (f) onChange(await fileToLogo(f));
  };
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
        {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <ImagePlus size={22} className="text-gray-400" />}
      </div>
      <label className="btn-light btn-sm cursor-pointer">
        Upload logo
        <input type="file" accept="image/*" className="hidden" onChange={pick} />
      </label>
      {value && (
        <button type="button" onClick={() => onChange(null)} className="btn-light btn-sm"><Trash2 size={14} /> Remove</button>
      )}
    </div>
  );
}
