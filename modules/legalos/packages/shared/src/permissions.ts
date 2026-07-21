/** Granular permission keys for WOXOX LegalOS RBAC. */
export const LEGAL_PERMISSIONS = [
  'legal.case.read',
  'legal.case.create',
  'legal.case.update',
  'legal.case.archive',
  'legal.case.export',
  'legal.complaint.read',
  'legal.complaint.create',
  'legal.complaint.update',
  'legal.complaint.convert_to_fir',
  'legal.fir.read',
  'legal.fir.create',
  'legal.fir.update',
  'legal.evidence.read',
  'legal.evidence.upload',
  'legal.evidence.download',
  'legal.evidence.seal',
  'legal.research.use',
  'legal.ai.use',
  'legal.analytics.read',
  'legal.integration.manage',
  'legal.admin.manage',
  'legal.dashboard.read',
  'legal.org.manage',
  'legal.warroom.use',
  'legal.conflict.check',
  'legal.portal.manage',
  'legal.time.record',
  'legal.workflow.approve',
] as const;


export type LegalPermission = (typeof LEGAL_PERMISSIONS)[number];

/** Permission groupings for UI and policy helpers. */
export const LEGAL_PERMISSION_GROUPS = {
  case: [
    'legal.case.read',
    'legal.case.create',
    'legal.case.update',
    'legal.case.archive',
    'legal.case.export',
  ],
  complaint: [
    'legal.complaint.read',
    'legal.complaint.create',
    'legal.complaint.update',
    'legal.complaint.convert_to_fir',
  ],
  fir: ['legal.fir.read', 'legal.fir.create', 'legal.fir.update'],
  evidence: [
    'legal.evidence.read',
    'legal.evidence.upload',
    'legal.evidence.download',
    'legal.evidence.seal',
  ],
  research: ['legal.research.use'],
  ai: ['legal.ai.use'],
  analytics: ['legal.analytics.read'],
  integration: ['legal.integration.manage'],
  admin: ['legal.admin.manage', 'legal.org.manage'],
  dashboard: ['legal.dashboard.read'],
  warroom: ['legal.warroom.use'],
  conflict: ['legal.conflict.check'],
  portal: ['legal.portal.manage'],
  time: ['legal.time.record'],
  workflow: ['legal.workflow.approve'],
} as const satisfies Record<string, readonly LegalPermission[]>;

/** Runtime guard for permission key validation. */
export function isLegalPermission(value: string): value is LegalPermission {
  return (LEGAL_PERMISSIONS as readonly string[]).includes(value);
}
