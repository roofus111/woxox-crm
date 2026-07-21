'use client'

// React Imports
import { useEffect, useState, useRef } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { encodeEmail, decodeEmail } from '@/utils/base64url' // Added decodeEmail import

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
import MuiAlert from '@mui/material/Alert'

// Third-party Imports
import { signIn, useSession } from 'next-auth/react'
import { isCrmPlatformEnabled, loginCrmPlatform } from '@/libs/crmPlatformApi'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import classnames from 'classnames'
import axios from 'axios'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { toast } from 'react-toastify'

const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }) => {
  // States
  const session = useSession()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('error')

  // Ref to prevent multiple redirections
  const hasRedirected = useRef(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const lap = '/images/lap2.png'
  const background = '/images/bg-pic.png'
  const logo = '/images/woxoxlogo.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  // Helper function to send verification email
  const sendVerificationEmail = async (email) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mail/send-email-verification`,
        { email: email.trim().toLowerCase() }
      )
    } catch (err) {
      console.error('Failed to send verification email:', err)
    }
  }

  const onSubmit = async (data) => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res && res.ok && res.error === null) {
      if (isCrmPlatformEnabled()) {
        try {
          await loginCrmPlatform(data.email, data.password)
        } catch (platformErr) {
          console.warn('CRM platform login skipped:', platformErr.message)
        }
      }
      toast.success('Successfully Logged In')
    } else if (res?.error) {
      let errorObj
      try {
        errorObj = JSON.parse(res.error)
      } catch (err) {
        errorObj = { message: [res.error] }
      }
      setErrorState(errorObj)
      setSnackbarMessage(errorObj.message[0] || 'Incorrect email or password')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  useEffect(() => {
    if (session.status !== 'authenticated' || !session.data?.user) return
    if (hasRedirected.current) return

    if (session.data.accessToken) {
      localStorage.setItem('token', session.data.accessToken)
    }

    hasRedirected.current = true
    const redirectURL = searchParams.get('redirectTo') ?? '/dashboards/crm'
    router.replace(getLocalizedUrl(redirectURL, locale))
  }, [session.status, session.data, locale, searchParams, router])

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

  // useEffect(() => {
  //   const handleRedirection = async () => {
  //     // Only proceed if we have a stable authenticated session
  //     if (session.status !== 'authenticated' || !session.data?.user) {
  //       console.log('[Login] Not authenticated or no user data, skipping redirection')
  //       return
  //     }

  //     // Prevent multiple redirections - check if already redirected
  //     if (hasRedirected.current) {
  //       console.log('[Login] Already redirected, skipping...')
  //       return
  //     }

  //     console.log('[Login] session.data.user:', session.data.user)

  //     try {
  //       // Store token
  //       if (session.data.accessToken) {
  //         localStorage.setItem('token', session.data.accessToken)
  //       }

  //       const sessionUser = session.data.user
  //       const isVerified = sessionUser?.isEmailVerified
  //       const email = sessionUser?.email
  //       const companyId = sessionUser?.company

  //       console.log('[Login Debug] isEmailVerified:', isVerified)
  //       console.log('[Login Debug] email:', email)
  //       console.log('[Login Debug] company:', companyId)

  //       // Mark as redirected BEFORE any navigation to prevent race conditions
  //       hasRedirected.current = true

  //       // First check if email is verified
  //       if (isVerified === false && email) {
  //         console.log('[Login] Email not verified, sending verification and redirecting')

  //         // Send verification email
  //         await sendVerificationEmail(email)

  //         // Encode email and navigate to email validation page
  //         const emailToEncode = email.trim().toLowerCase()
  //         const encoded = encodeEmail(emailToEncode)
  //         const targetUrl = `/email-validation/${encoded}`

  //         console.log('Navigating to email validation:', targetUrl)
  //         router.replace(getLocalizedUrl(targetUrl, locale))
  //         return // Exit early
  //       }

  //       // Email is verified, now check for company registration
  //       const hasValidCompany = companyId &&
  //         companyId !== '' &&
  //         companyId !== null &&
  //         companyId !== undefined &&
  //         companyId !== 'null' &&
  //         companyId !== 'undefined'

  //       if (!hasValidCompany) {
  //         console.log('[Login] No valid company found, redirecting to company registration')
  //         router.replace(getLocalizedUrl('/company-register', locale))
  //       } else {
  //         console.log('[Login] Valid company found, redirecting to dashboard')
  //         const redirectURL = searchParams.get('redirectTo') ?? '/'
  //         router.replace(getLocalizedUrl(redirectURL, locale))
  //       }

  //     } catch (error) {
  //       console.error('Error during redirection:', error)
  //       // Reset the flag on error so user can try again
  //       hasRedirected.current = false
  //     }
  //   }

  //   handleRedirection()
  // }, [
  //   session.status,
  //   session.data?.user?.id, // Only watch the user ID instead of the entire user object
  //   locale,
  //   searchParams,
  //   router
  // ])

  // useEffect(() => {
  //   if (session.status === 'unauthenticated') {
  //     console.log('[Login] Session unauthenticated, resetting redirect flag')
  //     hasRedirected.current = false
  //   }
  // }, [session.status])

  // // Additional effect to handle loading state
  // useEffect(() => {
  //   if (session.status === 'loading') {
  //     console.log('[Login] Session loading, resetting redirect flag')
  //     hasRedirected.current = false
  //   }
  // }, [session.status])

  // // Reset redirect flag when session status changes to unauthenticated
  // useEffect(() => {
  //   if (session.status === 'unauthenticated') {
  //     hasRedirected.current = false
  //   }
  // }, [session.status])

  return (
  <div className='flex bs-full justify-center items-center min-h-screen relative overflow-hidden'>
        <div className="absolute top-6 left-6 z-10">
          <Link href="/" >
          <img src={logo} alt="woxox-logo" className="h-8 w-auto" />
          </Link>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to WOXOX!</h1>
            <p className="text-gray-600">Please sign-in to your account and start the adventure</p>
          </div>
          <form
            noValidate
            action={() => { }}
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="relative">
                <input
                  {...field}
                  type="email"
                  placeholder=" "
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  className={classnames(
                    'peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    {
                      'border-red-500': errors.email || errorState,
                    }
                  )}
                />
                <label
                  className={classnames(
                    'absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500',
                    {
                      'text-red-500': errors.email || errorState,
                    }
                  )}
                >
                  Email
                </label>
                {(errors.email || errorState) && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email?.message || errorState?.message[0]}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name='password'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="relative">
                <input
                  {...field}
                  type={isPasswordShown ? 'text' : 'password'}
                  placeholder=" "
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  className={classnames(
                    'peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10',
                    {
                      'border-red-500': errors.password,
                    }
                  )}
                />
                <label
                  className={classnames(
                    'absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500',
                    {
                      'text-red-500': errors.password,
                    }
                  )}
                >
                  Password
                </label>
                <IconButton
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                >
                  <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </IconButton>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
            )}
          />

            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
              <Typography
                className='text-end'
                color='primary'
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale)}
              >
                Forgot password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit'>
              Log In
            </Button>
          </form>
            <div className="flex justify-center mt-4">
              <Button
                color="secondary"
                className="text-textPrimary"
                startIcon={<img src="/images/logos/google.png" alt="Google" width={22} />}
                sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
                onClick={() => signIn('google')}
              >
                Sign in with Google
              </Button>
            </div>
              <div className='flex justify-center mt-2 items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/register', locale)} color='primary'>
                Create an account
              </Typography>
            </div>
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
          sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  )
}

export default Login
