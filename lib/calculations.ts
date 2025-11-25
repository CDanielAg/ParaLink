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

export function suggestedDiameter(distanceKm: number, frequencyGHz: number = 5.8): number {
  
  // 1. CONSTANTES DEL SISTEMA
  const c = 0.3; // Velocidad luz aprox
  const wavelength = c / frequencyGHz; // Lambda (metros)
  const efficiency = 0.55; // Eficiencia típica 55%
  
  // Variables del Hardware (Estándar WiFi 5GHz)
  const txPower = 27; // dBm (Potencia Radio)
  const targetRx = -65; // dBm (Señal objetivo)
  const fadeMargin = 15; // dB (Margen seguridad)

  // 2. CÁLCULO DE PÉRDIDA DE ESPACIO LIBRE (FSL)
  // FSL = 92.45 + 20log(km) + 20log(GHz)
  const fsl = 92.45 + (20 * Math.log10(distanceKm)) + (20 * Math.log10(frequencyGHz));

  // 3. CÁLCULO DE GANANCIA NECESARIA (dBi)
  // Fórmula: (Pérdida - PotenciaRadio - Objetivo + Margen) / 2 antenas
  // Usamos Math.abs en targetRx para evitar líos de signos, asumimos presupuesto positivo.
  // Lógica: Necesito cubrir la pérdida (fsl) y el margen, restando lo que ya tengo (txPower).
  // Y quiero que me sobre señal (targetRx).
  
  // Simplificado: G_total = FSL - TxPower - 65 (que es el target positivo) + Margen
  const totalGainNeeded = fsl - txPower - 65 + fadeMargin;
  let dBiPerAntenna = totalGainNeeded / 2;

  // Seguridad: Ninguna antena parabólica baja de 16 dBi realmente.
  if (dBiPerAntenna < 16) dBiPerAntenna = 16;

  // 4. CONVERSIÓN dBi -> METROS (DIÁMETRO)
  // Convertir dBi (log) a Ganancia lineal (veces)
  const linearGain = Math.pow(10, dBiPerAntenna / 10);
  
  // Despeje de fórmula de apertura: D = (lambda / pi) * sqrt(G / n)
  const diameterMeters = (wavelength / Math.PI) * Math.sqrt(linearGain / efficiency);

  // Retornamos metros con 2 decimales de precisión
  return parseFloat(diameterMeters.toFixed(2));
}

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Estimate error margin based on distance
export function estimateError(distance: number): number {
  return Math.max(1, Math.min(5, distance * 0.1))
}
