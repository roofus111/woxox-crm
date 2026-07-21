// Next Imports

'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'
// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const UserVerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar


  const [data, setData] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/getcampaign`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        console.log(response.data.campaign);

        setData(response.data.campaign) // Update data if component is still mounted
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
      })
  }, [])


  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem icon={<i className='ri-home-smile-line' />} href={`/${locale}/home`}>
          Home
        </MenuItem>
        <SubMenu
          label={'Campaigns'}
          icon={<i class="ri-megaphone-line"></i>}
        // suffix={<Chip label='6' size='small' color='error' />}
        >
          {
            data.map((menu, index) => {
              // Check if the menu item has a 'name' property
              console.log(menu);

              if (menu.name) {
                return (
                  <MenuItem key={index} href={`/${locale}/leads/${menu.id}`}>
                    {menu.name}
                  </MenuItem>
                );
              } else {
                return (
                  <MenuItem key={index} href={`/${locale}/leads/${menu.id}`}>
                    {menu}
                  </MenuItem>
                );
              }
            })
          }


        </SubMenu>
        <MenuItem icon={<i className='ri-contacts-line' />} href={`/${locale}/leads`}>
          All Leads
        </MenuItem>
        <MenuItem icon={<i className='ri-calendar-schedule-line' />} href={`/${locale}/followup`}>
          Task Manager
        </MenuItem>
        <MenuItem icon={<i className='ri-coupon-3-line' />} href={`/${locale}/tickets`}>
          Tickets
        </MenuItem>
        <MenuItem icon={<i className='ri-user-line' />} href={`/${locale}/userdashboard`}>
          Users
        </MenuItem>

        {/* <SubMenu
          label={'Home'}
          icon={<i className='ri-home-smile-line' />}
        // suffix={<Chip label='6' size='small' color='error' />}
        >
          <MenuItem href={`/${locale}/dashboards/crm`}>{dictionary['navigation'].crm}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/analytics`}>{dictionary['navigation'].analytics}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/ecommerce`}>{dictionary['navigation'].eCommerce}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/academy`}>{dictionary['navigation'].academy}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/logistics`}>{dictionary['navigation'].logistics}</MenuItem>
        </SubMenu> */}
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 17 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
        </Menu> */}
    </ScrollWrapper>
  )
}

export default UserVerticalMenu
