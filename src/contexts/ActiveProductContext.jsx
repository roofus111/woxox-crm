'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ACTIVE_PRODUCT_KEY, matchProductFromPath, getProduct } from '@configs/products'
import { getEnabledProductIds, getEnabledProducts } from '@/libs/tenantModules'

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
  const { data: session, status } = useSession()
  const pathname = usePathname() || ''
  const router = useRouter()
  const params = useParams()
  const locale = params?.lang || 'en'

  const enabledIds = useMemo(
    () => (status === 'loading' ? ['crm'] : getEnabledProductIds(session)),
    [session, status]
  )
  const enabledProducts = useMemo(
    () => (status === 'loading' ? [getProduct('crm')].filter(Boolean) : getEnabledProducts(session)),
    [session, status]
  )

  const [activeProductId, setActiveProductIdState] = useState('crm')

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
