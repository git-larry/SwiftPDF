'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUploadSimple';
import { PDFProcessor } from '@/utils/pdfProcessing';

export default function DeletePagesPDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageInput, setPageInput] = useState('');

  const handleFileSelect = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setPdfInfo(null);
    setSelectedPages(new Set());
    setPageInput('');

    if (selectedFile) {
      try {
        const info = await PDFProcessor.getPDFInfo(selectedFile);
        setPdfInfo({ pageCount: info.pageCount });
      } catch (error) {
        setError('Error al leer información del PDF');
      }
    }
  };

  const parsePageNumbers = (input: string, maxPages: number): number[] => {
    const pages: number[] = [];
    const parts = input.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
          for (let i = start; i <= end; i++) {
            pages.push(i - 1); // Convertir a índice base 0
          }
        }
      } else {
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          pages.push(pageNum - 1); // Convertir a índice base 0
        }
      }
    }
    
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  const handlePageInputChange = (input: string) => {
    setPageInput(input);
    if (pdfInfo) {
      const pages = parsePageNumbers(input, pdfInfo.pageCount);
      setSelectedPages(new Set(pages));
    }
  };

  const togglePage = (pageIndex: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageIndex)) {
      newSelected.delete(pageIndex);
    } else {
      newSelected.add(pageIndex);
    }
    setSelectedPages(newSelected);
    
    // Actualizar el input de texto
    const sortedPages = Array.from(newSelected).sort((a, b) => a - b);
    const displayPages = sortedPages.map(p => p + 1); // Convertir a base 1 para mostrar
    setPageInput(displayPages.join(','));
  };

  const selectAllPages = () => {
    if (pdfInfo) {
      const allPages = Array.from({ length: pdfInfo.pageCount }, (_, i) => i);
      setSelectedPages(new Set(allPages));
      setPageInput(allPages.map(p => p + 1).join(','));
    }
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
    setPageInput('');
  };

  const handleDeletePages = async () => {
    if (!file || !pdfInfo) {
      setError('Selecciona un archivo PDF válido');
      return;
    }

    if (selectedPages.size === 0) {
      setError('Selecciona al menos una página para eliminar');
      return;
    }

    if (selectedPages.size === pdfInfo.pageCount) {
      setError('No puedes eliminar todas las páginas del documento');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      const pagesToDelete = Array.from(selectedPages);
      const modifiedPDF = await PDFProcessor.deletePages(file, pagesToDelete);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generar nombre de archivo
      const filename = PDFProcessor.generateUniqueFilename('documento_sin_paginas');
      
      // Descargar archivo
      PDFProcessor.downloadBlob(modifiedPDF, filename);
      
      const remainingPages = pdfInfo.pageCount - selectedPages.size;
      setSuccess(
        `Se eliminaron ${selectedPages.size} página(s) exitosamente. ` +
        `El documento final tiene ${remainingPages} página(s). ` +
        `Archivo descargado: ${filename}`
      );
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setFile(null);
        setPdfInfo(null);
        setSelectedPages(new Set());
        setPageInput('');
        setProgress(0);
        setSuccess(null);
      }, 5000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al eliminar páginas');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrashIcon className="h-6 w-6 text-blue-600" />
            Borrar Páginas de PDF Online Gratis
          </CardTitle>
          <CardDescription>
            Elimina páginas no deseadas de tus archivos PDF. Selecciona las páginas que 
            quieres borrar y guarda el documento final.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona el archivo PDF</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes={['application/pdf']}
              maxFiles={1}
              maxSize={100 * 1024 * 1024} // 100MB
            />
          </div>

          {/* Información del PDF */}
          {pdfInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Información del PDF
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <span className="font-medium">Páginas totales:</span> {pdfInfo.pageCount}
                </div>
                <div>
                  <span className="font-medium">Páginas seleccionadas:</span> {selectedPages.size}
                </div>
                <div>
                  <span className="font-medium">Páginas restantes:</span> {pdfInfo.pageCount - selectedPages.size}
                </div>
              </div>
            </div>
          )}

          {/* Selección de páginas */}
          {pdfInfo && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Páginas a eliminar</h3>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllPages}
                    disabled={selectedPages.size === pdfInfo.pageCount}
                  >
                    Seleccionar todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedPages.size === 0}
                  >
                    Limpiar selección
                  </Button>
                </div>
              </div>

              {/* Input de páginas */}
              <div className="space-y-2">
                <Label htmlFor="page-input">
                  Páginas específicas (ej: 1,3,5-8,10)
                </Label>
                <Input
                  id="page-input"
                  value={pageInput}
                  onChange={(e) => handlePageInputChange(e.target.value)}
                  placeholder="1,3,5-8,10"
                />
                <p className="text-xs text-gray-500">
                  Usa comas para separar páginas y guiones para rangos. 
                  Páginas disponibles: 1-{pdfInfo.pageCount}
                </p>
              </div>

              {/* Grid de páginas */}
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {Array.from({ length: pdfInfo.pageCount }, (_, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPages.has(index)
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-slate-600 hover:border-red-300'
                      }`}
                      onClick={() => togglePage(index)}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                        <div className="text-xs font-medium text-center">
                          {index + 1}
                        </div>
                        {selectedPages.has(index) && (
                          <TrashIcon className="h-3 w-3 text-red-500 mt-1" />
                        )}
                      </div>
                      <Checkbox
                        checked={selectedPages.has(index)}
                        onChange={() => togglePage(index)}
                        className="absolute top-1 right-1 h-3 w-3"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {selectedPages.size > 0 && (
                <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                  <AlertDescription>
                    ⚠️ Se eliminarán {selectedPages.size} página(s). 
                    El documento final tendrá {pdfInfo.pageCount - selectedPages.size} página(s).
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Eliminando páginas...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Mensajes de error y éxito */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Botón de acción */}
          <Button
            onClick={handleDeletePages}
            disabled={!file || !pdfInfo || selectedPages.size === 0 || isProcessing}
            className="w-full"
            size="lg"
            variant={selectedPages.size > 0 ? "destructive" : "default"}
          >
            {isProcessing ? (
              'Eliminando...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Eliminar {selectedPages.size} página(s)
              </>
            )}
          </Button>

          {/* Beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Características
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Selección múltiple de páginas</li>
                <li>• Vista previa antes de borrar</li>
                <li>• Conserva el formato original</li>
                <li>• Eliminación precisa</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Seguridad
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Procesamiento local</li>
                <li>• Sin subida a servidores</li>
                <li>• Privacidad garantizada</li>
                <li>• Totalmente gratuito</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}