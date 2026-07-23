'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
import { encodeEmail } from '@/utils/base64url'
import { hasConfiguredProducts } from '@/libs/tenantModules'

/** Paths where signed-in users should still see the page (signup / login flows). */
const AUTH_ENTRY_SEGMENTS = ['login', 'register', 'get-started', 'forgot-password']

function isAuthEntryPath(pathname, lang) {
  if (!pathname) return false
  return AUTH_ENTRY_SEGMENTS.some(segment => {
    const localized = getLocalizedUrl(`/${segment}`, lang)
    return pathname === localized || pathname.startsWith(`${localized}/`)
  })
}

const GuestOnlyRoute = ({ children, lang }) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'authenticated') return

    // Always allow register / login / get-started — even if already signed in
    if (isAuthEntryPath(pathname, lang)) return

    if (session.user.role === 'admin') {
      router.replace(getLocalizedUrl(themeConfig.homePageUrl, lang))
      return
    }

    // Company team members are invited by admin — don't trap them on OTP verification
    const hasCompany =
      session.user.company &&
      session.user.company !== 'null' &&
      session.user.company !== 'undefined'

    if (!session.user.isEmailVerified && !hasCompany && session.user.role === 'guest') {
      const encoded = encodeEmail(session.user.email)
      router.replace(getLocalizedUrl(`${themeConfig.emailValidationPageUrl}/${encoded}`, lang))
    } else if (!hasCompany && session.user.role === 'guest') {
      router.replace(getLocalizedUrl(themeConfig.companyRegisterPageUrl, lang))
    } else if (!hasConfiguredProducts() && !pathname?.includes('/select-products')) {
      router.replace(getLocalizedUrl(themeConfig.selectProductsPageUrl, lang))
    } else if (!session.user.plan) {
      if (!pathname?.includes('/marketplace')) {
        router.replace(getLocalizedUrl(themeConfig.marketplacePageUrl, lang))
      }
    } else if (!pathname?.includes('/marketplace')) {
      router.replace(getLocalizedUrl(themeConfig.homePageUrl, lang))
    }
  }, [session, status, pathname, lang, router])

  if (status === 'loading') return null

  return <>{children}</>
}

export default GuestOnlyRoute
