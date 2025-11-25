"use client"

import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export default function Theory() {
  // Mantenemos tus nombres de estado, pero ahora 'aperture' controla el tamaño real (diámetro)
  const [aperture, setAperture] = useState(3) // Tamaño del plato
  const [focus, setFocus] = useState(1)       // Distancia focal (p)

  // CONSTANTES DE VISUALIZACIÓN
  const SCALE = 40      // Pixeles por unidad (Escala uniforme para que la geometría sea real)
  const ORIGIN_X = 200  // Vértice X
  const ORIGIN_Y = 150  // Vértice Y

  // Lógica corregida: 
  // 1. Usamos escala 1:1 para que la distancia visual sea real.
  // 2. 'aperture' ahora define qué tan larga es la curva (el bucle).
  const generateParabolaPoints = () => {
    const points = []
    // El límite del bucle define el diámetro de la antena
    const limit = aperture 
    
    // Iteramos 'i' que representa la altura (eje Y local)
    for (let i = -limit; i <= limit; i += 0.1) {
      // Fórmula real: x = y² / 4p
      const x_val = (i * i) / (4 * focus)
      
      points.push({ 
        x: x_val * SCALE + ORIGIN_X, 
        y: i * SCALE + ORIGIN_Y 
      })
    }
    return points
  }

  const points = generateParabolaPoints()
  const pointsPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  // Calculamos posiciones dinámicas para el SVG
  const focusX = ORIGIN_X + (focus * SCALE)
  const directrixX = ORIGIN_X - (focus * SCALE)

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
                    <span>Apertura (Tamaño)</span>
                    <span className="text-primary font-bold">{aperture.toFixed(2)}</span>
                  </label>
                  <Slider
                    value={[aperture]}
                    onValueChange={(val) => setAperture(val[0])}
                    min={1}
                    max={4}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Controla el diámetro del plato</p>
                </div>

                <div>
                  <label className="text-sm font-medium flex justify-between mb-2">
                    <span>Distancia Focal (a)</span>
                    <span className="text-accent font-bold">{focus.toFixed(2)}</span>
                  </label>
                  <Slider
                    value={[focus]}
                    onValueChange={(val) => setFocus(val[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Modifica la curvatura y posición del foco</p>
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
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100,116,139,0.1)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="600" height="300" fill="url(#grid)" />

                {/* Axes */}
                <line x1={ORIGIN_X} y1="0" x2={ORIGIN_X} y2="300" stroke="rgba(100,116,139,0.3)" strokeWidth="1" />
                <line x1="0" y1={ORIGIN_Y} x2="600" y2={ORIGIN_Y} stroke="rgba(100,116,139,0.3)" strokeWidth="1" />

                {/* Directrix (Ahora es dinámica: se mueve con el foco) */}
                <line
                  x1={directrixX}
                  y1="0"
                  x2={directrixX}
                  y2="300"
                  stroke="rgba(239,68,68,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text x={directrixX - 10} y="20" fontSize="12" fill="rgba(239,68,68,0.6)" textAnchor="end">
                  Directriz
                </text>

                {/* Parabola */}
                <path d={pointsPath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />

                {/* Vertex */}
                <circle cx={ORIGIN_X} cy={ORIGIN_Y} r="4" fill="#e8eaed" stroke="#0ea5e9" strokeWidth="2" />

                {/* Focus (Ahora es dinámico) */}
                <circle cx={focusX} cy={ORIGIN_Y} r="5" fill="#10b981" />
                <text x={focusX} y={ORIGIN_Y + 25} fontSize="12" fill="#10b981" textAnchor="middle">
                  Foco
                </text>

                {/* Línea visual de apertura (opcional para ver el diámetro) */}
                <line 
                  x1={points[0]?.x} y1={points[0]?.y} 
                  x2={points[points.length-1]?.x} y2={points[points.length-1]?.y} 
                  stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" 
                />

              </svg>

              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm">
                <p>
                  <strong>Relación actual:</strong> La directriz está a la misma distancia del vértice ({focus}) que el foco.
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