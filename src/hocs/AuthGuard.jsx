// Third-party Imports
import { getServerSession } from 'next-auth/next'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import NotFound from '@/views/NotFound'
import { authOptions } from '@/libs/auth'

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

  if (!session) {
    return <AuthRedirect lang={locale} />
  }

  // Check if the user has the required role
  if (requiredRole && session.user.role !== requiredRole) {
    return <NotFound />
  }

  // Render children if user has the required role
  return <>{children}</>
}
