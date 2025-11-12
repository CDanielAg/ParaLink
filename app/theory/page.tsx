"use client"

import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export default function Theory() {
  const [aperture, setAperture] = useState(2)
  const [focus, setFocus] = useState(1)

  // Generate parabola points for visualization
  const generateParabolaPoints = () => {
    const points = []
    for (let i = -3; i <= 3; i += 0.2) {
      const y = (i * i) / (4 * focus)
      points.push({ x: y * 50 + 200, y: i * 30 + 150 })
    }
    return points
  }

  const points = generateParabolaPoints()
  const pointsPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Teoría de Parábolas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Theory Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Concepto Fundamental</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Una parábola es una curva plana abierta formada por los puntos que equidistan de un punto fijo (foco) y
                de una recta fija (directriz).
              </p>

              <h3 className="font-semibold mb-2 text-foreground">Componentes Clave</h3>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Foco:</strong> Punto donde convergen los rayos
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>
                    <strong>Directriz:</strong> Línea de referencia
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Vértice:</strong> Punto más cercano a directriz
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>
                    <strong>Eje:</strong> Línea de simetría
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-bold mb-4">Fórmula Estándar</h2>
              <div className="bg-muted/20 p-4 rounded-lg text-center font-mono text-lg border border-border mb-4">
                y² = 4ax
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Donde <strong>a</strong> es la distancia del vértice al foco
              </p>

              <h3 className="font-semibold mb-2 text-foreground">Propiedades</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Reflectiva: rayos paralelos convergen en el foco</li>
                <li>• Simetría: la curva es simétrica respecto al eje</li>
                <li>• Aplicación: antenas, espejos, reflectores</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-bold mb-4">Parámetros Ajustables</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex justify-between mb-2">
                    <span>Apertura (a)</span>
                    <span className="text-primary font-bold">{aperture.toFixed(2)}</span>
                  </label>
                  <Slider
                    value={[aperture]}
                    onValueChange={(val) => setAperture(val[0])}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Controla la distancia focal</p>
                </div>

                <div>
                  <label className="text-sm font-medium flex justify-between mb-2">
                    <span>Factor de Forma</span>
                    <span className="text-accent font-bold">{focus.toFixed(2)}</span>
                  </label>
                  <Slider
                    value={[focus]}
                    onValueChange={(val) => setFocus(val[0])}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Modifica la curvatura</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-bold mb-4">Gráfico Interactivo</h2>

              <svg
                width="100%"
                height="400"
                viewBox="0 0 600 300"
                className="border border-border rounded-lg bg-muted/5"
              >
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(100,116,139,0.1)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="600" height="300" fill="url(#grid)" />

                {/* Axes */}
                <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(100,116,139,0.3)" strokeWidth="1" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(100,116,139,0.3)" strokeWidth="1" />

                {/* Directrix */}
                <line
                  x1="50"
                  y1="0"
                  x2="50"
                  y2="300"
                  stroke="rgba(239,68,68,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text x="40" y="15" fontSize="12" fill="rgba(239,68,68,0.6)">
                  Directriz
                </text>

                {/* Focus */}
                <circle cx={200 + focus * 20} cy="150" r="5" fill="#10b981" />
                <text x={200 + focus * 20} y="170" fontSize="12" fill="#10b981" textAnchor="middle">
                  Foco
                </text>

                {/* Parabola */}
                <path d={pointsPath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />

                {/* Vertex */}
                <circle cx="200" cy="150" r="4" fill="#e8eaed" stroke="#0ea5e9" strokeWidth="2" />
              </svg>

              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm">
                <p>
                  <strong>Parámetro a:</strong> {(aperture / (4 * focus)).toFixed(3)} (controla la profundidad)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-bold mb-3">Aplicaciones Prácticas</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Antenas parabólicas</li>
                  <li>• Espejos solares</li>
                  <li>• Reflectores acústicos</li>
                  <li>• Telescopios</li>
                  <li>• Faros y proyectores</li>
                </ul>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-bold mb-3">Ventajas de Parábolas</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Concentración de energía</li>
                  <li>• Bajo costo de fabricación</li>
                  <li>• Amplio rango de frecuencias</li>
                  <li>• Alta directividad</li>
                  <li>• Ganancia eficiente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
