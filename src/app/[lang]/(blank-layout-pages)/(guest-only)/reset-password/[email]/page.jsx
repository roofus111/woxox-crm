'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, minLength, nonEmpty } from 'valibot'
import { getLocalizedUrl } from '@/utils/i18n'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Component Imports
import Logo from '@components/layout/shared/Logo'

const schema = object({
  newPassword: pipe(
    string(),
    nonEmpty('Password is required'),
    minLength(8, 'Password must be at least 8 characters long')
  ),
  confirmPassword: pipe(
    string(),
    nonEmpty('Please confirm your password')
  )
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const { email: emailParam, lang: locale } = useParams()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loadingVerify, setLoadingVerify] = useState(false)
  const [loadingResend, setLoadingResend] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('error')
  const [step, setStep] = useState(1) // 1: OTP verify, 2: reset form

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  })

  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')

  // decode email from URL or Base64
  const decodeEmail = (encodedEmail) => {
    try {
      let decoded = decodeURIComponent(encodedEmail)
      if (decoded.includes('@')) return decoded.toLowerCase()

      try {
        const b = atob(decoded)
        if (b.includes('@')) return b.toLowerCase()
      } catch {}

      try {
        const b2 = atob(encodedEmail)
        if (b2.includes('@')) return b2.toLowerCase()
      } catch {}

      return decoded.toLowerCase()
    } catch {
      return encodedEmail.toLowerCase()
    }
  }

  useEffect(() => {
    if (!emailParam) {
      router.push(getLocalizedUrl('/forgot-password', locale))
      return
    }
    const decoded = decodeEmail(emailParam)
    setEmail(decoded)
    if (!decoded.includes('@') || !decoded.includes('.')) {
      setSnackbarMessage('Invalid email format. Please go back and try again.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }, [emailParam, router, locale])

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false)
  }

  const handleInputChange = (i, val) => {
    if (val.length > 1 || /\D/.test(val)) return
    const arr = [...code]; arr[i] = val; setCode(arr)
    if (val && i < 5) {
      const nxt = document.getElementById(`code-${i+1}`)
      nxt?.focus()
    }
    if (snackbarOpen && snackbarSeverity === 'error') setSnackbarOpen(false)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      document.getElementById(`code-${i-1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) {
      setCode(digits.split(''))
      setTimeout(() => document.getElementById('code-5')?.focus(), 10)
    }
  }

  // Handle password reset (Step 2)
const handleResetPassword = async (data) => {
  const otp = code.join('')
  
  if (otp.length < 6) {
    setSnackbarMessage('Please enter the full 6-digit code.')
    setSnackbarSeverity('error')
    setSnackbarOpen(true)
    return
  }

  if (data.newPassword !== data.confirmPassword) {
    setSnackbarMessage('Passwords do not match.')
    setSnackbarSeverity('error')
    setSnackbarOpen(true)
    return
  }

  setLoadingVerify(true)
  try {
    // Single API call that verifies OTP AND resets password
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/mail/verify-password-reset`,
      {
        email: email.trim().toLowerCase(),
        otp,
        newPassword: data.newPassword
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    )
    
    setSnackbarMessage('Password reset successfully! Redirecting to login...')
    setSnackbarSeverity('success')
    setSnackbarOpen(true)
    setTimeout(() => {
      router.push(getLocalizedUrl('/login', locale))
    }, 2000)
  } catch (err) {
    console.error('Reset error:', err)
    let msg = 'Failed to reset password. Please try again.'
    if (err.response?.data?.message) msg = err.response.data.message
    else if (err.response?.status === 404) msg = 'OTP not found or expired. Please request a new code.'
    else if (err.response?.status === 400) msg = 'Invalid or expired OTP. Try again.'
    else if (err.request) msg = 'Network error. Check your connection.'
    
    setSnackbarMessage(msg)
    setSnackbarSeverity('error')
    setSnackbarOpen(true)
    
    // Reset the form
    setCode(['','','','','',''])
    setTimeout(() => document.getElementById('code-0')?.focus(), 100)
  } finally {
    setLoadingVerify(false)
  }
}

  const handleResendCode = async () => {
    if (loadingResend) return
    setSnackbarOpen(false)
    setLoadingResend(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mail/send-password-reset`,
        { email: email.trim().toLowerCase() },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      )
      setSnackbarMessage('A new code has been sent. Please check your email.')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      setCode(['','','','','',''])
      setStep(1)
      setTimeout(() => {
        setSnackbarMessage('You can now enter the new code.')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        document.getElementById('code-0')?.focus()
      }, 2000)
    } catch (err) {
      console.error('Resend error:', err)
      const msg = err.response?.data?.message || 'Could not resend code. Please try again.'
      setSnackbarMessage(msg)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoadingResend(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl border rounded-3xl shadow-none">
        <CardContent className="p-8">
          <Box className="text-center mb-6">
            <Typography variant="h4" className="mb-2 font-semibold text-left text-blue-600">
              Reset Password
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Enter the 6-digit verification code sent to:
            </Typography>
            <Typography className="text-blue-500 font-medium text-lg p-2 break-all">
              {email}
            </Typography>
          </Box>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((d, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={d}
                onChange={e => handleInputChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-12 text-center border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                disabled={loadingVerify}
              />
            ))}
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  disabled={loadingVerify}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!errors.confirmPassword || (confirmPassword && newPassword !== confirmPassword)}
                  helperText={
                    errors.confirmPassword?.message ||
                    (confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : '')
                  }
                  disabled={loadingVerify}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={
                loadingVerify || 
                code.join('').length < 6 || 
                !newPassword || 
                !confirmPassword || 
                newPassword !== confirmPassword
              }
              className="py-3"
            >
              {loadingVerify ? 'Resetting Password…' : 'Reset Password'}
            </Button>
          </form>

          <Typography variant="body2" className="text-center mt-4">
            Didn't get a code?{' '}
            <button
              onClick={handleResendCode} 
              disabled={loadingResend || loadingVerify}
              className="underline cursor-pointer text-blue-500"
            >
              {loadingResend ? 'Sending…' : 'Resend code'}
            </button>
          </Typography>

          <Divider className="my-4" />

          <Typography variant="body2" className="text-center">
            Remember your password?{' '}
            <Link href={getLocalizedUrl('/login', locale)} className="text-blue-600">
              Back to Login
            </Link>
          </Typography>

          <Typography variant="caption" className="block text-center mt-4">
            The verification code will expire in 10 minutes.
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  )
}