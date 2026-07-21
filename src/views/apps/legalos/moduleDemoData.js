/** Realistic demo datasets so every LegalOS module feels populated without live API. */

const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const DEMO = {
  matters: [
    { primary: 'WP(C) 482/2024', secondary: 'Sharma vs State of Delhi', status: 'ACTIVE', meta: 'DHC · Constitutional', owner: 'Adv. Ananya Rao', due: '22 Jul 2026' },
    { primary: 'CRL.A. 1190/2023', secondary: 'Mehta Bail Application', status: 'URGENT', meta: 'Sessions · Saket', owner: 'Adv. Rohan Kapoor', due: '20 Jul 2026' },
    { primary: 'CS(COMM) 215/2025', secondary: 'Meridian Infra vs Axis', status: 'ACTIVE', meta: 'Commercial · Arbitration', owner: 'Adv. Priya Nair', due: '01 Aug 2026' },
    { primary: 'OA 88/2024', secondary: 'GST Notice — Sharma Holdings', status: 'PENDING', meta: 'Tribunal', owner: 'Adv. Ananya Rao', due: '25 Jul 2026' },
    { primary: 'ARB/2025/14', secondary: 'Axis Settlement Seat SIAC', status: 'REVIEW', meta: 'SIAC · Singapore', owner: 'Adv. Priya Nair', due: '05 Aug 2026' }
  ],
  clients: [
    { primary: 'Sharma Holdings Pvt Ltd', secondary: 'Corporate · Delhi · KYC verified', status: 'ACTIVE', meta: '4 matters', owner: 'Partner desk', due: '—' },
    { primary: 'Meridian Infrastructure', secondary: 'Infra · Gurugram', status: 'ACTIVE', meta: '2 matters', owner: 'Priya Nair', due: '—' },
    { primary: 'Ravi Mehta', secondary: 'Individual · Bail counsel', status: 'ACTIVE', meta: '1 matter', owner: 'Rohan Kapoor', due: '—' },
    { primary: 'Axis Logistics', secondary: 'Commercial · Mumbai', status: 'PROSPECT', meta: 'Intake', owner: 'BD desk', due: today() }
  ],
  complaints: [
    { primary: 'CMP/PS/2024/118', secondary: 'Cheating · Cyber Cell Delhi', status: 'UNDER_ENQUIRY', meta: 'Police Station · Connaught Place', owner: 'Rohan Kapoor', due: '24 Jul 2026' },
    { primary: 'CMP/PS/2025/044', secondary: 'Criminal breach of trust', status: 'FILED', meta: 'PS Saket', owner: 'Ananya Rao', due: '28 Jul 2026' },
    { primary: 'CMP/PS/2025/091', secondary: 'Forgery of documents', status: 'PENDING_FIR', meta: 'EOW Delhi', owner: 'Priya Nair', due: '21 Jul 2026' }
  ],
  fir: [
    { primary: 'FIR 112/2025', secondary: 'PS Connaught Place · IPC 420/468', status: 'INVESTIGATION', meta: 'Linked CMP/PS/2024/118', owner: 'Rohan Kapoor', due: '30 Jul 2026' },
    { primary: 'FIR 67/2025', secondary: 'PS Saket · IPC 406', status: 'CHARGE_SHEET', meta: 'Sessions listed', owner: 'Ananya Rao', due: '02 Aug 2026' },
    { primary: 'FIR 09/2026', secondary: 'EOW · Forgery pack', status: 'REGISTERED', meta: 'Awaiting 161 statements', owner: 'Priya Nair', due: '26 Jul 2026' }
  ],
  evidence: [
    { primary: 'Exhibit A — Bank trail.pdf', secondary: 'WP(C) 482/2024 · SHA-256 sealed', status: 'SEALED', meta: '12.4 MB · Chain of custody OK', owner: 'Clerk · Neha', due: '—' },
    { primary: 'CCTV clip — Lobby.mp4', secondary: 'FIR 112/2025 · Hash verified', status: 'PROCESSING', meta: 'Evidence locker #14', owner: 'IT · Arjun', due: today() },
    { primary: 'WhatsApp export.zip', secondary: 'CS(COMM) 215/2025', status: 'SEALED', meta: 's.65B certificate attached', owner: 'Priya Nair', due: '—' },
    { primary: 'Title deeds — Meridian', secondary: 'Recovery matter', status: 'INDEXED', meta: 'Vault shelf B2', owner: 'Neha', due: '—' }
  ],
  calendar: [
    { primary: 'Final arguments — WP(C) 482', secondary: `${today()} · 10:30 · Court 12 DHC`, status: 'LISTED', meta: 'Appearance · Ananya', owner: 'Ananya Rao', due: today() },
    { primary: 'Bail hearing — Mehta', secondary: '21 Jul 2026 · 14:00 · Saket', status: 'CONFIRMED', meta: 'Caveat checked', owner: 'Rohan Kapoor', due: '21 Jul 2026' },
    { primary: 'Case management conference', secondary: '25 Jul 2026 · Virtual · SIAC', status: 'UPCOMING', meta: 'Zoom bridge ready', owner: 'Priya Nair', due: '25 Jul 2026' }
  ],
  hearings: [
    { primary: 'Misc. application listing', secondary: '22 Jul 2026 · Court 7', status: 'LISTED', meta: 'Adjournment risk', owner: 'Ananya Rao', due: '22 Jul 2026' },
    { primary: 'Evidence examination', secondary: '28 Jul 2026 · Sessions', status: 'PREP', meta: 'Witness list filed', owner: 'Rohan Kapoor', due: '28 Jul 2026' }
  ],
  filing: [
    { primary: 'Reply affidavit — WP(C) 482', secondary: 'Delhi High Court e-filing', status: 'QUEUED', meta: 'Stamp papers ready', owner: 'Filing desk', due: '22 Jul 2026' },
    { primary: 'Vakalatnama — Meridian', secondary: 'Commercial Division', status: 'DRAFT', meta: 'Client stamp pending', owner: 'Priya Nair', due: '24 Jul 2026' },
    { primary: 'Caveat — Saket Sessions', secondary: 'Mehta matter', status: 'FILED', meta: 'Diary no. 4412', owner: 'Rohan Kapoor', due: '—' }
  ],
  documents: [
    { primary: 'Draft petition v3.docx', secondary: 'WP(C) 482/2024', status: 'IN_REVIEW', meta: 'Partner comments open', owner: 'Ananya Rao', due: today() },
    { primary: 'Power of attorney.pdf', secondary: 'Sharma Holdings', status: 'EXECUTED', meta: 'Notarised 12 Jul', owner: 'Neha', due: '—' },
    { primary: 'Settlement term sheet', secondary: 'Axis · SIAC', status: 'DRAFT', meta: 'Version 1.2', owner: 'Priya Nair', due: '01 Aug 2026' }
  ],
  knowledge: [
    { primary: 'Bail jurisprudence note 2025', secondary: 'Internal brief · Criminal', status: 'PUBLISHED', meta: '12 citations', owner: 'Knowledge desk', due: '—' },
    { primary: 'Writ maintainability checklist', secondary: 'Constitutional practice', status: 'PUBLISHED', meta: 'Used 48 times', owner: 'Ananya Rao', due: '—' },
    { primary: 'SIAC procedural map', secondary: 'Arbitration desk', status: 'DRAFT', meta: 'Review by Priya', due: '30 Jul 2026' }
  ],
  ai: [
    { primary: 'Case summary — WP(C) 482', secondary: 'AI draft ready for counsel review', status: 'READY', meta: 'Tokens 4.2k · Confidence 0.86', owner: 'Legal AI', due: today() },
    { primary: 'Contract risk — Meridian SPA', secondary: '12 clauses flagged', status: 'REVIEW', meta: 'High: indemnity & jurisdiction', owner: 'Legal AI', due: today() },
    { primary: 'Judgment search — s.482 CrPC', secondary: '38 hits · SCC + Manupatra', status: 'COMPLETE', meta: 'Top 5 saved to matter', owner: 'Legal AI', due: '—' }
  ],
  billing: [
    { primary: 'INV-LOS-2041', secondary: 'Sharma Holdings · Retainer Jul', status: 'SENT', meta: '₹2,40,000', owner: 'Accounts', due: '31 Jul 2026' },
    { primary: 'INV-LOS-2038', secondary: 'Meridian · Arbitration hourlies', status: 'PAID', meta: '₹4,10,000', owner: 'Accounts', due: '—' },
    { primary: 'WIP — Mehta bail', secondary: 'Unbilled time 18.5 hrs', status: 'WIP', meta: '₹1,85,000 est.', owner: 'Rohan Kapoor', due: '25 Jul 2026' }
  ],
  analytics: [
    { primary: 'Active matters', secondary: 'Portfolio health', status: 'WATCH', meta: '24 open · 3 urgent', owner: 'Partners', due: today() },
    { primary: 'Realization rate', secondary: 'YTD billing', status: 'ON_TRACK', meta: '78% · Target 80%', owner: 'Finance', due: '—' },
    { primary: 'Hearing attendance', secondary: 'Last 30 days', status: 'GOOD', meta: '96% counsel coverage', owner: 'Ops', due: '—' }
  ]
}

