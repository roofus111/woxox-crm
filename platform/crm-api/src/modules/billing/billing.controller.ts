import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  HttpCode,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import {
  AssignSubscriptionDto,
  CreateRazorpayOrderDto,
  CreateRazorpayPaymentLinkDto,
  ListSubscriptionsQueryDto,
  UpsertCouponDto,
  UpsertPlanDto,
  VerifyRazorpayPaymentDto,
} from './dto/billing.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  private auditCtx(user: JwtPayload, req: Request) {
    return {
      actor: user,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  @Get('revenue')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  revenue() {
    return this.billing.revenueStats();
  }

  @Get('plans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  listPlans() {
    return this.billing.listPlans();
  }

  @Post('plans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  upsertPlan(
    @Body() dto: UpsertPlanDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.billing.upsertPlan(dto, this.auditCtx(user, req));
  }

  @Get('subscriptions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  listSubscriptions(@Query() query: ListSubscriptionsQueryDto) {
    return this.billing.listSubscriptions(query);
  }

  @Get('subscriptions/workspace/:workspaceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  workspaceSubscription(@Param('workspaceId') workspaceId: string) {
    return this.billing.getWorkspaceSubscription(workspaceId);
  }

  @Post('subscriptions/assign')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  assign(
    @Body() dto: AssignSubscriptionDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.billing.assignSubscription(dto, this.auditCtx(user, req));
  }

  @Post('subscriptions/:id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  cancel(
    @Param('id') id: string,
    @Body() body: { atPeriodEnd?: boolean },
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.billing.cancelSubscription(id, Boolean(body?.atPeriodEnd), this.auditCtx(user, req));
  }

  @Get('coupons')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  listCoupons() {
    return this.billing.listCoupons();
  }

  @Post('coupons')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  upsertCoupon(
    @Body() dto: UpsertCouponDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.billing.upsertCoupon(dto, this.auditCtx(user, req));
  }

  @Get('invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  listInvoices(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.billing.listInvoices(Number(page) || 1, Number(pageSize) || 25);
  }

  @Post('razorpay/orders')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  createRazorpayOrder(
    @Body() dto: CreateRazorpayOrderDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.billing.createRazorpayOrder(dto, this.auditCtx(user, req));
  }

  @Post('razorpay/payment-links')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  createRazorpayPaymentLink(
    @Body() dto: CreateRazorpayPaymentLinkDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.billing.createRazorpayPaymentLink(dto, this.auditCtx(user, req));
  }

  @Post('razorpay/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  verifyRazorpayPayment(
    @Body() dto: VerifyRazorpayPaymentDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.billing.verifyRazorpayPayment(dto, this.auditCtx(user, req));
  }

  /**
   * Razorpay webhook — verifies X-Razorpay-Signature when RAZORPAY_WEBHOOK_SECRET is set.
   * Idempotent via RazorpayEvent table.
   */
  @Post('webhooks/razorpay')
  @HttpCode(200)
  async razorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string | undefined,
    @Headers('x-razorpay-event-id') eventIdHeader: string | undefined,
  ) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const raw = req.rawBody;

    if (secret) {
      if (!signature || !raw) {
        throw new UnauthorizedException('Missing Razorpay signature or raw body');
      }
      const expected = createHmac('sha256', secret).update(raw).digest('hex');
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(signature, 'utf8');
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new UnauthorizedException('Invalid Razorpay signature');
      }
    }

    let payload: Record<string, unknown>;
    try {
      const text = raw ? raw.toString('utf8') : JSON.stringify(req.body);
      payload = JSON.parse(text);
    } catch {
      throw new BadRequestException('Invalid JSON');
    }

    const eventType = String(payload.event || '');
    if (!eventType) throw new BadRequestException('Missing event type');

    const eventId =
      eventIdHeader ||
      String(payload.event_id || '') ||
      `${eventType}:${Date.now()}`;

    const result = await this.billing.processRazorpayEvent(eventId, eventType, payload);
    return { received: true, ...result };
  }

  /**
   * Stripe webhook — verifies signature when STRIPE_WEBHOOK_SECRET is set.
   * Idempotent via StripeEvent table.
   */
  @Post('webhooks/stripe')
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const raw = req.rawBody;

    if (secret) {
      if (!signature || !raw) {
        throw new UnauthorizedException('Missing Stripe signature or raw body');
      }
      const valid = this.verifyStripeSignature(raw, signature, secret);
      if (!valid) {
        throw new UnauthorizedException('Invalid Stripe signature');
      }
    }

    let event: { id: string; type: string; data: { object: Record<string, unknown> } };
    try {
      const text = raw ? raw.toString('utf8') : JSON.stringify(req.body);
      event = JSON.parse(text);
    } catch {
      throw new BadRequestException('Invalid JSON');
    }

    if (!event?.id || !event?.type) {
      throw new BadRequestException('Invalid event');
    }

    const result = await this.billing.processStripeEvent(event);
    return { received: true, ...result };
  }

  private verifyStripeSignature(payload: Buffer, header: string, secret: string) {
    try {
      const parts = Object.fromEntries(
        header.split(',').map((p) => {
          const [k, v] = p.split('=');
          return [k, v];
        }),
      );
      const timestamp = parts.t;
      const sig = parts.v1;
      if (!timestamp || !sig) return false;
      const age = Math.abs(Date.now() / 1000 - Number(timestamp));
      if (age > 300) return false;
      const signed = `${timestamp}.${payload.toString('utf8')}`;
      const expected = createHmac('sha256', secret).update(signed).digest('hex');
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(sig, 'utf8');
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
}
