/**
 * WOXOX Product Catalog — Product-Based Navigation Architecture
 * Top-level products are subscription/tenant gated. Each product owns its sidebar.
 */

import { buildLegalOsNavMenu } from '@/views/apps/legalos/modules'

/** Map legacy plan addon IDs → product IDs */
export const ADDON_TO_PRODUCT = {
  SLM0825: 'crm', // Sales stays within CRM
  WFM0825: 'projectsMax',
  FDM0825: 'crm',
  FLM0825: 'projectsMax',
  TGM0825: 'crm',
  FTM0825: 'finance',
  HRM0825: 'hrms',
  LOS0825: 'legalos',
  ACAD0825: 'academy',
  ECOM0825: 'ecommerce',
  PRJLITE0825: 'projectsLite',
  PRJ0825: 'projectsMax',
  PLM0825: 'projectsMax' // Pipeline Manager → Max suite
}

/**
 * Demo / bootstrap products shown for signed-in tenants until real subscription gates apply.
 * Includes products that already have FE + BE + DB in WOXOX.
 */
export const DEMO_ENABLED_PRODUCTS = [
  'crm',
  'legalos',
  'hrms',
  'finance',
  'academy',
  'ecommerce',
  'projectsLite',
  'projectsMax'
]

/** Bump when default product set changes so older localStorage lists are upgraded. */
export const PRODUCTS_CATALOG_VERSION = '11'
export const PRODUCTS_CATALOG_VERSION_KEY = 'woxox.productsCatalogVersion'

const localeHref = (path) => (locale) => `/${locale}${path}`

/**
 * @typedef {Object} NavItem
 * @property {string} label
 * @property {string} [icon]
 * @property {(locale: string) => string} [href]
 * @property {NavItem[]} [children]
 * @property {string} [addonId] — extra gate inside a product menu
 * @property {string[]} [roles] — optional role allow-list
 */

