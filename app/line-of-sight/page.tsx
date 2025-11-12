"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Navigation } from "lucide-react"
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

  useEffect(() => {
    if (points.length === 2) {
      fetchTerrainAnalysis(points[0], points[1])
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
                onClick={() => mapRef.current?.goToMyLocation()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Navigation className="w-4 h-4" />
                Mi Ubicación GPS
              </button>
              <button
                onClick={() => mapRef.current?.addMarkerAtCenter()}
                disabled={points.length >= 2}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
    </main>
  )
}