"use client"

import { Download, Printer } from "lucide-react"
import { useRef, useState } from "react"
import PdfReportTemplate from "@/components/pdf-report-template"

export default function Export() {
  const [projectName, setProjectName] = useState("Análisis ParaLink")
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isGenerating) return

    setIsGenerating(true)

    try {
      const element = reportRef.current
      const htmlContent = element.outerHTML

      // Recopilar todos los estilos del documento
      let styles = ''
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          // Para hojas de estilo de origen cruzado, el acceso a cssRules puede estar bloqueado.
          if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
            // No podemos acceder a las reglas, pero podemos intentar volver a cargar la hoja de estilo
            // si es necesario, aunque para este caso lo omitiremos para evitar complejidad.
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
            <style>
              ${styles}
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ htmlContent: fullHtml }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      const pdfBlob = await response.blob()
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `paralink-report-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Aquí podrías mostrar una notificación de error al usuario
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    if (!reportRef.current) return
    const printWindow = window.open("", "", "width=900,height=600")
    if (printWindow) {
      printWindow.document.write(reportRef.current.innerHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const reportData = {
    projectName,
    date: new Date().toLocaleDateString("es-ES"),
    distance: 125.5,
    azimuth: 45.2,
    elevation: 12.8,
    diameter: 1.5,
    altitudeA: 450,
    altitudeB: 520,
    temperature: 22,
    humidity: 65,
    windSpeed: 15,
  }

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Exportar Resultados</h1>
            <p className="text-muted-foreground mt-2">Genera y descarga reportes en PDF</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-primary-foreground rounded-full"></span>
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Configuración del Reporte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Nombre del Proyecto</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Formato</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option>PDF (Recomendado)</option>
                <option>PNG</option>
                <option>SVG</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Nivel de Detalle</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Completo</option>
                <option>Resumido</option>
                <option>Solo Cálculos</option>
              </select>
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="bg-gray-50 rounded-lg border border-gray-300 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Vista Previa</h2>
            <span className="text-xs text-gray-500">A4 - Retrato</span>
          </div>

          <div
            ref={reportRef}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            style={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <PdfReportTemplate data={reportData} />
          </div>
        </div>

        {/* Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-bold mb-2">Formatos Soportados</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• PDF (Alta resolución)</li>
              <li>• PNG (Imagen)</li>
              <li>• SVG (Vectorial)</li>
            </ul>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-bold mb-2">Incluido en el Reporte</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cálculos parabólicos</li>
              <li>• Datos topográficos</li>
              <li>• Condiciones climáticas</li>
              <li>• Gráficos y mapas</li>
            </ul>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-bold mb-2">Opciones</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Imprimir directamente</li>
              <li>• Guardar localmente</li>
              <li>• Enviar por correo</li>
              <li>• Compartir en línea</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
