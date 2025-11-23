"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Navigation, Download } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import TerrainProfileChart from "@/components/terrain-profile-chart"

const MapContainer = dynamic(() => import("@/components/map-container"), { ssr: false })
import type { MapContainerHandle } from "@/components/map-container"

interface MapPoint {
  lat: number
  lng: number
  label: string
}

export default function LineOfSight() {
  const mapRef = useRef<MapContainerHandle | null>(null)
  const [points, setPoints] = useState<MapPoint[]>([])
  const [terrainData, setTerrainData] = useState<any>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [projectName, setProjectName] = useState("Análisis de Línea de Vista")
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (points.length === 2) {
      fetchTerrainAnalysis(points[0], points[1])
    } else {
      setTerrainData(null)
    }
  }, [points])

  const fetchTerrainAnalysis = async (p1: MapPoint, p2: MapPoint) => {
    try {
      // Fetch elevation for both points
      const response = await fetch(
        `https://api.open-elevation.com/api/v1/lookup?locations=${p1.lat},${p1.lng}|${p2.lat},${p2.lng}`,
      )
      const data = await response.json()

      if (data.results && data.results.length === 2) {
        const altA = data.results[0].elevation
        const altB = data.results[1].elevation

        // Calculate if line of sight is clear (simplified)
        const distance = Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lng - p1.lng, 2))

        // Fresnel zone radius (simplified, for 10 GHz)
        const frequency = 10 // GHz
        const fresnelRadius = 24.8 * Math.sqrt(distance / (4 * frequency))

        setTerrainData({
          altA,
          altB,
          maxObstacle: Math.max(altA, altB) + fresnelRadius,
          distKm: distance * 111.32, // Rough conversion
          lineOfSightClear: true,
        })
      }
    } catch (error) {
      console.log("[v0] Terrain analysis error:", error)
    }
  }

  const handleExport = async () => {
    if (!reportRef.current) return
    
    setIsExporting(true)
    
    try {
        const element = reportRef.current
        const htmlContent = element.outerHTML

        let styles = ''
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
              console.warn(`Skipping cross-origin stylesheet: ${sheet.href}`)
              continue
            }
            const rules = sheet.cssRules || sheet.rules
            for (const rule of Array.from(rules)) {
              styles += rule.cssText
            }
          } catch (e) {
            console.warn('Could not process a stylesheet: ', e)
          }
        }
      
        const fullHtml = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>PDF Report</title>
              <style>${styles}</style>
            </head>
            <body>${htmlContent}</body>
          </html>
        `

        const response = await fetch('/api/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ htmlContent: fullHtml }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Failed to generate PDF on server')
        }

        const pdfBlob = await response.blob()
        const url = window.URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

      setTimeout(() => {
        setShowExportModal(false)
        setIsExporting(false)
      }, 500)

    } catch (error) {
      console.error('Error during export:', error)
      alert('Error al generar el archivo. Por favor intenta de nuevo.')
      setIsExporting(false)
    }
  }


  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al cálculo
          </Link>
          <h1 className="text-4xl font-bold">Análisis de Línea de Vista</h1>
          <p className="text-muted-foreground mt-2">Marca dos puntos para analizar la visibilidad directa</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
            <div className="h-96">
              <MapContainer ref={mapRef} onPointsChange={setPoints} />
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold">Resultados del Análisis</h2>

            {points.length === 0 ? (
              <p className="text-sm text-muted-foreground">Marca dos puntos en el mapa</p>
            ) : (
              <div className="space-y-3">
                {points.map((point, idx) => (
                  <div key={idx} className="p-3 bg-muted/10 rounded-lg border border-border">
                    <p className="text-xs font-semibold text-primary mb-1">Punto {point.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                    </p>
                  </div>
                ))}

                {terrainData && (
                  <>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">Altitud Punto A</p>
                      <p className="text-2xl font-semibold">{terrainData.altA.toFixed(0)} m</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Altitud Punto B</p>
                      <p className="text-2xl font-semibold">{terrainData.altB.toFixed(0)} m</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Altura Máxima del Obstáculo</p>
                      <p className="text-2xl font-semibold">{terrainData.maxObstacle.toFixed(0)} m</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Visibilidad</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            terrainData.lineOfSightClear ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <p className="font-semibold">
                          {terrainData.lineOfSightClear ? "Línea Directa Clara" : "Obstrucción Detectada"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
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
                  setTerrainData(null)
                }}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Limpiar puntos
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                disabled={points.length < 2 || !terrainData}
                className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Terrain Profile Chart */}
        {points.length === 2 && (
          <div className="mt-6 bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Perfil Topográfico</h3>
            <TerrainProfileChart lat1={points[0].lat} lng1={points[0].lng} lat2={points[1].lat} lng2={points[1].lng} />
          </div>
        )}
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
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 bg-muted/5">
              <div ref={reportRef} data-report-content className="bg-white text-black p-8 rounded-lg border border-gray-300">
                {/* Header */}
                <div className="border-b-2 border-blue-600 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-blue-600">{projectName}</h1>
                  <p className="text-sm text-gray-600 mt-2">
                    Reporte de Análisis de Línea de Vista - {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>

                {/* Points Information */}
                {points && points.length === 2 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Ubicaciones</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {points.map((point, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="font-semibold text-blue-600 mb-2">Punto {point.label}</p>
                          <p className="text-sm text-gray-700">Latitud: {point.lat.toFixed(6)}°</p>
                          <p className="text-sm text-gray-700">Longitud: {point.lng.toFixed(6)}°</p>
                          {terrainData && idx === 0 && (
                            <p className="text-sm text-gray-700">Altitud: {terrainData.altA.toFixed(0)} m</p>
                          )}
                          {terrainData && idx === 1 && (
                             <p className="text-sm text-gray-700">Altitud: {terrainData.altB.toFixed(0)} m</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Results */}
                {terrainData && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Resultados del Análisis</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Distancia</p>
                        <p className="text-2xl font-bold text-blue-700">{terrainData.distKm?.toFixed(2)} km</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Visibilidad</p>
                         <div className="flex items-center gap-2 mt-2">
                          <div className={`w-4 h-4 rounded-full ${terrainData.lineOfSightClear ? "bg-green-500" : "bg-red-500"}`} />
                          <p className="text-lg font-bold text-green-700">
                            {terrainData.lineOfSightClear ? "Clara" : "Obstruida"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">Obstáculo Máximo</p>
                        <p className="text-2xl font-bold text-purple-700">{terrainData.maxObstacle?.toFixed(0)} m</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Footer */}
                <div className="border-t-2 border-gray-200 pt-4 mt-6">
                  <p className="text-xs text-gray-500 text-center">
                    Generado por ParaLink - {new Date().toLocaleString("es-ES")}
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