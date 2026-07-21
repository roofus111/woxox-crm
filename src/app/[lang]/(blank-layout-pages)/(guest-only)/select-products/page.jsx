'use client'

import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ProductModulePicker from '@/components/onboarding/ProductModulePicker'
import { storeEnabledProducts } from '@/libs/tenantModules'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'

export default function SelectProductsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.lang || 'en'
  const { data: session, update } = useSession()

  const handleContinue = async productIds => {
    const saved = storeEnabledProducts(productIds)

    if (session) {
      try {
        await update({
          user: {
            ...session.user,
            enabledProducts: saved
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
      onContinue={handleContinue}
      title='Select your WOXOX products'
      subtitle='Build your Business Operating System. Only purchased or selected products will appear in navigation — CRM is included.'
    />
  )
}
