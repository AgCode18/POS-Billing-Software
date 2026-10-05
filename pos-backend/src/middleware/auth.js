const jwt = require('jsonwebtoken');
const prisma = require('../db');

// 1. Verify token + confirm account is still active (so deactivation is instant)
async function authenticate(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account disabled or not found' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

const requireRole = (role) => (req, res, next) =>
  req.user.role === role ? next() : res.status(403).json({ message: 'Forbidden' });

// 2. Tenant isolation: ADMIN's tenant is always THEIR OWN id, never taken from the client.
//    Every admin-side query must use `where: { adminId: req.tenantId, ... }`
function tenant(req, res, next) {
  req.tenantId = req.user.id;
  next();
}

module.exports = { authenticate, requireRole, tenant };
