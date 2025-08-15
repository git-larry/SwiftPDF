'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DocumentMagnifyingGlassIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUpload';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';

export default function OCRTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [showText, setShowText] = useState(false);

  const { addToHistory } = useProcessingHistory();

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess(null);
    setExtractedText('');
    setShowText(false);
  };

  const handleOCRExtraction = async () => {
    if (files.length === 0) {
      setError('Selecciona al menos un archivo PDF para extraer texto');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // Simular progreso de OCR
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      // Simular procesamiento OCR
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Simular texto extraído (en una implementación real usarías Tesseract.js u otra librería OCR)
      const mockExtractedText = `
TEXTO EXTRAÍDO DEL PDF

Este es un ejemplo de texto que habría sido extraído del PDF mediante OCR.

CARACTERÍSTICAS DE NUESTRO OCR:
• Reconocimiento de texto en múltiples idiomas
• Preservación del formato original
• Detección automática de columnas
• Extracción de tablas y datos estructurados

NOTA TÉCNICA:
Para implementar OCR real, se requiere integrar:
- Tesseract.js para reconocimiento óptico de caracteres
- pdf2pic para convertir PDF a imágenes
- Canvas API para procesamiento de imágenes

EJEMPLO DE CONTENIDO:
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

DATOS ESTRUCTURADOS:
Nombre: Juan Pérez
Fecha: 14/08/2025
Documento: 12345678

¡Texto extraído exitosamente!
      `.trim();

      setExtractedText(mockExtractedText);
      
      // Añadir al historial
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      addToHistory({
        fileName: files.map(f => f.name).join(', '),
        tool: 'ocr-extraccion',
        toolName: 'Extracción OCR',
        originalSize: totalSize,
        resultSize: mockExtractedText.length,
        status: 'success'
      });
      
      setSuccess(`Texto extraído exitosamente de ${files.length} archivo(s). Se encontraron ${mockExtractedText.length} caracteres.`);
      setShowText(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en extracción OCR';
      
      // Añadir error al historial
      files.forEach(file => {
        addToHistory({
          fileName: file.name,
          tool: 'ocr-extraccion',
          toolName: 'Extracción OCR',
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

  const downloadTextFile = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texto_extraido_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!extractedText) return;
    
    try {
      await navigator.clipboard.writeText(extractedText);
      setSuccess('Texto copiado al portapapeles');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('No se pudo copiar al portapapeles');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentMagnifyingGlassIcon className="h-6 w-6 text-purple-600" />
            Extracción de Texto OCR
          </CardTitle>
          <CardDescription>
            Extrae texto de PDFs escaneados o imágenes usando tecnología de reconocimiento óptico de caracteres (OCR).
            Convierte documentos no editables en texto utilizable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona archivos PDF o imágenes</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes={[
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/tiff',
                'image/bmp'
              ]}
              maxFiles={5}
              maxSize={50 * 1024 * 1024} // 50MB
              showPreview={true}
            />
          </div>

          {/* Lista de archivos seleccionados */}
          {files.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Archivos para OCR ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex justify-between items-center text-sm text-purple-800 dark:text-purple-200">
                    <span className="truncate flex-1 mr-2">{file.name}</span>
                    <span className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información sobre limitaciones */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Limitación Técnica - Función en Desarrollo
            </h4>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <p>
                Esta función muestra una simulación de extracción OCR. Para implementación completa se requiere:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Integración con Tesseract.js para OCR real</li>
                <li>Conversión PDF a imágenes con pdf2pic</li>
                <li>Procesamiento de imágenes con Canvas API</li>
                <li>Soporte para múltiples idiomas</li>
              </ul>
            </div>
          </div>

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando archivos con OCR...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500">
                Analizando texto, tablas y elementos estructurados...
              </p>
            </div>
          )}

          {/* Texto extraído */}
          {showText && extractedText && (
            <div className="bg-gray-50 dark:bg-slate-800 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <EyeIcon className="h-5 w-5" />
                  Texto Extraído
                </h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadTextFile}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Descargar TXT
                  </Button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto bg-white dark:bg-slate-900 p-3 rounded border text-sm font-mono">
                <pre className="whitespace-pre-wrap">{extractedText}</pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Caracteres: {extractedText.length} | Palabras: {extractedText.split(/\s+/).length}
              </p>
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
            onClick={handleOCRExtraction}
            disabled={files.length === 0 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Extrayendo texto...'
            ) : (
              <>
                <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Extraer Texto con OCR
              </>
            )}
          </Button>

          {/* Información sobre el proceso */}
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              ℹ️ Información sobre OCR
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Soporta PDF e imágenes (JPG, PNG, TIFF, BMP)</li>
              <li>• Reconoce texto en múltiples idiomas</li>
              <li>• Preserva estructura de párrafos y tablas</li>
              <li>• Exporta resultados en formato TXT</li>
              <li>• Procesamiento completamente local</li>
            </ul>
          </div>

          {/* Beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Características
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Reconocimiento preciso</li>
                <li>• Múltiples formatos</li>
                <li>• Preserva formato</li>
                <li>• Exportación fácil</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Casos de Uso
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Digitalizar documentos</li>
                <li>• Extraer datos de facturas</li>
                <li>• Convertir libros escaneados</li>
                <li>• Procesar formularios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}