/** @type {Record<string, object>} */
export const PRODUCTS = {
  crm: {
    id: 'crm',
    name: 'CRM',
    shortName: 'CRM',
    description: 'Leads, contacts, deals & customer operations',
    icon: 'ri-customer-service-2-line',
    color: '#0288d1',
    homePath: '/dashboards/crm',
    pathPrefixes: [
      '/dashboards/crm',
      '/dashboards/analytics',
      '/manager/leads',
      '/manager/addleads',
      '/manager/leadcampaign',
      '/manager/activitylog',
      '/manager/customer',
      '/manager/followup',
      '/manager/tickets',
      '/manager/team',
      '/manager/saleRequest',
      '/manager/tagSection',
      '/manager/myfiles',
      '/manager/pipeline',
      '/manager/workflow',
      '/manager/documentation',
      '/manager/doceditor',
      '/manager/doctemplate',
      '/manager/leaddoceditor',
      '/manager/taskmanager',
      '/apps/kanban',
      '/apps/calendar',
      '/apps/chat',
      '/manager/marketplace',
      '/manager/subscription',
      '/manager/my-whatsapp',
      '/manager/email',
      '/manager/settings'
    ],
    /** Core product — always available once tenant has company access */
    isCore: true,
    addonId: null,
    menu: [
      {
        label: 'Dashboard',
        icon: 'ri-dashboard-line',
        href: localeHref('/dashboards/crm')
      },
      {
        label: 'Leads',
        icon: 'ri-user-star-line',
        children: [
          { label: 'All Leads', href: localeHref('/manager/leads') },
          { label: 'Add Leads', href: localeHref('/manager/addleads') },
          { label: 'Campaign', href: localeHref('/manager/leadcampaign') },
          { label: 'Activity Log', href: localeHref('/manager/activitylog') }
        ]
      },
      {
        label: 'Pipelines',
        icon: 'ri-flow-chart',
        href: localeHref('/manager/pipeline')
      },
      {
        label: 'Contacts',
        icon: 'ri-contacts-book-line',
        href: localeHref('/manager/customer')
      },
      {
        label: 'Deals',
        icon: 'ri-handshake-line',
        children: [
          { label: 'Sales Requests', href: localeHref('/manager/saleRequest') },
          { label: 'Invoices', href: localeHref('/manager/saleRequest/invoice') }
        ]
      },
      {
        label: 'Follow Up',
        icon: 'ri-calendar-schedule-line',
        children: [
          { label: 'My Schedules', href: localeHref('/manager/followup/myfollowup?my=true') },
          { label: 'All Schedules', href: localeHref('/manager/followup') }
        ]
      },
      {
        label: 'Task Manager',
        icon: 'ri-task-line',
        href: localeHref('/manager/taskmanager')
      },
      {
        label: 'Calendar',
        icon: 'ri-calendar-line',
        href: localeHref('/apps/calendar')
      },
      {
        label: 'Tickets',
        icon: 'ri-coupon-2-line',
        children: [
          { label: 'All Tickets', href: localeHref('/manager/tickets') },
          { label: 'Create Ticket', href: localeHref('/manager/tickets?create=1') }
        ]
      },
      {
        label: 'Team',
        icon: 'ri-group-line',
        href: localeHref('/manager/team')
      },
      {
        label: 'Project Manager Max',
        icon: 'ri-projector-line',
        addonId: 'PRJ0825',
        children: [
          { label: 'Max Dashboard', href: localeHref('/apps/projects/max') },
          { label: 'Projects', href: localeHref('/apps/projects/max/projects') },
          { label: 'Task Desk', href: localeHref('/apps/projects/max/tasks') },
          { label: 'Kanban Boards', href: localeHref('/apps/kanban') },
          { label: 'Documentation Board', href: localeHref('/manager/documentation') },
          { label: 'Files', href: localeHref('/manager/myfiles') }
        ]
      },
      {
        label: 'Chat',
        icon: 'ri-wechat-line',
        href: localeHref('/apps/chat')
      },
      {
        label: 'My WhatsApp',
        icon: 'ri-whatsapp-line',
        href: localeHref('/manager/my-whatsapp')
      },
      {
        label: 'Email',
        icon: 'ri-mail-open-line',
        children: [
          { label: 'Inbox', href: localeHref('/manager/email/inbox') },
          { label: 'Compose', href: localeHref('/manager/email/compose') },
          { label: 'Connect mailbox', href: localeHref('/manager/email/smtp') },
          { label: 'Email settings', href: localeHref('/manager/email/settings') }
        ]
      },
      {
        label: 'Reports',
        icon: 'ri-bar-chart-box-line',
        href: localeHref('/dashboards/analytics')
      },
      {
        label: 'Settings',
        icon: 'ri-settings-3-line',
        children: [
          { label: 'My WhatsApp', href: localeHref('/manager/my-whatsapp'), icon: 'ri-whatsapp-line' },
          { label: 'Connect mailbox', href: localeHref('/manager/email/smtp'), icon: 'ri-mail-settings-line' },
          { label: 'Marketplace', href: localeHref('/manager/marketplace') },
          { label: 'Subscription', href: localeHref('/manager/subscription') }
        ]
      }
    ]
  },

  legalos: {
    id: 'legalos',
    name: 'LegalOS',
    shortName: 'Legal',
    description: 'Matters, courts, evidence & legal operations',
    icon: 'ri-scales-3-line',
    color: '#9A7209',
    homePath: '/apps/legalos/dashboard',
    pathPrefixes: ['/apps/legalos'],
    isCore: false,
    addonId: 'LOS0825',
    demoDefault: true,
    menu: buildLegalOsNavMenu(localeHref)
  },

  hrms: {
    id: 'hrms',
    name: 'HRMS',
    shortName: 'HR',
    description: 'People, attendance, leave & payroll',
    icon: 'ri-team-line',
    color: '#7b1fa2',
    homePath: '/manager/hrmodule',
    pathPrefixes: ['/manager/hrmodule'],
    isCore: false,
    addonId: 'HRM0825',
    demoDefault: true,
    menu: [
      { label: 'Dashboard', icon: 'ri-dashboard-line', href: localeHref('/manager/hrmodule') },
      { label: 'Employees', icon: 'ri-file-user-line', href: localeHref('/manager/hrmodule/employees') },
      { label: 'Add Employee', icon: 'ri-user-add-line', href: localeHref('/manager/hrmodule/add-employee') },
      { label: 'Employee Details', icon: 'ri-id-card-line', href: localeHref('/manager/hrmodule/employee-details') },
      { label: 'Attendance', icon: 'ri-checkbox-circle-line', href: localeHref('/manager/hrmodule/attendance') },
      { label: 'Leave', icon: 'ri-pass-pending-line', href: localeHref('/manager/hrmodule/leave') },
      {
        label: 'Payroll',
        icon: 'ri-currency-line',
        children: [
          { label: 'Payroll', href: localeHref('/manager/hrmodule/payroll') },
          { label: 'Payroll Form', href: localeHref('/manager/hrmodule/payroll/payrollform') }
        ]
      },
      { label: 'User Dashboard', icon: 'ri-user-line', href: localeHref('/manager/hrmodule/userdashboard') },
      { label: 'Settings', icon: 'ri-settings-3-line', href: localeHref('/manager/subscription') }
    ]
  },

  finance: {
    id: 'finance',
    name: 'Finance',
    shortName: 'Finance',
    description: 'Expenses, accounts, ledgers & billing',
    icon: 'ri-bank-line',
    color: '#2e7d32',
    homePath: '/manager/finance',
    pathPrefixes: ['/manager/finance', '/manager/expense', '/manager/saleRequest'],
    isCore: false,
    addonId: 'FTM0825',
    demoDefault: true,
    menu: [
      { label: 'Dashboard', icon: 'ri-dashboard-line', href: localeHref('/manager/finance') },
      { label: 'Add Entry', icon: 'ri-add-circle-line', href: localeHref('/manager/finance/add') },
      { label: 'Ledger', icon: 'ri-book-2-line', href: localeHref('/manager/finance/ledger') },
      { label: 'Transactions', icon: 'ri-exchange-funds-line', href: localeHref('/manager/finance/ledger/transaction') },
      { label: 'Balance Sheet', icon: 'ri-scales-line', href: localeHref('/manager/finance/balance-sheet') },
      {
        label: 'Expenses',
        icon: 'ri-wallet-3-line',
        children: [
          { label: 'Expense List', href: localeHref('/manager/expense') },
          { label: 'Accounts', href: localeHref('/manager/expense/accounts') },
          { label: 'Categories', href: localeHref('/manager/expense/category') },
          { label: 'Add Account', href: localeHref('/manager/expense/add-account') }
        ]
      },
      {
        label: 'Sales & Billing',
        icon: 'ri-bill-line',
        children: [
          { label: 'Sales Request', href: localeHref('/manager/saleRequest') },
          { label: 'Invoices', href: localeHref('/manager/saleRequest/invoice') },
          { label: 'Transactions', href: localeHref('/manager/saleRequest/transaction') }
        ]
      },
      { label: 'Settings', icon: 'ri-settings-3-line', href: localeHref('/manager/subscription') }
    ]
  },

  academy: {
    id: 'academy',
    name: 'Academy',
    shortName: 'Academy',
    description: 'Courses, students, exams & certificates',
    icon: 'ri-graduation-cap-line',
    color: '#ef6c00',
    homePath: '/apps/academy/dashboard',
    pathPrefixes: ['/apps/academy', '/dashboards/academy'],
    isCore: false,
    addonId: 'ACAD0825',
    demoDefault: true,
    menu: [
      { label: 'Dashboard', icon: 'ri-dashboard-line', href: localeHref('/apps/academy/dashboard') },
      { label: 'Courses', icon: 'ri-book-2-line', href: localeHref('/apps/academy/my-courses') },
      { label: 'Course Details', icon: 'ri-file-list-3-line', href: localeHref('/apps/academy/course-details') },
      { label: 'Academy Overview', icon: 'ri-bar-chart-box-line', href: localeHref('/dashboards/academy') },
      { label: 'Settings', icon: 'ri-settings-3-line', href: localeHref('/manager/subscription') }
    ]
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce',
    shortName: 'Commerce',
    description: 'Catalog, orders & storefront ops',
    icon: 'ri-shopping-bag-3-line',
    color: '#c2185b',
    homePath: '/apps/ecommerce/dashboard',
    pathPrefixes: ['/apps/ecommerce', '/dashboards/ecommerce'],
    isCore: false,
    addonId: 'ECOM0825',
    demoDefault: true,
    menu: [
      { label: 'Dashboard', icon: 'ri-dashboard-line', href: localeHref('/apps/ecommerce/dashboard') },
      {
        label: 'Products',
        icon: 'ri-box-3-line',
        children: [
          { label: 'Product List', href: localeHref('/apps/ecommerce/products/list') },
          { label: 'Add Product', href: localeHref('/apps/ecommerce/products/add') },
          { label: 'Categories', href: localeHref('/apps/ecommerce/products/category') }
        ]
      },
      { label: 'Orders', icon: 'ri-shopping-cart-line', href: localeHref('/apps/ecommerce/orders/list') },
      { label: 'Customers', icon: 'ri-user-heart-line', href: localeHref('/apps/ecommerce/customers/list') },
      { label: 'Reviews', icon: 'ri-star-line', href: localeHref('/apps/ecommerce/manage-reviews') },
      { label: 'Referrals', icon: 'ri-share-forward-line', href: localeHref('/apps/ecommerce/referrals') },
      { label: 'Store Settings', icon: 'ri-settings-3-line', href: localeHref('/apps/ecommerce/settings') }
    ]
  },

  projectsLite: {
    id: 'projectsLite',
    name: 'Project Manager Lite',
    shortName: 'PM Lite',
    description: 'Projects, tasks, workflow boards, files, team & collaboration',
    icon: 'ri-checkbox-circle-line',
    color: '#00897b',
    homePath: '/apps/projects/lite',
    pathPrefixes: [
      '/apps/projects/lite',
      '/manager/taskmanager',
      '/manager/myfiles',
      '/manager/tagSection',
      '/manager/team',
      '/manager/workflow',
      '/manager/pipeline',
      '/manager/activitylog',
      '/manager/followup',
      '/manager/marketplace',
      '/manager/subscription',
      '/apps/calendar',
      '/apps/chat',
      '/apps/roles',
      '/apps/permissions'
    ],
    isCore: false,
    addonId: 'PRJLITE0825',
    demoDefault: true,
    menu: [
      {
        type: 'section',
        label: 'Overview',
        children: [
          { label: 'Lite Home', icon: 'ri-home-smile-line', href: localeHref('/apps/projects/lite') },
          { label: 'Projects', icon: 'ri-folder-chart-line', href: localeHref('/apps/projects/lite/projects') }
        ]
      },
      {
        type: 'section',
        label: 'Tasks',
        children: [
          { label: 'All Tasks', icon: 'ri-list-check-3', href: localeHref('/apps/projects/lite?view=all-tasks') },
          { label: 'New Task', icon: 'ri-add-circle-line', href: localeHref('/apps/projects/lite?view=new-task') },
          { label: 'Task Calendar', icon: 'ri-calendar-check-line', href: localeHref('/apps/projects/lite?view=calendar') },
          { label: 'Task Reports', icon: 'ri-bar-chart-box-line', href: localeHref('/apps/projects/lite?view=reports') },
          { label: 'Classic Task Manager', icon: 'ri-task-line', href: localeHref('/manager/taskmanager') }
        ]
      },
      {
        type: 'section',
        label: 'Workflow',
        children: [
          { label: 'Pipeline Boards', icon: 'ri-flow-chart', dynamic: 'pipelines' },
          { label: 'Manage Pipelines', icon: 'ri-route-line', href: localeHref('/manager/pipeline') },
          { label: 'Tag Manager', icon: 'ri-price-tag-3-line', href: localeHref('/manager/tagSection') }
        ]
      },
      {
        type: 'section',
        label: 'Schedule',
        children: [
          { label: 'Shared Calendar', icon: 'ri-calendar-line', href: localeHref('/apps/calendar') },
          { label: 'My Follow-ups', icon: 'ri-calendar-schedule-line', href: localeHref('/manager/followup/myfollowup?my=true') },
          { label: 'All Follow-ups', icon: 'ri-calendar-todo-line', href: localeHref('/manager/followup') }
        ]
      },
      {
        type: 'section',
        label: 'Collaboration',
        children: [
          { label: 'Chat', icon: 'ri-wechat-line', href: localeHref('/apps/chat') },
          { label: 'Team', icon: 'ri-group-line', href: localeHref('/manager/team') },
          { label: 'Roles', icon: 'ri-lock-2-line', href: localeHref('/apps/roles') },
          { label: 'Permissions', icon: 'ri-shield-keyhole-line', href: localeHref('/apps/permissions') }
        ]
      },
      {
        type: 'section',
        label: 'Files & activity',
        children: [
          { label: 'Files', icon: 'ri-folder-3-line', href: localeHref('/manager/myfiles') },
          { label: 'Activity Log', icon: 'ri-history-line', href: localeHref('/manager/activitylog') }
        ]
      },
      {
        type: 'section',
        label: 'System',
        children: [
          { label: 'Marketplace', icon: 'ri-store-2-line', href: localeHref('/manager/marketplace') },
          { label: 'Settings', icon: 'ri-settings-3-line', href: localeHref('/manager/subscription') }
        ]
      }
    ]
  },

  projectsMax: {
    id: 'projectsMax',
    name: 'Project Manager Max',
    shortName: 'PM Max',
    description: 'Boards, projects, pipelines, docs, tasks, files & analytics',
    icon: 'ri-projector-line',
    color: '#455a64',
    homePath: '/apps/projects/max',
    pathPrefixes: [
      '/apps/projects/max',
      '/apps/kanban',
      '/apps/chat',
      '/apps/roles',
      '/apps/permissions',
      '/apps/calendar',
      '/manager/documentation',
      '/manager/pipeline',
      '/manager/workflow',
      '/manager/doceditor',
      '/manager/doctemplate',
      '/manager/leaddoceditor',
      '/manager/myfiles',
      '/manager/tagSection',
      '/manager/team',
      '/manager/activitylog',
      '/manager/followup',
      '/manager/marketplace',
      '/manager/subscription',
      '/manager/taskmanager',
      '/dashboards/analytics'
    ],
    isCore: false,
    addonId: 'PRJ0825',
    demoDefault: true,
    menu: [
      {
        type: 'section',
        label: 'Overview',
        children: [
          { label: 'Max Dashboard', icon: 'ri-dashboard-line', href: localeHref('/apps/projects/max') },
          { label: 'Projects', icon: 'ri-folder-chart-line', href: localeHref('/apps/projects/max/projects') }
        ]
      },
      {
        type: 'section',
        label: 'Boards',
        children: [
          { label: 'Kanban Boards', icon: 'ri-kanban-view', href: localeHref('/apps/kanban') },
          { label: 'Documentation Board', icon: 'ri-file-list-3-line', href: localeHref('/manager/documentation') },
          { label: 'Pipeline Boards', icon: 'ri-flow-chart', dynamic: 'pipelines' }
        ]
      },
      {
        type: 'section',
        label: 'Tasks',
        children: [
          { label: 'Task Desk', icon: 'ri-checkbox-circle-line', href: localeHref('/apps/projects/max/tasks') },
          { label: 'All Tasks', icon: 'ri-list-check-3', href: localeHref('/apps/projects/max/tasks?view=all-tasks') },
          { label: 'New Task', icon: 'ri-add-circle-line', href: localeHref('/apps/projects/max/tasks?view=new-task') },
          { label: 'Task Calendar', icon: 'ri-calendar-check-line', href: localeHref('/apps/projects/max/tasks?view=calendar') },
          { label: 'Task Reports', icon: 'ri-bar-chart-box-line', href: localeHref('/apps/projects/max/tasks?view=reports') }
        ]
      },
      {
        type: 'section',
        label: 'Pipelines',
        children: [
          { label: 'Manage Pipelines', icon: 'ri-route-line', href: localeHref('/manager/pipeline') },
          { label: 'Tag Manager', icon: 'ri-price-tag-3-line', href: localeHref('/manager/tagSection') }
        ]
      },
      {
        type: 'section',
        label: 'Schedule',
        children: [
          { label: 'Shared Calendar', icon: 'ri-calendar-line', href: localeHref('/apps/calendar') },
          { label: 'My Follow-ups', icon: 'ri-calendar-schedule-line', href: localeHref('/manager/followup/myfollowup?my=true') },
          { label: 'All Follow-ups', icon: 'ri-calendar-todo-line', href: localeHref('/manager/followup') }
        ]
      },
      {
        type: 'section',
        label: 'Collaboration',
        children: [
          { label: 'Chat', icon: 'ri-wechat-line', href: localeHref('/apps/chat') },
          { label: 'Team', icon: 'ri-group-line', href: localeHref('/manager/team') },
          { label: 'Roles', icon: 'ri-lock-2-line', href: localeHref('/apps/roles') },
          { label: 'Permissions', icon: 'ri-shield-keyhole-line', href: localeHref('/apps/permissions') }
        ]
      },
      {
        type: 'section',
        label: 'Documents & files',
        children: [
          { label: 'Document Editor', icon: 'ri-file-edit-line', href: localeHref('/manager/doceditor') },
          { label: 'Document Templates', icon: 'ri-file-copy-2-line', href: localeHref('/manager/doctemplate') },
          { label: 'Lead Doc Editor', icon: 'ri-article-line', href: localeHref('/manager/leaddoceditor') },
          { label: 'Files', icon: 'ri-folder-3-line', href: localeHref('/manager/myfiles') }
        ]
      },
      {
        type: 'section',
        label: 'Insights',
        children: [
          { label: 'Analytics', icon: 'ri-line-chart-line', href: localeHref('/dashboards/analytics') },
          { label: 'Activity Log', icon: 'ri-history-line', href: localeHref('/manager/activitylog') }
        ]
      },
      {
        type: 'section',
        label: 'System',
        children: [
          { label: 'Marketplace', icon: 'ri-store-2-line', href: localeHref('/manager/marketplace') },
          { label: 'Settings', icon: 'ri-settings-3-line', href: localeHref('/manager/subscription') }
        ]
      }
    ]
  }
}

