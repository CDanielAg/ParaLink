"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Navigation, Zap, Download, Eye } from "lucide-react"
import {
  calculateDistance,
  calculateAzimuth,
  calculateElevationAngle,
  normalizeAzimuth,
  suggestedDiameter,
  estimateError,
} from "@/lib/calculations"

const MapContainer = dynamic(() => import("@/components/map-container"), { ssr: false })
import type { MapContainerHandle } from "@/components/map-container"

interface MapPoint {
  lat: number
  lng: number
  label: string
}

interface CalculationResults {
  distance: number | null
  azimuth: number | null
  elevation: number | null
  diameter: number | null
  error: number | null
  altitudeA: number | null
  altitudeB: number | null
  avgAltitude: number | null
}

export default function Calculator() {
  const mapRef = useRef<MapContainerHandle | null>(null)
  const [points, setPoints] = useState<MapPoint[]>([])
  const [results, setResults] = useState<CalculationResults>({
    distance: null,
    azimuth: null,
    elevation: null,
    diameter: null,
    error: null,
    altitudeA: null,
    altitudeB: null,
    avgAltitude: null,
  })
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    if (points.length === 2) {
      const distance = calculateDistance(points[0].lat, points[0].lng, points[1].lat, points[1].lng)
      const azimuth = normalizeAzimuth(calculateAzimuth(points[0].lat, points[0].lng, points[1].lat, points[1].lng))

      // Fetch elevation data from OpenElevation API
      fetchElevationData(points)

      setResults((prev) => ({
        ...prev,
        distance,
        azimuth,
        elevation: calculateElevationAngle(distance, 0),
        diameter: suggestedDiameter(distance),
        error: estimateError(distance),
      }))

      // Fetch weather data for point A
      fetchWeatherData(points[0])
    }
  }, [points])

  const fetchElevationData = async (pts: MapPoint[]) => {
    try {
      const locations = pts.map((p) => `${p.lat},${p.lng}`).join("|")
      const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${locations}`)
      const data = await response.json()

      if (data.results && data.results.length === 2) {
        const altitudeA = data.results[0].elevation
        const altitudeB = data.results[1].elevation
        const avgAltitude = (altitudeA + altitudeB) / 2

        setResults((prev) => ({
          ...prev,
          altitudeA,
          altitudeB,
          avgAltitude,
          elevation: calculateElevationAngle(prev.distance || 0, altitudeB - altitudeA),
        }))
      }
    } catch (error) {
      console.log("[v0] Failed to fetch elevation data:", error)
    }
  }

  const fetchWeatherData = async (point: MapPoint) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`,
      )
      const data = await response.json()
      setWeather(data.current)
    } catch (error) {
      console.log("[v0] Failed to fetch weather data:", error)
    }
  }

  return (
    <main className="pt-16">
      <div className="h-screen bg-card relative flex">
        {/* Map - Left Side */}
        <div className="flex-1 relative">
          <MapContainer ref={mapRef} onPointsChange={setPoints} />
        </div>

        {/* Right Panel */}
        <div className="w-96 bg-card/95 border-l border-border backdrop-blur-sm overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Calculadora Parabólica</h2>
              <p className="text-xs text-muted-foreground mt-1">Marca dos puntos en el mapa para comenzar</p>
            </div>

            {/* Input Display */}
            {points.length > 0 && (
              <div className="space-y-3">
                {points.map((point, idx) => (
                  <div key={idx} className="p-3 bg-muted/10 rounded-lg border border-border">
                    <p className="text-xs font-semibold text-primary mb-1">Punto {point.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Lat: {point.lat} | Lng: {point.lng}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {points.length === 2 && (
              <div className="space-y-3 p-4 bg-muted/10 rounded-lg border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Distancia</p>
                  <p className="text-lg font-semibold">{results.distance?.toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Azimut</p>
                  <p className="text-lg font-semibold">{results.azimuth?.toFixed(1)}°</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Elevación</p>
                  <p className="text-lg font-semibold">{results.elevation?.toFixed(2)}°</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Altitud Promedio</p>
                  <p className="text-lg font-semibold">{results.avgAltitude?.toFixed(0)} m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Diámetro Sugerido</p>
                  <p className="text-lg font-semibold">{results.diameter?.toFixed(2)} m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Error Estimado</p>
                  <p className="text-lg font-semibold">±{results.error?.toFixed(2)}%</p>
                </div>
              </div>
            )}

            {/* Weather Card */}
            {weather && (
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm font-semibold mb-2">Condiciones Climáticas</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Temperatura: {weather.temperature_2m}°C</p>
                  <p>Humedad: {weather.relative_humidity_2m}%</p>
                  <p>Viento: {weather.wind_speed_10m} km/h</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-border">
              <button
                onClick={() => mapRef.current?.addMarkerAtCenter()}
                disabled={points.length >= 2}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Colocar en centro
              </button>
              <button
                onClick={() => {
                  mapRef.current?.clearPoints()
                }}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Limpiar puntos
              </button>
              <button className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
