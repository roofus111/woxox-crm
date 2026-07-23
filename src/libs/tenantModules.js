import {
  ADDON_TO_PRODUCT,
  DEMO_ENABLED_PRODUCTS,
  PRODUCTS,
  PRODUCT_ORDER,
  TENANT_PRODUCTS_KEY,
  PRODUCTS_CONFIGURED_KEY,
  PRODUCTS_CATALOG_VERSION,
  PRODUCTS_CATALOG_VERSION_KEY,
  getAllProducts,
  getProduct
} from '@configs/products'

const demoAllProducts = () =>
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_ALL_PRODUCTS === 'true'

/**
 * Read explicit product list from local/tenant storage (client).
 * @returns {string[]|null}
 */
export function readStoredEnabledProducts() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(TENANT_PRODUCTS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(id => PRODUCTS[id]) : null
  } catch {
    return null
  }
}

/**
 * Persist enabled products for the tenant (client cache — must stay within paid entitlements).
 * @param {string[]} productIds
 */
export function storeEnabledProducts(productIds) {
  if (typeof window === 'undefined') return productIds
  const cleaned = [...new Set(productIds.filter(id => PRODUCTS[id]))]
  if (!cleaned.includes('crm')) cleaned.unshift('crm')
  window.localStorage.setItem(TENANT_PRODUCTS_KEY, JSON.stringify(cleaned))
  window.localStorage.setItem(PRODUCTS_CONFIGURED_KEY, '1')
  window.localStorage.setItem(PRODUCTS_CATALOG_VERSION_KEY, PRODUCTS_CATALOG_VERSION)
  return cleaned
}

export function hasConfiguredProducts() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(PRODUCTS_CONFIGURED_KEY) === '1'
  } catch {
    return false
  }
}

/** Merge catalog version upgrades; add newly entitled catalog products (e.g. docsign). */
function migrateStoredProducts(stored, entitlements = ['crm']) {
  if (typeof window === 'undefined') return stored
  try {
    const ver = window.localStorage.getItem(PRODUCTS_CATALOG_VERSION_KEY)
    const normalized = stored.map(id => (id === 'projects' ? 'projectsMax' : id))
    const allowed = new Set(entitlements.includes('crm') ? entitlements : ['crm', ...entitlements])
    let next = normalized.filter(id => allowed.has(id))
    if (!next.includes('crm')) next = ['crm', ...next]
    if (ver !== PRODUCTS_CATALOG_VERSION) {
      for (const id of DEMO_ENABLED_PRODUCTS) {
        if (allowed.has(id) && !next.includes(id)) next.push(id)
      }
      next = PRODUCT_ORDER.filter(id => next.includes(id))
      storeEnabledProducts(next)
    }
    return next
  } catch {
    return stored
  }
}

export { PRODUCTS_CONFIGURED_KEY }

/**
 * Collect product IDs from plan.moduleAccess addon list.
 */
export function productsFromPlanAddons(plan) {
  const access = plan?.modules?.[0]?.plans?.[0]?.moduleAccess
  if (!Array.isArray(access)) return []

  const ids = new Set()
  for (const item of access) {
    if (!item?.isActive) continue
    const productId = ADDON_TO_PRODUCT[item.addonId]
    if (productId) ids.add(productId)
  }

  const explicit = plan?.enabledProducts || plan?.modules?.[0]?.enabledProducts
  if (Array.isArray(explicit)) {
    explicit.forEach(id => {
      if (PRODUCTS[id]) ids.add(id)
    })
  }

  return [...ids]
}

function normalizeProductIds(ids) {
  if (!Array.isArray(ids)) return []
  return PRODUCT_ORDER.filter(id => ids.includes(id) && PRODUCTS[id])
}

function ensureCrm(ids) {
  const list = normalizeProductIds(ids)
  return list.includes('crm') ? list : ['crm', ...list]
}

/**
 * Maximum modules included in the tenant's subscription (plan + addons).
 * Used for module pickers — not necessarily what's active in navigation.
 */
