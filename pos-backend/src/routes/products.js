const router = require('express').Router();
const prisma = require('../db');
const log = require('../middleware/log');
const { authenticate, requireRole, tenant } = require('../middleware/auth');

router.use(authenticate, requireRole('ADMIN'), tenant);

function clean(b, partial = false) {
  const d = {};
  if (b.name !== undefined) {
    d.name = String(b.name).trim();
    if (!d.name) throw new Error('Product name is required');
  } else if (!partial) throw new Error('Product name is required');

  if (b.price !== undefined) {
    d.price = Number(b.price);
    if (!(d.price >= 0)) throw new Error('Invalid price');
  } else if (!partial) throw new Error('Price is required');

  if (b.stock !== undefined) {
    d.stock = parseInt(b.stock, 10);
    if (!(d.stock >= 0)) throw new Error('Invalid quantity');
  }
  if (b.taxRate !== undefined) d.taxRate = Number(b.taxRate) || 0;
  if (b.barcode !== undefined) d.barcode = b.barcode || null;
  if (b.lowStockAt !== undefined) d.lowStockAt = parseInt(b.lowStockAt, 10) || 0;
  if (b.categoryId !== undefined) d.categoryId = b.categoryId || null;
  return d;
}

router.get('/', async (req, res) => {
  const { q } = req.query;
  res.json(await prisma.product.findMany({
    where: {
      adminId: req.tenantId,
      isActive: true,
      ...(q && { OR: [{ name: { contains: q } }, { barcode: q }] }),
    },
    orderBy: { createdAt: 'desc' },
  }));
});

router.post('/', async (req, res) => {
  try {
    const p = await prisma.product.create({ data: { adminId: req.tenantId, ...clean(req.body) } });
    log(req.tenantId, 'PRODUCT_CREATED', 'Product', p.id, { name: p.name });
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ message: e.code === 'P2002' ? 'Barcode already used' : e.message });
  }
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const owned = await prisma.product.findFirst({ where: { id, adminId: req.tenantId } });
  if (!owned) return res.status(404).json({ message: 'Not found' });
  try {
    const d = clean(req.body, true);
    const p = await prisma.product.update({ where: { id }, data: d });
    if (d.stock !== undefined && d.stock !== owned.stock)
      await prisma.stockMovement.create({
        data: { adminId: req.tenantId, productId: id, change: d.stock - owned.stock, reason: 'ADJUSTMENT' },
      });
    log(req.tenantId, 'PRODUCT_UPDATED', 'Product', id, { name: p.name });
    res.json(p);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// soft delete: keeps old invoices intact
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const owned = await prisma.product.findFirst({ where: { id, adminId: req.tenantId } });
  if (!owned) return res.status(404).json({ message: 'Not found' });
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  log(req.tenantId, 'PRODUCT_DELETED', 'Product', id, { name: owned.name });
  res.json({ ok: true });
});

module.exports = router;
