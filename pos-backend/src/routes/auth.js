const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const log = require('../middleware/log');
const { authenticate } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email: String(email || '').toLowerCase() } });
  if (!user || !user.isActive || !(await bcrypt.compare(password || '', user.passwordHash)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
  if (user.role === 'ADMIN') log(user.id, 'LOGIN');

  const { passwordHash, ...safe } = user;
  res.json({ token, user: safe });
});

router.get('/me', authenticate, (req, res) => {
  const { passwordHash, ...safe } = req.user;
  res.json(safe);
});

module.exports = router;
