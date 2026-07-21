// utils/base64url.js

export function encodeEmail(email) {
  try {
    console.log('Encoding email:', email)
    
    // Convert string to base64
    const base64 = btoa(unescape(encodeURIComponent(email)))
    console.log('Base64:', base64)
    
    // Make URL-safe
    const base64url = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    
    console.log('Base64URL:', base64url)
    return base64url
  } catch (error) {
    console.error('Error encoding email:', error)
    throw new Error(`Failed to encode email: ${error.message}`)
  }
}

export function decodeEmail(encodedEmail) {
  try {
    console.log('Decoding email:', encodedEmail)
    
    // Convert from URL-safe base64
    let base64 = encodedEmail
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    // Add padding
    while (base64.length % 4) {
      base64 += '='
    }
    
    console.log('Base64 with padding:', base64)
    
    // Decode
    const decoded = decodeURIComponent(escape(atob(base64)))
    console.log('Decoded email:', decoded)
    
    return decoded
  } catch (error) {
    console.error('Error decoding email:', error)
    throw new Error(`Failed to decode email: ${error.message}`)
  }
}

// Test function you can call in browser console
export function testBase64UrlEncoding(email) {
  console.log('=== Testing Base64URL Encoding ===')
  try {
    const encoded = encodeEmail(email)
    const decoded = decodeEmail(encoded)
    console.log('Original:', email)
    console.log('Encoded:', encoded)
    console.log('Decoded:', decoded)
    console.log('Match:', email === decoded)
    return { encoded, decoded, match: email === decoded }
  } catch (error) {
    console.error('Test failed:', error)
    return { error: error.message }
  }
}