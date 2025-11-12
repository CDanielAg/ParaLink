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

// ✅ Calcular orientación realista entre observador y satélite
export function calculateSatelliteOrientation(
  observerLat: number,
  observerLng: number,
  satelliteLat: number,
  satelliteLng: number,
  satelliteAltitude: number, // km
) {
  const R = 6371 // Radio de la Tierra (km)
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const latO = toRad(observerLat)
  const lonO = toRad(observerLng)
  const latS = toRad(satelliteLat)
  const lonS = toRad(satelliteLng)

  // Ángulo central ψ (entre observador y satélite)
  const psi = Math.acos(
    Math.sin(latO) * Math.sin(latS) +
      Math.cos(latO) * Math.cos(latS) * Math.cos(lonS - lonO),
  )

  // Distancia satélite-observador (ley del coseno esférico)
  const distance = Math.sqrt(
    (R + satelliteAltitude) ** 2 +
      R ** 2 -
      2 * R * (R + satelliteAltitude) * Math.cos(psi),
  )

  // Elevación (en radianes)
  const elevationRad = Math.atan(
    (Math.cos(psi) - R / (R + satelliteAltitude)) / Math.sin(psi),
  )

  // Azimut (ángulo respecto al norte)
  const azimuthRad = Math.atan2(
    Math.sin(lonS - lonO),
    Math.cos(latO) * Math.tan(latS) - Math.sin(latO) * Math.cos(lonS - lonO),
  )

  return {
    azimuth: (toDeg(azimuthRad) + 360) % 360,
    elevation: toDeg(elevationRad),
    distance,
  }
}

// Calcular distancia superficial entre coordenadas (solo para referencia)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Posiciones fijas aproximadas (demo)
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
