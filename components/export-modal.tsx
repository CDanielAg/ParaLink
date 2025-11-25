import React, { RefObject } from 'react';
import { Download } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  isExporting: boolean;
  onExport: () => void;
  reportRef: RefObject<HTMLDivElement>;
  children: React.ReactNode;
  title?: string;
  detailLevel?: string; // Optional prop for detail level
  onDetailLevelChange?: (level: string) => void; // Optional prop for detail level change
}

export function ExportModal({
  isOpen,
  onClose,
  projectName,
  onProjectNameChange,
  isExporting,
  onExport,
  reportRef,
  children,
  title = "Vista Previa del Reporte",
  detailLevel,
  onDetailLevelChange,
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold mb-4">Configuración del Reporte</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {detailLevel !== undefined && onDetailLevelChange && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Nivel de Detalle
                </label>
                <select
                  value={detailLevel}
                  onChange={(e) => onDetailLevelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Completo</option>
                  <option>Resumido</option>
                  <option>Solo Cálculos</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 bg-muted/5">
          <div ref={reportRef} data-report-content className="bg-white text-black p-8 rounded-lg border border-gray-300">
            {children}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}