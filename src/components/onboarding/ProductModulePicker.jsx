'use client'

import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import { getAllProducts } from '@configs/products'
import { storeEnabledProducts, readStoredEnabledProducts } from '@/libs/tenantModules'

/**
 * Signup / onboarding: let customers select WOXOX products (modules).
 * Only modules included in the paid plan can be selected.
 */
export default function ProductModulePicker({
  value,
  onChange,
  onContinue,
  allowedProductIds = null,
  title = 'Choose your WOXOX products',
  subtitle = 'Only selected products appear in navigation. You can add more anytime from Marketplace.'
}) {
  const catalog = getAllProducts()
  const allowed = useMemo(() => {
    const base = allowedProductIds?.length ? allowedProductIds : catalog.map(p => p.id)
    return base.includes('crm') ? base : ['crm', ...base]
  }, [allowedProductIds, catalog])

  const initial = useMemo(() => {
    const stored = value?.length ? value : readStoredEnabledProducts()
    const picked = (stored || allowed).filter(id => allowed.includes(id))
    return picked.includes('crm') ? picked : ['crm', ...picked]
  }, [allowed, value])

  const [selected, setSelected] = useState(() => new Set(initial))

  const toggle = id => {
    if (id === 'crm') return
    if (!allowed.includes(id)) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      const list = [...next]
      onChange?.(list)
      return next
    })
  }

  const handleContinue = () => {
    const list = storeEnabledProducts([...selected].filter(id => allowed.includes(id)))
    onChange?.(list)
    onContinue?.(list)
  }

  return (
    <Box sx={{ maxWidth: 880, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        {subtitle}
      </Typography>

      <Grid container spacing={2}>
        {catalog.map(product => {
          const checked = selected.has(product.id)
          const locked = product.isCore
          const notIncluded = !allowed.includes(product.id)
          const disabled = locked || notIncluded
          return (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Paper
                variant='outlined'
                onClick={() => !disabled && toggle(product.id)}
                sx={{
                  p: 2,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: notIncluded ? 0.55 : 1,
                  borderColor: checked ? product.color : 'divider',
                  borderWidth: checked ? 2 : 1,
                  height: '100%',
                  transition: 'border-color .15s ease, box-shadow .15s ease',
                  boxShadow: checked ? `0 0 0 1px ${product.color}33` : 'none'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: product.color,
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <i className={product.icon} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggle(product.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      }
                      label={<Typography fontWeight={700}>{product.name}</Typography>}
                      sx={{ m: 0, alignItems: 'center' }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      {product.description}
                    </Typography>
                    {locked ? (
                      <Typography sx={{ mt: 0.75, fontSize: 11, fontWeight: 700, color: product.color }}>
                        Included · Core
                      </Typography>
                    ) : notIncluded ? (
                      <Typography sx={{ mt: 0.75, fontSize: 11, fontWeight: 700, color: 'text.disabled' }}>
                        Not in your plan
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {onContinue ? (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='contained' size='large' onClick={handleContinue}>
            Continue with {selected.size} product{selected.size === 1 ? '' : 's'}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}
