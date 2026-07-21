// app/guarded-page/layout.tsx or component
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import { redirect } from 'next/navigation'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
import { encodeEmail } from '@/utils/base64url'
import AuthRedirect from '@/components/AuthRedirect'

export default async function AuthGuardLayout({ children, locale, currentpath }) {
  const session = await getServerSession(authOptions)


  const emailValidationPageUrl = getLocalizedUrl(themeConfig.emailValidationPageUrl, locale)
  const userHomePage = getLocalizedUrl(themeConfig.userHomePageUrl, locale)
  const financeHomePageUrl = getLocalizedUrl(themeConfig.financeHomePageUrl, locale)
  const pipelineHomePageUrl = getLocalizedUrl(themeConfig.pipelineHomePageUrl, locale)
  const normalizedPath = currentpath ? `/${String(currentpath).replace(/^\//, '')}` : null

  console.log(session, 'session 4...................................................');
  if (!session) {
    return <AuthRedirect lang={locale} />
  }

  // Local / admin bypass: don't trap admin in onboarding gates
  if (session.user.role === 'admin') {
    return <>{children}</>
  }

  if (session.user.role === 'guest') {
    if (!session.user.isEmailVerified) {
      const encoded = encodeEmail(session.user.email)
      redirect(`${emailValidationPageUrl}/${encoded}`)
    } else if (!session.user.company) {
      console.log("Go to Company Register");

      redirect(getLocalizedUrl(themeConfig.companyRegisterPageUrl, locale))
    }
  } else if (!session.user.plan) {
    redirect(getLocalizedUrl(themeConfig.marketplacePageUrl, locale))
  } else {
    switch (session.user.role) {
      case 'user':
        if (normalizedPath && normalizedPath != userHomePage) redirect(userHomePage)
        break
      case 'finance':
        if (normalizedPath && normalizedPath != financeHomePageUrl) redirect(financeHomePageUrl)
        break
      case 'pipeline':
        if (normalizedPath && normalizedPath != financeHomePageUrl) redirect(financeHomePageUrl)
        break
      default:
        break
    }
  }

  return <>{children}</>
} 
