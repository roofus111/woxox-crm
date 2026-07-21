'use client'

import { useRef, useState } from 'react'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { useSettings } from '@core/hooks/useSettings'

/** Top-right moon/sun toggle for global WOXOX light ↔ dark mode. */
const ModeDropdown = () => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const anchorRef = useRef(null)
  const { settings, updateSettings } = useSettings()

  const isDark = settings.mode === 'dark'

  const handleToggle = () => {
    updateSettings({ mode: isDark ? 'light' : 'dark' })
  }

  return (
    <Tooltip
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      open={tooltipOpen}
    >
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        className='text-textPrimary'
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <i className={isDark ? 'ri-sun-line' : 'ri-moon-clear-line'} />
      </IconButton>
    </Tooltip>
  )
}

export default ModeDropdown
