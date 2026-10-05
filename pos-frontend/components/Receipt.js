import { fmtDate, invNo, money } from '@/lib/api';

// shop = admin user object (businessName, address, phone, gstin, logoUrl, receiptFooter, paperSize)
export default function Receipt({ invoice, shop }) {
  const width = { '58mm': '58mm', '80mm': '80mm', A4: '210mm' }[shop.paperSize] || '80mm';
  const Row = ({ a, b, bold }) => (
    <div className={`flex justify-between gap-2 ${bold ? 'font-bold text-sm' : ''}`}><span>{a}</span><span>{b}</span></div>
  );
  return (
    <div id="receipt" style={{ width, maxWidth: '100%' }} className="mx-auto bg-white text-black text-xs font-mono p-3 border border-dashed border-gray-300 print:border-0">
      {shop.logoUrl && <img src={shop.logoUrl} alt="" className="h-12 mx-auto mb-1 object-contain" />}
      <div className="text-center font-bold text-sm">{shop.businessName}</div>
      {shop.address && <div className="text-center">{shop.address}</div>}
      {shop.phone && <div className="text-center">Ph: {shop.phone}</div>}
      {shop.gstin && <div className="text-center">GSTIN: {shop.gstin}</div>}
      <div className="border-t border-dashed border-black my-2" />
      <Row a={invNo(invoice.invoiceNo)} b={fmtDate(invoice.createdAt)} />
      <div className="border-t border-dashed border-black my-2" />
      {invoice.items.map((i) => (
        <div key={i.id} className="mb-1">
          <div className="font-semibold">{i.name}</div>
          <Row a={`${i.qty} × ${money(i.price)}`} b={money(i.lineTotal)} />
        </div>
      ))}
      <div className="border-t border-dashed border-black my-2" />
      <Row a="Subtotal" b={money(invoice.subtotal)} />
      {Number(invoice.tax) > 0 && <Row a="Tax" b={money(invoice.tax)} />}
      {Number(invoice.discount) > 0 && <Row a="Discount" b={`-${money(invoice.discount)}`} />}
      <Row a="TOTAL" b={money(invoice.total)} bold />
      <Row a="Paid via" b={invoice.paymentMode} />
      <div className="border-t border-dashed border-black my-2" />
      <div className="text-center">{shop.receiptFooter || 'Thank you! Visit again.'}</div>
    </div>
  );
}
