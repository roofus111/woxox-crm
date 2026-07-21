import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// From apps/api/src/config → api package root is ../.., monorepo root is ../../../..
const configDir = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(configDir, '../..');
const monoRoot = path.resolve(configDir, '../../../..');
loadDotenv({ path: path.join(monoRoot, '.env') });
loadDotenv({ path: path.join(apiRoot, '.env'), override: true });
loadDotenv(); // cwd fallback

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/woxox_legalos'),
    LEGALOS_USE_MEMORY_MONGO: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    JWT_SECRET: z.string().optional(),
    JWT_ISSUER: z.string().optional(),
    JWT_AUDIENCE: z.string().optional(),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    TRUST_PROXY: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    WORKSPACE_AUTH_MODE: z.enum(['claim', 'header', 'open']).default('header'),

    LEGALOS_ENABLED: z
      .string()
      .optional()
      .transform((v) => v !== 'false' && v !== '0'),
    LEGALOS_SEED_DEMO: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    LEGALOS_PROVIDER_ECOURTS_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    LEGALOS_PROVIDER_SCC_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    LEGALOS_PROVIDER_MANUPATRA_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    LEGALOS_MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(104857600),
    LEGALOS_EVIDENCE_HASH_ALGORITHM: z.enum(['sha256']).default('sha256'),
    LEGALOS_AI_MODEL: z.string().default('gpt-4o-mini'),
    LEGALOS_REQUIRE_S3: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),

    OPENAI_API_KEY: z.string().optional(),
    OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),

    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_FORCE_PATH_STYLE: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),

    ECOURTS_BASE_URL: z.string().optional(),
    ECOURTS_CLIENT_ID: z.string().optional(),
    ECOURTS_CLIENT_SECRET: z.string().optional(),
    SCC_ONLINE_API_KEY: z.string().optional(),
    MANUPATRA_API_KEY: z.string().optional(),

    /** Optional WOXOX platform base URL for future host bridging */
    WOXOX_HOST_API_URL: z.string().optional(),

    /** Shared secret for CRM → LegalOS SSO bridge */
    CRM_BRIDGE_SECRET: z.string().optional(),
    /** Default workspace when CRM users enter LegalOS */
    CRM_DEFAULT_WORKSPACE_ID: z.string().default('000000000000000000000001'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.JWT_SECRET || data.JWT_SECRET.length < 32 || data.JWT_SECRET === 'change-me-in-production') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'Production requires JWT_SECRET with at least 32 characters',
        });
      }
      if (data.LEGALOS_USE_MEMORY_MONGO) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['LEGALOS_USE_MEMORY_MONGO'],
          message: 'In-memory Mongo is forbidden in production',
        });
      }
      if (!data.CORS_ORIGIN || data.CORS_ORIGIN.includes('*')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CORS_ORIGIN'],
          message: 'Production CORS_ORIGIN must be set to explicit origin(s), not *',
        });
      }
      if (
        data.CORS_ORIGIN.includes('localhost') &&
        process.env.ALLOW_LOCALHOST_CORS !== 'true'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CORS_ORIGIN'],
          message: 'Production CORS_ORIGIN should not use localhost (set ALLOW_LOCALHOST_CORS=true to override)',
        });
      }
      if (data.WORKSPACE_AUTH_MODE === 'open') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['WORKSPACE_AUTH_MODE'],
          message: 'WORKSPACE_AUTH_MODE=open is forbidden in production',
        });
      }
      if (data.WORKSPACE_AUTH_MODE === 'header') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['WORKSPACE_AUTH_MODE'],
          message: 'Production requires WORKSPACE_AUTH_MODE=claim (JWT workspaceIds)',
        });
      }
      if (data.LEGALOS_REQUIRE_S3) {
        if (!data.S3_BUCKET || !data.S3_REGION || !data.S3_ACCESS_KEY_ID || !data.S3_SECRET_ACCESS_KEY) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_BUCKET'],
            message: 'LEGALOS_REQUIRE_S3=true needs S3_BUCKET, S3_REGION, and credentials',
          });
        }
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const demoAuthEnabled =
  isDevelopment && (!env.JWT_SECRET || env.JWT_SECRET === 'change-me-in-production');

/** Shared signing/verification secret (local fallback only outside production). */
export function resolveJwtSecret(): string {
  if (env.JWT_SECRET && env.JWT_SECRET !== 'change-me-in-production') {
    return env.JWT_SECRET;
  }
  if (isProduction) {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'legalos-local-dev-secret-do-not-use-in-prod';
}

export const s3FullyConfigured = Boolean(
  env.S3_BUCKET && env.S3_REGION && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY,
);