const SECTION_DEFAULTS = {
  Practice: 'matters',
  'Court & Hearings': 'calendar',
  'Evidence & Documents': 'documents',
  Knowledge: 'knowledge',
  'Time & Billing': 'billing',
  Team: 'clients',
  'Intelligence & Comms': 'ai',
  Insights: 'analytics',
  System: 'matters',
  Overview: 'matters'
}

const STATS_BY_SLUG = {
  matters: [
    { label: 'Active', value: '24' },
    { label: 'Urgent', value: '3' },
    { label: 'This week', value: '7' },
    { label: 'Disposed YTD', value: '41' }
  ],
  complaints: [
    { label: 'Open', value: '12' },
    { label: 'Pending FIR', value: '4' },
    { label: 'Converted', value: '9' },
    { label: 'Closed', value: '31' }
  ],
  fir: [
    { label: 'Investigation', value: '8' },
    { label: 'Charge-sheet', value: '3' },
    { label: 'Trial', value: '5' },
    { label: 'Linked matters', value: '11' }
  ],
  evidence: [
    { label: 'Sealed', value: '86' },
    { label: 'Processing', value: '4' },
    { label: 'Exhibits', value: '142' },
    { label: 'Hash OK', value: '100%' }
  ],
  calendar: [
    { label: 'Today', value: '3' },
    { label: 'This week', value: '11' },
    { label: 'Virtual', value: '2' },
    { label: 'Conflicts', value: '1' }
  ],
  filing: [
    { label: 'Queued', value: '6' },
    { label: 'Draft', value: '4' },
    { label: 'Filed today', value: '2' },
    { label: 'Rejected', value: '0' }
  ],
  ai: [
    { label: 'Runs today', value: '14' },
    { label: 'Awaiting review', value: '5' },
    { label: 'Saved to matter', value: '22' },
    { label: 'Avg confidence', value: '0.84' }
  ],
  billing: [
    { label: 'WIP', value: '₹18L' },
    { label: 'Sent', value: '₹36L' },
    { label: 'Collected', value: '₹29L' },
    { label: 'Overdue', value: '₹2.1L' }
  ]
}

