/**
 * Airport code resolver - converts city names to IATA codes
 */

const CITY_TO_AIRPORT: Record<string, string> = {
  // Egypt
  'cairo': 'CAI',
  'alexandria': 'ALY',
  'luxor': 'LXR',
  'aswan': 'ASW',
  'hurghada': 'HRG',
  'sharm el sheikh': 'SSH',
  
  // Italy
  'rome': 'FCO',
  'roma': 'FCO',
  'milan': 'MXP',
  'milano': 'MXP',
  'venice': 'VCE',
  'venezia': 'VCE',
  'florence': 'FLR',
  'firenze': 'FLR',
  'naples': 'NAP',
  'napoli': 'NAP',
  'turin': 'TRN',
  'torino': 'TRN',
  'bologna': 'BLQ',
  'pisa': 'PSA',
  'verona': 'VRN',
  'palermo': 'PMO',
  'catania': 'CTA',
  
  // France
  'paris': 'CDG',
  'marseille': 'MRS',
  'lyon': 'LYS',
  'nice': 'NCE',
  'toulouse': 'TLS',
  
  // Germany
  'berlin': 'BER',
  'munich': 'MUC',
  'münchen': 'MUC',
  'frankfurt': 'FRA',
  'hamburg': 'HAM',
  'cologne': 'CGN',
  'köln': 'CGN',
  'düsseldorf': 'DUS',
  'dusseldorf': 'DUS',
  
  // UK
  'london': 'LHR',
  'manchester': 'MAN',
  'edinburgh': 'EDI',
  'glasgow': 'GLA',
  'birmingham': 'BHX',
  
  // Spain
  'madrid': 'MAD',
  'barcelona': 'BCN',
  'valencia': 'VLC',
  'seville': 'SVQ',
  'sevilla': 'SVQ',
  'malaga': 'AGP',
  
  // UAE
  'dubai': 'DXB',
  'abu dhabi': 'AUH',
  
  // USA
  'new york': 'JFK',
  'los angeles': 'LAX',
  'chicago': 'ORD',
  'san francisco': 'SFO',
  'miami': 'MIA',
  'las vegas': 'LAS',
  'boston': 'BOS',
  'washington': 'IAD',
  'seattle': 'SEA',
  
  // Other major cities
  'amsterdam': 'AMS',
  'brussels': 'BRU',
  'zurich': 'ZRH',
  'vienna': 'VIE',
  'istanbul': 'IST',
  'athens': 'ATH',
  'lisbon': 'LIS',
  'moscow': 'SVO',
  'tokyo': 'NRT',
  'singapore': 'SIN',
  'bangkok': 'BKK',
  'hong kong': 'HKG',
  'sydney': 'SYD',
  'melbourne': 'MEL',
  'toronto': 'YYZ',
  'montreal': 'YUL',
}

/**
 * Resolve a city name or airport code to IATA code
 */
export function resolveAirportCode(cityOrCode: string): string {
  const normalized = cityOrCode.toLowerCase().trim()
  
  // If it's already a 3-letter code, return uppercase
  if (/^[a-z]{3}$/i.test(normalized)) {
    return normalized.toUpperCase()
  }
  
  // Look up city name
  const code = CITY_TO_AIRPORT[normalized]
  if (code) {
    return code
  }
  
  // Check if it's a partial match (e.g., "milano malpensa" → "milan")
  for (const [city, code] of Object.entries(CITY_TO_AIRPORT)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return code
    }
  }
  
  // Fallback: return original (might work if it's already valid)
  console.warn(`[Airport] Could not resolve: ${cityOrCode}, using as-is`)
  return cityOrCode.toUpperCase()
}

/**
 * Get city name from IATA code
 */
export function getCityFromCode(code: string): string {
  const upperCode = code.toUpperCase()
  for (const [city, airportCode] of Object.entries(CITY_TO_AIRPORT)) {
    if (airportCode === upperCode) {
      return city.charAt(0).toUpperCase() + city.slice(1)
    }
  }
  return code
}
