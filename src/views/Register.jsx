'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { encodeEmail } from '@/utils/base64url'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import axios from 'axios'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

export default function Register({ mode }) {
  // States for form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // States for feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Snackbar (toast) state
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastSeverity, setToastSeverity] = useState('info') // 'error' | 'warning' | 'info' | 'success'

  // Next.js hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  // Image variants
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'
  const lap = '/images/lap2.png'
  const background = '/images/bg-pic.png'
  const logo = '/images/woxoxlogo.png'

  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  // Helpers
  const isValidEmail = (em) => /\S+@\S+\.\S+/.test(em)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setToastOpen(false)
  }

  const showToast = ({ message, severity = 'info' }) => {
    setToastMessage(message)
    setToastSeverity(severity)
    setToastOpen(true)
  }

  // Inside your Register component...
  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    // Basic client-side validation...
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first name and last name.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/register`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim().toLowerCase(),
          password: password,
        }
      )
      const targetUrl = `/en/login`

      router.push(targetUrl)

    } catch (err) {
      console.error('SignUp error:', err)

      if (err.response) {
        const status = err.response.status
        const dataMessage = err.response.data?.message || ''

        if (status === 409 || dataMessage.toLowerCase().includes('already registered')) {
          showToast({ message: 'User already registered. Please login.', severity: 'warning' })
        }
        else if (
          dataMessage.includes('E11000') ||
          dataMessage.toLowerCase().includes('duplicate key')
        ) {
          showToast({ message: 'User already registered. Please login.', severity: 'warning' })
        }
        else if (dataMessage) {
          setError(dataMessage)
        } else {
          setError('Something went wrong during sign up.')
        }
      } else {
        setError('Something went wrong during sign up.')
      }
    } finally {
      setLoading(false)
    }
  }

  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [swingOffset, setSwingOffset] = useState({ x: 0, y: 0 })
  const targetOffset = useRef({ x: 0, y: 0 })
  const swingTime = useRef(0)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = e.clientX - rect.left - rect.width / 2
    const relY = e.clientY - rect.top  - rect.height / 2
    const max = 20

    targetOffset.current = {
      x: (relX / (rect.width  / 2)) * max,
      y: (relY / (rect.height / 2)) * max,
    }
  }

  const handleMouseLeave = () => {
    targetOffset.current = { x: 0, y: 0 }
  }

  useEffect(() => {
    let frameId

    const animate = () => {
      swingTime.current += 0.008
      const swingX = Math.sin(swingTime.current) * 3
      const swingY = Math.cos(swingTime.current * 0.7) * 2

      setSwingOffset({ x: swingX, y: swingY })

      setOffset(prev => {
        const x = prev.x + (targetOffset.current.x - prev.x) * 0.1
        const y = prev.y + (targetOffset.current.y - prev.y) * 0.1
        return { x, y }
      })

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [])

return (
  <div className='flex bs-full justify-center items-center min-h-screen relative overflow-hidden'>
        <div className="absolute top-6 left-6 z-10">
          <Link href='/login'>
          <img src={logo} alt="woxox-logo" className="h-8 w-auto" />
          </Link>
        </div>
    {/* Background Image */}
    <div className='absolute inset-0 z-[-1]'>
      <img
        src={background}
        alt='background'
        className='w-full h-full object-cover'
      />
    </div>
    {/* Left side - Laptop illustration */}
      <div
        className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative mt-16 transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(${offset.x + swingOffset.x}px, ${offset.y + swingOffset.y}px, 0) rotate(${swingOffset.x * 0.5}deg)`,
          }}
        >
          <img
            src={lap}
            alt="laptop illustration"
            className="w-[700px] lg:w-[670px] drop-shadow-2xl"
          />
        </div>
      </div>

      <div className="w-full max-w-md lg:mr-20">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join thousands of businesses using Woxox CRM</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Enter your last name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={isPasswordShown ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 pr-12"
                  placeholder="Create a strong password"
                />
                <IconButton
                  type="button"
                  onClick={() => setIsPasswordShown(!isPasswordShown)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {isPasswordShown ? <i class="ri-eye-line"></i> : <i class="ri-eye-off-line"></i>}
                </IconButton>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-100/50 p-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Create Account Button - Fixed */}
            <Button 
              fullWidth 
              variant='contained' 
              type='submit' 
              disabled={loading}
              className="!py-3"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>

            {/* Google Sign Up */}
            <button
              type="button"
              className="w-full bg-transparent hover:bg-gray-50 cursor-pointer text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            {/* Sign in link */}
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/login', locale)} color='primary'>
                Sign in
              </Typography>
            </div>
          </form>
        </div>
      </div>

      {/* Snackbar Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span>{toastMessage}</span>
          <Button
            variant='outlined'
            className='ml-4'
            color="inherit"
            size="small"
            onClick={() => {
              setToastOpen(false)
              router.push(getLocalizedUrl('/login', locale))
            }}
          >
            Login
          </Button>
        </Alert>
      </Snackbar>
    </div>
  )
}