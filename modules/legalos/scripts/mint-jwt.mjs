#!/usr/bin/env node
/**
 * Mint a production-shaped JWT for LegalOS.
 * Usage:
 *   node scripts/mint-jwt.mjs
 * Env:
 *   JWT_SECRET (required, >=32 chars)
 *   JWT_ISSUER / JWT_AUDIENCE (optional)
 */
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  console.error('Set JWT_SECRET to at least 32 characters');
  process.exit(1);
}

const workspaceId = process.env.WORKSPACE_ID || '000000000000000000000001';
const userId = process.env.USER_ID || '0000000000000000000000aa';

const options = {
  expiresIn: process.env.JWT_EXPIRES_IN || '12h',
};
if (process.env.JWT_ISSUER) options.issuer = process.env.JWT_ISSUER;
if (process.env.JWT_AUDIENCE) options.audience = process.env.JWT_AUDIENCE;

const token = jwt.sign(
  {
    sub: userId,
    email: process.env.USER_EMAIL || 'advocate@firm.example',
    name: process.env.USER_NAME || 'Advocate',
    roles: ['legal-admin', 'advocate'],
    workspaceIds: [workspaceId],
  },
  secret,
  options,
);

console.log(token);
