const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('SUPER_ADMIN'));

const strip = ({ passwordHash, ...u }) => u;

// Create an Admin (shop) and hand over email + password
router.post('/admins', async (req, res) => {
  const { email, password, businessName, ownerName, phone, address, gstin, logoUrl } = req.body;
  if (!email || !password || !businessName)
    return res.status(400).json({ message: 'email, password, businessName required' });

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const admin = await prisma.user.create({
    data: {
      role: 'ADMIN',
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      businessName, ownerName, phone, address, gstin, logoUrl,
    },
  });
  res.status(201).json(strip(admin));
});

router.get('/admins', async (req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { invoices: true, products: true } } },
  });
  res.json(admins.map(strip));
});

// edit details / activate-deactivate / reset password
router.patch('/admins/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { password, ...rest } = req.body;
  const allowed = ['businessName', 'ownerName', 'phone', 'address', 'gstin', 'logoUrl', 'isActive'];
  const data = Object.fromEntries(Object.entries(rest).filter(([k]) => allowed.includes(k)));
  if (password) data.passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.update({ where: { id, role: 'ADMIN' }, data });
  res.json(strip(admin));
});

// Monitoring: platform-wide numbers
router.get('/overview', async (req, res) => {
  const [admins, sales, perAdmin] = await Promise.all([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.invoice.aggregate({ _sum: { total: true }, _count: true }),
    prisma.invoice.groupBy({ by: ['adminId'], _sum: { total: true }, _count: true }),
  ]);
  res.json({ admins, invoices: sales._count, revenue: sales._sum.total, perAdmin });
});

// Monitoring: drill into one admin's invoices
router.get('/admins/:id/invoices', async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: { adminId: Number(req.params.id) },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { items: true, customer: true },
  });
  res.json(invoices);
});

// Monitoring: activity feed (all admins or ?adminId=)
router.get('/activity', async (req, res) => {
  const where = req.query.adminId ? { adminId: Number(req.query.adminId) } : {};
  const logs = await prisma.activityLog.findMany({
    where, orderBy: { createdAt: 'desc' }, take: 100,
    include: { admin: { select: { businessName: true, email: true } } },
  });
  res.json(logs);
});

module.exports = router;
