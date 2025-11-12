"use client"

import { useEffect, useState } from "react"

interface SignalQualityGaugeProps {
  quality: number // 0-100
}

export default function SignalQualityGauge({ quality }: SignalQualityGaugeProps) {
  const [displayQuality, setDisplayQuality] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDisplayQuality(quality), 100)
    return () => clearTimeout(timer)
  }, [quality])

  const getColor = (q: number) => {
    if (q >= 80) return "#10b981"
    if (q >= 60) return "#3b82f6"
    if (q >= 40) return "#f59e0b"
    return "#ef4444"
  }

  const getLabel = (q: number) => {
    if (q >= 80) return "Excelente"
    if (q >= 60) return "Buena"
    if (q >= 40) return "Regular"
    return "Deficiente"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Gauge background */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="20" />

          {/* Gauge fill */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={getColor(displayQuality)}
            strokeWidth="20"
            strokeDasharray={`${(displayQuality / 100) * 565} 565`}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
          />

          {/* Center text */}
          <text x="100" y="100" textAnchor="middle" dy="0.3em" fontSize="48" fontWeight="bold" fill="currentColor">
            {displayQuality}%
          </text>
          <text
            x="100"
            y="130"
            textAnchor="middle"
            fontSize="14"
            fill="rgba(100,116,139,0.8)"
            className="text-muted-foreground"
          >
            {getLabel(displayQuality)}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>80-100%: Excelente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>60-79%: Buena</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span>40-59%: Regular</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>0-39%: Deficiente</span>
        </div>
      </div>
    </div>
  )
}
