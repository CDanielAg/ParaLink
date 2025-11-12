"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapPoint {
  lat: number
  lng: number
  label: string
}

interface MapContainerProps {
  onPointsChange?: (points: MapPoint[]) => void
}

export default function MapContainer({ onPointsChange }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const [points, setPoints] = useState<MapPoint[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([40.7128, -74.006], 10)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

  // Track polyline so we can remove it on clear
  // usar el ref del scope

    // Handle clicks to add points
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (markersRef.current.length >= 2) return

      const { lat, lng } = e.latlng
      const newPoint: MapPoint = {
        lat: Number.parseFloat(lat.toFixed(4)),
        lng: Number.parseFloat(lng.toFixed(4)),
        label: markersRef.current.length === 0 ? "A" : "B",
      }

      // Add marker
      const marker = L.marker([lat, lng])
        .bindPopup(`Punto ${newPoint.label}<br/>Lat: ${newPoint.lat}<br/>Lng: ${newPoint.lng}`)
        .addTo(map)

      markersRef.current.push(marker)

      // Use functional setState to avoid stale closure
      setPoints((prev) => {
        const updated = [...prev, newPoint]
        onPointsChange?.(updated)

        // Remove existing polyline and draw a new one if two points
        if (polylineRef.current) {
          try { map.removeLayer(polylineRef.current) } catch (e) {}
          polylineRef.current = null
        }
        if (updated.length === 2) {
          polylineRef.current = L.polyline(
            [
              [updated[0].lat, updated[0].lng],
              [updated[1].lat, updated[1].lng],
            ],
            { color: "#0ea5e9", weight: 2, dashArray: "5, 5" },
          ).addTo(map)
        }

        return updated
      })
    }

    map.on("click", handleMapClick)

    return () => {
      map.off("click", handleMapClick)
  if (polylineRef.current) try { map.removeLayer(polylineRef.current) } catch (e) {}
    }
  }, [onPointsChange])

  const clearPoints = () => {
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    if (polylineRef.current) {
      try {
        polylineRef.current.remove()
      } catch (e) {}
      polylineRef.current = null
    }
    setPoints([])
    onPointsChange?.([])
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 bg-card/95 border border-border rounded-lg p-4 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground mb-2">
          {points.length === 0 ? "Haz clic en el mapa para marcar puntos" : `${points.length}/2 puntos marcados`}
        </p>
        {points.length > 0 && (
          <button
            onClick={clearPoints}
            className="w-full px-3 py-1 bg-muted text-foreground text-sm rounded hover:bg-muted/80 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Cursor Coordinates */}
      <div className="absolute bottom-4 right-4 bg-card/95 border border-border rounded-lg px-3 py-2 backdrop-blur-sm text-xs text-muted-foreground">
        Pasa el ratón por el mapa para ver coordenadas
      </div>
    </div>
  )
}
