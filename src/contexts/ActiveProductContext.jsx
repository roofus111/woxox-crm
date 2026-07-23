'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ACTIVE_PRODUCT_KEY, matchProductFromPath, getProduct } from '@configs/products'
import { getEnabledProductIds, getEnabledProducts } from '@/libs/tenantModules'
import { getCrmPlatformToken, syncTenantModulesFromPlatform, bridgeCrmPlatformWithLegacyToken, ensureCrmPlatformSession, clearCrmPlatformToken } from '@/libs/crmPlatformApi'

const ActiveProductContext = createContext(null)

function readStoredActiveProduct() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(ACTIVE_PRODUCT_KEY)
  } catch {
    return null
  }
}

export function ActiveProductProvider({ children }) {
  const { data: session, status, update: updateSession } = useSession()
  const pathname = usePathname() || ''
  const router = useRouter()
  const params = useParams()
  const locale = params?.lang || 'en'
  const [modulesSynced, setModulesSynced] = useState(false)

  // Pull workspace modules from billing platform on every authenticated session.
  useEffect(() => {
    if (status !== 'authenticated' || modulesSynced) return

    const run = async () => {
      try {
        const legacy =
          session?.accessToken ||
          (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

        if (legacy) {
          // Refresh platform JWT when missing; also re-bridge if onboarding sync fails
          await ensureCrmPlatformSession(legacy)
          const synced = await syncTenantModulesFromPlatform(updateSession)
          if (!synced && legacy) {
            clearCrmPlatformToken()
            await ensureCrmPlatformSession(legacy, { force: true })
            await syncTenantModulesFromPlatform(updateSession)
          }
        } else if (!getCrmPlatformToken() && session?.accessToken) {
          await bridgeCrmPlatformWithLegacyToken(session.accessToken)
          await syncTenantModulesFromPlatform(updateSession)
        }
      } catch {
        /* platform sync optional */
      } finally {
        setModulesSynced(true)
      }
    }

    run()
  }, [status, modulesSynced, updateSession, session?.accessToken])

  const enabledIds = useMemo(
    () => (status === 'loading' ? ['crm'] : getEnabledProductIds(session)),
    [session, status, modulesSynced]
  )
  const enabledProducts = useMemo(
    () => (status === 'loading' ? [getProduct('crm')].filter(Boolean) : getEnabledProducts(session)),
    [session, status, modulesSynced]
  )

  const [activeProductId, setActiveProductIdState] = useState('crm')

  // Block direct URL access to modules not included in the subscription.
  useEffect(() => {
    if (status !== 'authenticated') return
    const fromPath = matchProductFromPath(pathname)
    if (!fromPath || fromPath === 'crm') return
    if (!enabledIds.includes(fromPath)) {
      router.replace(`/${locale}/dashboards/crm`)
    }
  }, [pathname, enabledIds, status, locale, router])

  // Sync from route → product (Dynamics / Salesforce style).
  // Prefer the currently stored product when several products share a path (files, tags, workflow…).
  useEffect(() => {
    const stored = readStoredActiveProduct()
    const fromPath = matchProductFromPath(pathname, stored)
    if (fromPath && enabledIds.includes(fromPath)) {
      setActiveProductIdState(fromPath)
      try {
        window.localStorage.setItem(ACTIVE_PRODUCT_KEY, fromPath)
      } catch {
        /* ignore */
      }
      return
    }

    if (stored && enabledIds.includes(stored)) {
      setActiveProductIdState(stored)
      return
    }

    if (enabledIds.length) {
      setActiveProductIdState(enabledIds[0])
    }
  }, [pathname, enabledIds])

  const setActiveProduct = useCallback(
    (productId, { navigate = true } = {}) => {
      if (!enabledIds.includes(productId)) return
      setActiveProductIdState(productId)
      try {
        window.localStorage.setItem(ACTIVE_PRODUCT_KEY, productId)
      } catch {
        /* ignore */
      }
      const product = getProduct(productId)
      if (navigate && product?.homePath) {
        router.push(`/${locale}${product.homePath}`)
      }
    },
    [enabledIds, locale, router]
  )

  const value = useMemo(
    () => ({
      activeProductId,
      setActiveProduct,
      enabledProducts,
      enabledIds,
      activeProduct: getProduct(activeProductId) || getProduct('crm')
    }),
    [activeProductId, setActiveProduct, enabledProducts, enabledIds]
  )

  return <ActiveProductContext.Provider value={value}>{children}</ActiveProductContext.Provider>
}

export function useActiveProduct() {
  const ctx = useContext(ActiveProductContext)
  if (!ctx) {
    throw new Error('useActiveProduct must be used within ActiveProductProvider')
  }
  return ctx
}

/** Safe hook when provider may be absent (role shells). */
export function useActiveProductOptional() {
  return useContext(ActiveProductContext)
}
