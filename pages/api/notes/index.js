// pages/api/notes/index.js
import prisma from '../../../lib/prisma';
import applyCors from '../../../lib/cors';
import { getUserFromRequest, requireRole } from '../../../lib/auth';

export default async function handler(req, res) {
  await applyCors(req, res);

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tenantId = user.tenantId;

  if (req.method === 'GET') {
    // list notes for tenant
    const notes = await prisma.note.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(notes);
  }

  if (req.method === 'POST') {
    // members and admins can create notes
    if (!requireRole(user, ['ADMIN', 'MEMBER'])) return res.status(403).json({ error: 'Forbidden' });

    // subscription gating
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant.plan === 'FREE') {
      const count = await prisma.note.count({ where: { tenantId } });
      if (count >= 3) {
        return res.status(403).json({ error: 'Free plan note limit reached (3). Upgrade to Pro.' });
      }
    }

    const { title = '', content = '' } = req.body || {};
    const note = await prisma.note.create({
      data: { title, content, tenantId, createdBy: user.id }
    });

    return res.status(201).json(note);
  }

  return res.status(405).end();
}
