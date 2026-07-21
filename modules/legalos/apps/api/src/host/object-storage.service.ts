import { createHash, randomBytes } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env, isProduction, s3FullyConfigured } from '../config/env.js';
import { ApiError } from '../common/ApiError.js';
import { logger } from '../common/logger.js';

export interface UploadIntentInput {
  workspaceId: string;
  mimeType: string;
  sizeBytes: number;
  filename: string;
  purpose?: string;
}

export interface UploadIntent {
  key: string;
  bucket: string;
  uploadUrl: string;
  expiresAt: Date;
  headers: Record<string, string>;
  maxBytes: number;
}

/**
 * Object storage — real S3 presign when credentials are set; stub URLs only in development.
 */
export class ObjectStorageService {
  private readonly client: S3Client | null;

  constructor() {
    if (s3FullyConfigured) {
      this.client = new S3Client({
        region: env.S3_REGION!,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID!,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
        },
        ...(env.S3_ENDPOINT
          ? {
              endpoint: env.S3_ENDPOINT,
              forcePathStyle: env.S3_FORCE_PATH_STYLE ?? true,
            }
          : {}),
      });
    } else {
      this.client = null;
      if (isProduction && env.LEGALOS_REQUIRE_S3) {
        logger.error('S3 required but not configured');
      } else if (!isProduction) {
        logger.warn('S3 credentials missing — using stub upload URLs (development only)');
      }
    }
  }

  isConfigured(): boolean {
    return Boolean(this.client);
  }

  assertUploadAllowed(mimeType: string, sizeBytes: number): void {
    if (sizeBytes <= 0) {
      throw ApiError.badRequest('Upload size must be positive');
    }

    if (sizeBytes > env.LEGALOS_MAX_UPLOAD_BYTES) {
      throw ApiError.badRequest(
        `Upload exceeds maximum size of ${env.LEGALOS_MAX_UPLOAD_BYTES} bytes`,
      );
    }

    const allowedPrefixes = [
      'image/',
      'video/',
      'audio/',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
    ];

    const allowed = allowedPrefixes.some((p) => mimeType.startsWith(p));
    if (!allowed) {
      throw ApiError.badRequest(`MIME type not allowed: ${mimeType}`);
    }
  }

  buildObjectKey(workspaceId: string, filename: string): string {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `legal/${workspaceId}/${new Date().toISOString().slice(0, 10)}/${uuidv4()}-${safeName}`;
  }

  async createPrivateUploadIntent(input: UploadIntentInput): Promise<UploadIntent> {
    this.assertUploadAllowed(input.mimeType, input.sizeBytes);

    if (isProduction && !this.client) {
      throw ApiError.badRequest('Object storage is not configured for production uploads');
    }

    const bucket = env.S3_BUCKET ?? 'woxox-legalos-dev';
    const key = this.buildObjectKey(input.workspaceId, input.filename);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const headers: Record<string, string> = {
      'Content-Type': input.mimeType,
      'x-amz-meta-workspace-id': input.workspaceId,
      ...(input.purpose ? { 'x-amz-meta-purpose': input.purpose } : {}),
    };

    if (this.client) {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: input.mimeType,
        Metadata: {
          'workspace-id': input.workspaceId,
          ...(input.purpose ? { purpose: input.purpose } : {}),
        },
      });
      const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });
      return {
        key,
        bucket,
        uploadUrl,
        expiresAt,
        headers,
        maxBytes: env.LEGALOS_MAX_UPLOAD_BYTES,
      };
    }

    const signature = createHash('sha256')
      .update(`${key}:${input.sizeBytes}:${randomBytes(8).toString('hex')}`)
      .digest('hex')
      .slice(0, 16);

    return {
      key,
      bucket,
      uploadUrl: `https://${bucket}.s3.${env.S3_REGION ?? 'ap-south-1'}.amazonaws.com/${key}?X-Amz-Stub=${signature}`,
      expiresAt,
      headers,
      maxBytes: env.LEGALOS_MAX_UPLOAD_BYTES,
    };
  }

  async getDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const bucket = env.S3_BUCKET ?? 'woxox-legalos-dev';

    if (this.client) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    }

    if (isProduction) {
      throw ApiError.badRequest('Object storage is not configured for production downloads');
    }

    return `https://${bucket}.s3.${env.S3_REGION ?? 'ap-south-1'}.amazonaws.com/${key}?download=1&expires=${expiresInSeconds}`;
  }
}

export const objectStorageService = new ObjectStorageService();
