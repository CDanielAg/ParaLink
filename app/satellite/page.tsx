"use client"

import { useState, useEffect } from "react"
import { Satellite } from "lucide-react"
import dynamic from "next/dynamic"
import { satellites, calculateSatelliteOrientation, getSatellitePosition } from "@/lib/satellite-data"

const MapContainer = dynamic(() => import("@/components/map-container"), { ssr: false })

interface MapPoint {
  lat: number
  lng: number
  label: string
}

interface SatelliteData {
  azimuth: number
  elevation: number
  distance: number
}

type SatelliteType = "GPS" | "COMMUNICATIONS" | "TELEVISION"

export default function SatelliteOrientation() {
  const [selectedType, setSelectedType] = useState<SatelliteType>("GPS")
  const [selectedSatellite, setSelectedSatellite] = useState(0)
  const [observerPoint, setObserverPoint] = useState<MapPoint | null>(null)
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null)
  const [points, setPoints] = useState<MapPoint[]>([])

  // Update when points change or selection changes
  useEffect(() => {
    if (points.length > 0) {
      const observer = points[0]
      setObserverPoint(observer)

      const satData = satellites[selectedType] as any
      const satPosition = getSatellitePosition(selectedType, selectedSatellite)

      const orientation = calculateSatelliteOrientation(
        observer.lat,
        observer.lng,
        satPosition.lat,
        satPosition.lng,
        satData.altitude,
      )

      setSatelliteData(orientation)
    }
  }, [points, selectedType, selectedSatellite])

  const currentSatType = satellites[selectedType] as any
  const currentSatellite = currentSatType.satellites[selectedSatellite]
  const satPosition = getSatellitePosition(selectedType, selectedSatellite)

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Orientador Satelital</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Satellite Type Selection */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-bold mb-4">Tipo de Satélite</h2>

              <div className="space-y-2 mb-6">
                {Object.entries(satellites).map(([key, data]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedType(key as SatelliteType)
                      setSelectedSatellite(0)
                    }}
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      selectedType === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {data.name}
                  </button>
                ))}
              </div>

              {/* Satellite Selection */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Satélite Específico</label>
                <select
                  value={selectedSatellite}
                  onChange={(e) => setSelectedSatellite(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {currentSatType.satellites.map((sat: any, idx: number) => (
                    <option key={idx} value={idx}>
                      {sat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Satellite Data */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-bold mb-4">Parámetros Satelitales</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Azimut</p>
                  <p className="text-3xl font-bold text-primary">{satelliteData?.azimuth.toFixed(1)}°</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Elevación</p>
                  <p className="text-3xl font-bold text-accent">{satelliteData?.elevation.toFixed(1)}°</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Distancia</p>
                  <p className="text-xl font-semibold">{satelliteData?.distance.toFixed(0)} km</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Satélite</p>
                  <p className="text-sm font-semibold">{currentSatellite.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Frecuencia: {currentSatType.frequency} GHz</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Altitud Orbital</p>
                  <p className="text-sm font-semibold">{currentSatType.altitude.toLocaleString()} km</p>
                </div>
              </div>

              <button className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Usar en Cálculo
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="h-96">
                <MapContainer onPointsChange={setPoints} />
              </div>
              <div className="p-4 bg-muted/10 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {points.length === 0
                    ? "Marca tu ubicación en el mapa"
                    : `Observador en: ${points[0].lat.toFixed(4)}, ${points[0].lng.toFixed(4)}`}
                </p>
              </div>
            </div>

            {/* Compass/Bearing Visualization */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-bold mb-4">Orientación del Satélite</h3>

              <div className="flex gap-6">
                {/* Compass */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-48 h-48 rounded-full border-2 border-primary/30 bg-muted/10 flex items-center justify-center">
                    {/* North indicator */}
                    <div className="absolute top-4 text-xs font-bold text-primary">N</div>

                    {/* Direction indicator */}
                    {satelliteData && (
                      <div
                        className="absolute w-2 h-24 bg-gradient-to-t from-accent to-accent/50 rounded-full origin-bottom"
                        style={{
                          transform: `rotate(${satelliteData.azimuth}deg)`,
                          bottom: "50%",
                        }}
                      >
                        <Satellite className="w-5 h-5 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent" />
                      </div>
                    )}

                    {/* Cardinal directions */}
                    <div className="absolute bottom-4 text-xs font-bold text-secondary">S</div>
                    <div className="absolute right-4 text-xs font-bold text-secondary">E</div>
                    <div className="absolute left-4 text-xs font-bold text-secondary">O</div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dirección del Satélite</p>
                    <p className="text-2xl font-bold">
                      {satelliteData
                        ? `${getDirection(satelliteData.azimuth)} (${satelliteData.azimuth.toFixed(1)}°)`
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ángulo de Elevación</p>
                    <p className="text-xl font-semibold">{satelliteData?.elevation.toFixed(1)}° sobre el horizonte</p>
                  </div>

                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Posición del Satélite</p>
                    <p className="text-sm font-mono">
                      Lat: {satPosition.lat.toFixed(4)}, Lng: {satPosition.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Helper function to get cardinal direction from azimuth
function getDirection(azimuth: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ]
  const index = Math.round((azimuth % 360) / 22.5) % 16
  return directions[index]
}
