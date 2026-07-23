import {
  PrismaClient,
  Role,
  LeadSource,
  LeadStatus,
  ActivityType,
  TaskStatus,
  TaskPriority,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_STAGES = [
  { name: 'Qualification', probability: 10, sortOrder: 0 },
  { name: 'Proposal', probability: 40, sortOrder: 1 },
  { name: 'Negotiation', probability: 70, sortOrder: 2 },
  { name: 'Won', probability: 100, sortOrder: 3, isWon: true },
  { name: 'Lost', probability: 0, sortOrder: 4, isLost: true },
];

async function main() {
  const email = 'admin@woxox.local';
  const password = 'admin123';

  let workspace = await prisma.workspace.findFirst({ where: { slug: 'woxox-demo' } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: 'WOXOX Demo', slug: 'woxox-demo', plan: 'enterprise' },
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: 'WOXOX Admin',
      emailVerified: new Date(),
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: Role.SUPER_ADMIN },
    create: { workspaceId: workspace.id, userId: user.id, role: Role.SUPER_ADMIN },
  });

  // Ensure control-plane workspace fields exist on demo tenant
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      ...(workspace.tenantCode ? {} : { tenantCode: 'WOX-000001' }),
      status: 'active',
      enabledModules: workspace.enabledModules?.length
        ? workspace.enabledModules
        : ['crm', 'finance', 'hrms', 'legalos', 'projectsLite', 'projectsMax'],
      plan: workspace.plan || 'enterprise',
    },
  });

  let pipeline = await prisma.pipeline.findFirst({
    where: { workspaceId: workspace.id, isDefault: true },
    include: { stages: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        workspaceId: workspace.id,
        name: 'Sales Pipeline',
        moduleKey: 'crm',
        isDefault: true,
        stages: {
          create: [
            { name: 'Qualification', probability: 10, winProbability: 10, sortOrder: 0 },
            { name: 'Proposal', probability: 40, winProbability: 40, sortOrder: 1 },
            { name: 'Negotiation', probability: 70, winProbability: 70, sortOrder: 2 },
            {
              name: 'Won',
              probability: 100,
              winProbability: 100,
              sortOrder: 3,
              isWon: true,
              isSuccess: true,
              isClosed: true,
              stageType: 'success',
            },
            {
              name: 'Lost',
              probability: 0,
              winProbability: 0,
              sortOrder: 4,
              isLost: true,
              isClosed: true,
              stageType: 'lost',
            },
          ],
        },
      },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  // Seed system pipeline templates
  const { SYSTEM_PIPELINE_TEMPLATES } = await import('../src/modules/pipelines/pipeline-templates.seed');
  for (const tpl of SYSTEM_PIPELINE_TEMPLATES) {
    const existing = await prisma.pipelineTemplate.findFirst({
      where: { isSystem: true, name: tpl.name, moduleKey: tpl.moduleKey, workspaceId: null },
    });
    if (!existing) {
      await prisma.pipelineTemplate.create({
        data: {
          name: tpl.name,
          description: tpl.description,
          moduleKey: tpl.moduleKey,
          icon: tpl.icon,
          color: tpl.color,
          isSystem: true,
          stagesJson: tpl.stages,
        },
      });
    }
  }

  const qualification = pipeline.stages.find((s) => s.name === 'Qualification')!;
  const proposal = pipeline.stages.find((s) => s.name === 'Proposal')!;
  const negotiation = pipeline.stages.find((s) => s.name === 'Negotiation')!;

  const leadCount = await prisma.lead.count({ where: { workspaceId: workspace.id } });
  if (leadCount === 0) {
    await prisma.lead.createMany({
      data: [
        {
          workspaceId: workspace.id,
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya@example.com',
          phone: '+91 98765 43210',
          companyName: 'Acme Retail',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          score: 72,
          ownerId: user.id,
        },
        {
          workspaceId: workspace.id,
          firstName: 'Rahul',
          lastName: 'Verma',
          email: 'rahul@example.com',
          companyName: 'Nova Tech',
          source: LeadSource.GOOGLE_ADS,
          status: LeadStatus.QUALIFIED,
          score: 88,
          ownerId: user.id,
        },
        {
          workspaceId: workspace.id,
          firstName: 'Anita',
          lastName: 'Das',
          email: 'anita@example.com',
          source: LeadSource.WHATSAPP,
          status: LeadStatus.CONTACTED,
          score: 55,
          ownerId: user.id,
        },
      ],
    });
  }

  const companyCount = await prisma.company.count({ where: { workspaceId: workspace.id } });
  let acme: { id: string } | null = null;
  let nova: { id: string } | null = null;

  if (companyCount === 0) {
    acme = await prisma.company.create({
      data: {
        workspaceId: workspace.id,
        name: 'Acme Retail Pvt Ltd',
        industry: 'Retail',
        website: 'https://acme.example.com',
        revenue: 25000000,
        employeeCount: 120,
        ownerId: user.id,
      },
    });
    nova = await prisma.company.create({
      data: {
        workspaceId: workspace.id,
        name: 'Nova Tech Solutions',
        industry: 'Technology',
        website: 'https://nova.example.com',
        revenue: 85000000,
        employeeCount: 340,
        ownerId: user.id,
      },
    });
  } else {
    acme = await prisma.company.findFirst({ where: { workspaceId: workspace.id, name: { contains: 'Acme' } } });
    nova = await prisma.company.findFirst({ where: { workspaceId: workspace.id, name: { contains: 'Nova' } } });
  }

  const contactCount = await prisma.contact.count({ where: { workspaceId: workspace.id } });
  let priya: { id: string } | null = null;
  if (contactCount === 0 && acme && nova) {
    priya = await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        companyId: acme.id,
        firstName: 'Priya',
        lastName: 'Sharma',
        emails: ['priya@acme.example.com'],
        phones: ['+91 98765 43210'],
        jobTitle: 'Procurement Head',
        ownerId: user.id,
      },
    });
    await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        companyId: nova.id,
        firstName: 'Rahul',
        lastName: 'Verma',
        emails: ['rahul@nova.example.com'],
        phones: ['+91 91234 56789'],
        jobTitle: 'CTO',
        ownerId: user.id,
      },
    });
  } else {
    priya = await prisma.contact.findFirst({ where: { workspaceId: workspace.id, firstName: 'Priya' } });
  }

  const dealCount = await prisma.deal.count({ where: { workspaceId: workspace.id } });
  if (dealCount === 0 && priya && acme) {
    const deal1 = await prisma.deal.create({
      data: {
        workspaceId: workspace.id,
        pipelineId: pipeline.id,
        stageId: proposal.id,
        contactId: priya.id,
        companyId: acme.id,
        title: 'Acme — Annual CRM License',
        amount: 450000,
        currency: 'INR',
        probability: 40,
        ownerId: user.id,
        expectedCloseAt: new Date(Date.now() + 14 * 86400000),
      },
    });
    const deal2 = await prisma.deal.create({
      data: {
        workspaceId: workspace.id,
        pipelineId: pipeline.id,
        stageId: negotiation.id,
        companyId: nova?.id,
        title: 'Nova — Enterprise Rollout',
        amount: 1200000,
        currency: 'INR',
        probability: 70,
        ownerId: user.id,
        expectedCloseAt: new Date(Date.now() + 7 * 86400000),
      },
    });

    await prisma.activity.createMany({
      data: [
        {
          workspaceId: workspace.id,
          type: ActivityType.CALL,
          subject: 'Discovery call with Priya',
          body: 'Discussed CRM requirements and timeline.',
          ownerId: user.id,
          contactId: priya.id,
          dealId: deal1.id,
          completedAt: new Date(),
        },
        {
          workspaceId: workspace.id,
          type: ActivityType.MEETING,
          subject: 'Proposal review — Nova Tech',
          dueAt: new Date(Date.now() + 2 * 86400000),
          ownerId: user.id,
          dealId: deal2.id,
        },
        {
          workspaceId: workspace.id,
          type: ActivityType.TASK,
          subject: 'Send revised quote to Acme',
          dueAt: new Date(),
          ownerId: user.id,
          dealId: deal1.id,
        },
      ],
    });
  }

  const taskCount = await prisma.task.count({ where: { workspaceId: workspace.id } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          workspaceId: workspace.id,
          title: 'Follow up with qualified leads',
          status: TaskStatus.OPEN,
          priority: TaskPriority.HIGH,
          dueAt: new Date(),
          ownerId: user.id,
          assigneeId: user.id,
        },
        {
          workspaceId: workspace.id,
          title: 'Prepare Q3 pipeline report',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          dueAt: new Date(Date.now() + 3 * 86400000),
          ownerId: user.id,
          assigneeId: user.id,
        },
      ],
    });
  }

  console.log('[seed] Workspace:', workspace.slug);
  console.log('[seed] Pipeline:', pipeline.id);
  console.log('[seed] Login:', email, '/', password);

  const planDefaults = [
    { code: 'trial', name: 'Free Trial', amountMonthly: 0, amountYearly: 0, enabledModules: ['crm'], sortOrder: 0 },
    { code: 'starter', name: 'Starter', amountMonthly: 199900, amountYearly: 1999000, enabledModules: ['crm'], sortOrder: 1, maxUsers: 5 },
    {
      code: 'professional',
      name: 'Professional',
      amountMonthly: 499900,
      amountYearly: 4999000,
      enabledModules: ['crm', 'finance', 'hrms'],
      sortOrder: 2,
      maxUsers: 25,
    },
    {
      code: 'enterprise',
      name: 'Enterprise',
      amountMonthly: 999900,
      amountYearly: 9999000,
      enabledModules: ['crm', 'finance', 'hrms', 'legalos', 'projectsLite', 'projectsMax', 'academy', 'ecommerce'],
      sortOrder: 3,
    },
  ] as const;

  for (const p of planDefaults) {
    await prisma.plan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        amountMonthly: p.amountMonthly,
        amountYearly: p.amountYearly,
        enabledModules: [...p.enabledModules],
        sortOrder: p.sortOrder,
        maxUsers: 'maxUsers' in p ? p.maxUsers : undefined,
      },
      create: {
        code: p.code,
        name: p.name,
        currency: 'INR',
        amountMonthly: p.amountMonthly,
        amountYearly: p.amountYearly,
        enabledModules: [...p.enabledModules],
        sortOrder: p.sortOrder,
        maxUsers: 'maxUsers' in p ? p.maxUsers : undefined,
        isActive: true,
      },
    });
  }

  const enterprise = await prisma.plan.findUnique({ where: { code: 'enterprise' } });
  if (enterprise) {
    const existingSub = await prisma.subscription.findFirst({
      where: { workspaceId: workspace.id, status: { in: ['active', 'trialing'] } },
    });
    if (!existingSub) {
      const periodEnd = new Date();
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      await prisma.subscription.create({
        data: {
          workspaceId: workspace.id,
          planId: enterprise.id,
          status: 'active',
          billingCycle: 'yearly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });
    }
  }

  console.log('[seed] Billing plans ready');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
