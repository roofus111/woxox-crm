/** LegalOS accents — surfaces follow WOXOX theme (light/dark). */
export const lg = {
  // Darker gold for readable text/accents on light CRM backgrounds
  gold: '#9A7209',
  goldDark: '#7A5A07',
  radius: '18px',
  font: 'Inter, system-ui, sans-serif'
}

/** Theme-aware sx helpers (pass theme from useTheme()). */
export function lgSurfaces(theme) {
  const dark = theme.palette.mode === 'dark'
  return {
    pageBg: theme.palette.background.default,
    cardBg: theme.palette.background.paper,
    hover: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    text: theme.palette.text.primary,
    textMuted: theme.palette.text.secondary,
    border: dark ? 'rgba(154,114,9,0.4)' : 'rgba(154,114,9,0.28)',
    shadow: dark ? '0 8px 28px rgba(0,0,0,0.35)' : '0 4px 18px rgba(15,23,42,0.06)'
  }
}
