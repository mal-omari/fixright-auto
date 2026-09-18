import 'server-only'

export const LIVE_OPERATIONS_ENABLED =
  process.env.NEXT_PUBLIC_LIVE_OPERATIONS_ENABLED === 'true' &&
  process.env.APP_MODE === 'live' &&
  process.env.NEXT_PUBLIC_APP_MODE === 'live'

export const DEMO_API_RESPONSE = {
  success: true,
  demo: true,
  message: 'Demo only — nothing was stored or sent.',
} as const
