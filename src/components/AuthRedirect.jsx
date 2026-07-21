'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }) => {
  const pathname = usePathname()
  const locale = lang || pathname?.split('/')?.[1] || 'en'

  const redirectUrl = `/${locale}/login?redirectTo=${pathname || `/${locale}`}`
  const login = `/${locale}/login`
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, locale)
  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}

export default AuthRedirect
