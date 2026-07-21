/** Route registry for LegalOS native modules — single source for pages + navigation. */

export const LEGALOS_MODULES = [
  // Overview
  { slug: 'dashboard', title: 'Dashboard', section: 'Overview', icon: 'ri-dashboard-line', api: null },

  // Practice
  { slug: 'matters', title: 'Matter Management', section: 'Practice', icon: 'ri-briefcase-4-line', api: '/cases?limit=50', kind: 'matters' },
  { slug: 'clients', title: 'Client Management', section: 'Practice', icon: 'ri-user-heart-line', api: '/parties?limit=50' },
  { slug: 'complaints', title: 'Complaints', section: 'Practice', icon: 'ri-alarm-warning-line', api: '/complaints?limit=50' },
  { slug: 'fir', title: 'FIR Register', section: 'Practice', icon: 'ri-file-list-3-line', api: '/firs?limit=50' },
  { slug: 'litigation', title: 'Litigation Tracker', section: 'Practice', icon: 'ri-sword-line', api: null },
  { slug: 'recovery', title: 'Recovery Cases', section: 'Practice', icon: 'ri-refund-2-line', api: null },
  { slug: 'arbitration', title: 'Arbitration', section: 'Practice', icon: 'ri-auction-line', api: null },
  { slug: 'timeline', title: 'Case Timeline', section: 'Practice', icon: 'ri-timeline-view', api: null },
  { slug: 'crm', title: 'Legal CRM', section: 'Practice', icon: 'ri-customer-service-2-line', api: null },
  { slug: 'portal', title: 'Client Portal', section: 'Practice', icon: 'ri-door-open-line', api: null },

  // Court & Hearings
  { slug: 'calendar', title: 'Court Calendar', section: 'Court & Hearings', icon: 'ri-calendar-check-line', api: '/hearings?limit=50' },
  { slug: 'hearings', title: 'Hearings', section: 'Court & Hearings', icon: 'ri-gavel-line', api: '/hearings?limit=50' },
  { slug: 'filing', title: 'Court Filing', section: 'Court & Hearings', icon: 'ri-send-plane-line', api: '/filings?limit=50' },
  { slug: 'orders', title: 'Court Orders', section: 'Court & Hearings', icon: 'ri-file-paper-2-line', api: null },
  { slug: 'compliance', title: 'Compliance', section: 'Court & Hearings', icon: 'ri-shield-check-line', api: null },

  // Evidence & Documents
  { slug: 'evidence', title: 'Evidence Management', section: 'Evidence & Documents', icon: 'ri-folder-shield-2-line', api: '/evidence?limit=50' },
  { slug: 'documents', title: 'Legal Documents', section: 'Evidence & Documents', icon: 'ri-file-text-line', api: null },
  { slug: 'petitions', title: 'Petitions', section: 'Evidence & Documents', icon: 'ri-file-edit-line', api: null },
  { slug: 'contracts', title: 'Contracts', section: 'Evidence & Documents', icon: 'ri-contract-line', api: null },
  { slug: 'notices', title: 'Notices', section: 'Evidence & Documents', icon: 'ri-mail-unread-line', api: null },
  { slug: 'versions', title: 'Document Versioning', section: 'Evidence & Documents', icon: 'ri-git-branch-line', api: null },

  // Knowledge
  { slug: 'knowledge', title: 'Knowledge Base', section: 'Knowledge', icon: 'ri-book-open-line', api: '/knowledge?limit=50' },
  { slug: 'judgments', title: 'Judgement Library', section: 'Knowledge', icon: 'ri-book-marked-line', api: null },
  { slug: 'acts', title: 'Acts & Sections', section: 'Knowledge', icon: 'ri-scales-3-line', api: null },
  { slug: 'research', title: 'Research', section: 'Knowledge', icon: 'ri-search-eye-line', api: null },

  // Time & Billing
  { slug: 'time', title: 'Time Tracking', section: 'Time & Billing', icon: 'ri-timer-line', api: null },
  { slug: 'billing', title: 'Billing', section: 'Time & Billing', icon: 'ri-bill-line', api: null },
  { slug: 'invoices', title: 'Invoices', section: 'Time & Billing', icon: 'ri-receipt-line', api: null },
  { slug: 'payments', title: 'Payments', section: 'Time & Billing', icon: 'ri-money-rupee-circle-line', api: null },
  { slug: 'expenses', title: 'Expenses', section: 'Time & Billing', icon: 'ri-wallet-3-line', api: null },

  // Team
  { slug: 'advocates', title: 'Advocate Management', section: 'Team', icon: 'ri-user-star-line', api: null },
  { slug: 'collaboration', title: 'Team Collaboration', section: 'Team', icon: 'ri-group-line', api: null },
  { slug: 'tasks', title: 'Task Management', section: 'Team', icon: 'ri-checkbox-circle-line', api: null },

  // Intelligence & Comms
  { slug: 'ai', title: 'Legal AI', section: 'Intelligence & Comms', icon: 'ri-robot-2-line', api: null },
  { slug: 'voice', title: 'Voice Notes', section: 'Intelligence & Comms', icon: 'ri-mic-line', api: null },
  { slug: 'email', title: 'Email Integration', section: 'Intelligence & Comms', icon: 'ri-mail-line', api: null },
  { slug: 'whatsapp', title: 'WhatsApp Integration', section: 'Intelligence & Comms', icon: 'ri-whatsapp-line', api: null },
  { slug: 'notifications', title: 'Notifications', section: 'Intelligence & Comms', icon: 'ri-notification-3-line', api: '/notifications/feed?' },

  // Insights
  { slug: 'analytics', title: 'Analytics', section: 'Insights', icon: 'ri-line-chart-line', api: null },
  { slug: 'reports', title: 'Reports', section: 'Insights', icon: 'ri-bar-chart-box-line', api: null },

  // System
  { slug: 'settings', title: 'Settings', section: 'System', icon: 'ri-settings-3-line', api: null }
]

export const LEGALOS_SECTION_ORDER = [
  'Overview',
  'Practice',
  'Court & Hearings',
  'Evidence & Documents',
  'Knowledge',
  'Time & Billing',
  'Team',
  'Intelligence & Comms',
  'Insights',
  'System'
]

export function getModule(slug) {
  return LEGALOS_MODULES.find(m => m.slug === slug)
}

/** Build product-nav menu tree (sections) from the module registry. */
export function buildLegalOsNavMenu(localeHref) {
  return LEGALOS_SECTION_ORDER.map(section => {
    const children = LEGALOS_MODULES.filter(m => m.section === section).map(m => ({
      label: m.title,
      icon: m.icon,
      href: localeHref(`/apps/legalos/${m.slug === 'dashboard' ? 'dashboard' : m.slug}`)
    }))
    if (!children.length) return null
    return { type: 'section', label: section, children }
  }).filter(Boolean)
}
