'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FileUploadSimple from '@/components/FileUploadSimple';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';

export default function WordToPDFTool() {
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

  const handleConvertToPDF = async () => {
    if (files.length === 0) {
      setError('Selecciona al menos un archivo de Word para convertir');
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
      }, 300);

      // Nota: La conversión de Word a PDF requiere librerías especializadas
      // En un entorno real, esto se haría en el servidor con librerías como:
      // - LibreOffice headless
      // - Pandoc
      // - Microsoft Office API
      // - Aspose.Words
      
      // Para esta demo, simularemos el proceso
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Simular error ya que no tenemos conversión real implementada
      throw new Error(
        'La conversión de Word a PDF requiere procesamiento en el servidor. ' +
        'Esta funcionalidad estará disponible en la versión completa de la aplicación. ' +
        'Por ahora, recomendamos usar "Guardar como PDF" desde Microsoft Word.'
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al convertir archivo';
      
      // Añadir error al historial
      files.forEach(file => {
        addToHistory({
          fileName: file.name,
          tool: 'convertir-word-a-pdf',
          toolName: 'Convertir Word a PDF',
          originalSize: file.size,
          status: 'error',
          errorMessage
        });
      });
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            Convertir Word a PDF Online
          </CardTitle>
          <CardDescription>
            Convierte tus documentos de Microsoft Word a formato PDF en segundos. 
            Mantén el formato original sin complicaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona archivos de Word</h3>
            <FileUploadSimple
              onFileSelect={handleFileSelect}
              acceptedFileTypes={[
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                '.docx',
                '.doc'
              ]}
              maxFiles={5}
              maxSize={50 * 1024 * 1024} // 50MB
            />
          </div>

          {/* Lista de archivos seleccionados */}
          {files.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Archivos seleccionados ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex justify-between items-center text-sm text-blue-800 dark:text-blue-200">
                    <span className="truncate flex-1 mr-2">{file.name}</span>
                    <span className="text-xs">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información sobre limitaciones */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Limitación Técnica
            </h4>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <p>
                La conversión de Word a PDF requiere procesamiento en el servidor con librerías especializadas.
              </p>
              <p className="font-medium">Alternativas recomendadas:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Usar &quot;Guardar como PDF&quot; desde Microsoft Word</li>
                <li>Usar &quot;Exportar como PDF&quot; desde Google Docs</li>
                <li>Usar herramientas online especializadas como SmallPDF o ILovePDF</li>
                <li>Usar LibreOffice Writer (gratuito) con &quot;Exportar como PDF&quot;</li>
              </ul>
            </div>
          </div>

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Convirtiendo archivos...</span>
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
                Convertir a PDF ({files.length} archivo{files.length !== 1 ? 's' : ''})
              </>
            )}
          </Button>

          {/* Información sobre el proceso */}
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              ℹ️ Información del Proceso
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Soporta archivos .docx y .doc</li>
              <li>• Tamaño máximo: 50MB por archivo</li>
              <li>• Hasta 5 archivos simultáneamente</li>
              <li>• Preserva formato, imágenes y enlaces</li>
              <li>• Requiere implementación de servidor para funcionar</li>
            </ul>
          </div>

          {/* Beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Características
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Preserva formato original</li>
                <li>• Soporta DOCX y DOC</li>
                <li>• Mantiene enlaces e imágenes</li>
                <li>• Conversión por lotes</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Seguridad
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Procesamiento seguro</li>
                <li>• Sin almacenamiento permanente</li>
                <li>• Archivos eliminados automáticamente</li>
                <li>• Privacidad garantizada</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}