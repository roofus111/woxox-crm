'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { lg, lgSurfaces } from './theme'

export function LgPageHeader({ title, subtitle, crumbs = [], action }) {
  const params = useParams()
  const locale = params?.lang || 'en'

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 3,
        mb: 3
      }}
    >
      <Box>
        <Breadcrumbs
          sx={{
            mb: 1,
            '& .MuiBreadcrumbs-separator': { color: 'text.secondary' },
            '& a': { color: 'text.secondary', textDecoration: 'none', '&:hover': { color: lg.gold } }
          }}
        >
          <Typography component={Link} href={`/${locale}/apps/legalos/dashboard`} sx={{ fontSize: 13 }}>
            LegalOS
          </Typography>
          {crumbs.map((c, i) => (
            <Typography
              key={i}
              sx={{ color: i === crumbs.length - 1 ? lg.gold : 'text.secondary', fontSize: 13 }}
            >
              {c.label}
            </Typography>
          ))}
        </Breadcrumbs>
        <Typography variant='h4' fontWeight={700} sx={{ letterSpacing: -0.5, color: 'text.primary' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 14 }}>{subtitle}</Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  )
}

export function LgCard({ children, sx = {}, onClick, noHover }) {
  const theme = useTheme()
  const s = lgSurfaces(theme)

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: `1px solid ${s.border}`,
        borderRadius: lg.radius,
        boxShadow: s.shadow,
        transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
        ...(noHover
          ? {}
          : {
              '&:hover': {
                bgcolor: s.hover,
                borderColor: 'rgba(154,114,9,0.5)',
                transform: 'translateY(-2px)'
              }
            }),
        ...sx
      }}
    >
      {children}
    </Card>
  )
}

export function LgStat({ label, value, hint }) {
  return (
    <LgCard>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.2,
            textTransform: 'uppercase'
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 28, fontWeight: 700, color: lg.gold }}>{value}</Typography>
        {hint ? (
          <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>{hint}</Typography>
        ) : null}
      </CardContent>
    </LgCard>
  )
}

export function LgSection({ title, action, children, sx = {} }) {
  return (
    <LgCard noHover sx={sx}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: 16, color: 'text.primary' }}>
            {title}
          </Typography>
          {action}
        </Box>
        {children}
      </CardContent>
    </LgCard>
  )
}

export function LgChip({ label, tone = 'gold' }) {
  const map = {
    gold: { bg: 'rgba(154,114,9,0.12)', color: lg.gold },
    success: { bg: 'rgba(76,175,80,0.15)', color: '#2e7d32' },
    warning: { bg: 'rgba(244,180,0,0.18)', color: '#b26a00' },
    danger: { bg: 'rgba(229,57,53,0.12)', color: '#c62828' }
  }
  const t = map[tone] || map.gold
  return (
    <Chip size='small' label={label} sx={{ bgcolor: t.bg, color: t.color, fontWeight: 700, borderRadius: '8px' }} />
  )
}

export function LgDataTable({ columns = [], rows = [], searchPlaceholder = 'Search…', onSearch }) {
  const theme = useTheme()
  const s = lgSurfaces(theme)

  return (
    <Box>
      {onSearch ? (
        <TextField
          size='small'
          placeholder={searchPlaceholder}
          onChange={e => onSearch(e.target.value)}
          sx={{ mb: 2, maxWidth: 360, width: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search size={16} color={lg.gold} />
              </InputAdornment>
            )
          }}
        />
      ) : null}
      <TableContainer
        sx={{
          borderRadius: lg.radius,
          border: `1px solid ${s.border}`,
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Table stickyHeader size='small'>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  sx={{
                    bgcolor: 'action.hover',
                    color: lg.gold,
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 0.6,
                    borderBottom: `1px solid ${s.border}`,
                    textTransform: 'uppercase'
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ color: 'text.secondary' }}>
                  No records
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow
                  key={row.id || row._id || i}
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'rgba(154,114,9,0.08) !important' },
                    '& td': { borderColor: 'divider', color: 'text.primary' }
                  }}
                >
                  {columns.map(col => (
                    <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
