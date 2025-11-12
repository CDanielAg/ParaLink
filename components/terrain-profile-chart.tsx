"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TerrainData {
  distance: number
  elevation: number
}

interface TerrainProfileChartProps {
  lat1: number
  lng1: number
  lat2: number
  lng2: number
}

export default function TerrainProfileChart({ lat1, lng1, lat2, lng2 }: TerrainProfileChartProps) {
  const [data, setData] = useState<TerrainData[]>([])
  const [loading, setLoading] = useState(true)
  const [lineOfSightClear, setLineOfSightClear] = useState(true)

  useEffect(() => {
    const fetchTerrainProfile = async () => {
      try {
        setLoading(true)

        // Create 50 points along the line between the two coordinates
        const points = []
        for (let i = 0; i <= 50; i++) {
          const progress = i / 50
          const lat = lat1 + (lat2 - lat1) * progress
          const lng = lng1 + (lng2 - lng1) * progress
          points.push(`${lat},${lng}`)
        }

        // Fetch elevation for all points
        const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${points.join("|")}`)
        const result = await response.json()

        if (result.results) {
          // Calculate straight line distance
          const R = 6371 // km
          const dLat = ((lat2 - lat1) * Math.PI) / 180
          const dLng = ((lng2 - lng1) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const totalDistance = R * c

          const terrainData = result.results.map((point: any, idx: number) => ({
            distance: (totalDistance * idx) / 50,
            elevation: point.elevation,
          }))

          setData(terrainData)

          // Check line of sight - simplified check
          if (terrainData.length > 2) {
            const startElev = terrainData[0].elevation
            const endElev = terrainData[terrainData.length - 1].elevation
            const maxIntermediate = Math.max(...terrainData.slice(1, -1).map((d) => d.elevation))

            // Draw line between start and end points
            const lineAtPoint = (idx: number) => {
              const progress = idx / (terrainData.length - 1)
              return startElev + (endElev - startElev) * progress
            }

            // Check if any terrain point is above the line
            let clear = true
            for (let i = 1; i < terrainData.length - 1; i++) {
              if (terrainData[i].elevation > lineAtPoint(i) + 50) {
                // 50m clearance margin
                clear = false
                break
              }
            }
            setLineOfSightClear(clear)
          }
        }
      } catch (error) {
        console.log("[v0] Failed to fetch terrain profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTerrainProfile()
  }, [lat1, lng1, lat2, lng2])

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Cargando perfil...</div>
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="distance" label={{ value: "Distancia (km)", position: "insideBottomRight", offset: -5 }} />
          <YAxis label={{ value: "Elevación (m)", angle: -90, position: "insideLeft" }} />
          <Tooltip contentStyle={{ backgroundColor: "rgba(26, 31, 46, 0.95)", border: "1px solid #2d3748" }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="elevation"
            stroke="#0ea5e9"
            dot={false}
            name="Elevación del Terreno"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