export const PRODUCT_ORDER = [
  'crm',
  'legalos',
  'hrms',
  'finance',
  'academy',
  'ecommerce',
  'projectsLite',
  'projectsMax'
]

export const TENANT_PRODUCTS_KEY = 'woxox.enabledProducts'
export const ACTIVE_PRODUCT_KEY = 'woxox.activeProduct'
export const PRODUCTS_CONFIGURED_KEY = 'woxox.productsConfigured'

export function getProduct(id) {
  return PRODUCTS[id] || null
}

export function getAllProducts() {
  return PRODUCT_ORDER.map(id => PRODUCTS[id]).filter(Boolean)
}

/** All products whose pathPrefixes match a pathname (longest prefix first). */
export function matchProductsFromPath(pathname = '') {
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/)/, '') || pathname
  const scored = []
  for (const product of getAllProducts()) {
    let bestLen = -1
    for (const prefix of product.pathPrefixes || []) {
      if (stripped === prefix || stripped.startsWith(`${prefix}/`) || stripped.startsWith(`${prefix}?`)) {
        if (prefix.length > bestLen) bestLen = prefix.length
      }
    }
    if (bestLen >= 0) scored.push({ id: product.id, len: bestLen })
  }
  scored.sort((a, b) => b.len - a.len)
  return scored.map(s => s.id)
}

/** Resolve which product owns a pathname (without locale prefix). */
export function matchProductFromPath(pathname = '', preferredId = null) {
  const matches = matchProductsFromPath(pathname)
  if (!matches.length) return null
  if (preferredId && matches.includes(preferredId)) return preferredId

  // Shared manager routes can match CRM + PM Lite + PM Max — prefer CRM unless user picked another product.
  const tieOrder = ['crm', 'projectsMax', 'projectsLite']
  for (const id of tieOrder) {
    if (matches.includes(id)) return id
  }

  return matches[0]
}
