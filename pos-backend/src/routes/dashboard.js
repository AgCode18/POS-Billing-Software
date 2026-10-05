const router = require('express').Router();
const prisma = require('../db');
const { authenticate, requireRole, tenant } = require('../middleware/auth');

router.use(authenticate, requireRole('ADMIN'), tenant);

// Matches the admin dashboard cards: Total Products / Total Stock / Inventory Value
router.get('/stats', async (req, res) => {
  const where = { adminId: req.tenantId, isActive: true };
  const [agg, value] = await Promise.all([
    prisma.product.aggregate({ where, _count: true, _sum: { stock: true } }),
    prisma.$queryRaw`SELECT COALESCE(SUM(price * stock), 0) AS v FROM Product WHERE adminId = ${req.tenantId} AND isActive = 1`,
  ]);
  res.json({
    totalProducts: agg._count,
    totalStock: agg._sum.stock || 0,
    inventoryValue: Number(value[0].v),
  });
});

module.exports = router;
