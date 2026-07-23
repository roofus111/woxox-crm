/** System pipeline templates seeded into PipelineTemplate (workspaceId = null). */

export type SeedStageDef = {
  name: string;
  description?: string;
  sortOrder: number;
  stageType?: string;
  isWon?: boolean;
  isLost?: boolean;
  isSuccess?: boolean;
  isClosed?: boolean;
  probability?: number;
  winProbability?: number;
  color?: string;
  fields?: Array<{ fieldKey: string; label: string; fieldType?: string; isRequired?: boolean }>;
  documents?: Array<{ docKey: string; label: string; isRequired?: boolean }>;
  checklist?: Array<{ label: string; isRequired?: boolean }>;
};

export type SeedTemplateDef = {
  name: string;
  description: string;
  moduleKey: string;
  icon: string;
  color: string;
  stages: SeedStageDef[];
};

export const SYSTEM_PIPELINE_TEMPLATES: SeedTemplateDef[] = [
  {
    name: 'Sales',
    description: 'Classic B2B sales pipeline',
    moduleKey: 'crm',
    icon: 'ri-handshake-line',
    color: '#0288d1',
    stages: [
      { name: 'Lead', sortOrder: 0, probability: 10, color: '#90caf9' },
      { name: 'Qualified', sortOrder: 1, probability: 30, color: '#64b5f6' },
      { name: 'Proposal', sortOrder: 2, probability: 50, color: '#42a5f5' },
      { name: 'Negotiation', sortOrder: 3, probability: 70, color: '#1e88e5' },
      {
        name: 'Closed Won',
        sortOrder: 4,
        probability: 100,
        isWon: true,
        isSuccess: true,
        isClosed: true,
        stageType: 'success',
        color: '#43a047',
      },
      {
        name: 'Closed Lost',
        sortOrder: 5,
        probability: 0,
        isLost: true,
        isClosed: true,
        stageType: 'lost',
        color: '#e53935',
      },
    ],
  },
  {
    name: 'Immigration / Work Permit',
    description: 'Inquiry through departure for work permit cases',
    moduleKey: 'immigration',
    icon: 'ri-passport-line',
    color: '#6a1b9a',
    stages: [
      { name: 'Inquiry', sortOrder: 0, probability: 5, color: '#ce93d8' },
      {
        name: 'Documents',
        sortOrder: 1,
        probability: 15,
        documents: [
          { docKey: 'passport', label: 'Passport', isRequired: true },
          { docKey: 'cv', label: 'CV / Resume', isRequired: true },
        ],
        checklist: [
          { label: 'Passport', isRequired: true },
          { label: 'Resume', isRequired: true },
          { label: 'Experience letters', isRequired: false },
          { label: 'Degree', isRequired: false },
          { label: 'IELTS', isRequired: false },
        ],
      },
      { name: 'Eligibility', sortOrder: 2, probability: 25 },
      { name: 'Agreement', sortOrder: 3, probability: 35 },
      { name: 'Payment', sortOrder: 4, probability: 45 },
      {
        name: 'Employer Search',
        sortOrder: 5,
        probability: 55,
        documents: [{ docKey: 'experience_letter', label: 'Experience Letter', isRequired: true }],
      },
      { name: 'Job Offer', sortOrder: 6, probability: 65 },
      { name: 'Work Permit', sortOrder: 7, probability: 75 },
      {
        name: 'Visa',
        sortOrder: 8,
        probability: 85,
        fields: [
          { fieldKey: 'passport_number', label: 'Passport Number', isRequired: true },
          { fieldKey: 'embassy', label: 'Embassy', isRequired: true },
          { fieldKey: 'visa_type', label: 'Visa Type', isRequired: true },
          { fieldKey: 'appointment_date', label: 'Appointment Date', fieldType: 'date', isRequired: true },
        ],
        documents: [
          { docKey: 'medical', label: 'Medical', isRequired: true },
          { docKey: 'pcc', label: 'PCC', isRequired: true },
        ],
      },
      {
        name: 'Departure',
        sortOrder: 9,
        probability: 100,
        isWon: true,
        isSuccess: true,
        isClosed: true,
        stageType: 'success',
        documents: [
          { docKey: 'ticket', label: 'Ticket', isRequired: true },
          { docKey: 'insurance', label: 'Insurance', isRequired: true },
        ],
      },
    ],
  },
  {
    name: 'Recruitment',
    description: 'Hiring funnel from applied to hired',
    moduleKey: 'recruitment',
    icon: 'ri-user-search-line',
    color: '#00897b',
    stages: [
      { name: 'Applied', sortOrder: 0, probability: 10 },
      { name: 'Screening', sortOrder: 1, probability: 25 },
      { name: 'Interview', sortOrder: 2, probability: 45 },
      { name: 'HR Review', sortOrder: 3, probability: 65 },
      { name: 'Offer', sortOrder: 4, probability: 80 },
      {
        name: 'Hired',
        sortOrder: 5,
        probability: 100,
        isWon: true,
        isSuccess: true,
        isClosed: true,
        stageType: 'success',
      },
    ],
  },
  {
    name: 'Customer Support',
    description: 'Ticket support lifecycle',
    moduleKey: 'support',
    icon: 'ri-customer-service-2-line',
    color: '#ef6c00',
    stages: [
      { name: 'Open', sortOrder: 0, probability: 10 },
      { name: 'Assigned', sortOrder: 1, probability: 30 },
      { name: 'Investigation', sortOrder: 2, probability: 50 },
      { name: 'Waiting', sortOrder: 3, probability: 60 },
      { name: 'Resolved', sortOrder: 4, probability: 90, isSuccess: true },
      {
        name: 'Closed',
        sortOrder: 5,
        probability: 100,
        isClosed: true,
        isWon: true,
        stageType: 'closed',
      },
    ],
  },
];
