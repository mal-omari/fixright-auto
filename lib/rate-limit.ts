// Best-effort in-memory sliding-window limiter. State is per serverless
// instance, so this blunts scripted abuse rather than hard-guaranteeing a
// global cap — acceptable for the public booking form.
const buckets = new Map<string, number[]>()
const MAX_KEYS = 10_000

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter(t => now - t < windowMs)

  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) {
      if (v.every(t => now - t >= windowMs)) buckets.delete(k)
    }
  }

  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }

  hits.push(now)
  buckets.set(key, hits)
  return true
}
