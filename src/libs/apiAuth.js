'use client'

/**
 * Ensure API calls use the NextAuth access token in localStorage
 * (TaskManager / projects API all read localStorage.token).
 */
export function syncAuthTokenFromSession(accessToken) {
  if (typeof window === 'undefined') return
  if (accessToken) {
    try {
      localStorage.setItem('token', accessToken)
    } catch {
      /* ignore */
    }
  }
}

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

export function authHeaders() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }
  return { 'Content-Type': 'application/json' }
}
