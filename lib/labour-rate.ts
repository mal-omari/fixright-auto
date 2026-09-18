import { SITE_CONFIG } from '@/lib/site-config'

export const DEFAULT_LABOUR_RATE = 95
export const MAX_LABOUR_RATE = 1000
export const DEMO_LABOUR_RATE_KEY = 'demo-motorworks:demo:labour-rate'

export function parseLabourRate(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const rate = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(rate) || rate < 0 || rate > MAX_LABOUR_RATE) return null
  return Math.round(rate * 100) / 100
}

function configuredStorage(): { storage: Storage; key: string } | null {
  if (typeof window === 'undefined' || !SITE_CONFIG.demo.enabled) return null
  return { storage: window.sessionStorage, key: DEMO_LABOUR_RATE_KEY }
}

export function readLabourRate(): number {
  const configured = configuredStorage()
  if (!configured) return DEFAULT_LABOUR_RATE
  return parseLabourRate(configured.storage.getItem(configured.key)) ?? DEFAULT_LABOUR_RATE
}

export function writeLabourRate(value: string | number): number | null {
  const rate = parseLabourRate(value)
  if (rate === null) return null
  const configured = configuredStorage()
  configured?.storage.setItem(configured.key, String(rate))
  return rate
}

export function clearDemoLabourRate(storage: Storage): void {
  storage.removeItem(DEMO_LABOUR_RATE_KEY)
}
