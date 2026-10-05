const router = require('express').Router();
const prisma = require('../db');
const log = require('../middleware/log');
const { authenticate, requireRole, tenant } = require('../middleware/auth');

router.use(authenticate, requireRole('ADMIN'), tenant);

// Create bill. Prices/tax come from DB, never from the client.
router.post('/', async (req, res) => {
  const { items, discount = 0, paymentMode = 'CASH', customerId = null } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'No items' });

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      const ids = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: ids }, adminId: req.tenantId, isActive: true },
      });
      const map = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0, tax = 0;
      const lines = items.map(({ productId, qty }) => {
        const p = map.get(productId);
        if (!p) throw new Error('Product not found');
        if (!Number.isInteger(qty) || qty < 1) throw new Error('Invalid quantity');
        if (p.stock < qty) throw new Error(`Insufficient stock: ${p.name}`);
        const base = Number(p.price) * qty;
        const lineTax = (base * Number(p.taxRate)) / 100;
        subtotal += base; tax += lineTax;
        return { productId, name: p.name, price: p.price, taxRate: p.taxRate, qty, lineTotal: base + lineTax };
      });

      const total = Math.max(subtotal + tax - Number(discount), 0);

      // per-shop sequential invoice number
      const { invoiceSeq } = await tx.user.update({
        where: { id: req.tenantId }, data: { invoiceSeq: { increment: 1 } }, select: { invoiceSeq: true },
      });

      const inv = await tx.invoice.create({
        data: {
          adminId: req.tenantId, invoiceNo: invoiceSeq, customerId,
          subtotal, tax, discount, total, paymentMode,
          items: { create: lines },
        },
        include: { items: true },
      });

      for (const l of lines) {
        await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.qty } } });
        await tx.stockMovement.create({
          data: { adminId: req.tenantId, productId: l.productId, change: -l.qty, reason: 'SALE' },
        });
      }
      return inv;
    });

    log(req.tenantId, 'INVOICE_CREATED', 'Invoice', invoice.id, { total: invoice.total });
    res.status(201).json(invoice);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/', async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: { adminId: req.tenantId },
    orderBy: { createdAt: 'desc' }, take: 100,
    include: { items: true, customer: true },
  });
  res.json(invoices);
});

router.get('/summary', async (req, res) => {
  const a = await prisma.invoice.aggregate({ where: { adminId: req.tenantId }, _count: true, _sum: { total: true } });
  res.json({ count: a._count, total: Number(a._sum.total || 0) });
});

router.get('/:id', async (req, res) => {
  const inv = await prisma.invoice.findFirst({
    where: { id: Number(req.params.id), adminId: req.tenantId }, // tenant check
    include: { items: true, customer: true },
  });
  inv ? res.json(inv) : res.status(404).json({ message: 'Not found' });
});

module.exports = router;
