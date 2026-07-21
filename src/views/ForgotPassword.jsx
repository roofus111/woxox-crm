'use client'

// Next Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import axios from 'axios'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Snackbar } from '@mui/material'
import MuiAlert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import DirectionalIcon from '@components/DirectionalIcon'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const ForgotPasswordV2 = ({ mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-4-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-4-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

  //State
  const [email, setEmail] = useState('')
  const [loading, setloading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('')
  const [emailError, setEmailError] = useState('')
  const [reason, setReason] = useState('')

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )
  const forgotPass = '/images/forgot-pass.png'
  const logo = '/images/woxoxlogo.png'

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSnackbarClose = () => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()){
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address')
      return
    }

    setloading(true)
    setEmailError('')

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/mail/send-password-reset`, {
        email: email.trim().toLocaleLowerCase()
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('Password reset email sent:', response.data);

      setSnackbarMessage('Password reset code sent to your email')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)

      const encodedEmail = btoa(email.trim().toLocaleLowerCase())
      setTimeout(() => {
        router.push(getLocalizedUrl(`/reset-password/${encodedEmail}`, locale))
      }, 1500)
      
    } catch (error) {
      console.error('Send password reset error:', error.response || error);

      let errorMessage = 'Failed to send reset email. Please try again.'

      if(error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.status === 404) {
          errorMessage = 'No account found with this email address.'
        } else if (error.response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.'
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setloading(false)
    }
  }

return (
  <div className='flex bs-full justify-center items-center min-h-screen relative overflow-hidden'>
        <div className="absolute top-6 left-6 z-10">
          <img src={logo} alt="woxox-logo" className="h-8 w-auto" />
        </div>
    <div className='absolute inset-0 z-[-1]'>
      <img
        src={forgotPass}
        alt='background'
        className='w-full h-full object-cover'
      />
    </div>
    
    {/* Left side - Illustration */}
    <div className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden">
      <div className="relative mt-16">
        
      </div>
    </div>

    {/* Right side - Form */}
    <div className="w-full max-w-md lg:mr-20">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your email and we'll send you instructions to reset your password</p>
        </div>
        
        <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className="relative">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              className={classnames(
                'peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                {
                  'border-red-500': emailError,
                  'opacity-50 cursor-not-allowed': loading
                }
              )}
            />
            <label
              className={classnames(
                'absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500',
                {
                  'text-red-500': emailError,
                }
              )}
            >
              Email
            </label>
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          
          <Button 
            fullWidth 
            variant='contained' 
            type='submit'
            disabled={loading || !email.trim()}
            className="py-3"
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : 'Send Reset Code'}
          </Button>
          
          <div className='flex justify-center mt-4'>
            <Typography className='flex items-center' color='primary'>
              <Link href={getLocalizedUrl('/login', locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon
                  ltrIconClass='ri-arrow-left-s-line'
                  rtlIconClass='ri-arrow-right-s-line'
                  className='text-xl'
                />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </div>
        </form>
      </div>
    </div>
    
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MuiAlert 
        onClose={handleSnackbarClose} 
        severity={snackbarSeverity} 
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </MuiAlert>
    </Snackbar>
  </div>
)
}

export default ForgotPasswordV2
