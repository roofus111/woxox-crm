import { TransitionValidatorService } from '../src/modules/pipelines/transition-validator.service';

describe('TransitionValidatorService checklist/fields', () => {
  const makePrisma = (overrides: Record<string, unknown> = {}) =>
    ({
      pipeline: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'pipe1',
          stages: [
            {
              id: 's1',
              sortOrder: 0,
              requiresApproval: false,
              fields: [{ fieldKey: 'passport', label: 'Passport', isRequired: true }],
              documents: [{ docKey: 'cv', label: 'CV', isRequired: true }],
              checklist: [{ id: 'c1', label: 'Passport', isRequired: true }],
              permissions: [],
              transitionsFrom: [],
              ...((overrides.fromStage as object) || {}),
            },
            {
              id: 's2',
              sortOrder: 1,
              requiresApproval: false,
              fields: [],
              documents: [],
              checklist: [],
              permissions: [],
              transitionsFrom: [],
            },
          ],
        }),
      },
      pipelineRecord: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    }) as any;

  it('blocks when required field/doc/checklist missing', async () => {
    const prisma = makePrisma();
    const svc = new TransitionValidatorService(prisma);
    const result = await svc.validate('ws1', 'pipe1', {
      fromStageId: 's1',
      toStageId: 's2',
      fieldValues: {},
      documents: {},
      checklist: {},
    });
    expect(result.allowed).toBe(false);
    expect(result.errors.some((e) => e.includes('Passport'))).toBe(true);
    expect(result.errors.some((e) => e.includes('CV'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Checklist'))).toBe(true);
  });

  it('allows when requirements satisfied', async () => {
    const prisma = makePrisma();
    const svc = new TransitionValidatorService(prisma);
    const result = await svc.validate('ws1', 'pipe1', {
      fromStageId: 's1',
      toStageId: 's2',
      fieldValues: { passport: 'A123' },
      documents: { cv: { uploaded: true } },
      checklist: { c1: true },
    });
    expect(result.allowed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('blocks when explicit transition rule does not allow edge', async () => {
    const prisma = makePrisma({
      fromStage: {
        transitionsFrom: [{ id: 'r1', toStageId: 'other', isActive: true }],
      },
    });
    const svc = new TransitionValidatorService(prisma);
    const result = await svc.validate('ws1', 'pipe1', {
      fromStageId: 's1',
      toStageId: 's2',
      fieldValues: { passport: 'A123' },
      documents: { cv: { url: 'http://x' } },
      checklist: { c1: true },
    });
    expect(result.allowed).toBe(false);
    expect(result.errors.some((e) => e.includes('not allowed'))).toBe(true);
  });
});
