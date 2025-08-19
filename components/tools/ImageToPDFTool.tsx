'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PhotoIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FileUploadSimple from '@/components/FileUploadSimple';
import { PDFProcessor, ProcessingOptions } from '@/utils/pdfProcessing';

export default function ImageToPDFTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<'auto' | 'a4' | 'letter'>('auto');

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess(null);
  };

  const validateImageFiles = (files: File[]): { isValid: boolean; error?: string } => {
    if (!files || files.length === 0) {
      return { isValid: false, error: 'No se han seleccionado archivos de imagen' };
    }

    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    for (const file of files) {
      if (!supportedTypes.includes(file.type)) {
        return { 
          isValid: false, 
          error: `Formato no soportado: ${file.name}. Solo se permiten JPG y PNG` 
        };
      }
      
      // Límite de 10MB por imagen
      if (file.size > 10 * 1024 * 1024) {
        return { 
          isValid: false, 
          error: `Imagen demasiado grande: ${file.name}. Máximo 10MB por imagen` 
        };
      }
    }

    return { isValid: true };
  };

  const getPageSizeDescription = (size: string) => {
    switch (size) {
      case 'auto':
        return 'Ajustar automáticamente al tamaño de cada imagen';
      case 'a4':
        return 'Formato A4 estándar (210 × 297 mm)';
      case 'letter':
        return 'Formato Carta (216 × 279 mm)';
      default:
        return '';
    }
  };

  const handleConvertToPDF = async () => {
    const validation = validateImageFiles(files);
    if (!validation.isValid) {
      setError(validation.error || 'Error de validación');
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

      const options: ProcessingOptions = {
        preserveMetadata: true
      };

      const pdfData = await PDFProcessor.imagesToPDF(files, options);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generar nombre de archivo
      const filename = PDFProcessor.generateUniqueFilename('imagenes_a_pdf');
      
      // Descargar archivo
      PDFProcessor.downloadBlob(pdfData, filename);
      
      setSuccess(
        `${files.length} imagen(es) convertida(s) a PDF exitosamente. ` +
        `Archivo descargado: ${filename}`
      );
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setFiles([]);
        setProgress(0);
        setSuccess(null);
      }, 5000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al convertir imágenes');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhotoIcon className="h-6 w-6 text-blue-600" />
            Convertir JPG a PDF Online Gratis
          </CardTitle>
          <CardDescription>
            Transforma imágenes JPG y PNG en un PDF profesional. Agrupa múltiples fotos 
            en un solo documento fácilmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona las imágenes</h3>
            <FileUploadSimple
              onFileSelect={handleFileSelect}
              acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png']}
              maxFiles={50}
              maxSize={10 * 1024 * 1024} // 10MB por imagen
            />
          </div>

          {/* Lista de archivos con reordenamiento */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Imágenes seleccionadas ({files.length})
                </h3>
                <p className="text-sm text-gray-500">
                  Arrastra para reordenar
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded mb-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="max-w-full max-h-full object-contain rounded"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                    
                    <div className="text-xs">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {PDFProcessor.formatFileSize(file.size)}
                      </p>
                    </div>
                    
                    {/* Botones de reordenamiento */}
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => index > 0 && moveFile(index, index - 1)}
                        disabled={index === 0}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-600 rounded disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => index < files.length - 1 && moveFile(index, index + 1)}
                        disabled={index === files.length - 1}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-600 rounded disabled:opacity-50"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opciones de configuración */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuración del PDF</h3>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Tamaño de página</Label>
                <RadioGroup 
                  value={pageSize} 
                  onValueChange={(value: any) => setPageSize(value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="cursor-pointer">
                      Automático - {getPageSizeDescription('auto')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="a4" id="a4" />
                    <Label htmlFor="a4" className="cursor-pointer">
                      A4 - {getPageSizeDescription('a4')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="letter" id="letter" />
                    <Label htmlFor="letter" className="cursor-pointer">
                      Carta - {getPageSizeDescription('letter')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Convirtiendo imágenes a PDF...</span>
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
            onClick={handleConvertToPDF}
            disabled={files.length === 0 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Convirtiendo...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Convertir a PDF ({files.length} imagen{files.length !== 1 ? 'es' : ''})
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
                <li>• Soporta múltiples formatos de imagen</li>
                <li>• Ajuste automático de tamaño</li>
                <li>• Calidad de imagen preservada</li>
                <li>• Conversión por lotes</li>
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