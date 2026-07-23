import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  isConfigured() {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  async sendWelcomeEmail(input: {
    to: string;
    companyName: string;
    adminName?: string;
    loginUrl: string;
    onboardingUrl?: string;
    plan?: string;
    temporaryPasswordHint?: boolean;
  }) {
    const onboardingUrl =
      input.onboardingUrl || input.loginUrl.replace(/\/login\/?$/, '/onboarding');
    const subject = `Welcome to WOXOX — ${input.companyName}`;
    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
        <h1 style="color:#0f766e;font-size:22px">Welcome to WOXOX</h1>
        <p>Hi ${input.adminName || 'there'},</p>
        <p><strong>${input.companyName}</strong> is ready on WOXOX Business OS${
          input.plan ? ` (${input.plan})` : ''
        }.</p>
        <p>
          <a href="${input.loginUrl}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;margin-right:8px">
            Sign in
          </a>
          <a href="${onboardingUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">
            Start onboarding
          </a>
        </p>
        <p style="color:#64748b;font-size:14px">
          Complete onboarding to set up your company profile, invite your team, and pick modules.
          ${input.temporaryPasswordHint ? 'Use the temporary password from your Super Admin, then change it.' : ''}
        </p>
        <p style="color:#94a3b8;font-size:12px">— WOXOX Control Center</p>
      </div>
    `;
    return this.send({ to: input.to, subject, html });
  }

  async send(input: { to: string; subject: string; html: string; text?: string }) {
    if (!this.isConfigured()) {
      this.logger.warn(`SMTP not configured — skipped email to ${input.to}: ${input.subject}`);
      return { sent: false, reason: 'smtp_not_configured' as const };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodemailer = require('nodemailer') as typeof import('nodemailer');
      const port = Number(process.env.SMTP_PORT || 587);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      return { sent: true as const };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'send failed';
      this.logger.error(`Email failed to ${input.to}: ${message}`);
      return { sent: false, reason: message };
    }
  }
}
