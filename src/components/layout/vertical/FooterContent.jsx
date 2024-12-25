'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'
// Third-party Imports
import classnames from 'classnames'
import { getLocalizedUrl } from '@/utils/i18n'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { lang: locale } = useParams()
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made with `}</span>
        <span>{`❤️`}</span>
        <span className='text-textSecondary'>{` by `}</span>
        <Link href={getLocalizedUrl('/', 'locale')} target='_blank' className='text-primary capitalize'>
          Woxox
        </Link>
      </p>
    </div>
  )
}

export default FooterContent
