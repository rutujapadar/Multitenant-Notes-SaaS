// pages/api/auth/login.js
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signJwt } from '../../../lib/auth';
import applyCors from '../../../lib/cors';

export default async function handler(req, res) {
  await applyCors(req, res);
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  });

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signJwt({
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: user.tenant.slug
  });

  res.json({ token, tenantSlug: user.tenant.slug, role: user.role });
}
