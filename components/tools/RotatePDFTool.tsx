'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUploadSimple';
import { PDFProcessor, RotationOptions } from '@/utils/pdfProcessing';

export default function RotatePDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [rotationMode, setRotationMode] = useState<'all' | 'specific'>('all');
  const [specificPages, setSpecificPages] = useState('');

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

  const getRotationDescription = (angle: number) => {
    switch (angle) {
      case 90:
        return 'Rotar 90° en sentido horario';
      case 180:
        return 'Rotar 180° (voltear)';
      case 270:
        return 'Rotar 270° (90° antihorario)';
      default:
        return '';
    }
  };

  const handleRotatePDF = async () => {
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
      }, 200);

      let rotationOptions: RotationOptions = {
        angle: rotationAngle
      };

      if (rotationMode === 'specific') {
        const pages = parsePageNumbers(specificPages, pdfInfo.pageCount);
        if (pages.length === 0) {
          throw new Error('No se han especificado páginas válidas');
        }
        rotationOptions.pages = pages;
      }

      const rotatedPDF = await PDFProcessor.rotatePDF(file, rotationOptions);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generar nombre de archivo
      const filename = PDFProcessor.generateUniqueFilename('documento_rotado');
      
      // Descargar archivo
      PDFProcessor.downloadBlob(rotatedPDF, filename);
      
      const pagesText = rotationMode === 'all' 
        ? 'todas las páginas' 
        : `${rotationOptions.pages?.length || 0} página(s)`;
      
      setSuccess(
        `PDF rotado exitosamente. Se rotaron ${pagesText} ${rotationAngle}°. ` +
        `Archivo descargado: ${filename}`
      );
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setFile(null);
        setPdfInfo(null);
        setProgress(0);
        setSuccess(null);
        setSpecificPages('');
      }, 5000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al rotar PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowPathIcon className="h-6 w-6 text-blue-600" />
            Rotar PDF Online Gratis
          </CardTitle>
          <CardDescription>
            Rota páginas de tu PDF en cualquier dirección. Corrige la orientación de 
            documentos escaneados de manera sencilla y rápida.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <span className="font-medium">Páginas totales:</span> {pdfInfo.pageCount}
                </div>
                <div>
                  <span className="font-medium">Tamaño:</span> {file ? PDFProcessor.formatFileSize(file.size) : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Opciones de rotación */}
          {pdfInfo && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Ángulo de rotación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[90, 180, 270].map((angle) => (
                    <div
                      key={angle}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        rotationAngle === angle
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-slate-600 hover:border-blue-300'
                      }`}
                      onClick={() => setRotationAngle(angle as 90 | 180 | 270)}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {angle}°
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getRotationDescription(angle)}
                        </div>
                        <div className="mt-2">
                          <ArrowPathIcon 
                            className={`h-8 w-8 mx-auto text-gray-400 transform`}
                            style={{ transform: `rotate(${angle}deg)` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Páginas a rotar</h3>
                
                <RadioGroup 
                  value={rotationMode} 
                  onValueChange={(value: any) => setRotationMode(value)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-pages" />
                    <Label htmlFor="all-pages">Rotar todas las páginas</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="specific-pages" />
                    <Label htmlFor="specific-pages">Rotar páginas específicas</Label>
                  </div>
                </RadioGroup>

                {rotationMode === 'specific' && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="page-numbers">
                      Páginas específicas (ej: 1,3,5-8,10)
                    </Label>
                    <Input
                      id="page-numbers"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder="1,3,5-8,10"
                    />
                    <p className="text-xs text-gray-500">
                      Usa comas para separar páginas y guiones para rangos. 
                      Páginas disponibles: 1-{pdfInfo.pageCount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rotando PDF...</span>
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
            onClick={handleRotatePDF}
            disabled={!file || !pdfInfo || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Rotando...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Rotar PDF {rotationAngle}°
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
                <li>• Rotación por páginas específicas</li>
                <li>• Múltiples ángulos de rotación</li>
                <li>• Vista previa en tiempo real</li>
                <li>• Corrección automática</li>
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