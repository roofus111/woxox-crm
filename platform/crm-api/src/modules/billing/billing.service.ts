import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  AssignSubscriptionDto,
  CreateRazorpayOrderDto,
  CreateRazorpayPaymentLinkDto,
  ListSubscriptionsQueryDto,
  UpsertCouponDto,
  UpsertPlanDto,
  VerifyRazorpayPaymentDto,
} from './dto/billing.dto';
import { createHmac, timingSafeEqual } from 'crypto';

type AuditContext = {
  actor: JwtPayload;
  ipAddress?: string;
  userAgent?: string;
};

const ACTIVE_STATUSES = ['active', 'trialing'];

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaultPlans() {
    const defaults: UpsertPlanDto[] = [
      {
        code: 'trial',
        name: 'Free Trial',
        description: 'Time-limited evaluation',
        currency: 'INR',
        amountMonthly: 0,
        amountYearly: 0,
        enabledModules: ['crm'],
        trialDays: 14,
        sortOrder: 0,
      },
      {
        code: 'starter',
        name: 'Starter',
        description: 'For small teams',
        currency: 'INR',
        amountMonthly: 199900,
        amountYearly: 1999000,
        enabledModules: ['crm'],
        maxUsers: 5,
        trialDays: 14,
        sortOrder: 1,
      },
      {
        code: 'professional',
        name: 'Professional',
        description: 'Growing companies',
        currency: 'INR',
        amountMonthly: 499900,
        amountYearly: 4999000,
        enabledModules: ['crm', 'finance', 'hrms'],
        maxUsers: 25,
        trialDays: 14,
        sortOrder: 2,
      },
      {
        code: 'enterprise',
        name: 'Enterprise',
        description: 'Full Business OS',
        currency: 'INR',
        amountMonthly: 999900,
        amountYearly: 9999000,
        enabledModules: ['crm', 'finance', 'hrms', 'legalos', 'projectsLite', 'projectsMax', 'academy', 'ecommerce'],
        trialDays: 14,
        sortOrder: 3,
      },
    ];

    for (const plan of defaults) {
      await this.prisma.plan.upsert({
        where: { code: plan.code },
        update: {
          name: plan.name,
          description: plan.description,
          amountMonthly: plan.amountMonthly,
          amountYearly: plan.amountYearly,
          enabledModules: plan.enabledModules || ['crm'],
          maxUsers: plan.maxUsers,
          trialDays: plan.trialDays ?? 14,
          sortOrder: plan.sortOrder ?? 0,
        },
        create: {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          currency: plan.currency || 'INR',
          amountMonthly: plan.amountMonthly,
          amountYearly: plan.amountYearly,
          enabledModules: plan.enabledModules || ['crm'],
          maxUsers: plan.maxUsers,
          trialDays: plan.trialDays ?? 14,
          sortOrder: plan.sortOrder ?? 0,
          isActive: true,
        },
      });
    }
  }

  async revenueStats() {
    await this.ensureDefaultPlans();
    const subs = await this.prisma.subscription.findMany({
      where: { status: { in: ACTIVE_STATUSES } },
      include: { plan: true, workspace: { select: { id: true, name: true, deletedAt: true } } },
    });

    let mrr = 0;
    let activePaid = 0;
    let trialing = 0;
    for (const s of subs) {
      if (s.workspace.deletedAt) continue;
      if (s.status === 'trialing' || (s.plan.amountMonthly === 0 && s.plan.code === 'trial')) {
        trialing += 1;
        continue;
      }
      activePaid += 1;
      const monthly =
        s.billingCycle === 'yearly'
          ? Math.round(s.plan.amountYearly / 12)
          : s.plan.amountMonthly;
      mrr += await this.applyCouponAmount(monthly, s.couponCode);
    }

    const paidThisMonth = await this.prisma.invoice.aggregate({
      where: {
        status: 'paid',
        paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amountPaid: true },
    });

    const failed = await this.prisma.invoice.count({
      where: { status: { in: ['open', 'uncollectible'] } },
    });

    return {
      success: true,
      stats: {
        mrr,
        arr: mrr * 12,
        currency: 'INR',
        activePaidSubscriptions: activePaid,
        trialingSubscriptions: trialing,
        revenueThisMonth: paidThisMonth._sum.amountPaid || 0,
        openOrFailedInvoices: failed,
        stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
        razorpayConfigured: Boolean(
          process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
        ),
      },
    };
  }

  async listPlans() {
    await this.ensureDefaultPlans();
    const plans = await this.prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
    return { success: true, plans };
  }

  async upsertPlan(dto: UpsertPlanDto, audit: AuditContext) {
    const plan = await this.prisma.plan.upsert({
      where: { code: dto.code },
      update: {
        name: dto.name,
        description: dto.description,
        currency: dto.currency || 'INR',
        amountMonthly: dto.amountMonthly,
        amountYearly: dto.amountYearly,
        enabledModules: dto.enabledModules || ['crm'],
        maxUsers: dto.maxUsers,
        maxStorageGb: dto.maxStorageGb,
        trialDays: dto.trialDays ?? 14,
        stripePriceMonthly: dto.stripePriceMonthly,
        stripePriceYearly: dto.stripePriceYearly,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      create: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        currency: dto.currency || 'INR',
        amountMonthly: dto.amountMonthly,
        amountYearly: dto.amountYearly,
        enabledModules: dto.enabledModules || ['crm'],
        maxUsers: dto.maxUsers,
        maxStorageGb: dto.maxStorageGb,
        trialDays: dto.trialDays ?? 14,
        stripePriceMonthly: dto.stripePriceMonthly,
        stripePriceYearly: dto.stripePriceYearly,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.writeAudit(audit, {
      action: 'billing.plan_upsert',
      entityType: 'plan',
      entityId: plan.id,
      workspaceId: null,
      metadata: { code: plan.code },
    });

    return { success: true, plan };
  }

  async listSubscriptions(query: ListSubscriptionsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 25, 100);
    const where: Prisma.SubscriptionWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.workspace = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { tenantCode: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.subscription.count({ where }),
      this.prisma.subscription.findMany({
        where,
        include: {
          plan: true,
          workspace: {
            select: {
              id: true,
              name: true,
              tenantCode: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { success: true, total, page, pageSize, subscriptions: items };
  }

  async getWorkspaceSubscription(workspaceId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true, invoices: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    return { success: true, subscription: sub };
  }

  async assignSubscription(dto: AssignSubscriptionDto, audit: AuditContext) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: dto.workspaceId },
    });
    if (!workspace || workspace.deletedAt) {
      throw new NotFoundException('Workspace not found');
    }

    const plan = await this.resolvePlan(dto.plan);
    if (!plan.isActive) throw new BadRequestException('Plan is inactive');

    if (dto.couponCode) {
      await this.validateCoupon(dto.couponCode);
    }

    const billingCycle = dto.billingCycle || 'monthly';
    const startTrial = dto.startTrial ?? plan.code === 'trial';
    const trialDays = plan.trialDays || 14;
    const now = new Date();
    const trialEndsAt = startTrial
      ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : null;
    const periodEnd = new Date(now);
    if (billingCycle === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Cancel previous active-like subscriptions
    await this.prisma.subscription.updateMany({
      where: {
        workspaceId: workspace.id,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
      data: { status: 'canceled', canceledAt: now, cancelAtPeriodEnd: false },
    });

    const subscription = await this.prisma.subscription.create({
      data: {
        workspaceId: workspace.id,
        planId: plan.id,
        status: startTrial ? 'trialing' : 'active',
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEndsAt,
        couponCode: dto.couponCode?.toUpperCase() || null,
      },
      include: { plan: true },
    });

    if (dto.couponCode) {
      await this.prisma.coupon.updateMany({
        where: { code: dto.couponCode.toUpperCase() },
        data: { timesRedeemed: { increment: 1 } },
      });
    }

    await this.prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        plan: plan.code,
        status: startTrial ? 'trial' : 'active',
        trialEndsAt: trialEndsAt || workspace.trialEndsAt,
        enabledModules: plan.enabledModules.length ? plan.enabledModules : workspace.enabledModules,
      },
    });

    await this.writeAudit(audit, {
      action: 'billing.subscription_assign',
      entityType: 'subscription',
      entityId: subscription.id,
      workspaceId: workspace.id,
      metadata: {
        planCode: plan.code,
        billingCycle,
        status: subscription.status,
        couponCode: dto.couponCode || null,
      },
    });

    return { success: true, subscription };
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean, audit: AuditContext) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: atPeriodEnd
        ? { cancelAtPeriodEnd: true }
        : { status: 'canceled', canceledAt: new Date(), cancelAtPeriodEnd: false },
      include: { plan: true },
    });

    if (!atPeriodEnd) {
      await this.prisma.workspace.update({
        where: { id: sub.workspaceId },
        data: { status: 'suspended' },
      });
    }

    await this.writeAudit(audit, {
      action: atPeriodEnd ? 'billing.subscription_cancel_at_period_end' : 'billing.subscription_cancel',
      entityType: 'subscription',
      entityId: subscriptionId,
      workspaceId: sub.workspaceId,
      metadata: {},
    });

    return { success: true, subscription: updated };
  }

  async listCoupons() {
    const coupons = await this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return { success: true, coupons };
  }

  async upsertCoupon(dto: UpsertCouponDto, audit: AuditContext) {
    if (!dto.percentOff && !dto.amountOff) {
      throw new BadRequestException('percentOff or amountOff required');
    }
    const code = dto.code.toUpperCase().trim();
    const coupon = await this.prisma.coupon.upsert({
      where: { code },
      update: {
        name: dto.name,
        percentOff: dto.percentOff,
        amountOff: dto.amountOff,
        currency: dto.currency || 'INR',
        maxRedemptions: dto.maxRedemptions,
        redeemBy: dto.redeemBy ? new Date(dto.redeemBy) : null,
        durationMonths: dto.durationMonths,
        isActive: dto.isActive ?? true,
      },
      create: {
        code,
        name: dto.name,
        percentOff: dto.percentOff,
        amountOff: dto.amountOff,
        currency: dto.currency || 'INR',
        maxRedemptions: dto.maxRedemptions,
        redeemBy: dto.redeemBy ? new Date(dto.redeemBy) : null,
        durationMonths: dto.durationMonths,
        isActive: dto.isActive ?? true,
      },
    });

    await this.writeAudit(audit, {
      action: 'billing.coupon_upsert',
      entityType: 'coupon',
      entityId: coupon.id,
      workspaceId: null,
      metadata: { code },
    });

    return { success: true, coupon };
  }

  async listInvoices(page = 1, pageSize = 25) {
    const take = Math.min(pageSize, 100);
    const [total, invoices] = await this.prisma.$transaction([
      this.prisma.invoice.count(),
      this.prisma.invoice.findMany({
        include: {
          workspace: { select: { id: true, name: true, tenantCode: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
    ]);
    return { success: true, total, page, pageSize: take, invoices };
  }

  /** Idempotent Stripe event processing */
  async processStripeEvent(event: {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  }) {
    const existing = await this.prisma.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing) {
      return { success: true, duplicate: true };
    }

    await this.prisma.stripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
        payload: event as unknown as Prisma.InputJsonValue,
      },
    });

    const obj = event.data?.object || {};

    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
      await this.upsertInvoiceFromStripe(obj, 'paid');
    } else if (event.type === 'invoice.payment_failed') {
      await this.upsertInvoiceFromStripe(obj, 'open');
    } else if (event.type === 'customer.subscription.updated') {
      await this.syncSubscriptionFromStripe(obj);
    } else if (event.type === 'customer.subscription.deleted') {
      const stripeSubId = String(obj.id || '');
      if (stripeSubId) {
        await this.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSubId },
          data: { status: 'canceled', canceledAt: new Date() },
        });
      }
    }

    return { success: true, duplicate: false, type: event.type };
  }

  // ─── Razorpay ───────────────────────────────────────────────────────────────

  async createRazorpayOrder(dto: CreateRazorpayOrderDto, audit: AuditContext) {
    const { workspace, plan, billingCycle, amount, currency, couponCode } =
      await this.resolvePayable(dto);

    const order = await this.razorpayRequest('POST', '/orders', {
      amount,
      currency,
      receipt: `wox-${workspace.id.slice(-10)}`,
      notes: {
        workspaceId: workspace.id,
        planCode: plan.code,
        billingCycle,
        couponCode: couponCode || '',
      },
    });

    const invoice = await this.prisma.invoice.create({
      data: {
        workspaceId: workspace.id,
        number: `RZ-${Date.now()}`,
        amountDue: amount,
        amountPaid: 0,
        currency,
        status: 'open',
        razorpayOrderId: String(order.id),
        metadata: {
          planCode: plan.code,
          billingCycle,
          couponCode: couponCode || null,
          provider: 'razorpay',
        },
      },
    });

    await this.writeAudit(audit, {
      action: 'billing.razorpay_order_create',
      entityType: 'invoice',
      entityId: invoice.id,
      workspaceId: workspace.id,
      metadata: { orderId: order.id, amount, planCode: plan.code },
    });

    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      invoiceId: invoice.id,
      workspace: { id: workspace.id, name: workspace.name },
      plan: { code: plan.code, name: plan.name },
      billingCycle,
    };
  }

  async createRazorpayPaymentLink(dto: CreateRazorpayPaymentLinkDto, audit: AuditContext) {
    const { workspace, plan, billingCycle, amount, currency, couponCode } =
      await this.resolvePayable(dto);

    const appOrigin = process.env.APP_ORIGIN || 'https://app.woxox.com';
    const link = await this.razorpayRequest('POST', '/payment_links', {
      amount,
      currency,
      accept_partial: false,
      description: `${plan.name} (${billingCycle}) — ${workspace.name}`,
      customer: {
        name: dto.customerName || workspace.name,
        email: dto.customerEmail || undefined,
      },
      notify: {
        email: Boolean(dto.customerEmail),
        sms: false,
      },
      reminder_enable: true,
      callback_url: `${appOrigin.replace(/\/$/, '')}/en/super-admin/billing`,
      callback_method: 'get',
      notes: {
        workspaceId: workspace.id,
        planCode: plan.code,
        billingCycle,
        couponCode: couponCode || '',
      },
    });

    const invoice = await this.prisma.invoice.create({
      data: {
        workspaceId: workspace.id,
        number: `RZPL-${Date.now()}`,
        amountDue: amount,
        amountPaid: 0,
        currency,
        status: 'open',
        razorpayOrderId: link.order_id ? String(link.order_id) : null,
        hostedInvoiceUrl: link.short_url ? String(link.short_url) : null,
        metadata: {
          planCode: plan.code,
          billingCycle,
          couponCode: couponCode || null,
          provider: 'razorpay',
          paymentLinkId: link.id,
        },
      },
    });

    await this.writeAudit(audit, {
      action: 'billing.razorpay_payment_link_create',
      entityType: 'invoice',
      entityId: invoice.id,
      workspaceId: workspace.id,
      metadata: { paymentLinkId: link.id, shortUrl: link.short_url, amount },
    });

    return {
      success: true,
      paymentLink: {
        id: link.id,
        shortUrl: link.short_url,
        amount: link.amount,
        currency: link.currency,
        status: link.status,
      },
      invoiceId: invoice.id,
    };
  }

  async verifyRazorpayPayment(dto: VerifyRazorpayPaymentDto, audit: AuditContext) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new BadRequestException('Razorpay is not configured');

    const payload = `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`;
    const expected = createHmac('sha256', keySecret).update(payload).digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(dto.razorpaySignature || '', 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { razorpayOrderId: dto.razorpayOrderId },
    });
    if (!invoice) throw new NotFoundException('Invoice/order not found');

    const meta = (invoice.metadata || {}) as Record<string, unknown>;
    const workspaceId = dto.workspaceId || invoice.workspaceId;
    const planCode = String(meta.planCode || 'starter');
    const billingCycle = (meta.billingCycle as 'monthly' | 'yearly') || 'monthly';

    const result = await this.assignSubscription(
      {
        workspaceId,
        plan: planCode,
        billingCycle,
        startTrial: false,
      },
      audit,
    );

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'paid',
        amountPaid: invoice.amountDue,
        razorpayPaymentId: dto.razorpayPaymentId,
        paidAt: new Date(),
        subscriptionId: result.subscription.id,
      },
    });

    await this.writeAudit(audit, {
      action: 'billing.razorpay_payment_verified',
      entityType: 'invoice',
      entityId: invoice.id,
      workspaceId,
      metadata: {
        orderId: dto.razorpayOrderId,
        paymentId: dto.razorpayPaymentId,
        planCode,
      },
    });

    return { success: true, subscription: result.subscription, invoiceId: invoice.id };
  }

  async processRazorpayEvent(
    eventId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    const existing = await this.prisma.razorpayEvent.findUnique({ where: { id: eventId } });
    if (existing) return { success: true, duplicate: true };

    await this.prisma.razorpayEvent.create({
      data: {
        id: eventId,
        type: eventType,
        payload: payload as Prisma.InputJsonValue,
      },
    });

    const entity = (((payload.payload as Record<string, unknown>)?.payment as Record<string, unknown>)
      ?.entity ||
      ((payload.payload as Record<string, unknown>)?.order as Record<string, unknown>)?.entity ||
      ((payload.payload as Record<string, unknown>)?.payment_link as Record<string, unknown>)
        ?.entity ||
      {}) as Record<string, unknown>;

    if (
      eventType === 'payment.captured' ||
      eventType === 'order.paid' ||
      eventType === 'payment_link.paid'
    ) {
      await this.markRazorpayPaidFromEntity(entity);
    } else if (eventType === 'payment.failed') {
      const orderId = entity.order_id ? String(entity.order_id) : null;
      if (orderId) {
        await this.prisma.invoice.updateMany({
          where: { razorpayOrderId: orderId, status: 'open' },
          data: { status: 'uncollectible' },
        });
      }
    }

    return { success: true, duplicate: false, type: eventType };
  }

  private async markRazorpayPaidFromEntity(entity: Record<string, unknown>) {
    const orderId = entity.order_id
      ? String(entity.order_id)
      : entity.id && String(entity.entity || '') === 'order'
        ? String(entity.id)
        : null;
    const paymentId = entity.id && String(entity.entity || entity.entity_type || '') !== 'order'
      ? String(entity.id)
      : entity.payment_id
        ? String(entity.payment_id)
        : null;

    const notes = (entity.notes || {}) as Record<string, string>;
    let invoice = orderId
      ? await this.prisma.invoice.findFirst({ where: { razorpayOrderId: orderId } })
      : null;

    if (!invoice && notes.workspaceId) {
      invoice = await this.prisma.invoice.findFirst({
        where: {
          workspaceId: notes.workspaceId,
          status: 'open',
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!invoice) return;
    if (invoice.status === 'paid') return;

    const meta = (invoice.metadata || {}) as Record<string, unknown>;
    const planCode = String(meta.planCode || notes.planCode || 'starter');
    const billingCycle =
      (meta.billingCycle as 'monthly' | 'yearly') ||
      (notes.billingCycle as 'monthly' | 'yearly') ||
      'monthly';

    const systemActor: JwtPayload = {
      sub: 'system',
      email: 'razorpay-webhook@woxox.local',
      workspaceId: invoice.workspaceId,
      role: 'SUPER_ADMIN',
    };

    const result = await this.assignSubscription(
      {
        workspaceId: invoice.workspaceId,
        plan: planCode,
        billingCycle,
        startTrial: false,
      },
      { actor: systemActor },
    );

    const amountPaid = Number(entity.amount || invoice.amountDue || 0);
    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'paid',
        amountPaid,
        razorpayPaymentId: paymentId || invoice.razorpayPaymentId,
        razorpayOrderId: orderId || invoice.razorpayOrderId,
        paidAt: new Date(),
        subscriptionId: result.subscription.id,
      },
    });
  }

  private async resolvePayable(dto: {
    workspaceId: string;
    plan: string;
    billingCycle?: 'monthly' | 'yearly';
    couponCode?: string;
  }) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: dto.workspaceId },
    });
    if (!workspace || workspace.deletedAt) throw new NotFoundException('Workspace not found');

    const plan = await this.resolvePlan(dto.plan);
    if (!plan.isActive) throw new BadRequestException('Plan is inactive');

    const billingCycle = dto.billingCycle || 'monthly';
    let amount = billingCycle === 'yearly' ? plan.amountYearly : plan.amountMonthly;
    if (amount <= 0) throw new BadRequestException('Plan amount must be greater than zero');

    if (dto.couponCode) {
      await this.validateCoupon(dto.couponCode);
      amount = await this.applyCouponAmount(amount, dto.couponCode);
    }

    return {
      workspace,
      plan,
      billingCycle,
      amount,
      currency: (plan.currency || 'INR').toUpperCase(),
      couponCode: dto.couponCode?.toUpperCase() || null,
    };
  }

  private async razorpayRequest(method: string, path: string, body?: Record<string, unknown>) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new BadRequestException(
        'Razorpay is not configured (set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)',
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & {
      error?: { description?: string };
      id?: string;
      amount?: number;
      currency?: string;
      receipt?: string;
      short_url?: string;
      status?: string;
      order_id?: string;
    };

    if (!res.ok) {
      throw new BadRequestException(
        data.error?.description || `Razorpay API failed (${res.status})`,
      );
    }
    return data;
  }

  private async upsertInvoiceFromStripe(obj: Record<string, unknown>, status: string) {
    const stripeInvoiceId = String(obj.id || '');
    if (!stripeInvoiceId) return;

    const stripeSubId = obj.subscription ? String(obj.subscription) : null;
    const sub = stripeSubId
      ? await this.prisma.subscription.findFirst({ where: { stripeSubscriptionId: stripeSubId } })
      : null;

    const amountPaid = Number(obj.amount_paid || 0);
    const amountDue = Number(obj.amount_due || 0);
    const currency = String(obj.currency || 'inr').toUpperCase();

    if (!sub) return;

    await this.prisma.invoice.upsert({
      where: { stripeInvoiceId },
      update: {
        status,
        amountPaid,
        amountDue,
        currency,
        hostedInvoiceUrl: obj.hosted_invoice_url ? String(obj.hosted_invoice_url) : null,
        pdfUrl: obj.invoice_pdf ? String(obj.invoice_pdf) : null,
        paidAt: status === 'paid' ? new Date() : null,
      },
      create: {
        workspaceId: sub.workspaceId,
        subscriptionId: sub.id,
        stripeInvoiceId,
        number: obj.number ? String(obj.number) : null,
        amountPaid,
        amountDue,
        currency,
        status,
        hostedInvoiceUrl: obj.hosted_invoice_url ? String(obj.hosted_invoice_url) : null,
        pdfUrl: obj.invoice_pdf ? String(obj.invoice_pdf) : null,
        paidAt: status === 'paid' ? new Date() : null,
      },
    });

    if (status === 'paid') {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'active' },
      });
      await this.prisma.workspace.update({
        where: { id: sub.workspaceId },
        data: { status: 'active' },
      });
    }
  }

  private async syncSubscriptionFromStripe(obj: Record<string, unknown>) {
    const stripeSubId = String(obj.id || '');
    if (!stripeSubId) return;
    const statusMap: Record<string, string> = {
      active: 'active',
      trialing: 'trialing',
      past_due: 'past_due',
      canceled: 'canceled',
      unpaid: 'unpaid',
    };
    const status = statusMap[String(obj.status || '')] || String(obj.status || 'active');
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubId },
      data: {
        status,
        cancelAtPeriodEnd: Boolean(obj.cancel_at_period_end),
        currentPeriodEnd: obj.current_period_end
          ? new Date(Number(obj.current_period_end) * 1000)
          : undefined,
      },
    });
  }

  private async resolvePlan(planRef: string) {
    const byCode = await this.prisma.plan.findUnique({ where: { code: planRef } });
    if (byCode) return byCode;
    const byId = await this.prisma.plan.findUnique({ where: { id: planRef } });
    if (byId) return byId;
    throw new NotFoundException('Plan not found');
  }

  private async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid coupon');
    if (coupon.redeemBy && coupon.redeemBy < new Date()) {
      throw new BadRequestException('Coupon expired');
    }
    if (coupon.maxRedemptions != null && coupon.timesRedeemed >= coupon.maxRedemptions) {
      throw new BadRequestException('Coupon fully redeemed');
    }
    return coupon;
  }

  private async applyCouponAmount(amount: number, code: string | null) {
    if (!code) return amount;
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) return amount;
    if (coupon.percentOff) return Math.round(amount * (1 - coupon.percentOff / 100));
    if (coupon.amountOff) return Math.max(0, amount - coupon.amountOff);
    return amount;
  }

  private async writeAudit(
    audit: AuditContext,
    data: {
      action: string;
      entityType: string;
      entityId: string | null;
      workspaceId: string | null;
      metadata: Record<string, unknown>;
    },
  ) {
    await this.prisma.platformAuditLog.create({
      data: {
        actorUserId: audit.actor.sub,
        actorEmail: audit.actor.email,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId ?? undefined,
        workspaceId: data.workspaceId ?? undefined,
        ipAddress: audit.ipAddress,
        userAgent: audit.userAgent,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
