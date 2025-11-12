// Haversine formula to calculate distance between two points
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate angle of elevation
export function calculateElevationAngle(distance: number, heightDiff: number): number {
  return Math.atan(heightDiff / (distance * 1000)) * (180 / Math.PI)
}

// Calculate azimuth (bearing)
export function calculateAzimuth(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRad(lng2 - lng1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)

  const y = Math.sin(dLng) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)

  return (Math.atan2(y, x) * 180) / Math.PI
}

// Normalize azimuth to 0-360
export function normalizeAzimuth(azimuth: number): number {
  return ((azimuth % 360) + 360) % 360
}

// Calculate suggested antenna diameter (simplified)
export function suggestedDiameter(distance: number, frequency = 10.7): number {
  // GHz
  const wavelength = 299792458 / (frequency * 1e9) // meters
  return Math.max(0.3, Math.min(3, (wavelength * distance) / 100))
}

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Estimate error margin based on distance
export function estimateError(distance: number): number {
  return Math.max(1, Math.min(5, distance * 0.1))
}
