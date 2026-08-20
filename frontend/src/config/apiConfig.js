const PROD_API_BASE = 'https://staffsphere-o5r1.onrender.com'
const DEV_API_BASE = 'http://127.0.0.1:5001'

function sanitizeBaseUrl(value, fallback = getDefaultApiBase()) {
  const raw = String(value || '').trim().replace(/\/+$/, '')
  if (!raw) return fallback

  const isLocalHost = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:(\d+))?(\/.*)?$/i.test(raw)
  if (import.meta.env.PROD && isLocalHost) return fallback

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw)
      if (!parsed.hostname) return fallback
      return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, '')
    } catch {
      return fallback
    }
  }

  if (raw.startsWith('//')) {
    return `https:${raw}`.replace(/\/+$/, '')
  }

  if (/^(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+|\[[^\]]+\]|[a-z0-9.-]+):(\d+)$/i.test(raw)) {
    return `http://${raw}`
  }

  if (/^\d+$/.test(raw)) {
    return `${fallback.replace(/\/+$/, '')}:${raw}`
  }

  return raw
}

function getDefaultApiBase() {
  return import.meta.env.PROD ? PROD_API_BASE : DEV_API_BASE
}

const envBase = sanitizeBaseUrl(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE)
const fallbackBase = getDefaultApiBase()

export const BASE_URL = sanitizeBaseUrl(envBase || fallbackBase)

export const API_CONNECTION_ERROR_MESSAGE = 'Unable to connect to server. Please try again later.'

if (!BASE_URL && typeof console !== 'undefined') {
  console.warn('VITE_API_URL/VITE_API_BASE is missing. Falling back to default API URL.')
}
