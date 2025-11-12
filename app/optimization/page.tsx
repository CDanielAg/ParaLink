"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Cloud, Droplets, Wind, Gauge } from "lucide-react"
import SignalQualityGauge from "@/components/signal-quality-gauge"

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

export default function Optimization() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [signalQuality, setSignalQuality] = useState(75)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [latitude, setLatitude] = useState(40.7128)
  const [longitude, setLongitude] = useState(-74.006)

  useEffect(() => {
    fetchWeatherData()
  }, [latitude, longitude])

  useEffect(() => {
    generateRecommendations()
  }, [weather])

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,cloud_cover,visibility`,
      )
      const data = await response.json()
      const current = data.current

      setWeather({
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        pressure: current.pressure_msl,
        cloudCover: current.cloud_cover,
        visibility: current.visibility / 1000, // Convert to km
      })
    } catch (error) {
      console.log("[v0] Weather fetch error:", error)
    }
  }

  const generateRecommendations = () => {
    const recs: Recommendation[] = []
    let quality = 100

    if (!weather) return

    // High humidity impacts signal
    if (weather.humidity > 80) {
      recs.push({
        icon: <Droplets className="w-4 h-4" />,
        title: "Humedad Elevada",
        description: "La alta humedad puede causar pérdida de señal del 2-4%. Considera aumentar la potencia.",
        severity: "medium",
      })
      quality -= 4
    }

    // Wind speed impacts antenna stability
    if (weather.windSpeed > 30) {
      recs.push({
        icon: <Wind className="w-4 h-4" />,
        title: "Viento Fuerte",
        description: `Viento a ${weather.windSpeed} km/h detectado. Verifica la estabilidad de la antena.`,
        severity: "high",
      })
      quality -= 10
    }

    // Cloud cover reduces signal
    if (weather.cloudCover > 70) {
      recs.push({
        icon: <Cloud className="w-4 h-4" />,
        title: "Nubosidad Alta",
        description: "Cobertura nubosa al 70%+. Posible atenuación de 1-2% en la señal.",
        severity: "low",
      })
      quality -= 2
    }

    // Temperature extremes
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
          {/* Location Input */}
          <div className="lg:col-span-3 bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-bold mb-4">Ubicación de Análisis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Latitud</label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(Number.parseFloat(e.target.value))}
                  step="0.001"
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Longitud</label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(Number.parseFloat(e.target.value))}
                  step="0.001"
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={fetchWeatherData}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Actualizar Datos
            </button>
          </div>

          {/* Current Conditions */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-bold mb-4">Condiciones Actuales</h2>

            {weather ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Temperatura</span>
                  <span className="font-bold text-lg">{weather.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Humedad</span>
                  <span className="font-bold text-lg">{weather.humidity}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Viento</span>
                  <span className="font-bold text-lg">{weather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Presión</span>
                  <span className="font-bold text-lg">{weather.pressure} mb</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Nubosidad</span>
                  <span className="font-bold text-lg">{weather.cloudCover}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <span className="text-xs text-muted-foreground">Visibilidad</span>
                  <span className="font-bold text-lg">{weather.visibility.toFixed(1)} km</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Cargando datos...</p>
            )}
          </div>

          {/* Signal Quality Gauge */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6 flex items-center justify-center">
            <SignalQualityGauge quality={signalQuality} />
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card rounded-lg border border-border p-6">
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
                      {rec.severity === "high" && "⚠️ Alto"}
                      {rec.severity === "medium" && "⚡ Medio"}
                      {rec.severity === "low" && "ℹ️ Bajo"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-muted/10 rounded-lg text-center">
              <p className="text-muted-foreground">
                {weather ? "Condiciones óptimas para la transmisión" : "Ingresa coordenadas y actualiza datos"}
              </p>
            </div>
          )}
        </div>

        {/* Optimization Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Consejos de Optimización</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Aumenta el ángulo de elevación con vientos fuertes</li>
              <li>• Verifica la alineación de la antena regularmente</li>
              <li>• Limpia el reflector en días nublados</li>
              <li>• Usa amplificadores LNA en condiciones adversas</li>
              <li>• Monitorea la temperatura de los componentes</li>
            </ul>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Próximas Acciones</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                Exportar Análisis
              </button>
              <button className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors text-sm">
                Comparar Histórico
              </button>
              <button className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors text-sm">
                Configurar Alertas
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
