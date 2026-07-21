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
 * Persist enabled products for the tenant (demo / until backend tenantConfig ships).
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

/** Merge newly shipped default products into an older saved list once. */
function migrateStoredProducts(stored) {
  if (typeof window === 'undefined') return stored
  try {
    const ver = window.localStorage.getItem(PRODUCTS_CATALOG_VERSION_KEY)
    if (ver === PRODUCTS_CATALOG_VERSION) return stored
    // Map legacy single "projects" product → Max
    const normalized = stored.map(id => (id === 'projects' ? 'projectsMax' : id))
    const merged = PRODUCT_ORDER.filter(id => normalized.includes(id) || DEMO_ENABLED_PRODUCTS.includes(id))
    storeEnabledProducts(merged)
    return merged
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

/**
 * Role-based product visibility.
 */
export function filterProductsByRole(productIds, role) {
  if (!role || role === 'admin' || role === 'guest') return productIds
  if (role === 'finance') return productIds.filter(id => id === 'finance' || id === 'crm')
  // Pipeline operators + standard users get PM products when enabled for the tenant
  if (role === 'pipeline') {
    return productIds.filter(id => ['crm', 'projectsLite', 'projectsMax'].includes(id))
  }
  if (role === 'user') {
    return productIds.filter(id => ['crm', 'hrms', 'projectsLite', 'projectsMax'].includes(id))
  }
  return productIds
}

/**
 * Resolve products the current tenant may open in the product switcher.
 */
export function getEnabledProductIds(session) {
  const role = session?.user?.role
  const company = session?.user?.company
  const plan = session?.user?.plan

  const fromSession = session?.user?.enabledProducts
  const fromCompany =
    company && typeof company === 'object' ? company.enabledProducts || company.enabledModules : null
  const storedRaw = typeof window !== 'undefined' ? readStoredEnabledProducts() : null
  const stored = storedRaw?.length ? migrateStoredProducts(storedRaw) : storedRaw

  let ids = []

  if (Array.isArray(fromSession) && fromSession.length) {
    ids = PRODUCT_ORDER.filter(id => fromSession.includes(id) || DEMO_ENABLED_PRODUCTS.includes(id))
  } else if (Array.isArray(fromCompany) && fromCompany.length) {
    ids = PRODUCT_ORDER.filter(id => fromCompany.includes(id) || DEMO_ENABLED_PRODUCTS.includes(id))
  } else if (stored?.length) {
    ids = stored
  } else {
    const fromAddons = productsFromPlanAddons(plan)
    ids = [...new Set([...DEMO_ENABLED_PRODUCTS, ...fromAddons])]
  }

  if ((company || plan || role === 'admin') && !ids.includes('crm')) {
    ids = ['crm', ...ids]
  }

  // Ensure shipped products appear for admin / company tenants
  if (company || plan || role === 'admin') {
    for (const id of DEMO_ENABLED_PRODUCTS) {
      if (!ids.includes(id)) ids.push(id)
    }
  }

  ids = PRODUCT_ORDER.filter(id => ids.includes(id))

  return filterProductsByRole(ids, role)
}

export function getEnabledProducts(session) {
  return getEnabledProductIds(session)
    .map(id => getProduct(id))
    .filter(Boolean)
}

/**
 * Whether a product addon (or CRM inner addon) is active on the plan.
 * Core products with no addonId are open when the product itself is enabled.
 */
export function isAddonActive(session, addonId) {
  if (!addonId) return true

  // Demo: LegalOS open when product enabled even without LOS0825 purchase yet
  if (addonId === 'LOS0825') {
    const enabled = getEnabledProductIds(session)
    if (enabled.includes('legalos')) return true
  }

  const access = session?.user?.plan?.modules?.[0]?.plans?.[0]?.moduleAccess
  if (!Array.isArray(access)) {
    // Without plan data, allow CRM-internal items that map to purchased products loosely
    return false
  }
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
  return filterMenuItems(product.menu, session)
}

export { getAllProducts, getProduct }
