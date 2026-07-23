'use client'

import { useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ProductModulePicker from '@/components/onboarding/ProductModulePicker'
import { getPlanEntitlements, storeEnabledProducts } from '@/libs/tenantModules'
import { getCrmPlatformToken, updateOnboarding } from '@/libs/crmPlatformApi'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'

export default function SelectProductsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.lang || 'en'
  const { data: session, update } = useSession()

  const allowedProductIds = useMemo(() => getPlanEntitlements(session), [session])

  const handleContinue = async productIds => {
    const allowed = new Set(allowedProductIds)
    const saved = storeEnabledProducts(productIds.filter(id => allowed.has(id)))

    if (getCrmPlatformToken()) {
      try {
        await updateOnboarding({ modules: saved, step: 'modules' })
      } catch {
        /* platform sync optional */
      }
    }

    if (session) {
      try {
        await update({
          user: {
            ...session.user,
            enabledProducts: saved,
            enabledModules: saved
          }
        })
      } catch {
        /* session may not persist custom fields until auth callback supports it */
      }
    }

    const next = session?.user?.plan ? themeConfig.homePageUrl : themeConfig.marketplacePageUrl
    router.replace(getLocalizedUrl(next, locale))
  }

  return (
    <ProductModulePicker
      allowedProductIds={allowedProductIds}
      onContinue={handleContinue}
      title='Select your WOXOX products'
      subtitle='Choose the modules included in your plan. Only selected products will appear in your CRM navigation — CRM is always included.'
    />
  )
}
