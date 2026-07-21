'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { useActiveProduct } from '@/contexts/ActiveProductContext'
import { getProductNavMenu } from '@/libs/tenantModules'
import { getApiBase } from '@/libs/apiAuth'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

function renderLeafItems(items, locale, pipelines) {
  return items.map(item => {
    if (item.dynamic === 'pipelines') {
      return (
        <SubMenu
          key={item.label}
          label={item.label}
          icon={item.icon ? <i className={item.icon} /> : <i className='ri-flow-chart' />}
        >
          {pipelines.length === 0 ? (
            <MenuItem href={`/${locale}/manager/pipeline`}>No boards yet — Manage</MenuItem>
          ) : (
            pipelines.map(pipe => (
              <MenuItem key={pipe._id} href={`/${locale}/manager/workflow/${pipe._id}`}>
                {pipe.name || 'Untitled pipeline'}
              </MenuItem>
            ))
          )}
          <MenuItem href={`/${locale}/manager/pipeline`} icon={<i className='ri-settings-3-line' />}>
            Manage pipelines
          </MenuItem>
        </SubMenu>
      )
    }

    if (item.children?.length && item.type !== 'section') {
      return (
        <SubMenu key={item.label} label={item.label} icon={item.icon ? <i className={item.icon} /> : undefined}>
          {renderLeafItems(item.children, locale, pipelines)}
        </SubMenu>
      )
    }

    const href = typeof item.href === 'function' ? item.href(locale) : item.href
    return (
      <MenuItem key={`${item.label}-${href}`} href={href} icon={item.icon ? <i className={item.icon} /> : undefined}>
        {item.label}
      </MenuItem>
    )
  })
}

function renderMenuTree(items, locale, productName, pipelines) {
  const hasSections = items.some(item => item.type === 'section')

  if (!hasSections) {
    return <MenuSection label={productName || 'Product'}>{renderLeafItems(items, locale, pipelines)}</MenuSection>
  }

  return items.map(item => {
    if (item.type === 'section') {
      return (
        <MenuSection key={item.label} label={item.label}>
          {renderLeafItems(item.children || [], locale, pipelines)}
        </MenuSection>
      )
    }
    return renderLeafItems([item], locale, pipelines)
  })
}

function menuNeedsPipelines(items) {
  return items.some(item => {
    if (item.dynamic === 'pipelines') return true
    if (item.children?.length) return menuNeedsPipelines(item.children)
    return false
  })
}

/**
 * Independent product sidebar — only items for the active product.
 */
export default function ProductMenu({ scrollMenu }) {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const params = useParams()
  const locale = params?.lang || 'en'
  const { data: session, status } = useSession()
  const { activeProduct } = useActiveProduct()
  const [pipelines, setPipelines] = useState([])

  const menuItems = useMemo(
    () => getProductNavMenu(activeProduct?.id || 'crm', session),
    [activeProduct?.id, session]
  )
  const needsPipelines = useMemo(() => menuNeedsPipelines(menuItems), [menuItems])
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  useEffect(() => {
    if (!needsPipelines) {
      setPipelines([])
      return undefined
    }

    let cancelled = false
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const response = await axios.get(`${getApiBase()}/api/pipelines/getPipeline`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (!cancelled) setPipelines(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Failed to load pipeline boards for product menu:', error)
        if (!cancelled) setPipelines([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [needsPipelines, activeProduct?.id])

  if (status === 'loading') {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Skeleton key={i} variant='text' width={`${50 + (i % 3) * 15}%`} height={34} sx={{ mb: 0.75 }} />
        ))}
      </Box>
    )
  }

  return (
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
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {renderMenuTree(menuItems, locale, activeProduct?.name, pipelines)}
      </Menu>
    </ScrollWrapper>
  )
}