const ACTIONS_BY_SLUG = {
  matters: ['New matter', 'Import', 'Conflict check'],
  complaints: ['New complaint', 'Convert to FIR', 'Export'],
  fir: ['Register FIR link', 'Request documents', 'Export'],
  evidence: ['Upload evidence', 'Seal & hash', 'Chain of custody'],
  calendar: ['Block date', 'Sync eCourts', 'Conflict check'],
  hearings: ['Add hearing', 'Prep pack', 'Remind counsel'],
  filing: ['New filing', 'Stamp checklist', 'Submit e-file'],
  documents: ['Upload', 'Start workflow', 'Request signature'],
  knowledge: ['Add note', 'Import judgment', 'Tag matter'],
  ai: ['Run case summary', 'Draft petition', 'Risk scan'],
  billing: ['Create invoice', 'Log time', 'Send reminder'],
  clients: ['Add client', 'KYC refresh', 'Portal invite'],
  advocates: ['Add advocate', 'Assign roster', 'Availability'],
  notifications: ['Mark all read', 'Preferences', 'Test alert'],
  settings: ['Firm profile', 'Integrations', 'Access control']
}

const FILTERS_BY_SLUG = {
  matters: ['All', 'Active', 'Urgent', 'Pending', 'Disposed'],
  complaints: ['All', 'Filed', 'Under enquiry', 'Pending FIR'],
  fir: ['All', 'Registered', 'Investigation', 'Charge sheet'],
  evidence: ['All', 'Sealed', 'Processing', 'Indexed'],
  calendar: ['All', 'Today', 'This week', 'Virtual'],
  filing: ['All', 'Draft', 'Queued', 'Filed'],
  ai: ['All', 'Ready', 'Review', 'Complete'],
  billing: ['All', 'WIP', 'Sent', 'Paid', 'Overdue']
}

export function getModuleDemoRows(slug, section) {
  if (DEMO[slug]) return DEMO[slug].map((r, i) => ({ ...r, id: `${slug}-${i}` }))
  const fallbackKey = SECTION_DEFAULTS[section] || 'matters'
  const base = DEMO[fallbackKey] || DEMO.matters
  return base.map((r, i) => ({
    ...r,
    id: `${slug}-${i}`,
    primary: r.primary,
    secondary: `${r.secondary} · ${slug}`,
    meta: r.meta
  }))
}

export function getModuleStats(slug) {
  return (
    STATS_BY_SLUG[slug] || [
      { label: 'Records', value: '18' },
      { label: 'Active', value: '11' },
      { label: 'Due soon', value: '4' },
      { label: 'Owners', value: '6' }
    ]
  )
}

export function getModuleActions(slug, title) {
  return ACTIONS_BY_SLUG[slug] || [`New ${title || 'record'}`, 'Export', 'Share']
}

export function getModuleFilters(slug) {
  return FILTERS_BY_SLUG[slug] || ['All', 'Active', 'Archived']
}
