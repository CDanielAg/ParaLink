"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Cloud, Droplets, Wind, Gauge, MapPin, Trash2 } from "lucide-react"
import SignalQualityGauge from "@/components/signal-quality-gauge"
import type { MapContainerHandle } from "@/components/map-container"

// Import dinámico del mapa
const MapContainer = dynamic(() => import("@/components/map-container"), { ssr: false })

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  pressure: number
  cloudCover: number
  visibility: number
}

interface Recommendation {
  icon: React.ReactNode
  title: string
  description: string
  severity: "high" | "medium" | "low"
}

interface MapPoint {
  lat: number
  lng: number
  label: string
}

export default function Optimization() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [signalQuality, setSignalQuality] = useState(75)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [points, setPoints] = useState<MapPoint[]>([])
  const mapRef = useRef<MapContainerHandle | null>(null)

  // Actualiza automáticamente el clima al seleccionar un punto
  useEffect(() => {
    if (points.length > 0) {
      fetchWeatherData(points[0].lat, points[0].lng)
    }
  }, [points])

  useEffect(() => {
    generateRecommendations()
  }, [weather])

  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,cloud_cover,visibility`,
      )
      const data = await response.json()
      const current = data.current

      setWeather({
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        pressure: current.pressure_msl,
        cloudCover: current.cloud_cover,
        visibility: current.visibility / 1000,
      })
    } catch (error) {
      console.log("[v0] Weather fetch error:", error)
    }
  }

  const generateRecommendations = () => {
    if (!weather) return

    const recs: Recommendation[] = []
    let quality = 100

    if (weather.humidity > 80) {
      recs.push({
        icon: <Droplets className="w-4 h-4" />,
        title: "Humedad Elevada",
        description: "La alta humedad puede causar pérdida de señal del 2-4%. Considera aumentar la potencia.",
        severity: "medium",
      })
      quality -= 4
    }

    if (weather.windSpeed > 30) {
      recs.push({
        icon: <Wind className="w-4 h-4" />,
        title: "Viento Fuerte",
        description: `Viento a ${weather.windSpeed} km/h detectado. Verifica la estabilidad de la antena.`,
        severity: "high",
      })
      quality -= 10
    }

    if (weather.cloudCover > 70) {
      recs.push({
        icon: <Cloud className="w-4 h-4" />,
        title: "Nubosidad Alta",
        description: "Cobertura nubosa al 70%+. Posible atenuación de 1-2% en la señal.",
        severity: "low",
      })
      quality -= 2
    }

    if (weather.temperature < -10 || weather.temperature > 40) {
      recs.push({
        icon: <Gauge className="w-4 h-4" />,
        title: "Temperatura Extrema",
        description: `Temperatura de ${weather.temperature}°C. Los componentes electrónicos pueden ver afectado su rendimiento.`,
        severity: "medium",
      })
      quality -= 5
    }

    setRecommendations(recs)
    setSignalQuality(Math.max(20, quality))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 border-red-500/30"
      case "medium":
        return "bg-amber-500/10 border-amber-500/30"
      default:
        return "bg-blue-500/10 border-blue-500/30"
    }
  }

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Optimización de Señal</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Mapa */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
            <div className="h-96 relative">
              <MapContainer ref={mapRef} onPointsChange={setPoints} />
            </div>
            <div className="p-4 bg-muted/10 border-t border-border">
              {points.length === 0 ? (
                <p className="text-xs text-muted-foreground">Haz clic en el mapa para seleccionar tu ubicación.</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ubicación seleccionada: {points[0].lat.toFixed(4)}, {points[0].lng.toFixed(4)}
                </p>
              )}
            </div>

            {/* Botones de control del mapa */}
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={() => mapRef.current?.addMarkerAtCenter()}
                disabled={points.length >= 1}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <MapPin className="w-4 h-4" />
                Colocar en centro
              </button>
              <button
                onClick={() => mapRef.current?.clearPoints()}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Gauge de señal */}
          <div className="bg-card rounded-lg border border-border p-6 flex flex-col items-center justify-center">
            <SignalQualityGauge quality={signalQuality} />
            <p className="text-sm text-muted-foreground mt-3">Calidad estimada de señal</p>
          </div>
        </div>

        {/* Condiciones y recomendaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Condiciones actuales */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-bold mb-4">Condiciones Actuales</h2>
            {weather ? (
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Temperatura</span>
                  <span className="font-bold text-lg">{weather.temperature}°C</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Humedad</span>
                  <span className="font-bold text-lg">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Viento</span>
                  <span className="font-bold text-lg">{weather.windSpeed} km/h</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Presión</span>
                  <span className="font-bold text-lg">{weather.pressure} mb</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Nubosidad</span>
                  <span className="font-bold text-lg">{weather.cloudCover}%</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Visibilidad</span>
                  <span className="font-bold text-lg">{weather.visibility.toFixed(1)} km</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selecciona una ubicación para obtener datos.</p>
            )}
          </div>

          {/* Recomendaciones */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold mb-6">Recomendaciones de Optimización</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(rec.severity)}`}>
                    <div className="flex gap-3">
                      <div className="text-muted-foreground mt-1">{rec.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{rec.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                      <div className="text-xs font-semibold capitalize text-muted-foreground">
                        {rec.severity === "high" && "Alto"}
                        {rec.severity === "medium" && "Medio"}
                        {rec.severity === "low" && "Bajo"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-muted/10 rounded-lg text-center">
                <p className="text-muted-foreground">
                  {weather ? "Condiciones óptimas para la transmisión" : "Selecciona ubicación en el mapa"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
