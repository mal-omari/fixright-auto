export const SITE_CONFIG = {
  business: {
    name: 'Demo Motorworks',
    wordmarkPrimary: 'DEMO',
    wordmarkSecondary: 'MOTORWORKS',
    shortMark: 'DM',
    tagline: 'Honest work. Clear estimates. Every time.',
    city: 'London',
    region: 'Ontario',
    phoneDisplay: '519-555-0147',
    phoneHref: 'tel:5195550147',
    addressLine1: '100 Example Road',
    addressLine2: 'Fictional demo address',
    ownerName: 'Jordan Lee',
    ownerInitials: 'JL',
    establishedYear: 2008,
  },
  demo: {
    enabled: process.env.NEXT_PUBLIC_LIVE_OPERATIONS_ENABLED !== 'true',
    label: 'Fictional product demo',
    notice: 'No real garage, customers, bookings, or payments are represented.',
  },
} as const

export const DEFAULT_SERVICE_HOURS: Record<string, number> = {
  'Oil Change': 1,
  'Brake Service': 2,
  'Engine & Transmission': 4,
  'Heating & A/C': 2,
  'Electrical & Diagnostics': 2,
  'Tire Services': 1.5,
  'Safety Certification': 1.5,
  'Body & Rust Work': 4,
  'Not sure — need diagnostic': 1,
}

export function configuredYearsInBusiness(): number {
  return new Date().getFullYear() - SITE_CONFIG.business.establishedYear
}
