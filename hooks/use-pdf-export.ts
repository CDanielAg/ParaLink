import { useState, useCallback, RefObject } from 'react';

interface UsePdfExportProps {
  reportRef: RefObject<HTMLDivElement>;
  projectName: string;
  onExportSuccess?: () => void;
  onExportError?: (error: Error) => void;
}

export function usePdfExport({ reportRef, projectName, onExportSuccess, onExportError }: UsePdfExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!reportRef.current) {
      console.error('Report reference is null.');
      if (onExportError) onExportError(new Error('Report content not available.'));
      return;
    }

    setIsExporting(true);

    try {
      const element = reportRef.current;
      const htmlContent = element.outerHTML;

      let styles = '';
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
            console.warn(`Skipping cross-origin stylesheet: ${sheet.href}`);
            continue;
          }
          const rules = sheet.cssRules || sheet.rules;
          for (const rule of Array.from(rules)) {
            styles += rule.cssText;
          }
        } catch (e) {
          console.warn('Could not process a stylesheet: ', e);
        }
      }

      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PDF Report</title>
            <style>${styles}</style>
          </head>
          <body>${htmlContent}</body>
        </html>
      `;

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: fullHtml }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate PDF on server');
      }

      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (onExportSuccess) onExportSuccess();

    } catch (error: any) {
      console.error('Error during export:', error);
      alert('Error al generar el archivo. Por favor intenta de nuevo.'); // Keep original alert
      if (onExportError) onExportError(error);
    } finally {
      setIsExporting(false);
    }
  }, [reportRef, projectName, onExportSuccess, onExportError]);

  return { handleExport, isExporting };
}
