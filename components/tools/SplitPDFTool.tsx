'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScissorsIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FileUploadSimple from '@/components/FileUploadSimple';
import { PDFProcessor, SplitOptions } from '@/utils/pdfProcessing';

export default function SplitPDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  
  // Opciones de división
  const [splitMode, setSplitMode] = useState<'all' | 'pages' | 'ranges'>('all');
  const [specificPages, setSpecificPages] = useState('');
  const [pageRanges, setPageRanges] = useState('');

  const handleFileSelect = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setPdfInfo(null);

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

  const parsePageRanges = (input: string, maxPages: number): { start: number; end: number }[] => {
    const ranges: { start: number; end: number }[] = [];
    const parts = input.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
          ranges.push({ start: start - 1, end: end - 1 }); // Convertir a índice base 0
        }
      }
    }
    
    return ranges;
  };

  const handleSplitPDF = async () => {
    if (!file || !pdfInfo) {
      setError('Selecciona un archivo PDF válido');
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
          return prev + 10;
        });
      }, 200);

      let splitOptions: SplitOptions;

      switch (splitMode) {
        case 'pages':
          const pages = parsePageNumbers(specificPages, pdfInfo.pageCount);
          if (pages.length === 0) {
            throw new Error('No se han especificado páginas válidas');
          }
          splitOptions = { mode: 'pages', pages };
          break;
        
        case 'ranges':
          const ranges = parsePageRanges(pageRanges, pdfInfo.pageCount);
          if (ranges.length === 0) {
            throw new Error('No se han especificado rangos válidos');
          }
          splitOptions = { mode: 'ranges', ranges };
          break;
        
        default:
          splitOptions = { mode: 'pages', pages: Array.from({ length: pdfInfo.pageCount }, (_, i) => i) };
      }

      const splitPDFs = await PDFProcessor.splitPDF(file, splitOptions);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Descargar archivos divididos
      splitPDFs.forEach((pdfData, index) => {
        const filename = PDFProcessor.generateUniqueFilename(`pagina_${index + 1}`);
        PDFProcessor.downloadBlob(pdfData, filename);
      });
      
      setSuccess(`PDF dividido exitosamente en ${splitPDFs.length} archivos`);
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setFile(null);
        setPdfInfo(null);
        setProgress(0);
        setSuccess(null);
        setSpecificPages('');
        setPageRanges('');
      }, 5000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al dividir PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScissorsIcon className="h-6 w-6 text-blue-600" />
            Dividir PDF Online Gratis
          </CardTitle>
          <CardDescription>
            Divide un PDF grande en varios archivos más pequeños. Extrae páginas específicas 
            o separa cada página en un documento individual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona el archivo PDF</h3>
            <FileUploadSimple
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
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Páginas totales: {pdfInfo.pageCount}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Tamaño: {file ? PDFProcessor.formatFileSize(file.size) : 'N/A'}
              </p>
            </div>
          )}

          {/* Opciones de división */}
          {pdfInfo && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Opciones de división</h3>
              
              <RadioGroup value={splitMode} onValueChange={(value: any) => setSplitMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">Dividir cada página en un archivo separado</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pages" id="pages" />
                  <Label htmlFor="pages">Extraer páginas específicas</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ranges" id="ranges" />
                  <Label htmlFor="ranges">Dividir por rangos de páginas</Label>
                </div>
              </RadioGroup>

              {/* Páginas específicas */}
              {splitMode === 'pages' && (
                <div className="space-y-2">
                  <Label htmlFor="specific-pages">
                    Páginas específicas (ej: 1,3,5-8,10)
                  </Label>
                  <Input
                    id="specific-pages"
                    value={specificPages}
                    onChange={(e) => setSpecificPages(e.target.value)}
                    placeholder="1,3,5-8,10"
                  />
                  <p className="text-xs text-gray-500">
                    Usa comas para separar páginas y guiones para rangos
                  </p>
                </div>
              )}

              {/* Rangos de páginas */}
              {splitMode === 'ranges' && (
                <div className="space-y-2">
                  <Label htmlFor="page-ranges">
                    Rangos de páginas (ej: 1-5,6-10,11-15)
                  </Label>
                  <Input
                    id="page-ranges"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    placeholder="1-5,6-10,11-15"
                  />
                  <p className="text-xs text-gray-500">
                    Cada rango se guardará como un archivo separado
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dividiendo PDF...</span>
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
            onClick={handleSplitPDF}
            disabled={!file || !pdfInfo || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Procesando...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Dividir PDF
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
                <li>• Extrae páginas específicas</li>
                <li>• Divide por rangos de páginas</li>
                <li>• Preserva el formato original</li>
                <li>• Descarga inmediata</li>
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