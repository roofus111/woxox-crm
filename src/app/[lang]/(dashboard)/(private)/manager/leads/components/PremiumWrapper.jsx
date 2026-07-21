import React from 'react'
// MUI Imports
import { Box, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'

// Styled components for premium overlay
const PremiumOverlay = styled(Box)(({ theme }) => ({
  position: 'relative',
  maxHeight: "100vh",
  overflow: 'hidden',
  borderRadius: theme.spacing(1),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: 'blur(8px)',
    zIndex: 2,
  }
}))

const PremiumContent = styled(Box)({
  filter: 'blur(4px)',
  pointerEvents: 'none',
  userSelect: 'none',
})

// Styled lock icon button
const LockIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 3,
  fontSize: 48,
  color: theme.palette.primary.main,
  backdropFilter: 'blur(10px)',
  borderRadius: '50%',
  width: 80,
  height: 80,
  '&:hover': {
  backgroundColor: "transparent",
    transform: 'translate(-50%, -50%) scale(1.1)',
  },
  '& i': {
    fontSize: 48,
    color: 'inherit'
  }
}))

const PremiumWrapper = ({ 
  children, 
  isPremium = false, 
  onUpgrade
}) => {
  if (isPremium) {
    return <>{children}</>
  }

  return (
    <PremiumOverlay>
      <PremiumContent>
        {children}
      </PremiumContent>
      
      <LockIconButton onClick={onUpgrade}>
        <i className="ri-lock-2-line"></i>
      </LockIconButton>
    </PremiumOverlay>
  )
}

export default PremiumWrapper