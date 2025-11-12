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

    // Clonar el nodo y aplicar estilos computados inline para evitar que html2canvas intente parsear
    // funciones de color modernas como lab(), que no están soportadas.
    const cloneNodeWithInlineStyles = (node: HTMLElement) => {
      const clone = node.cloneNode(true) as HTMLElement

      const colorProps = [
        'color',
        'background',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'box-shadow',
        'text-shadow',
        'fill',
        'stroke'
      ]

      const resolveColor = (val: string) => {
        if (!/lab\(/i.test(val)) return val
        try {
          const temp = document.createElement('div')
          temp.style.color = val
          temp.style.display = 'none'
          document.body.appendChild(temp)
          const rgb = window.getComputedStyle(temp).color
          document.body.removeChild(temp)
          return rgb || 'rgb(0, 0, 0)'
        } catch (e) {
          return 'rgb(0, 0, 0)'
        }
      }

      const walk = (orig: Element, copied: Element) => {
        const computed = window.getComputedStyle(orig as Element)

        // Aplicar propiedades de color críticas como estilos inline con valores resueltos
        for (const prop of colorProps) {
          try {
            const value = computed.getPropertyValue(prop)
            if (value) {
              const resolved = resolveColor(value)
              ;(copied as HTMLElement).style.setProperty(prop, resolved)
            }
          } catch (e) {
            // ignore
          }
        }

        // Copiar tamaño, fuentes y layout básicos para conservar apariencia
        const passthrough = ['font', 'font-size', 'font-family', 'font-weight', 'line-height', 'padding', 'margin', 'width', 'height', 'display', 'vertical-align', 'text-align']
        for (const prop of passthrough) {
          try {
            const v = computed.getPropertyValue(prop)
            if (v) (copied as HTMLElement).style.setProperty(prop, v)
          } catch (e) {}
        }

        // Eliminar variables CSS en el nodo copiado para evitar referencias a lab() desde :root
        const copiedStyle = (copied as HTMLElement).style
        for (let i = copiedStyle.length - 1; i >= 0; i--) {
          const name = copiedStyle.item(i)
          if (name && name.startsWith('--')) copiedStyle.removeProperty(name)
        }

        // Repetir para hijos
        const origChildren = Array.from(orig.children)
        const copyChildren = Array.from(copied.children)
        for (let i = 0; i < origChildren.length; i++) {
          const o = origChildren[i]
          const c = copyChildren[i]
          if (o && c) walk(o, c)
        }
      }

      walk(node, clone)
      return clone
    }
    const opt: any = {
      margin: 10,
      filename: `geoparabola-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm', format: 'a4' },
    }

    // Import html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default

  // Usar el clon con estilos inline para evitar errores de parseo de CSS modernos
  const cloned = cloneNodeWithInlineStyles(element)
    const wrapper = document.createElement('div')
    wrapper.style.position = 'fixed'
    wrapper.style.left = '-9999px'
    wrapper.appendChild(cloned)
    // Resolver variables CSS en :root que usan lab(...) y crear un style temporal
    const buildResolvedRootVarsStyle = () => {
      const computedRoot = window.getComputedStyle(document.documentElement)
      const rules: string[] = []
      for (let i = 0; i < computedRoot.length; i++) {
        const name = computedRoot.item(i)
        if (!name) continue
        if (!name.startsWith('--')) continue
        const val = computedRoot.getPropertyValue(name).trim()
        if (!val) continue
        if (/lab\(/i.test(val)) {
          // intentar resolver a rgb
          try {
            const temp = document.createElement('div')
            temp.style.color = val
            temp.style.display = 'none'
            document.body.appendChild(temp)
            const rgb = window.getComputedStyle(temp).color || ''
            document.body.removeChild(temp)
            if (rgb) rules.push(`${name}: ${rgb};`)
          } catch (e) {
            rules.push(`${name}: rgb(0,0,0);`)
          }
        }
      }
      if (rules.length === 0) return null
      const style = document.createElement('style')
      style.textContent = `:root { ${rules.join(' ')} }`
      return style
    }

    const resolvedRootStyle = buildResolvedRootVarsStyle()
    if (resolvedRootStyle) wrapper.appendChild(resolvedRootStyle)
    document.body.appendChild(wrapper)

    // Override temporal directo en :root para variables que contienen lab(...)
    const root = document.documentElement
    const originalVars: Record<string, string | null> = {}
    const toOverride: Array<[string, string]> = []
    const computedRoot = window.getComputedStyle(root)
    for (let i = 0; i < computedRoot.length; i++) {
      const name = computedRoot.item(i)
      if (!name) continue
      if (!name.startsWith('--')) continue
      const val = computedRoot.getPropertyValue(name).trim()
      if (!val) continue
      if (/lab\(/i.test(val)) {
        // intentar resolver
        try {
          const temp = document.createElement('div')
          temp.style.color = val
          temp.style.display = 'none'
          document.body.appendChild(temp)
          const rgb = window.getComputedStyle(temp).color || 'rgb(0,0,0)'
          document.body.removeChild(temp)
          originalVars[name] = root.style.getPropertyValue(name) || null
          toOverride.push([name, rgb])
        } catch (e) {
          originalVars[name] = root.style.getPropertyValue(name) || null
          toOverride.push([name, 'rgb(0,0,0)'])
        }
      }
    }

    for (const [k, v] of toOverride) {
      root.style.setProperty(k, v)
    }

    try {
      await html2pdf().set(opt).from(cloned).save()
    } finally {
      // restaurar variables originales
      for (const [k, _] of toOverride) {
        const orig = originalVars[k]
        if (orig === null) root.style.removeProperty(k)
        else root.style.setProperty(k, orig)
      }
      // limpiar style temporal si existe
      if (resolvedRootStyle && resolvedRootStyle.parentNode) resolvedRootStyle.parentNode.removeChild(resolvedRootStyle)
      if (wrapper.parentNode) document.body.removeChild(wrapper)
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
