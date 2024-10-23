// Component Imports
'use client'
import LayoutFooter from '@layouts/components/vertical/Footer'
import FooterContent from './FooterContent'
import UserFooterContent from './UserFooterContent';

const Footer = (user) => {
  console.log(user);

  return (
    <LayoutFooter>
      {user != 'user' ? <UserFooterContent /> : <FooterContent />}
    </LayoutFooter>
  )
}

export default Footer
