// React Imports
import React from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
// import EventIcon from '@mui/icons-material/Event'

// Forward Ref Wrapper
const CustomInput = React.forwardRef((props, ref) => {
  // Destructure props
  const { label, readOnly, onClick, value, ...otherProps } = props

  return (
    <TextField
      {...otherProps}
      label={label}
      value={value}
      onClick={onClick}
      inputRef={ref} // Using inputRef prop to forward the ref to the MUI TextField
      //   InputProps={{
      //     readOnly, // Pass readOnly dynamically
      //     endAdornment: (
      //       <InputAdornment position='end'>
      //         <EventIcon />
      //       </InputAdornment>
      //     )
      //   }}
      variant='outlined'
      fullWidth
    />
  )
})

export default CustomInput
