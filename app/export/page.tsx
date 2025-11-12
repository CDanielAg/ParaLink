"use client"

import { Download, Printer } from "lucide-react"
import { useRef, useState } from "react"
import PdfReportTemplate from "@/components/pdf-report-template"

export default function Export() {
  const [projectName, setProjectName] = useState("Análisis GeoParábola")
  const reportRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return

    const element = reportRef.current
    const opt = {
      margin: 10,
      filename: `geoparabola-${new Date().getTime()}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    }

    // Import html2pdf dynamically to avoid server-side evaluation (ReferenceError: self is not defined)
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf().set(opt).from(element).save()
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
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
