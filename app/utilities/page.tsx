"use client"

import type React from "react"

import { RotateCw } from "lucide-react"
import { useState } from "react"

export default function Utilities() {
  const [converters, setConverters] = useState({
    metersKm: { meters: "", kilometers: "" },
    dbmMw: { dbm: "", mw: "" },
    degreesRadians: { degrees: "", radians: "" },
    frequencyWavelength: { frequency: "", wavelength: "" },
  })

  const handleMeterConvert = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = Number.parseFloat(e.target.value) || 0
    if (field === "meters") {
      setConverters((prev) => ({
        ...prev,
        metersKm: { meters: e.target.value, kilometers: (value / 1000).toString() },
      }))
    } else {
      setConverters((prev) => ({
        ...prev,
        metersKm: { meters: (value * 1000).toString(), kilometers: e.target.value },
      }))
    }
  }

  const handleDbmConvert = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = Number.parseFloat(e.target.value) || 0
    if (field === "dbm") {
      const mw = Math.pow(10, value / 10)
      setConverters((prev) => ({
        ...prev,
        dbmMw: { dbm: e.target.value, mw: mw.toFixed(4) },
      }))
    } else {
      const dbm = 10 * Math.log10(value)
      setConverters((prev) => ({
        ...prev,
        dbmMw: { dbm: dbm.toFixed(2), mw: e.target.value },
      }))
    }
  }

  const handleDegreesConvert = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = Number.parseFloat(e.target.value) || 0
    if (field === "degrees") {
      const radians = (value * Math.PI) / 180
      setConverters((prev) => ({
        ...prev,
        degreesRadians: { degrees: e.target.value, radians: radians.toFixed(6) },
      }))
    } else {
      const degrees = (value * 180) / Math.PI
      setConverters((prev) => ({
        ...prev,
        degreesRadians: { degrees: degrees.toFixed(2), radians: e.target.value },
      }))
    }
  }

  const handleFrequencyConvert = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = Number.parseFloat(e.target.value) || 0
    const c = 299792458 // Speed of light in m/s
    if (field === "frequency") {
      const wavelength = c / (value * 1e9) // frequency in GHz to wavelength in m
      setConverters((prev) => ({
        ...prev,
        frequencyWavelength: { frequency: e.target.value, wavelength: wavelength.toFixed(6) },
      }))
    } else {
      const frequency = c / (value * 1e9)
      setConverters((prev) => ({
        ...prev,
        frequencyWavelength: { frequency: frequency.toFixed(4), wavelength: e.target.value },
      }))
    }
  }

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Utilidades</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Converters */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold mb-6">Conversores Rápidos</h2>

            <div className="space-y-6">
              {/* Meters to KM */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Metros ↔ Kilómetros</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Metros"
                    value={converters.metersKm.meters}
                    onChange={(e) => handleMeterConvert(e, "meters")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Kilómetros"
                    value={converters.metersKm.kilometers}
                    onChange={(e) => handleMeterConvert(e, "kilometers")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* dBm to mW */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">dBm ↔ mW</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="dBm"
                    value={converters.dbmMw.dbm}
                    onChange={(e) => handleDbmConvert(e, "dbm")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="mW"
                    value={converters.dbmMw.mw}
                    onChange={(e) => handleDbmConvert(e, "mw")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Degrees to Radians */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Grados ↔ Radianes</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Grados"
                    value={converters.degreesRadians.degrees}
                    onChange={(e) => handleDegreesConvert(e, "degrees")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Radianes"
                    value={converters.degreesRadians.radians}
                    onChange={(e) => handleDegreesConvert(e, "radians")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Frequency to Wavelength */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Frecuencia (GHz) ↔ Longitud Onda (m)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Frecuencia (GHz)"
                    value={converters.frequencyWavelength.frequency}
                    onChange={(e) => handleFrequencyConvert(e, "frequency")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Longitud (m)"
                    value={converters.frequencyWavelength.wavelength}
                    onChange={(e) => handleFrequencyConvert(e, "wavelength")}
                    className="flex-1 min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold mb-6">Estado de APIs</h2>

            <div className="space-y-3 mb-6">
              {[
                { name: "OpenStreetMap", status: "online" },
                { name: "OpenElevation", status: "online" },
                { name: "Open-Meteo", status: "online" },
                { name: "SatNOGS", status: "online" },
              ].map((api) => (
                <div
                  key={api.name}
                  className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-border"
                >
                  <span className="text-sm font-medium">{api.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-semibold">EN LÍNEA</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4" />
              Actualizar Estado
            </button>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Información del Proyecto</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Nombre:</strong> ParaLink
              </p>
              <p>
                <strong className="text-foreground">Versión:</strong> 1.0.0
              </p>
              <p>
                <strong className="text-foreground">Estado:</strong> Desarrollo Activo
              </p>
              <p>
                <strong className="text-foreground">Última Actualización:</strong> {new Date().toLocaleDateString()}
              </p>
              <p>
                <strong className="text-foreground">Licencia:</strong> MIT
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold mb-4">APIs y Recursos</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Mapas: OpenStreetMap</p>
              <p>• Elevación: OpenElevation API</p>
              <p>• Clima: Open-Meteo API</p>
              <p>• Satélites: SatNOGS Network</p>
              <p>• Datos Actualizados: Automáticamente</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
