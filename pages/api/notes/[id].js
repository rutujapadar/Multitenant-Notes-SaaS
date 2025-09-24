// pages/api/notes/[id].js
import prisma from '../../../lib/prisma';
import applyCors from '../../../lib/cors';
import { getUserFromRequest, requireRole } from '../../../lib/auth';

export default async function handler(req, res) {
  await applyCors(req, res);

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const tenantId = user.tenantId;

  // ensure note exists and belongs to tenant
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.tenantId !== tenantId) return res.status(404).json({ error: 'Not found' });

  if (req.method === 'GET') {
    return res.json(note);
  }

  if (req.method === 'PUT') {
    if (!requireRole(user, ['ADMIN', 'MEMBER'])) return res.status(403).json({ error: 'Forbidden' });
    const { title, content } = req.body || {};
    const updated = await prisma.note.update({
      where: { id },
      data: { title: title ?? note.title, content: content ?? note.content }
    });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    if (!requireRole(user, ['ADMIN', 'MEMBER'])) return res.status(403).json({ error: 'Forbidden' });
    await prisma.note.delete({ where: { id } });
    return res.json({ ok: true });
  }

  return res.status(405).end();
}
