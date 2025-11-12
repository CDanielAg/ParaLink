// Simplified satellite data and calculations
export const satellites = {
  GPS: {
    name: "GPS (NAVSTAR)",
    frequency: 1.575, // GHz
    altitude: 20200, // km
    satellites: [
      { name: "GPS I-01", noradId: 4044, inclination: 55 },
      { name: "GPS II-01", noradId: 16019, inclination: 55 },
      { name: "GPS III-01", noradId: 43873, inclination: 55 },
    ],
  },
  COMMUNICATIONS: {
    name: "Comunicación Satelital",
    frequency: 11.5, // GHz
    altitude: 36000, // km
    satellites: [
      { name: "Intelsat 39A", noradId: 41959, inclination: 0.03 },
      { name: "SES-14", noradId: 43013, inclination: 0.02 },
      { name: "Eutelsat 7B", noradId: 40425, inclination: 0.05 },
    ],
  },
  TELEVISION: {
    name: "Televisión Satelital",
    frequency: 12.75, // GHz
    altitude: 36000, // km
    satellites: [
      { name: "DirecTV 7S", noradId: 37949, inclination: 0.05 },
      { name: "Sky Brasil C1", noradId: 40360, inclination: 0.03 },
      { name: "Hispasat 30W-6", noradId: 39161, inclination: 0.01 },
    ],
  },
}

// Calculate satellite position relative to observer
export function calculateSatelliteOrientation(
  observerLat: number,
  observerLng: number,
  satelliteLat: number,
  satelliteLng: number,
  satelliteAltitude: number,
) {
  // Calculate azimuth
  const dLng = satelliteLng - observerLng
  const y = Math.sin(toRad(dLng)) * Math.cos(toRad(satelliteLat))
  const x =
    Math.cos(toRad(observerLat)) * Math.sin(toRad(satelliteLat)) -
    Math.sin(toRad(observerLat)) * Math.cos(toRad(satelliteLat)) * Math.cos(toRad(dLng))
  let azimuth = Math.atan2(y, x) * (180 / Math.PI)
  azimuth = ((azimuth % 360) + 360) % 360

  // Calculate elevation
  const distance = calculateDistance(observerLat, observerLng, satelliteLat, satelliteLng)
  const earthRadius = 6371 // km
  const angle = Math.acos(earthRadius / (earthRadius + satelliteAltitude))
  const elevation =
    Math.atan2(Math.cos(angle) - earthRadius / (earthRadius + satelliteAltitude), Math.sin(angle)) * (180 / Math.PI)

  return {
    azimuth: azimuth,
    elevation: Math.max(elevation, 0), // Can't be below horizon
    distance: distance,
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Get approximate satellite position (simplified - using fixed positions for demo)
export function getSatellitePosition(satelliteType: string, index = 0) {
  const positions: { [key: string]: { lat: number; lng: number }[] } = {
    GPS: [
      { lat: 45, lng: -75 },
      { lat: -20, lng: 140 },
      { lat: 0, lng: 0 },
    ],
    COMMUNICATIONS: [
      { lat: 0, lng: -100 },
      { lat: 0, lng: 50 },
      { lat: 0, lng: 160 },
    ],
    TELEVISION: [
      { lat: 0, lng: -75 },
      { lat: 0, lng: -30 },
      { lat: 0, lng: 100 },
    ],
  }

  return positions[satelliteType]?.[index] || { lat: 0, lng: 0 }
}
