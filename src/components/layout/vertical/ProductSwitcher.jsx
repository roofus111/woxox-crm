'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import ButtonBase from '@mui/material/ButtonBase'
import { useActiveProductOptional } from '@/contexts/ActiveProductContext'
import useVerticalNav from '@menu/hooks/useVerticalNav'

/**
 * Top-of-sidebar product switcher — only shows purchased / assigned products.
 */
export default function ProductSwitcher() {
  const ctx = useActiveProductOptional()
  const { isCollapsed, isHovered } = useVerticalNav()
  const [anchorEl, setAnchorEl] = useState(null)

  if (!ctx) return null

  const { activeProduct, enabledProducts, setActiveProduct } = ctx
  const compact = isCollapsed && !isHovered

  if (!enabledProducts?.length) return null

  return (
    <Box sx={{ px: compact ? 1 : 2, pb: 1.5, pt: 0.5 }}>
      <ButtonBase
        onClick={e => setAnchorEl(e.currentTarget)}
        aria-label='Switch WOXOX product'
        sx={{
          width: '100%',
          borderRadius: '10px',
          border: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: 'action.hover',
          px: compact ? 1 : 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          justifyContent: compact ? 'center' : 'flex-start',
          textAlign: 'left',
          '&:hover': { bgcolor: 'action.selected' }
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '8px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: activeProduct?.color || 'primary.main',
            color: '#fff',
            flexShrink: 0
          }}
        >
          <i className={activeProduct?.icon || 'ri-apps-line'} style={{ fontSize: 16 }} />
        </Box>
        {!compact ? (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: 'text.secondary' }}>
              PRODUCT
            </Typography>
            <Typography noWrap fontWeight={700} fontSize={13}>
              {activeProduct?.name || 'CRM'}
            </Typography>
          </Box>
        ) : null}
        {!compact ? <i className='ri-arrow-down-s-line text-textSecondary' /> : null}
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { minWidth: 240, mt: 1 } }}
      >
        <Typography sx={{ px: 2, py: 1, fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>
          Your products
        </Typography>
        <Divider />
        {enabledProducts.map(product => {
          const selected = product.id === activeProduct?.id
          return (
            <MenuItem
              key={product.id}
              selected={selected}
              onClick={() => {
                setAnchorEl(null)
                setActiveProduct(product.id, { navigate: true })
              }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: product.color,
                    color: '#fff'
                  }}
                >
                  <i className={product.icon} style={{ fontSize: 14 }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={product.name}
                secondary={product.description}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 600, fontSize: 13 }}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
              {selected ? <i className='ri-check-line' style={{ color: product.color }} /> : null}
            </MenuItem>
          )
        })}
      </Menu>
    </Box>
  )
}
