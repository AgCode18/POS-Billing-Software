const prisma = require('../db');

// fire-and-forget activity logging for Super Admin monitoring
module.exports = (adminId, action, entity, entityId, meta) =>
  prisma.activityLog
    .create({ data: { adminId, action, entity, entityId, meta } })
    .catch((e) => console.error('log failed', e.message));
