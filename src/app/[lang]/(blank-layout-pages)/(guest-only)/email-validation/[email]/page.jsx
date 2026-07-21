'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { getLocalizedUrl } from '@/utils/i18n'
import { useSession } from "next-auth/react"
import { Button } from '@mui/material'

// Constants
const OTP_LENGTH = 6
const API_TIMEOUT = 10000
const REDIRECT_DELAY = 1500
const RESEND_DELAY = 2000

const background = '/images/background.jpg'
const logo = '/images/woxoxlogo.png'

// Custom hook for OTP management
const useOTP = (length = OTP_LENGTH) => {
  const [code, setCode] = useState(Array(length).fill(''))

  const updateCode = useCallback((index, value) => {
    setCode(prev => {
      const newCode = [...prev]
      newCode[index] = value
      return newCode
    })
  }, [])

  const resetCode = useCallback(() => {
    setCode(Array(length).fill(''))
  }, [length])

  const getOTPString = useCallback(() => code.join(''), [code])

  const isComplete = useCallback(() => getOTPString().length === length, [getOTPString, length])

  return { code, updateCode, resetCode, getOTPString, isComplete }
}

// Custom hook for API calls
const useEmailAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const makeRequest = useCallback(async (endpoint, data, options = {}) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        data,
        {
          timeout: API_TIMEOUT,
          headers: { 'Content-Type': 'application/json' },
          ...options
        }
      )
      console.log('API Response:', response) // Debug logging
      return response.data
    } catch (err) {
      const errorMessage = handleAPIError(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setError('')
    setMessage('')
  }, [])

  const setSuccessMessage = useCallback((msg) => {
    setMessage(msg)
  }, [])

  return { loading, error, message, makeRequest, clearMessages, setSuccessMessage, setError }
}

// Error handling utility
const handleAPIError = (err) => {
  if (err.response) {
    const { status, data } = err.response
    if (data?.message) return data.message

    switch (status) {
      case 404: return 'OTP not found. Please request a new code.'
      case 400: return 'Invalid or expired OTP. Please try again or request a new code.'
      default: return 'Verification failed. Please try again.'
    }
  } else if (err.request) {
    return 'Network error. Please check your connection and try again.'
  }
  return 'An unexpected error occurred. Please try again.'
}

// Email decoding utility
const decodeEmail = (encodedEmail) => {
  try {
    let decoded = decodeURIComponent(encodedEmail)

    if (decoded.includes('@')) {
      return decoded.toLowerCase()
    }

    try {
      const base64Decoded = atob(encodedEmail)
      if (base64Decoded.includes('@')) {
        return base64Decoded.toLowerCase()
      }
    } catch {
      // Not Base64 encoded, continue
    }

    return decoded.toLowerCase()
  } catch (error) {
    console.error('Error decoding email:', error)
    return encodedEmail.toLowerCase()
  }
}

// OTP Input Component
const OTPInput = React.memo(({
  code,
  onInputChange,
  onKeyDown,
  disabled,
  onPaste
}) => (
  <div className="flex justify-center gap-2 mb-6" onPaste={onPaste}>
    {code.map((digit, idx) => (
      <input
        key={idx}
        id={`code-${idx}`}
        type="text"
        inputMode="numeric"
        pattern="\d*"
        autoComplete="one-time-code"
        value={digit}
        onChange={(e) => onInputChange(idx, e.target.value)}
        onKeyDown={(e) => onKeyDown(idx, e)}
        className="w-12 h-12 text-center text-lg font-medium border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        maxLength={1}
        aria-label={`Digit ${idx + 1}`}
        disabled={disabled}
      />
    ))}
  </div>
))