export function getPlanEntitlements(session) {
  if (demoAllProducts()) return [...DEMO_ENABLED_PRODUCTS]

  const plan = session?.user?.plan
  const company = session?.user?.company
  const fromPlanModules = session?.user?.planModules
  const fromPlanDef = plan?.enabledModules
  const fromCompany =
    company && typeof company === 'object'
      ? company.enabledModules || company.enabledProducts
      : null
  const fromAddons = productsFromPlanAddons(plan)

  let entitlements = []

  if (Array.isArray(fromPlanModules) && fromPlanModules.length) {
    entitlements = normalizeProductIds(fromPlanModules)
  } else if (Array.isArray(fromPlanDef) && fromPlanDef.length) {
    entitlements = normalizeProductIds(fromPlanDef)
  } else if (Array.isArray(fromCompany) && fromCompany.length) {
    entitlements = normalizeProductIds(fromCompany)
  } else if (fromAddons.length) {
    entitlements = normalizeProductIds(['crm', ...fromAddons])
  } else {
    entitlements = ['crm']
  }

  for (const id of fromAddons) {
    if (!entitlements.includes(id)) entitlements.push(id)
  }

  return ensureCrm(entitlements)
}

/**
 * Modules the tenant has paid for / activated on the workspace.
 * @deprecated Use getPlanEntitlements for pickers and getEnabledProductIds for nav.
 */
export function getPaidProductIds(session) {
  return getPlanEntitlements(session)
}

/**
 * Role-based product visibility.
 */
export function filterProductsByRole(productIds, role) {
  if (!role || role === 'admin' || role === 'guest') return productIds
  if (role === 'finance') return productIds.filter(id => id === 'finance' || id === 'crm')
  if (role === 'pipeline') {
    return productIds.filter(id => ['crm', 'projectsLite', 'projectsMax'].includes(id))
  }
  if (role === 'user') {
    return productIds.filter(id =>
      ['crm', 'hrms', 'projectsLite', 'projectsMax', 'docsign'].includes(id)
    )
  }
  return productIds
}

/**
 * Resolve products the current tenant may open in the product switcher.
 * Only paid / selected modules appear — never the full demo catalog.
 */
export function getEnabledProductIds(session) {
  const role = session?.user?.role

  if (demoAllProducts()) {
    return filterProductsByRole(DEMO_ENABLED_PRODUCTS, role)
  }

  const entitlements = getPlanEntitlements(session)

  const fromWorkspace = session?.user?.enabledModules
  const fromSession = session?.user?.enabledProducts
  const storedRaw = typeof window !== 'undefined' ? readStoredEnabledProducts() : null
  const stored = storedRaw?.length ? migrateStoredProducts(storedRaw, entitlements) : storedRaw

  let active = entitlements

  // Workspace selection from billing platform is authoritative for navigation.
  if (Array.isArray(fromWorkspace) && fromWorkspace.length) {
    active = fromWorkspace.filter(id => entitlements.includes(id) || id === 'crm')
  } else if (Array.isArray(fromSession) && fromSession.length) {
    active = fromSession.filter(id => entitlements.includes(id) || id === 'crm')
  } else if (stored?.length) {
    active = stored.filter(id => entitlements.includes(id) || id === 'crm')
  }

  active = ensureCrm(active.length ? active : entitlements)

  return filterProductsByRole(PRODUCT_ORDER.filter(id => active.includes(id)), role)
}

export function getEnabledProducts(session) {
  return getEnabledProductIds(session)
    .map(id => getProduct(id))
    .filter(Boolean)
}

/**
 * Whether a product addon (or CRM inner addon) is active on the plan.
 */
export function isAddonActive(session, addonId) {
  if (!addonId) return true

  const enabled = getEnabledProductIds(session)
  const productId = ADDON_TO_PRODUCT[addonId]
  if (productId && enabled.includes(productId)) return true

  const access = session?.user?.plan?.modules?.[0]?.plans?.[0]?.moduleAccess
  if (!Array.isArray(access)) return false
  return !!access.find(item => item.addonId === addonId && item.isActive)
}

/**
 * Filter a product menu tree by role + addon gates.
 */
export function filterMenuItems(items, session) {
  if (!Array.isArray(items)) return []
  const role = session?.user?.role

  return items
    .map(item => {
      if (item.roles?.length && role && !item.roles.includes(role) && role !== 'admin') {
        return null
      }
      if (item.addonId && !isAddonActive(session, item.addonId)) {
        return null
      }
      const children = item.children ? filterMenuItems(item.children, session) : undefined
      if ((item.type === 'section' || item.children) && (!children || children.length === 0) && !item.href) {
        return null
      }
      return children ? { ...item, children } : item
    })
    .filter(Boolean)
}

export function getProductNavMenu(productId, session) {
  const product = getProduct(productId)
  if (!product) return []
  if (!getEnabledProductIds(session).includes(productId)) return []
  return filterMenuItems(product.menu, session)
}

export { getAllProducts, getProduct }
