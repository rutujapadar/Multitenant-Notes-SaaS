// lib/auth.js
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// express-like wrapper for Next.js API pages
export async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  const data = verifyJwt(token);
  if (!data) return null;
  // fetch up-to-date user & tenant from DB
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    include: { tenant: true }
  });
  if (!user) return null;
  // ensure the token's tenant slug matches DB tenant
  if (data.tenantSlug !== user.tenant.slug) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: user.tenant.slug,
    tenantPlan: user.tenant.plan
  };
}

export function requireRole(user, requiredRoles = []) {
  if (!user) return false;
  if (requiredRoles.length === 0) return true;
  return requiredRoles.includes(user.role);
}
