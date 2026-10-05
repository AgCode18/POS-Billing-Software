const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const log = require('../middleware/log');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('ADMIN'));

const strip = ({ passwordHash, ...u }) => u;

// Shop + printer settings (admin edits only their own row)
router.patch('/', async (req, res) => {
  const allowed = ['businessName', 'ownerName', 'phone', 'address', 'gstin', 'logoUrl', 'receiptFooter', 'paperSize'];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (data.paperSize && !['58mm', '80mm', 'A4'].includes(data.paperSize))
    return res.status(400).json({ message: 'Invalid paper size' });
  if (data.businessName !== undefined && !String(data.businessName).trim())
    return res.status(400).json({ message: 'Shop name is required' });

  const u = await prisma.user.update({ where: { id: req.user.id }, data });
  log(req.user.id, 'SETTINGS_UPDATED');
  res.json(strip(u));
});

router.patch('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  if (!(await bcrypt.compare(currentPassword || '', req.user.passwordHash)))
    return res.status(400).json({ message: 'Current password is incorrect' });
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  res.json({ ok: true });
});

module.exports = router;
