'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DocumentDuplicateIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUploadSimple';
import { PDFProcessor, ProcessingOptions } from '@/utils/pdfProcessing';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';

export default function MergePDFTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addToHistory } = useProcessingHistory();

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess(null);
  };

  const handleMergePDFs = async () => {
    if (files.length < 2) {
      setError('Selecciona al menos 2 archivos PDF para unir');
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
        compression: 'medium',
        preserveMetadata: true
      };

      const mergedPDF = await PDFProcessor.mergePDFs(files, options);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generar nombre de archivo
      const filename = PDFProcessor.generateUniqueFilename('documento_unido');
      
      // Descargar archivo
      PDFProcessor.downloadBlob(mergedPDF, filename);
      
      // Calcular tamaño total de archivos originales
      const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      // Añadir al historial
      addToHistory({
        fileName: filename,
        tool: 'unir-pdf',
        toolName: 'Unir PDF',
        originalSize: totalOriginalSize,
        resultSize: mergedPDF.length,
        status: 'success'
      });
      
      setSuccess(`PDF unido exitosamente. Archivo descargado: ${filename}`);
      
      // Limpiar archivos después de un tiempo
      setTimeout(() => {
        setFiles([]);
        setProgress(0);
        setSuccess(null);
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al unir PDFs';
      
      // Añadir error al historial si hay archivos seleccionados
      if (files.length > 0) {
        const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
        addToHistory({
          fileName: files.map(f => f.name).join(', '),
          tool: 'unir-pdf',
          toolName: 'Unir PDF',
          originalSize: totalOriginalSize,
          status: 'error',
          errorMessage
        });
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" />
            Unir PDF Online Gratis
          </CardTitle>
          <CardDescription>
            Combina varios archivos PDF en un solo documento de forma rápida y segura.
            Nuestra herramienta online es totalmente gratuita y fácil de usar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona los archivos PDF</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes={['application/pdf']}
              maxFiles={20}
              maxSize={100 * 1024 * 1024} // 100MB
              showPreview={true}
            />
          </div>

          {/* Información de archivos */}
          {files.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Archivos seleccionados: {files.length}
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{file.name}</span>
                    <span>{PDFProcessor.formatFileSize(file.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando archivos...</span>
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
            onClick={handleMergePDFs}
            disabled={files.length < 2 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Procesando...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Unir PDFs ({files.length} archivos)
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
                <li>• Combina múltiples PDFs en segundos</li>
                <li>• Mantiene la calidad original</li>
                <li>• Procesamiento del lado del cliente</li>
                <li>• Totalmente gratuito</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Seguridad
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Procesamiento local en tu navegador</li>
                <li>• No se suben archivos a servidores</li>
                <li>• Privacidad garantizada</li>
                <li>• Sin límites de uso</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}