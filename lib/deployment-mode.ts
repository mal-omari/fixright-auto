export type AppMode = 'demo' | 'live'

function normaliseMode(value: string | undefined, variableName: string): AppMode {
  if (value === undefined || value === '') return 'demo'
  if (value === 'demo' || value === 'live') return value
  throw new Error(`${variableName} must be either "demo" or "live" (received "${value}")`)
}

/**
 * Resolve the one browser-visible operations mode at build time.
 * A split configuration is rejected instead of creating a hybrid deployment.
 */
export function resolveLiveOperationsMode(
  publicModeValue: string | undefined,
  serverModeValue: string | undefined,
): boolean {
  const publicMode = normaliseMode(publicModeValue, 'NEXT_PUBLIC_APP_MODE')
  const serverMode = normaliseMode(serverModeValue, 'APP_MODE')

  if (publicMode !== serverMode) {
    throw new Error(
      `Unsafe split app mode: NEXT_PUBLIC_APP_MODE=${publicMode} while APP_MODE=${serverMode}. ` +
      'Set both to "demo" or both to "live".',
    )
  }

  return publicMode === 'live'
}
