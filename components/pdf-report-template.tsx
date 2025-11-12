"use client"

import React from "react"

import { useRef } from "react"

interface ReportData {
  projectName: string
  date: string
  distance?: number
  azimuth?: number
  elevation?: number
  diameter?: number
  altitudeA?: number
  altitudeB?: number
  temperature?: number
  humidity?: number
  windSpeed?: number
}

interface PdfReportTemplateProps {
  data: ReportData
  onRef?: (ref: React.RefObject<HTMLDivElement>) => void
}

export default function PdfReportTemplate({ data, onRef }: PdfReportTemplateProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (onRef) onRef(reportRef)
  }, [onRef])

  return (
    <div
      ref={reportRef}
      className="bg-white text-black p-8 max-w-4xl mx-auto"
      style={{
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#333",
      }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
        <div className="inline-block w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg mb-2" />
        <h1 className="text-3xl font-bold">GeoParábola</h1>
        <p className="text-gray-600">Reporte de Análisis Geoespacial</p>
        <p className="text-xs text-gray-500 mt-2">Generado: {data.date}</p>
      </div>

      {/* Project Info */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">Información del Proyecto</h2>
        <p>
          <strong>Nombre:</strong> {data.projectName}
        </p>
        <p>
          <strong>Fecha de Análisis:</strong> {data.date}
        </p>
      </div>

      {/* Calculations */}
      {(data.distance !== undefined || data.azimuth !== undefined) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">Cálculos Parabólicos</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.distance !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Distancia</p>
                <p className="font-bold">{data.distance.toFixed(2)} km</p>
              </div>
            )}
            {data.azimuth !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Azimut</p>
                <p className="font-bold">{data.azimuth.toFixed(1)}°</p>
              </div>
            )}
            {data.elevation !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Elevación</p>
                <p className="font-bold">{data.elevation.toFixed(2)}°</p>
              </div>
            )}
            {data.diameter !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Diámetro Sugerido</p>
                <p className="font-bold">{data.diameter.toFixed(2)} m</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terrain Data */}
      {(data.altitudeA !== undefined || data.altitudeB !== undefined) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">Datos Topográficos</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.altitudeA !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Altitud Punto A</p>
                <p className="font-bold">{data.altitudeA.toFixed(0)} m</p>
              </div>
            )}
            {data.altitudeB !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Altitud Punto B</p>
                <p className="font-bold">{data.altitudeB.toFixed(0)} m</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weather Data */}
      {(data.temperature !== undefined || data.humidity !== undefined) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">Condiciones Climáticas</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.temperature !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Temperatura</p>
                <p className="font-bold">{data.temperature}°C</p>
              </div>
            )}
            {data.humidity !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Humedad</p>
                <p className="font-bold">{data.humidity}%</p>
              </div>
            )}
            {data.windSpeed !== undefined && (
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Velocidad del Viento</p>
                <p className="font-bold">{data.windSpeed} km/h</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 text-center text-xs text-gray-600">
        <p>GeoParábola v1.0.0 - Herramienta de Análisis Geoespacial</p>
        <p>Información de APIs: OpenStreetMap, OpenElevation, Open-Meteo, SatNOGS</p>
      </div>
    </div>
  )
}
