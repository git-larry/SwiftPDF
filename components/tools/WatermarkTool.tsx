'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { PaintBrushIcon, ArrowDownTrayIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUpload';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';

interface WatermarkConfig {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
  fontFamily: 'Arial' | 'Times' | 'Courier' | 'Helvetica';
  style: 'normal' | 'bold' | 'italic';
}

export default function WatermarkTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processedFiles, setProcessedFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [imageWatermark, setImageWatermark] = useState<File | null>(null);

  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    text: 'CONFIDENCIAL',
    fontSize: 36,
    opacity: 0.3,
    rotation: -45,
    position: 'center',
    color: '#ff0000',
    fontFamily: 'Arial',
    style: 'bold'
  });

  const { addToHistory } = useProcessingHistory();

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess(null);
    setProcessedFiles([]);
  };

  const handleImageWatermarkSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setImageWatermark(selectedFiles[0]);
    }
  };

  const updateWatermarkConfig = (key: keyof WatermarkConfig, value: any) => {
    setWatermarkConfig(prev => ({ ...prev, [key]: value }));
  };

  const addWatermarks = async () => {
    if (files.length === 0) {
      setError('Selecciona al menos un archivo PDF para añadir marcas de agua');
      return;
    }

    if (watermarkType === 'text' && !watermarkConfig.text.trim()) {
      setError('Ingresa el texto para la marca de agua');
      return;
    }

    if (watermarkType === 'image' && !imageWatermark) {
      setError('Selecciona una imagen para usar como marca de agua');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    setProcessedFiles([]);

    try {
      const processed: { name: string; url: string; size: number }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simular progreso
        setProgress((i / files.length) * 80);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simular procesamiento (en una implementación real usarías pdf-lib)
        const mockProcessedContent = await simulateWatermarkAddition(file, watermarkConfig, watermarkType, imageWatermark);
        
        const blob = new Blob([mockProcessedContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const processedFileName = file.name.replace('.pdf', '_con_marca_de_agua.pdf');
        
        processed.push({
          name: processedFileName,
          url,
          size: blob.size
        });

        // Añadir al historial
        addToHistory({
          fileName: file.name,
          tool: 'marca-agua',
          toolName: 'Marca de Agua',
          originalSize: file.size,
          resultSize: blob.size,
          status: 'success'
        });
      }

      setProgress(100);
      setProcessedFiles(processed);
      setSuccess(`Se añadieron marcas de agua a ${files.length} archivo(s) exitosamente`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al añadir marcas de agua';
      
      files.forEach(file => {
        addToHistory({
          fileName: file.name,
          tool: 'marca-agua',
          toolName: 'Marca de Agua',
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

  const simulateWatermarkAddition = async (
    file: File,
    config: WatermarkConfig,
    type: 'text' | 'image',
    imageFile: File | null
  ): Promise<ArrayBuffer> => {
    // Simulación del procesamiento real de PDF con marca de agua
    const arrayBuffer = await file.arrayBuffer();
    return arrayBuffer; // En una implementación real, procesarías con pdf-lib
  };

  const downloadFile = (fileData: { name: string; url: string }) => {
    const a = document.createElement('a');
    a.href = fileData.url;
    a.download = fileData.name;
    a.click();
  };

  const downloadAll = () => {
    processedFiles.forEach(file => {
      setTimeout(() => downloadFile(file), 100);
    });
  };

  const previewWatermark = () => {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden min-h-48">
        <div className="absolute inset-0 bg-white dark:bg-slate-900 opacity-80 rounded-lg"></div>
        <div className="relative z-10">
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Vista Previa del Documento</p>
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded p-4 mx-auto max-w-xs">
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        
        {/* Marca de agua simulada */}
        {watermarkType === 'text' && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `rotate(${watermarkConfig.rotation}deg)`,
              opacity: watermarkConfig.opacity
            }}
          >
            <span 
              style={{
                fontSize: `${Math.max(watermarkConfig.fontSize / 2, 16)}px`,
                color: watermarkConfig.color,
                fontFamily: watermarkConfig.fontFamily,
                fontWeight: watermarkConfig.style === 'bold' ? 'bold' : 'normal',
                fontStyle: watermarkConfig.style === 'italic' ? 'italic' : 'normal'
              }}
              className="select-none"
            >
              {watermarkConfig.text}
            </span>
          </div>
        )}
        
        {watermarkType === 'image' && imageWatermark && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: watermarkConfig.opacity }}
          >
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaintBrushIcon className="h-6 w-6 text-blue-600" />
            Añadir Marcas de Agua
          </CardTitle>
          <CardDescription>
            Añade marcas de agua de texto o imagen a tus PDFs para proteger tu contenido y establecer propiedad.
            Personaliza posición, transparencia, rotación y estilo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de configuración */}
            <div className="space-y-6">
              {/* Tipo de marca de agua */}
              <div>
                <Label className="text-base font-semibold">Tipo de Marca de Agua</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={watermarkType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWatermarkType('text')}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Texto
                  </Button>
                  <Button
                    variant={watermarkType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWatermarkType('image')}
                  >
                    <PhotoIcon className="h-4 w-4 mr-1" />
                    Imagen
                  </Button>
                </div>
              </div>

              {/* Configuración de texto */}
              {watermarkType === 'text' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="watermark-text">Texto de la Marca de Agua</Label>
                    <Input
                      id="watermark-text"
                      value={watermarkConfig.text}
                      onChange={(e) => updateWatermarkConfig('text', e.target.value)}
                      placeholder="Ingresa el texto..."
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fuente</Label>
                      <Select
                        value={watermarkConfig.fontFamily}
                        onValueChange={(value) => updateWatermarkConfig('fontFamily', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times">Times New Roman</SelectItem>
                          <SelectItem value="Courier">Courier</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Estilo</Label>
                      <Select
                        value={watermarkConfig.style}
                        onValueChange={(value) => updateWatermarkConfig('style', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Negrita</SelectItem>
                          <SelectItem value="italic">Cursiva</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="color-picker">Color del Texto</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="color-picker"
                        type="color"
                        value={watermarkConfig.color}
                        onChange={(e) => updateWatermarkConfig('color', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={watermarkConfig.color}
                        onChange={(e) => updateWatermarkConfig('color', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tamaño de Fuente: {watermarkConfig.fontSize}px</Label>
                    <Slider
                      value={[watermarkConfig.fontSize]}
                      onValueChange={(value) => updateWatermarkConfig('fontSize', value[0])}
                      max={72}
                      min={12}
                      step={2}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {/* Configuración de imagen */}
              {watermarkType === 'image' && (
                <div>
                  <Label className="text-base font-semibold">Imagen para Marca de Agua</Label>
                  <div className="mt-2">
                    <FileUpload
                      onFileSelect={handleImageWatermarkSelect}
                      acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                      maxFiles={1}
                      maxSize={5 * 1024 * 1024} // 5MB
                      showPreview={true}
                    />
                  </div>
                  {imageWatermark && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✓ Imagen seleccionada: {imageWatermark.name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Configuración común */}
              <div className="space-y-4">
                <div>
                  <Label>Posición</Label>
                  <Select
                    value={watermarkConfig.position}
                    onValueChange={(value) => updateWatermarkConfig('position', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="top-left">Superior Izquierda</SelectItem>
                      <SelectItem value="top-right">Superior Derecha</SelectItem>
                      <SelectItem value="bottom-left">Inferior Izquierda</SelectItem>
                      <SelectItem value="bottom-right">Inferior Derecha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Transparencia: {Math.round(watermarkConfig.opacity * 100)}%</Label>
                  <Slider
                    value={[watermarkConfig.opacity]}
                    onValueChange={(value) => updateWatermarkConfig('opacity', value[0])}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Rotación: {watermarkConfig.rotation}°</Label>
                  <Slider
                    value={[watermarkConfig.rotation]}
                    onValueChange={(value) => updateWatermarkConfig('rotation', value[0])}
                    max={360}
                    min={-360}
                    step={15}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Vista Previa</h3>
                {previewWatermark()}
              </div>
            </div>
          </div>

          {/* Subida de PDFs */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona archivos PDF</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes={['application/pdf']}
              maxFiles={10}
              maxSize={50 * 1024 * 1024} // 50MB
              showPreview={true}
            />
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Archivos para procesar ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex justify-between items-center text-sm text-blue-800 dark:text-blue-200">
                    <span className="truncate flex-1 mr-2">{file.name}</span>
                    <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Añadiendo marcas de agua...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Archivos procesados */}
          {processedFiles.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Archivos con marcas de agua ({processedFiles.length})
                </h4>
                <Button variant="outline" size="sm" onClick={downloadAll}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Descargar Todos
                </Button>
              </div>
              <div className="space-y-2">
                {processedFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="truncate flex-1 mr-2 text-green-800 dark:text-green-200">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file)}
                      >
                        Descargar
                      </Button>
                    </div>
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
                Esta función muestra una simulación de marcas de agua. Para implementación completa se requiere:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Integración completa con pdf-lib para manipulación real de PDFs</li>
                <li>Procesamiento de imágenes para marcas de agua tipo imagen</li>
                <li>Renderizado de texto con fuentes personalizadas</li>
                <li>Posicionamiento preciso en páginas PDF</li>
              </ul>
            </div>
          </div>

          {/* Mensajes */}
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

          {/* Botón principal */}
          <Button
            onClick={addWatermarks}
            disabled={files.length === 0 || isProcessing || (watermarkType === 'text' && !watermarkConfig.text.trim()) || (watermarkType === 'image' && !imageWatermark)}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Procesando...'
            ) : (
              <>
                <PaintBrushIcon className="h-5 w-5 mr-2" />
                Añadir Marcas de Agua
              </>
            )}
          </Button>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Características
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Marcas de agua de texto e imagen</li>
                <li>• Control total de transparencia</li>
                <li>• Múltiples posiciones disponibles</li>
                <li>• Rotación personalizable</li>
                <li>• Vista previa en tiempo real</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Casos de Uso
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Proteger documentos confidenciales</li>
                <li>• Establecer propiedad de contenido</li>
                <li>• Añadir logos de empresa</li>
                <li>• Marcar versiones de borrador</li>
                <li>• Identificar documentos internos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}