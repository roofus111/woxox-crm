import { Injectable } from '@nestjs/common';

@Injectable()
export class LegacyProvisionService {
  async provision(input: {
    companyName: string;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    enabledModules?: string[];
  }): Promise<{ ok: boolean; message: string }> {
    const base = process.env.LEGACY_API_URL || process.env.BACKEND_API_URL;
    const secret = process.env.SUPER_ADMIN_PROVISION_SECRET;
    if (!base || !secret) {
      return {
        ok: false,
        message: 'Legacy provision skipped (LEGACY_API_URL / SUPER_ADMIN_PROVISION_SECRET not set)',
      };
    }

    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/super-admin/provision-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-super-admin-secret': secret,
        },
        body: JSON.stringify({
          companyName: input.companyName,
          adminEmail: input.adminEmail,
          adminPassword: input.adminPassword,
          adminName: input.adminName,
          enabledModules: input.enabledModules?.length ? input.enabledModules : ['crm'],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        return { ok: false, message: data.message || `Legacy provision failed (${res.status})` };
      }
      return { ok: true, message: data.message || 'Legacy company created' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Legacy provision error';
      return { ok: false, message };
    }
  }
}
