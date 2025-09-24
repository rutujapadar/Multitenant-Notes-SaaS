// pages/api/tenants/[slug]/upgrade.js
import prisma from '../../../../lib/prisma';
import applyCors from '../../../../lib/cors';
import { getUserFromRequest, requireRole } from '../../../../lib/auth';

export default async function handler(req, res) {
  await applyCors(req, res);
  if (req.method !== 'POST') return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { slug } = req.query;

  // only admin and must belong to same tenant
  if (user.tenantSlug !== slug) return res.status(403).json({ error: 'Forbidden' });
  if (!requireRole(user, ['ADMIN'])) return res.status(403).json({ error: 'Admin only' });

  // upgrade tenant plan to PRO
  const updated = await prisma.tenant.update({
    where: { slug },
    data: { plan: 'PRO' }
  });

  res.json({ ok: true, tenant: { slug: updated.slug, plan: updated.plan } });
}
