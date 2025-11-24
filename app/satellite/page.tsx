"use client"

import { useState, useEffect, useRef } from "react"
import { Satellite, Download } from "lucide-react"
import dynamic from "next/dynamic"
import {
  satellites,
  calculateSatelliteOrientation,
  getSatellitePosition,
} from "@/lib/satellite-data"
import type { MapContainerHandle } from "@/components/map-container"

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
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null)
  const [points, setPoints] = useState<MapPoint[]>([])
  
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [projectName, setProjectName] = useState("Reporte de Orientación Satelital")
  const reportRef = useRef<HTMLDivElement>(null)

  const mapRef = useRef<MapContainerHandle | null>(null)

  useEffect(() => {
    if (points.length > 0) {
      const observer = points[0]
      const satType = satellites[selectedType] as any
      const satPos = getSatellitePosition(selectedType, selectedSatellite)
      const orientation = calculateSatelliteOrientation(
        observer.lat,
        observer.lng,
        satPos.lat,
        satPos.lng,
        satType.altitude,
      )
      setSatelliteData(orientation)
    } else {
      setSatelliteData(null)
    }
  }, [points, selectedType, selectedSatellite])

  const handleExport = async () => {
    if (!reportRef.current) return
    setIsExporting(true)

    try {
      const reportHtml = reportRef.current.outerHTML
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: reportHtml }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const error = new Error(errorData.details || 'Failed to generate PDF')
        console.error("Error during export:", error)
        alert(`Error durante la exportación: ${error.message}`)
        throw error
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setShowExportModal(false)
    } catch (error) {
      // Error is already logged and alerted
    } finally {
      setIsExporting(false)
    }
  }

  const currentSatType = satellites[selectedType] as any
  const currentSatellite = currentSatType.satellites[selectedSatellite]
  const satPosition = getSatellitePosition(selectedType, selectedSatellite)

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Orientador Satelital</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tipo de satélite */}
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
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {data.name}
                  </button>
                ))}
              </div>

              {/* Satélite específico */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Satélite Específico
                </label>
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

            {/* Datos satelitales */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-bold mb-4">Parámetros Satelitales</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Azimut</p>
                  <p className="text-3xl font-bold text-primary">
                    {satelliteData?.azimuth.toFixed(1) ?? "-"}°
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Elevación</p>
                  <p className="text-3xl font-bold text-accent">
                    {satelliteData?.elevation.toFixed(1) ?? "-"}°
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Distancia</p>
                  <p className="text-xl font-semibold">
                    {satelliteData?.distance.toFixed(0) ?? "-"} km
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Satélite</p>
                  <p className="text-sm font-semibold">{currentSatellite.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Frecuencia: {currentSatType.frequency} GHz
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Altitud Orbital</p>
                  <p className="text-sm font-semibold">
                    {currentSatType.altitude.toLocaleString()} km
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-2 pt-4 border-t border-border mt-4">
                <button
                  onClick={() => mapRef.current?.addMarkerAtCenter()}
                  disabled={points.length >= 1}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Colocar en centro
                </button>
                <button
                  onClick={() => {
                    mapRef.current?.clearPoints()
                    setPoints([])
                  }}
                  className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  Limpiar punto
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={!satelliteData}
                  className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Exportar Reporte
                </button>
              </div>
            </div>
          </div>

          {/* Panel Derecho */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mapa */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="h-96">
                <MapContainer ref={mapRef} onPointsChange={setPoints} />
              </div>
              <div className="p-4 bg-muted/10 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {points.length === 0
                    ? "Marca tu ubicación en el mapa"
                    : `Observador en: ${points[0].lat.toFixed(4)}, ${points[0].lng.toFixed(4)}`}
                </p>
              </div>
            </div>

            {/* Brújula */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-bold mb-4">Orientación del Satélite</h3>

              <div className="flex gap-6">
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-48 h-48 rounded-full border-2 border-primary/30 bg-muted/10 flex items-center justify-center">
                    <div className="absolute top-4 text-xs font-bold text-primary">N</div>

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

                    <div className="absolute bottom-4 text-xs font-bold text-secondary">S</div>
                    <div className="absolute right-4 text-xs font-bold text-secondary">E</div>
                    <div className="absolute left-4 text-xs font-bold text-secondary">O</div>
                  </div>
                </div>

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
                    <p className="text-xl font-semibold">
                      {satelliteData?.elevation.toFixed(1) ?? "-"}° sobre el horizonte
                    </p>
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Vista Previa del Reporte</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

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
              </div>
            </div>
            
            <div className="p-6 bg-muted/5">
              <div ref={reportRef} className="bg-white text-black p-8 rounded-lg border border-gray-300">
                <div className="border-b-2 border-blue-600 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-blue-600">{projectName}</h1>
                  <p className="text-sm text-gray-600 mt-2">
                    Reporte de Orientación Satelital - {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>

                {points.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Ubicación del Observador</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">Latitud: {points[0].lat.toFixed(6)}°</p>
                      <p className="text-sm text-gray-700">Longitud: {points[0].lng.toFixed(6)}°</p>
                    </div>
                  </div>
                )}

                {satelliteData && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-3">Satélite Seleccionado</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="font-semibold text-blue-600 mb-2">Nombre</p>
                          <p className="text-lg">{currentSatellite.name}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="font-semibold text-blue-600 mb-2">Tipo</p>
                          <p className="text-lg">{currentSatType.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-3">Resultados de Orientación</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">Azimut</p>
                          <p className="text-2xl font-bold text-blue-700">{satelliteData.azimuth.toFixed(2)}°</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Elevación</p>
                          <p className="text-2xl font-bold text-green-700">{satelliteData.elevation.toFixed(2)}°</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">Distancia</p>
                          <p className="text-2xl font-bold text-purple-700">{satelliteData.distance.toFixed(0)} km</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="border-t-2 border-gray-200 pt-4 mt-6">
                  <p className="text-xs text-gray-500 text-center">
                    Generado por ParaLink - {new Date().toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
               <button
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || !satelliteData}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Descargar PDF
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

function getDirection(azimuth: number): string {
  const dirs = [
    "N","NNE","NE","ENE","E","ESE","SE","SSE",
    "S","SSW","SW","WSW","W","WNW","NW","NNW"
  ]
  const idx = Math.round((azimuth % 360) / 22.5) % 16
  return dirs[idx]
}