// Enhanced Loading Spinner Component
const LoadingSpinner = ({ size = "h-4 w-4", color = "text-blue-500" }) => (
  <svg className={`animate-spin ${size} ${color}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

export default function EmailValidationPage() {
  const router = useRouter()
  const { email: emailParam, lang: locale } = useParams()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()

  // Debug session status
  console.log('Session status:', status)
  console.log('Session data:', session)

  // State management
  const [email, setEmail] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Custom hooks
  const { code, updateCode, resetCode, getOTPString, isComplete } = useOTP()
  const { loading: loadingVerify, error, message, makeRequest, clearMessages, setSuccessMessage, setError } = useEmailAPI()
  const { loading: loadingResend, makeRequest: makeResendRequest } = useEmailAPI()

  // Memoized values
  const redirectURL = useMemo(() =>
    searchParams.get('redirectTo') ?? '/', [searchParams]
  )

  // Email initialization effect
  useEffect(() => {
    if (!emailParam) {
      router.push(getLocalizedUrl('/register', locale))
      return
    }

    const decodedEmail = decodeEmail(emailParam)
    setEmail(decodedEmail)

    if (!decodedEmail.includes('@') || !decodedEmail.includes('.')) {
      clearMessages()
      setError('Invalid email format. Please go back and try again.')
    }
  }, [emailParam, router, locale, clearMessages, setError])

  // Auto-send OTP effect
  useEffect(() => {
    const sendOTP = async (email) => {
      try {
        await makeRequest('/api/mail/send-email-verification', {
          email: email.trim().toLowerCase()
        })
      } catch (err) {
        console.error('Failed to send initial OTP:', err)
        setError('Failed to send initial OTP. Please try again.')
      }
    }

    if (email) {
      sendOTP(email)
    }
  }, [email, makeRequest])

  // Event handlers
  const handleInputChange = useCallback((idx, val) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return

    updateCode(idx, val)

    // Auto-focus next input
    if (val && idx < OTP_LENGTH - 1) {
      const next = document.getElementById(`code-${idx + 1}`)
      if (next) next.focus()
    }

    // Clear errors when user starts typing
    if (error) clearMessages()
  }, [updateCode, error, clearMessages])

  const handleKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      const prev = document.getElementById(`code-${idx - 1}`)
      if (prev) prev.focus()
    }
  }, [code])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pastedData.length === OTP_LENGTH) {
      const newCode = pastedData.split('')
      newCode.forEach((digit, idx) => updateCode(idx, digit))

      setTimeout(() => {
        const last = document.getElementById(`code-${OTP_LENGTH - 1}`)
        if (last) last.focus()
      }, 10)
    }
  }, [updateCode])

  const handleVerifyEmail = useCallback(async () => {
    if (isVerifying || loadingVerify || !isComplete()) return

    setIsVerifying(true)
    clearMessages()

    try {
      const response = await makeRequest('/api/mail/verify-email', {
        email: email.trim().toLowerCase(),
        otp: getOTPString().trim()
      })

      console.log('Verification response:', response) // Log the full response

      // Update session with proper error handling
      try {
        if (session) {
          console.log('Updating session with existing data:', session)
          await update({
            ...session,
            user: {
              ...session.user,
              isEmailVerified: true
            }
          })
          console.log('Session updated successfully')
        } else {
          console.log('No session available, creating new session data')
          await update({
            user: {
              isEmailVerified: true
            }
          })
          console.log('New session data created')
        }
      } catch (sessionError) {
        console.error('Error updating session:', sessionError)
        // Continue with the flow even if session update fails
      }

      setSuccessMessage('Email verified successfully! Redirecting to login...')
      resetCode()

      setTimeout(() => {
        router.push(getLocalizedUrl(redirectURL, locale))
      }, REDIRECT_DELAY)

    } catch (err) {
      console.error('Verification error:', err)
      resetCode()
      setTimeout(() => {
        const first = document.getElementById('code-0')
        if (first) first.focus()
      }, 100)
    } finally {
      setIsVerifying(false)
    }
  }, [isVerifying, loadingVerify, isComplete, makeRequest, email, getOTPString, update, session, setSuccessMessage, resetCode, router, redirectURL, locale, clearMessages])

  const handleResendCode = useCallback(async () => {
    if (loadingResend) return

    try {
      await makeResendRequest('/api/mail/resend-email-verification', {
        email: email.trim().toLowerCase()
      })

      setSuccessMessage('A new code has been sent to your email. Please wait a moment before verifying.')
      resetCode()

      setTimeout(() => {
        setSuccessMessage('You can now enter the new verification code.')
        const first = document.getElementById('code-0')
        if (first) first.focus()
      }, RESEND_DELAY)

    } catch (err) {
      // Error is already handled by the hook
    }
  }, [loadingResend, makeResendRequest, email, setSuccessMessage, resetCode])

  const handleChangeEmail = useCallback(() => {
    router.push(getLocalizedUrl('/register', locale))
  }, [router, locale])

  // Early return for invalid email
  if (!email || !email.includes('@')) {
    return (
      <div className='flex bs-full justify-center items-center min-h-screen relative overflow-hidden'>
        <div className='absolute inset-0 z-[-1]'>
          <div className="w-full h-full bg-gradient-to-br from-blue-200 via-blue-300 to-cyan-200"></div>
        </div>

        <div className="w-full max-w-md lg:mr-20">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Email</h2>
            <p className="text-gray-600 mb-6">The email format is invalid. Please go back and try again.</p>
            <button
              onClick={handleChangeEmail}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex bs-full justify-center items-center min-h-screen relative overflow-hidden'>
      <div className="absolute top-6 left-6 z-10">
        <img src={logo} alt="woxox-logo" className="h-8 w-auto" />
      </div>
      <div className='absolute inset-0 z-[-1]'>
        <img
          src={background}
          alt='background'
          className='w-full h-full object-cover'
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full max-w-md lg:mr-20">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to your mail
            </p>
          </div>

          {/* OTP Input */}
          <OTPInput
            code={code}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loadingVerify}
            onPaste={handlePaste}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-100/70 backdrop-blur-sm border border-red-300/70 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-100/70 backdrop-blur-sm border border-green-300/70 text-green-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm text-center">{message}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col gap-4">
            {/* Verify Button */}
            <Button
              onClick={handleVerifyEmail}
              disabled={loadingVerify || isVerifying || !isComplete()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all duration-200 font-medium shadow-lg"
            >
              {loadingVerify ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Verifying...
                </span>
              ) : 'Verify Email'}
            </Button>

            {/* Change Email Button */}
            <Button
              onClick={handleChangeEmail}
              disabled={loadingVerify}
              className="w-full bg-transparent border border-white/30 text-gray-700 hover:bg-white/10 py-3 px-6 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 backdrop-blur-sm"
            >
              Change Email
            </Button>

            {/* Resend Code Link */}
            <div className="text-center mt-2">
              <span className="text-gray-600 text-sm">Didn't receive a code? </span>
              <Button
                onClick={handleResendCode}
                disabled={loadingResend || loadingVerify}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline"
              >
                {loadingResend ? 'Sending...' : 'Resend code'}
              </Button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center text-xs text-gray-500 mt-6">
            <p>The verification code will expire in 10 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
