'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArchiveBoxArrowDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUploadSimple';
import { PDFProcessor, ProcessingOptions } from '@/utils/pdfProcessing';

export default function CompressPDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number; fileSize: number } | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const handleFileSelect = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setPdfInfo(null);

    if (selectedFile) {
      try {
        const info = await PDFProcessor.getPDFInfo(selectedFile);
        setPdfInfo({ pageCount: info.pageCount, fileSize: selectedFile.size });
      } catch (error) {
        setError('Error al leer información del PDF');
      }
    }
  };

  const getCompressionDescription = (level: string) => {
    switch (level) {
      case 'low':
        return 'Compresión ligera - Mantiene alta calidad, reducción moderada del tamaño';
      case 'medium':
        return 'Compresión equilibrada - Balance entre calidad y tamaño (recomendado)';
      case 'high':
        return 'Compresión máxima - Mayor reducción de tamaño, puede afectar la calidad';
      default:
        return '';
    }
  };

  const getExpectedReduction = (level: string) => {
    switch (level) {
      case 'low':
        return '10-30%';
      case 'medium':
        return '30-50%';
      case 'high':
        return '50-70%';
      default:
        return '';
    }
  };

  const handleCompressPDF = async () => {
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
          return prev + 15;
        });
      }, 300);

      const options: ProcessingOptions = {
        compression: compressionLevel,
        preserveMetadata: true
      };

      const compressedPDF = await PDFProcessor.compressPDF(file, options);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Calcular reducción de tamaño
      const originalSize = file.size;
      const compressedSize = compressedPDF.length;
      const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      // Generar nombre de archivo
      const filename = PDFProcessor.generateUniqueFilename('documento_comprimido');
      
      // Descargar archivo
      PDFProcessor.downloadBlob(compressedPDF, filename);
      
      // Mostrar mensaje apropiado según la reducción obtenida
      if (parseFloat(reduction) < 5) {
        setSuccess(
          `PDF procesado. Reducción mínima del ${reduction}% obtenida. ` +
          `Este PDF ya está optimizado o contiene elementos (como imágenes) que no se pueden comprimir significativamente. ` +
          `Tamaño: ${PDFProcessor.formatFileSize(originalSize)} → ${PDFProcessor.formatFileSize(compressedSize)}`
        );
      } else {
        setSuccess(
          `PDF comprimido exitosamente. Reducción del tamaño: ${reduction}%. ` +
          `Tamaño original: ${PDFProcessor.formatFileSize(originalSize)}, ` +
          `Tamaño comprimido: ${PDFProcessor.formatFileSize(compressedSize)}`
        );
      }
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setFile(null);
        setPdfInfo(null);
        setProgress(0);
        setSuccess(null);
      }, 5000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al comprimir PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArchiveBoxArrowDownIcon className="h-6 w-6 text-blue-600" />
            Comprimir PDF Online Gratis
          </CardTitle>
          <CardDescription>
            Reduce el tamaño de tus archivos PDF sin perder calidad. Optimiza documentos 
            para subirlos a la web o enviarlos por email.
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
                  <span className="font-medium">Páginas:</span> {pdfInfo.pageCount}
                </div>
                <div>
                  <span className="font-medium">Tamaño actual:</span> {PDFProcessor.formatFileSize(pdfInfo.fileSize)}
                </div>
                <div>
                  <span className="font-medium">Reducción esperada:</span> {getExpectedReduction(compressionLevel)}
                </div>
              </div>
            </div>
          )}

          {/* Opciones de compresión */}
          {pdfInfo && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nivel de compresión</h3>
              
              <RadioGroup 
                value={compressionLevel} 
                onValueChange={(value: any) => setCompressionLevel(value)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                  <RadioGroupItem value="low" id="low" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="low" className="font-medium cursor-pointer">
                      Compresión Ligera
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getCompressionDescription('low')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Reducción esperada: {getExpectedReduction('low')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <RadioGroupItem value="medium" id="medium" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="medium" className="font-medium cursor-pointer">
                      Compresión Equilibrada (Recomendado)
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getCompressionDescription('medium')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Reducción esperada: {getExpectedReduction('medium')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                  <RadioGroupItem value="high" id="high" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="high" className="font-medium cursor-pointer">
                      Compresión Máxima
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getCompressionDescription('high')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Reducción esperada: {getExpectedReduction('high')}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Comprimiendo PDF...</span>
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
            onClick={handleCompressPDF}
            disabled={!file || !pdfInfo || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Comprimiendo...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Comprimir PDF
              </>
            )}
          </Button>

          {/* Beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Beneficios
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Reducción de hasta 70% del tamaño</li>
                <li>• Mantiene la calidad visual</li>
                <li>• Optimización inteligente</li>
                <li>• Múltiples niveles de compresión</li>
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