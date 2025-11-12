"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
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

export type MapContainerHandle = {
  addMarkerAtCenter: () => void
  clearPoints: () => void
  goToMyLocation: () => void
}

const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(function MapContainer({ onPointsChange }: MapContainerProps, ref) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const [points, setPoints] = useState<MapPoint[]>([])
  const [markMode, setMarkMode] = useState<boolean>(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Shim para navegadores que muestran advertencia sobre MouseEvent.mozPressure
    try {
      if (typeof window !== 'undefined' && typeof (MouseEvent.prototype as any).mozPressure === 'undefined') {
        Object.defineProperty(MouseEvent.prototype, 'mozPressure', {
          get() {
            // @ts-ignore
            return (this as any).pressure ?? 0
          },
          configurable: true,
        })
      }
      if (typeof window !== 'undefined' && typeof (MouseEvent.prototype as any).mozInputSource === 'undefined') {
        Object.defineProperty(MouseEvent.prototype, 'mozInputSource', {
          get() {
            // Map pointerType to a numeric code to approximate old mozInputSource values
            // mouse -> 1, pen -> 2, touch -> 3, unknown -> 0
            // @ts-ignore
            const pt = (this as any).pointerType
            if (!pt) return 0
            if (pt === 'mouse') return 1
            if (pt === 'pen') return 2
            if (pt === 'touch') return 3
            return 0
          },
          configurable: true,
        })
      }
    } catch (e) {
      // noop
    }

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

      // Add marker (draggable)
      const marker = L.marker([lat, lng], { draggable: true })
        .bindPopup(`Punto ${newPoint.label}<br/>Lat: ${newPoint.lat}<br/>Lng: ${newPoint.lng}`)
        .addTo(map)

      // handle drag to update point
      marker.on('dragend', (ev: L.LeafletEvent) => {
        const m = ev.target as L.Marker
        const pos = m.getLatLng()
        setPoints((prev) => {
          const updated = prev.map((p) => (p.label === newPoint.label ? { ...p, lat: Number.parseFloat(pos.lat.toFixed(4)), lng: Number.parseFloat(pos.lng.toFixed(4)) } : p))
          onPointsChange?.(updated)
          // update polyline
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
      })

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

    // Use PointerEvent on the map container for marking (better on mobile)
    const container = map.getContainer()
    const pointerHandler = (ev: PointerEvent) => {
      if (!markMode) return
      // Only react to primary button / touch
      if (ev.isPrimary === false) return
      ev.preventDefault()
      // Convert DOM event to latlng
      try {
        // Leaflet provides mouseEventToLatLng which accepts pointer events
        const latlng = (map as any).mouseEventToLatLng(ev)
        if (!latlng) return
        // reuse existing click handler logic
        handleMapClick({ latlng } as unknown as L.LeafletMouseEvent)
      } catch (e) {
        // fallback: compute container point
        const rect = container.getBoundingClientRect()
        const point = L.point(ev.clientX - rect.left, ev.clientY - rect.top)
        const latlng = map.containerPointToLatLng(point)
        handleMapClick({ latlng } as unknown as L.LeafletMouseEvent)
      }
    }

    container.addEventListener('pointerdown', pointerHandler)

    return () => {
      container.removeEventListener('pointerdown', pointerHandler)
      if (polylineRef.current) try { map.removeLayer(polylineRef.current) } catch (e) {}
    }
  }, [onPointsChange])

  // Effect to enable/disable map interactions when markMode toggles
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (markMode) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
    } else {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
    }
  }, [markMode])

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

  const addMarkerAt = (lat: number, lng: number) => {
    const map = mapInstanceRef.current
    if (!map) return
    if (markersRef.current.length >= 2) return

    const newPoint: MapPoint = {
      lat: Number.parseFloat(lat.toFixed(4)),
      lng: Number.parseFloat(lng.toFixed(4)),
      label: markersRef.current.length === 0 ? 'A' : 'B',
    }

    const marker = L.marker([lat, lng], { draggable: true })
      .bindPopup(`Punto ${newPoint.label}<br/>Lat: ${newPoint.lat}<br/>Lng: ${newPoint.lng}`)
      .addTo(map)

    marker.on('dragend', (ev: L.LeafletEvent) => {
      const m = ev.target as L.Marker
      const pos = m.getLatLng()
      setPoints((prev) => {
        const updated = prev.map((p) => (p.label === newPoint.label ? { ...p, lat: Number.parseFloat(pos.lat.toFixed(4)), lng: Number.parseFloat(pos.lng.toFixed(4)) } : p))
        onPointsChange?.(updated)
        if (polylineRef.current) {
          try { map.removeLayer(polylineRef.current) } catch (e) {}
          polylineRef.current = null
        }
        if (updated.length === 2) {
          polylineRef.current = L.polyline([
            [updated[0].lat, updated[0].lng],
            [updated[1].lat, updated[1].lng],
          ], { color: '#0ea5e9', weight: 2, dashArray: '5, 5' }).addTo(map)
        }
        return updated
      })
    })

    markersRef.current.push(marker)
    setPoints((prev) => {
      const updated = [...prev, newPoint]
      onPointsChange?.(updated)
      if (updated.length === 2) {
        if (polylineRef.current) try { map.removeLayer(polylineRef.current) } catch (e) {}
        polylineRef.current = L.polyline([
          [updated[0].lat, updated[0].lng],
          [updated[1].lat, updated[1].lng],
        ], { color: '#0ea5e9', weight: 2, dashArray: '5, 5' }).addTo(map)
      }
      return updated
    })
  }

  const addMarkerAtCenter = () => {
    const map = mapInstanceRef.current
    if (!map) return
    const c = map.getCenter()
    addMarkerAt(c.lat, c.lng)
  }

  const goToMyLocation = () => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 14)
    })
  }

  useImperativeHandle(ref, () => ({
    addMarkerAtCenter,
    clearPoints,
    goToMyLocation,
  }))

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

  {/* Map Controls - moved to right side */}
  <div className="absolute right-4 top-24 bg-card/95 border border-border rounded-lg p-4 backdrop-blur-sm z-50 pointer-events-auto">
        <p className="text-xs text-muted-foreground mb-2">
          {points.length === 0
            ? markMode
              ? "Toca en el mapa para marcar puntos"
              : "Activa 'Marcar puntos' para añadir pines"
            : `${points.length}/2 puntos marcados`}
        </p>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setMarkMode((s) => !s)}
            className={`px-3 py-1 text-sm rounded ${markMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
          >
            {markMode ? 'Marcar: ON' : 'Marcar: OFF'}
          </button>
          <button
            onClick={() => clearPoints()}
            className="px-3 py-1 text-sm rounded bg-muted text-foreground"
          >
            Limpiar
          </button>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              const map = mapInstanceRef.current
              if (!map) return
              const center = map.getCenter()
              addMarkerAt(center.lat, center.lng)
            }}
            className="w-full px-3 py-1 text-sm rounded bg-secondary text-secondary-foreground"
          >
            Colocar en centro
          </button>
          <button
            onClick={() => {
              const map = mapInstanceRef.current
              if (!map) return
              if (!navigator.geolocation) return
              navigator.geolocation.getCurrentPosition((pos) => {
                map.setView([pos.coords.latitude, pos.coords.longitude], 14)
              })
            }}
            className="w-full px-3 py-1 text-sm rounded bg-muted text-foreground"
          >
            Ir a mi ubicación
          </button>
        </div>
        </div>

      {/* Crosshair */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-6 h-6 border border-primary rounded-full opacity-70" />
      </div>
        {/* fallback single clear button removed (we use the above) */}
      </div>

      {/* Cursor Coordinates */}
      <div className="absolute bottom-4 right-4 bg-card/95 border border-border rounded-lg px-3 py-2 backdrop-blur-sm text-xs text-muted-foreground z-50">
        Pasa el ratón por el mapa para ver coordenadas
      </div>
    </div>
  )
  });

  export default MapContainer
