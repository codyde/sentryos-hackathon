/**
 * Multi-source logo fetching utility
 * Automatically tries multiple services to fetch company logos
 */

export interface LogoSource {
  name: string
  getUrl: (domain: string) => string
  priority: number
}

/**
 * Available logo sources, ordered by priority
 */
export const LOGO_SOURCES: LogoSource[] = [
  {
    name: 'Clearbit',
    getUrl: (domain: string) => `https://logo.clearbit.com/${domain}`,
    priority: 1
  },
  {
    name: 'Google Favicon (128px)',
    getUrl: (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    priority: 2
  },
  {
    name: 'DuckDuckGo Icons',
    getUrl: (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    priority: 3
  },
  {
    name: 'Favicon.io',
    getUrl: (domain: string) => `https://favicon.io/favicon.ico?url=${domain}`,
    priority: 4
  }
]

/**
 * Extract domain from company name
 * Converts "Flo Health" -> "flo.health"
 */
export function extractDomain(companyName: string): string {
  const normalized = companyName.toLowerCase().trim()

  // Known mappings for common companies
  const domainMap: Record<string, string> = {
    'catawiki': 'catawiki.com',
    'flo health': 'flo.health',
    'dojo': 'dojo.tech',
    'bitvavo': 'bitvavo.com',
    'sentry': 'sentry.io'
  }

  // Check known mappings first
  if (domainMap[normalized]) {
    return domainMap[normalized]
  }

  // Convert company name to domain format
  // "Acme Corp" -> "acme.com"
  const parts = normalized.split(/\s+/)
  const mainName = parts[0]

  // Common TLD guesses
  const tlds = ['com', 'io', 'tech', 'co', 'net']

  // Return first TLD as default
  return `${mainName}.${tlds[0]}`
}

/**
 * Get all possible logo URLs for a company, ordered by priority
 */
export function getLogoUrls(companyName: string, customDomain?: string): string[] {
  const domain = customDomain || extractDomain(companyName)

  return LOGO_SOURCES
    .sort((a, b) => a.priority - b.priority)
    .map(source => source.getUrl(domain))
}

/**
 * Get the primary logo URL (Clearbit)
 */
export function getPrimaryLogoUrl(companyName: string, customDomain?: string): string {
  const domain = customDomain || extractDomain(companyName)
  return LOGO_SOURCES[0].getUrl(domain)
}
