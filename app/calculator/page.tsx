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
  const [showExportModal, setShowExportModal] = useState(false)
  const [projectName, setProjectName] = useState("Enlace Parabólico")
  const [exportFormat, setExportFormat] = useState("PDF")
  const [detailLevel, setDetailLevel] = useState("Completo")
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

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

  const handleExport = async () => {
    if (!reportRef.current) return
    
    setIsExporting(true)
    
    try {
      // @ts-ignore - Importación dinámica
      const html2canvas = (await import('html2canvas')).default
      // @ts-ignore - Importación dinámica para jsPDF v3
      const jsPDF = (await import('jspdf')).default
      
      // Crear un contenedor temporal con estilos inline para evitar problemas con oklch/lab
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = reportRef.current.offsetWidth + 'px'
      tempContainer.style.backgroundColor = '#ffffff'
      tempContainer.innerHTML = reportRef.current.innerHTML
      document.body.appendChild(tempContainer)
      
      // Aplicar estilos RGB directamente a todos los elementos
      const allElements = tempContainer.querySelectorAll('*')
      allElements.forEach((el: any) => {
        const styles = window.getComputedStyle(el)
        // Convertir colores computados a RGB
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          el.style.backgroundColor = styles.backgroundColor
        }
        if (styles.color) {
          el.style.color = styles.color
        }
        if (styles.borderColor) {
          el.style.borderColor = styles.borderColor
        }
      })

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        removeContainer: false,
      })
      
      // Limpiar contenedor temporal
      document.body.removeChild(tempContainer)

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      if (exportFormat === 'PDF (Recomendado)' || exportFormat === 'PDF') {
        // Crear PDF
        const pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [imgWidth, imgHeight]
        })
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        pdf.save(`${projectName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
      } else if (exportFormat === 'PNG') {
        // Descargar PNG
        const link = document.createElement('a')
        link.download = `${projectName.replace(/\s+/g, '_')}_${new Date().getTime()}.png`
        link.href = imgData
        link.click()
      } else if (exportFormat === 'SVG') {
        // Para SVG, convertimos el canvas a PNG (SVG real requeriría re-renderizar todo)
        // Alternativamente podrías usar una librería como dom-to-svg
        const link = document.createElement('a')
        link.download = `${projectName.replace(/\s+/g, '_')}_${new Date().getTime()}.png`
        link.href = imgData
        link.click()
        alert('Nota: La exportación SVG guarda como PNG de alta calidad')
      }

      // Cerrar modal después de exportar
      setTimeout(() => {
        setShowExportModal(false)
        setIsExporting(false)
      }, 500)
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al generar el archivo. Por favor intenta de nuevo.')
      setIsExporting(false)
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
              <button 
                onClick={() => setShowExportModal(true)}
                disabled={points.length < 2}
                className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Vista Previa del Reporte</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Settings */}
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold mb-4">Configuración del Reporte</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Formato</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>PDF (Recomendado)</option>
                    <option>PNG</option>
                    <option>SVG</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Nivel de Detalle
                  </label>
                  <select
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Completo</option>
                    <option>Resumido</option>
                    <option>Solo Cálculos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 bg-muted/5">
              <div ref={reportRef} data-report-content className="bg-white text-black p-8 rounded-lg border border-gray-300">
                {/* Header */}
                <div className="border-b-2 border-blue-600 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-blue-600">{projectName}</h1>
                  <p className="text-sm text-gray-600 mt-2">
                    Reporte de Enlace de Radio Parabólico - {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>

                {/* Points Information */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Ubicaciones</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {points.map((point, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="font-semibold text-blue-600 mb-2">Punto {point.label}</p>
                        <p className="text-sm text-gray-700">Latitud: {point.lat.toFixed(6)}°</p>
                        <p className="text-sm text-gray-700">Longitud: {point.lng.toFixed(6)}°</p>
                        {idx === 0 && results.altitudeA && (
                          <p className="text-sm text-gray-700">Altitud: {results.altitudeA.toFixed(0)} m</p>
                        )}
                        {idx === 1 && results.altitudeB && (
                          <p className="text-sm text-gray-700">Altitud: {results.altitudeB.toFixed(0)} m</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Results */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Resultados del Cálculo</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Distancia</p>
                      <p className="text-2xl font-bold text-blue-700">{results.distance?.toFixed(2)} km</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Azimut</p>
                      <p className="text-2xl font-bold text-green-700">{results.azimuth?.toFixed(1)}°</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Elevación</p>
                      <p className="text-2xl font-bold text-purple-700">{results.elevation?.toFixed(2)}°</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-xs text-gray-600 mb-1">Diámetro Sugerido</p>
                      <p className="text-2xl font-bold text-orange-700">{results.diameter?.toFixed(2)} m</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-xs text-gray-600 mb-1">Error Estimado</p>
                      <p className="text-2xl font-bold text-red-700">±{results.error?.toFixed(2)}%</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <p className="text-xs text-gray-600 mb-1">Altitud Promedio</p>
                      <p className="text-2xl font-bold text-teal-700">{results.avgAltitude?.toFixed(0)} m</p>
                    </div>
                  </div>
                </div>

                {/* Weather Conditions */}
                {weather && detailLevel !== "Solo Cálculos" && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Condiciones Climáticas (Punto A)</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Temperatura</p>
                          <p className="text-lg font-semibold">{weather.temperature_2m}°C</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Humedad</p>
                          <p className="text-lg font-semibold">{weather.relative_humidity_2m}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Viento</p>
                          <p className="text-lg font-semibold">{weather.wind_speed_10m} km/h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                {detailLevel === "Completo" && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Detalles Técnicos</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                      <p className="mb-2">
                        <strong>Método de Cálculo:</strong> Fórmula de Haversine para distancia geodésica
                      </p>
                      <p className="mb-2">
                        <strong>Radio Terrestre:</strong> 6371 km (promedio)
                      </p>
                      <p className="mb-2">
                        <strong>Fuente de Elevación:</strong> Open-Elevation API
                      </p>
                      <p>
                        <strong>Notas:</strong> Los cálculos no consideran obstáculos en la línea de vista. Se
                        recomienda un estudio de sitio para validar la viabilidad del enlace.
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t-2 border-gray-200 pt-4 mt-6">
                  <p className="text-xs text-gray-500 text-center">
                    Generado por Calculadora Parabólica - {new Date().toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Descargar {exportFormat}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}