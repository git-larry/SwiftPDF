'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  EyeIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PDFPreviewProps {
  file: File;
  onClose: () => void;
}

export default function PDFPreview({ file, onClose }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Crear URL del archivo
        const url = URL.createObjectURL(file);
        setPdfUrl(url);

        // Simular carga de información del PDF
        // En una implementación real, usarías pdf-lib o PDF.js para obtener el número de páginas
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular número de páginas (en una implementación real esto vendría del PDF)
        setTotalPages(Math.floor(Math.random() * 10) + 1);
        setIsLoading(false);

      } catch (error) {
        setError('Error al cargar el PDF para vista previa');
        setIsLoading(false);
      }
    };

    loadPDF();

    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [file, pdfUrl]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = file.name;
      a.click();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Cargando vista previa...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={onClose} className="w-full mt-4">
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vista Previa: {file.name}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Descargar
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
          <div className="flex justify-center">
            {pdfUrl ? (
              <div 
                className="bg-white shadow-lg"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
              >
                {/* Nota: En una implementación real, aquí usarías PDF.js o react-pdf */}
                <div className="w-[595px] h-[842px] bg-white border border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <EyeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Vista Previa de PDF</p>
                    <p className="text-sm">Página {currentPage} de {totalPages}</p>
                    <p className="text-xs mt-2 text-gray-400">
                      Implementación completa requiere PDF.js
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No se pudo cargar el PDF</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Archivo: {file.name}</span>
            <span>Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}