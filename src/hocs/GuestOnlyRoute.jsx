'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
import { encodeEmail } from '@/utils/base64url'
import { hasConfiguredProducts } from '@/libs/tenantModules'

const GuestOnlyRoute = ({ children, lang }) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      // Local admin bypass: skip onboarding gates
      if (session.user.role === 'admin') {
        router.replace(getLocalizedUrl(themeConfig.homePageUrl, lang))
        return
      }

      if (!session.user.isEmailVerified) {
        const encoded = encodeEmail(session.user.email)
        router.replace(getLocalizedUrl(`${themeConfig.emailValidationPageUrl}/${encoded}`, lang))
      } else if (!session.user.company) {
        router.replace(getLocalizedUrl(themeConfig.companyRegisterPageUrl, lang))
      } else if (!hasConfiguredProducts() && !pathname?.includes('/select-products')) {
        router.replace(getLocalizedUrl(themeConfig.selectProductsPageUrl, lang))
      } else if (!session.user.plan) {
        if (!pathname?.includes('/marketplace')) {
          router.replace(getLocalizedUrl(themeConfig.marketplacePageUrl, lang))
        }
      } else {
        if (!pathname?.includes('/marketplace')) {
          router.replace(getLocalizedUrl(themeConfig.homePageUrl, lang))
        }
      }
    } else if (status === 'unauthenticated') {
      if (pathname != '/en/login' && pathname != '/en/register') {
        router.replace(getLocalizedUrl(themeConfig.loginPageUrl, lang))
      }
    }
  }, [session, status, pathname, lang, router])

  if (status === 'loading') return null

  return <>{children}</>
}

export default GuestOnlyRoute
