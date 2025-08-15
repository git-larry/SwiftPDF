'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InformationCircleIcon, ArrowDownTrayIcon, DocumentIcon, ClockIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUploadSimple';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';

interface PDFMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  subject?: string;
  keywords?: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount?: number;
  fileSize?: number;
  version?: string;
  encrypted?: boolean;
  linearized?: boolean;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  };
  security?: {
    userPassword?: boolean;
    ownerPassword?: boolean;
    encryptionLevel?: string;
  };
}

interface FileMetadataResult {
  fileName: string;
  metadata: PDFMetadata;
  error?: string;
}

export default function MetadataTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [metadataResults, setMetadataResults] = useState<FileMetadataResult[]>([]);

  const { addToHistory } = useProcessingHistory();

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess(null);
    setMetadataResults([]);
  };

  const extractMetadata = async () => {
    if (files.length === 0) {
      setError('Selecciona al menos un archivo PDF para extraer metadatos');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    setMetadataResults([]);

    try {
      const results: FileMetadataResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simular progreso
        setProgress((i / files.length) * 90);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simular extracción de metadatos (en una implementación real usarías pdf-lib o pdf-parse)
        const metadata = await simulateMetadataExtraction(file);
        
        results.push({
          fileName: file.name,
          metadata
        });

        // Añadir al historial
        addToHistory({
          fileName: file.name,
          tool: 'metadatos',
          toolName: 'Extracción de Metadatos',
          originalSize: file.size,
          status: 'success'
        });
      }

      setProgress(100);
      setMetadataResults(results);
      setSuccess(`Metadatos extraídos exitosamente de ${files.length} archivo(s)`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al extraer metadatos';
      
      files.forEach(file => {
        addToHistory({
          fileName: file.name,
          tool: 'metadatos',
          toolName: 'Extracción de Metadatos',
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

  const simulateMetadataExtraction = async (file: File): Promise<PDFMetadata> => {
    // Simulación de extracción de metadatos reales
    const mockMetadata: PDFMetadata = {
      title: file.name.includes('informe') ? 'Informe Anual 2024' : 
             file.name.includes('contrato') ? 'Contrato de Servicios' :
             file.name.includes('manual') ? 'Manual de Usuario v2.1' :
             'Documento sin título',
      author: 'Usuario Ejemplo',
      creator: 'Microsoft Word 365',
      producer: 'Adobe Acrobat 23.008.20470',
      subject: 'Documento generado automáticamente',
      keywords: 'PDF, documento, ejemplo, metadatos',
      creationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      modificationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      pageCount: Math.floor(Math.random() * 50) + 1,
      fileSize: file.size,
      version: `1.${Math.floor(Math.random() * 7) + 1}`,
      encrypted: Math.random() > 0.7,
      linearized: Math.random() > 0.5,
      permissions: {
        printing: Math.random() > 0.3,
        modifying: Math.random() > 0.4,
        copying: Math.random() > 0.2,
        annotating: Math.random() > 0.3
      },
      security: {
        userPassword: Math.random() > 0.8,
        ownerPassword: Math.random() > 0.9,
        encryptionLevel: Math.random() > 0.5 ? '128-bit AES' : '40-bit RC4'
      }
    };

    return mockMetadata;
  };

  const exportMetadataAsJSON = () => {
    if (metadataResults.length === 0) return;

    const exportData = {
      extractionDate: new Date().toISOString(),
      totalFiles: metadataResults.length,
      files: metadataResults
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadatos_pdf_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMetadataAsCSV = () => {
    if (metadataResults.length === 0) return;

    const headers = [
      'Archivo',
      'Título',
      'Autor',
      'Creador',
      'Productor',
      'Páginas',
      'Tamaño (MB)',
      'Versión PDF',
      'Encriptado',
      'Fecha de Creación',
      'Fecha de Modificación'
    ];

    const csvData = metadataResults.map(result => [
      result.fileName,
      result.metadata.title || '',
      result.metadata.author || '',
      result.metadata.creator || '',
      result.metadata.producer || '',
      result.metadata.pageCount || '',
      result.metadata.fileSize ? (result.metadata.fileSize / 1024 / 1024).toFixed(2) : '',
      result.metadata.version || '',
      result.metadata.encrypted ? 'Sí' : 'No',
      result.metadata.creationDate ? new Date(result.metadata.creationDate).toLocaleDateString() : '',
      result.metadata.modificationDate ? new Date(result.metadata.modificationDate).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadatos_pdf_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no válida';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
            Extracción de Metadatos PDF
          </CardTitle>
          <CardDescription>
            Extrae información detallada de metadatos de archivos PDF incluyendo propiedades del documento, 
            información de seguridad, fechas de creación y más datos técnicos útiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona archivos PDF</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes={['application/pdf']}
              maxFiles={20}
              maxSize={100 * 1024 * 1024} // 100MB
              showPreview={true}
            />
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                Archivos para analizar ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex justify-between items-center text-sm text-indigo-800 dark:text-indigo-200">
                    <span className="truncate flex-1 mr-2">{file.name}</span>
                    <Badge variant="secondary">{formatBytes(file.size)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extrayendo metadatos...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500">
                Analizando propiedades del documento y configuración de seguridad...
              </p>
            </div>
          )}

          {/* Información sobre limitaciones */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Limitación Técnica - Función en Desarrollo
            </h4>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <p>
                Esta función muestra metadatos simulados. Para implementación completa se requiere:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Integración con pdf-lib para lectura real de metadatos</li>
                <li>Análisis de estructura interna del PDF</li>
                <li>Extracción de información de seguridad y permisos</li>
                <li>Detección de firmas digitales y certificados</li>
              </ul>
            </div>
          </div>

          {/* Resultados de metadatos */}
          {metadataResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Resultados de Metadatos</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportMetadataAsCSV}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Exportar CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportMetadataAsJSON}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Exportar JSON
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {metadataResults.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DocumentIcon className="h-5 w-5 text-indigo-600" />
                        {result.fileName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Información básica */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <DocumentIcon className="h-4 w-4" />
                            Información del Documento
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div><strong>Título:</strong> {result.metadata.title || 'Sin título'}</div>
                            <div><strong>Autor:</strong> {result.metadata.author || 'No especificado'}</div>
                            <div><strong>Asunto:</strong> {result.metadata.subject || 'Sin asunto'}</div>
                            <div><strong>Palabras clave:</strong> {result.metadata.keywords || 'Sin palabras clave'}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <CogIcon className="h-4 w-4" />
                            Información Técnica
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div><strong>Creador:</strong> {result.metadata.creator || 'Desconocido'}</div>
                            <div><strong>Productor:</strong> {result.metadata.producer || 'Desconocido'}</div>
                            <div><strong>Versión PDF:</strong> {result.metadata.version || 'No disponible'}</div>
                            <div><strong>Páginas:</strong> {result.metadata.pageCount || 'No disponible'}</div>
                            <div><strong>Tamaño:</strong> {result.metadata.fileSize ? formatBytes(result.metadata.fileSize) : 'No disponible'}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            Fechas y Estado
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div><strong>Creado:</strong> {result.metadata.creationDate ? formatDate(result.metadata.creationDate) : 'No disponible'}</div>
                            <div><strong>Modificado:</strong> {result.metadata.modificationDate ? formatDate(result.metadata.modificationDate) : 'No disponible'}</div>
                            <div className="flex items-center gap-2">
                              <strong>Encriptado:</strong> 
                              <Badge variant={result.metadata.encrypted ? "destructive" : "secondary"}>
                                {result.metadata.encrypted ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <strong>Linealizado:</strong> 
                              <Badge variant={result.metadata.linearized ? "default" : "secondary"}>
                                {result.metadata.linearized ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Permisos y seguridad */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded">
                          <h6 className="font-medium text-gray-900 dark:text-white mb-2">🔒 Permisos del Documento</h6>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Badge variant={result.metadata.permissions?.printing ? "default" : "secondary"} className="text-xs">
                                {result.metadata.permissions?.printing ? '✓' : '✗'}
                              </Badge>
                              Imprimir
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={result.metadata.permissions?.modifying ? "default" : "secondary"} className="text-xs">
                                {result.metadata.permissions?.modifying ? '✓' : '✗'}
                              </Badge>
                              Modificar
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={result.metadata.permissions?.copying ? "default" : "secondary"} className="text-xs">
                                {result.metadata.permissions?.copying ? '✓' : '✗'}
                              </Badge>
                              Copiar
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={result.metadata.permissions?.annotating ? "default" : "secondary"} className="text-xs">
                                {result.metadata.permissions?.annotating ? '✓' : '✗'}
                              </Badge>
                              Anotar
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded">
                          <h6 className="font-medium text-gray-900 dark:text-white mb-2">🛡️ Configuración de Seguridad</h6>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span>Contraseña de Usuario:</span>
                              <Badge variant={result.metadata.security?.userPassword ? "destructive" : "secondary"} className="text-xs">
                                {result.metadata.security?.userPassword ? 'Configurada' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Contraseña de Propietario:</span>
                              <Badge variant={result.metadata.security?.ownerPassword ? "destructive" : "secondary"} className="text-xs">
                                {result.metadata.security?.ownerPassword ? 'Configurada' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Nivel de Encriptación:</span>
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.security?.encryptionLevel || 'Ninguno'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
            onClick={extractMetadata}
            disabled={files.length === 0 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Extrayendo metadatos...'
            ) : (
              <>
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Extraer Metadatos
              </>
            )}
          </Button>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ℹ️ Información Extraída
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Propiedades del documento (título, autor, etc.)</li>
                <li>• Información técnica (creador, productor, versión)</li>
                <li>• Fechas de creación y modificación</li>
                <li>• Configuración de seguridad y permisos</li>
                <li>• Estado de encriptación y linealización</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                📊 Formatos de Exportación
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• CSV para análisis en hojas de cálculo</li>
                <li>• JSON para procesamiento programático</li>
                <li>• Información estructurada y legible</li>
                <li>• Compatible con herramientas de análisis</li>
                <li>• Datos listos para reportes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}