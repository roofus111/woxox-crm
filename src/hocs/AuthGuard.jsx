// Third-party Imports
import { getServerSession } from 'next-auth/next'
import themeConfig from '@configs/themeConfig'
// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import NotFound from '@/views/NotFound'
import { authOptions } from '@/libs/auth'
import { getLocalizedUrl } from '@/utils/i18n'
import { redirect } from 'next/navigation'
// Define your roles (you can also manage this in a more dynamic way if needed)
const roles = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
}

// console.log(session)

export default async function AuthGuard({ children, locale, requiredRole }) {
  // Check if session exists
  const session = await getServerSession(authOptions)
  console.log(session, `requiredRole : ${requiredRole}`)
  const userHomePage = getLocalizedUrl(themeConfig.userHomePageUrl, 'en')
  const financeHomePageUrl = getLocalizedUrl(themeConfig.financeHomePageUrl, 'en')
  const pipelineHomePageUrl = getLocalizedUrl(themeConfig.pipelineHomePageUrl, 'en')
  if (!session) {
    return <AuthRedirect lang={locale} />
  }
  // Check if the user has the required role
  if (requiredRole && session.user.role !== requiredRole) {
    if (session.user.role === 'user') {
      redirect(userHomePage)
    } else if (session.user.role === 'finance') {
      redirect(financeHomePageUrl)
    } else if (session.user.role === 'pipeline') {
      redirect(pipelineHomePageUrl)
    } else {
      return <NotFound />
    }
  }

  // Render children if user has the required role
  return <>{children}</>
}
