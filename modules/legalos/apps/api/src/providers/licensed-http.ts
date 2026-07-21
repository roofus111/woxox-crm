import { env } from '../config/env.js';
import type { ProviderResult } from './types.js';

export async function licensedGetJson<T>(
  provider: string,
  url: string,
  headers: Record<string, string> = {},
): Promise<ProviderResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        provider,
        fetchedAt: new Date().toISOString(),
        error: {
          code: 'PROVIDER_HTTP_ERROR',
          message: `${provider} returned ${res.status}: ${text.slice(0, 240)}`,
        },
      };
    }

    const data = (await res.json()) as T;
    return {
      ok: true,
      provider,
      fetchedAt: new Date().toISOString(),
      data,
    };
  } catch (err) {
    return {
      ok: false,
      provider,
      fetchedAt: new Date().toISOString(),
      error: {
        code: 'PROVIDER_NETWORK_ERROR',
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function ecourtsAccessToken(): Promise<string | null> {
  if (!env.ECOURTS_BASE_URL || !env.ECOURTS_CLIENT_ID || !env.ECOURTS_CLIENT_SECRET) {
    return null;
  }

  const tokenUrl = `${env.ECOURTS_BASE_URL.replace(/\/$/, '')}/oauth/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.ECOURTS_CLIENT_ID,
    client_secret: env.ECOURTS_CLIENT_SECRET,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    return null;
  }

  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}
